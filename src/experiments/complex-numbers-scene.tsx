"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export interface ComplexNumbersData {
  real: number;
  imaginary: number;
  magnitude: number;
  argument: number;
}

export interface ComplexNumbersSceneProps {
  real: number;
  imaginary: number;
  showPlane: boolean;
  showPolar: boolean;
  rotationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: ComplexNumbersData) => void;
}

/**
 * Complex Numbers scene component
 * Visualizes the Argand plane and complex arithmetic
 */
export function ComplexNumbersSceneComponent({
  real,
  imaginary,
  showPlane,
  showPolar,
  rotationSpeed,
  isPlaying,
  onDataChange
}: ComplexNumbersSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Calculate complex number properties
  const magnitude = Math.sqrt(real * real + imaginary * imaginary);
  const argument = Math.atan2(imaginary, real) * (180 / Math.PI);

  useEffect(() => {
    onDataChange?.({ real, imaginary, magnitude, argument });
  }, [real, imaginary, magnitude, argument, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.z = timeRef.current * rotationSpeed * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

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

        {/* Complex number as vector */}
        <Line points={useMemo(() => [[0, 0, 0], [real, imaginary, 0]], [real, imaginary])} color="#fbbf24" lineWidth={4} />

        {/* Point representing complex number */}
        <mesh position={[real, imaginary, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>

        {/* Magnitude circle */}
        {showPolar && magnitude > 0 && (
          <Line
            points={useMemo(() => {
              const pts: [number, number, number][] = [];
              for (let i = 0; i <= 120; i++) {
                const theta = (i / 120) * Math.PI * 2;
                pts.push([magnitude * Math.cos(theta), magnitude * Math.sin(theta), 0]);
              }
              return pts;
            }, [magnitude])}
            color="#22c55e"
            lineWidth={2}
            transparent
            opacity={0.5}
          />
        )}

        {/* Angle arc */}
        {showPolar && magnitude > 0 && (
          <Line
            points={useMemo(() => {
              const pts: [number, number, number][] = [];
              const angle = Math.atan2(imaginary, real);
              for (let i = 0; i <= 30; i++) {
                const theta = (i / 30) * angle;
                const r = 0.5;
                pts.push([r * Math.cos(theta), r * Math.sin(theta), 0]);
              }
              return pts;
            }, [real, imaginary])}
            color="#a855f7"
            lineWidth={2}
          />
        )}
      </group>

      {/* Labels */}
      <mesh position={[0, 5.5, 0]}>
        <planeGeometry args={[5, 0.5]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default ComplexNumbersSceneComponent;
