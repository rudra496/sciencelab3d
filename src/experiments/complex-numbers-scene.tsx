"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface ComplexNumbersData {
  real: number;
  imaginary: number;
  magnitude: number;
  argument: number;
  conjugate?: { real: number; imaginary: number };
  square?: { real: number; imaginary: number; magnitude: number };
}

export interface ComplexNumbersSceneProps {
  real: number;
  imaginary: number;
  showPlane: boolean;
  showPolar: boolean;
  showConjugate: boolean;
  showSquare: boolean;
  rotationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: ComplexNumbersData) => void;
}

/**
 * Complex Numbers scene component
 * Visualizes the Argand plane and complex arithmetic operations
 */
export function ComplexNumbersSceneComponent({
  real,
  imaginary,
  showPlane,
  showPolar,
  showConjugate,
  showSquare,
  rotationSpeed,
  isPlaying,
  onDataChange
}: ComplexNumbersSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dataRef = useRef({
    frameCount: 0,
    time: 0
  });
  const [, forceUpdate] = useState({});

  // Calculate complex number properties
  const magnitude = Math.sqrt(real * real + imaginary * imaginary);
  const argument = Math.atan2(imaginary, real) * (180 / Math.PI);

  // Conjugate: a - bi
  const conjugateReal = real;
  const conjugateImag = -imaginary;
  const conjugateMag = Math.sqrt(conjugateReal * conjugateReal + conjugateImag * conjugateImag);

  // Square: (a + bi)² = (a² - b²) + 2abi
  const squareReal = real * real - imaginary * imaginary;
  const squareImag = 2 * real * imaginary;
  const squareMag = Math.sqrt(squareReal * squareReal + squareImag * squareImag);

  const updateReactState = useCallback(() => {
    onDataChange?.({
      real,
      imaginary,
      magnitude,
      argument,
      conjugate: showConjugate ? { real: conjugateReal, imaginary: conjugateImag } : undefined,
      square: showSquare ? { real: squareReal, imaginary: squareImag, magnitude: squareMag } : undefined,
    });
    forceUpdate({});
  }, [real, imaginary, magnitude, argument, showConjugate, showSquare, conjugateReal, conjugateImag, squareReal, squareImag, squareMag, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    if (groupRef.current) {
      groupRef.current.rotation.z = data.time * rotationSpeed * 0.1;
    }

    // Update React state every 8 frames
    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

  // Generate magnitude circle
  const magnitudeCirclePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const theta = (i / 120) * Math.PI * 2;
      pts.push([magnitude * Math.cos(theta), magnitude * Math.sin(theta), 0]);
    }
    return pts;
  }, [magnitude]);

  // Generate angle arc
  const angleArcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const angleRad = Math.atan2(imaginary, real);
    for (let i = 0; i <= 30; i++) {
      const theta = (i / 30) * angleRad;
      const r = 0.5;
      pts.push([r * Math.cos(theta), r * Math.sin(theta), 0]);
    }
    return pts;
  }, [real, imaginary]);

  // Generate conjugate reflection line (real axis)
  const reflectionLine = useMemo(() => {
    if (!showConjugate) return [];
    const midX = (real + conjugateReal) / 2;
    const midY = (imaginary + conjugateImag) / 2;
    return [
      [midX - 0.3, midY, 0],
      [midX + 0.3, midY, 0]
    ] as [number, number, number][];
  }, [showConjugate, real, imaginary, conjugateReal, conjugateImag]);

  // Origin arrow for squaring
  const squareArrowPoints = useMemo(() => {
    if (!showSquare) return [];
    const midX = real / 2;
    const midY = imaginary / 2;
    return [
      [0, 0, 0],
      [midX, midY, 0]
    ] as [number, number, number][];
  }, [showSquare, real, imaginary]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#fbbf24" />

      <group ref={groupRef}>
        {/* Complex plane grid */}
        {showPlane && (
          <>
            <gridHelper args={[10, 20, "#1a1a3e", "#1a1a3e"]} position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {/* Real axis */}
            <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#3b82f6" lineWidth={3} />
            {/* Imaginary axis */}
            <Line points={[[0, -5, 0], [0, 5, 0]]} color="#ef4444" lineWidth={3} />
          </>
        )}

        {/* Main complex number z = a + bi */}
        <Line points={[[0, 0, 0], [real, imaginary, 0]]} color="#fbbf24" lineWidth={4} />
        <mesh position={[real, imaginary, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>

        {/* Magnitude circle (polar form) */}
        {showPolar && magnitude > 0.1 && (
          <Line
            points={magnitudeCirclePoints}
            color="#22c55e"
            lineWidth={2}
            opacity={0.5}
            transparent
          />
        )}

        {/* Angle arc */}
        {showPolar && magnitude > 0.1 && (
          <Line
            points={angleArcPoints}
            color="#a855f7"
            lineWidth={2}
          />
        )}

        {/* Conjugate z̄ = a - bi */}
        {showConjugate && (imaginary !== 0) && (
          <>
            <Line points={[[0, 0, 0], [conjugateReal, conjugateImag, 0]]} color="#06b6d4" lineWidth={3} opacity={0.7} />
            <mesh position={[conjugateReal, conjugateImag, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.4} />
            </mesh>
            {/* Reflection line */}
            <Line points={reflectionLine} color="#94a3b8" lineWidth={1} opacity={0.5} />
          </>
        )}

        {/* Square z² */}
        {showSquare && magnitude > 0.1 && (
          <>
            {/* Arrow indicating squaring operation */}
            <Line points={squareArrowPoints} color="#f97316" lineWidth={2} opacity={0.5} />
            {/* Squared result */}
            <Line points={[[0, 0, 0], [squareReal, squareImag, 0]]} color="#f97316" lineWidth={3} opacity={0.8} />
            <mesh position={[squareReal, squareImag, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}

        {/* Origin point */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Labels / Legend background */}
      <mesh position={[0, 5.5, 0]}>
        <planeGeometry args={[6, 0.5]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
      </mesh>

      {/* Axis labels */}
      <mesh position={[5.5, -0.3, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.4, 5.5, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </>
  );
}

export default ComplexNumbersSceneComponent;
