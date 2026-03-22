"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface TrigonometryData {
  angle: number;
  sin: number;
  cos: number;
  tan: number;
}

export interface TrigonometrySceneProps {
  angle: number;
  showUnitCircle: boolean;
  showWave: boolean;
  animationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: TrigonometryData) => void;
}

/**
 * Trigonometry scene component
 * Visualizes unit circle, sin/cos/tan relationships
 */
export function TrigonometrySceneComponent({
  angle,
  showUnitCircle,
  showWave,
  animationSpeed,
  isPlaying,
  onDataChange
}: TrigonometrySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const currentAngleRef = useRef(angle);

  // Generate unit circle points
  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const theta = (i / 120) * Math.PI * 2;
      pts.push([Math.cos(theta), Math.sin(theta), 0]);
    }
    return pts;
  }, []);

  // Generate sine wave points
  const sineWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.03;
      pts.push([x, Math.sin(x * 2), 0]);
    }
    return pts;
  }, []);

  // Axis lines
  const xAxisPoints = useMemo(() => [[-3, 0, 0], [3, 0, 0]] as [number, number, number][], []);
  const yAxisPoints = useMemo(() => [[0, -2, 0], [0, 2, 0]] as [number, number, number][], []);

  useEffect(() => {
    const rad = (currentAngleRef.current * Math.PI) / 180;
    onDataChange?.({
      angle: currentAngleRef.current,
      sin: Math.sin(rad),
      cos: Math.cos(rad),
      tan: Math.tan(rad),
    });
  }, [angle, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta * animationSpeed;
    if (groupRef.current) {
      groupRef.current.rotation.z = timeRef.current * 0.2;
    }
  });

  const rad = (angle * Math.PI) / 180;
  const cosX = Math.cos(rad);
  const sinY = Math.sin(rad);

  // Generate dynamic lines based on current angle
  const angleRadiusLine = useMemo(
    () => [[0, 0, 0], [cosX, sinY, 0]] as [number, number, number][],
    [cosX, sinY]
  );

  const cosineLine = useMemo(
    () => [[cosX, 0, 0], [cosX, sinY, 0]] as [number, number, number][],
    [cosX, sinY]
  );

  const sineLine = useMemo(
    () => [[0, sinY, 0], [cosX, sinY, 0]] as [number, number, number][],
    [cosX, sinY]
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <group>
        {/* Unit circle */}
        {showUnitCircle && (
          <>
            <Line points={circlePoints} color="#8b5cf6" lineWidth={2} />
            {/* Angle radius line */}
            <Line points={angleRadiusLine} color="#fbbf24" lineWidth={3} />
            {/* Cosine line (horizontal) */}
            <Line points={cosineLine} color="#3b82f6" lineWidth={2} />
            {/* Sine line (vertical) */}
            <Line points={sineLine} color="#22c55e" lineWidth={2} />
            {/* Point on circle */}
            <mesh position={[cosX, sinY, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}

        {/* Sine wave */}
        {showWave && (
          <Line
            points={sineWavePoints}
            color="#22c55e"
            lineWidth={2}
            position={new THREE.Vector3(2.5, 0, 0)}
          />
        )}

        {/* Axes */}
        <Line points={xAxisPoints} color="#666" lineWidth={1} />
        <Line points={yAxisPoints} color="#666" lineWidth={1} />
      </group>

      {/* Labels */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[4, 0.5]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default TrigonometrySceneComponent;
