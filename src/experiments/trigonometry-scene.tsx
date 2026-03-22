"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface TrigonometryData {
  angle: number;
  sin: number;
  cos: number;
  tan: number;
  radianValue: number;
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
 * Visualizes unit circle, sin/cos/tan relationships, and wave generation
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
  const waveRef = useRef<THREE.Group>(null);
  const dataRef = useRef({
    frameCount: 0,
    time: 0,
    currentAngle: angle
  });
  const [, forceUpdate] = useState({});

  // Generate unit circle points
  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const theta = (i / 120) * Math.PI * 2;
      pts.push([Math.cos(theta), Math.sin(theta), 0]);
    }
    return pts;
  }, []);

  // Static axes
  const xAxisPoints = useMemo(() => [[-4, 0, 0], [6, 0, 0]] as [number, number, number][], []);
  const yAxisPoints = useMemo(() => [[0, -3, 0], [0, 3, 0]] as [number, number, number][], []);

  // Generate multiple trig waves
  const sineWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.04;
      pts.push([x, Math.sin(x), 0]);
    }
    return pts;
  }, []);

  const cosineWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.04;
      pts.push([x, Math.cos(x), 0]);
    }
    return pts;
  }, []);

  const tangentWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.04;
      const tan = Math.tan(x);
      // Clamp tan values for visualization
      const clampedTan = Math.max(-2.5, Math.min(2.5, tan));
      pts.push([x, clampedTan, 0]);
    }
    return pts;
  }, []);

  const updateReactState = useCallback(() => {
    const rad = (dataRef.current.currentAngle * Math.PI) / 180;
    onDataChange?.({
      angle: dataRef.current.currentAngle,
      sin: Math.sin(rad),
      cos: Math.cos(rad),
      tan: Math.tan(rad),
      radianValue: rad,
    });
    forceUpdate({});
  }, [onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    // Animate angle automatically when playing
    data.currentAngle = (data.currentAngle + delta * animationSpeed * 30) % 360;

    if (groupRef.current) {
      // Subtle camera rotation effect
      groupRef.current.rotation.z = Math.sin(data.time * 0.1) * 0.05;
    }

    if (waveRef.current) {
      // Animate wave phase
      waveRef.current.position.x = Math.sin(data.time * animationSpeed * 0.5) * 0.3;
    }

    // Update React state every 8 frames
    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

  // Override with manual angle changes
  dataRef.current.currentAngle = angle;

  const rad = (angle * Math.PI) / 180;
  const cosX = Math.cos(rad);
  const sinY = Math.sin(rad);

  // Tan line (extend to show tangent)
  const tanLinePoints: [number, number, number][] = [[1, 0, 0]];
  const tanValue = Math.tan(rad);
  if (Math.abs(tanValue) < 10) {
    tanLinePoints.push([1, tanValue, 0]);
  }

  // Arc showing angle
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * rad;
      pts.push([0.3 * Math.cos(theta), 0.3 * Math.sin(theta), 0]);
    }
    return pts;
  }, [rad]);

  // Animated point on waves
  const waveX = ((angle / 360) * Math.PI * 2) % (Math.PI * 2);
  const waveOffset = (waveX - Math.PI) * 2;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

      <group ref={groupRef}>
        {/* Unit Circle Section */}
        {showUnitCircle && (
          <group position={[-2, 0, 0]}>
            {/* Unit circle */}
            <Line points={circlePoints} color="#8b5cf6" lineWidth={2} />

            {/* Angle arc */}
            <Line points={arcPoints} color="#a78bfa" lineWidth={2} />

            {/* Angle radius line */}
            <Line points={[[0, 0, 0], [cosX, sinY, 0]]} color="#fbbf24" lineWidth={3} />

            {/* Cosine line (horizontal from origin) */}
            <Line points={[[0, 0, 0], [cosX, 0, 0]]} color="#3b82f6" lineWidth={3} />
            {/* Cosine indicator line (vertical) */}
            <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#3b82f6" lineWidth={1} opacity={0.5} />

            {/* Sine line (vertical from point to axis) */}
            <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#22c55e" lineWidth={3} />

            {/* Tangent line (from x=1 to intersection) */}
            {Math.abs(tanValue) < 10 && Math.abs(cosX) > 0.01 && (
              <Line points={tanLinePoints} color="#ef4444" lineWidth={2} opacity={0.7} />
            )}

            {/* Point on circle */}
            <mesh position={[cosX, sinY, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
            </mesh>

            {/* Cosine point on axis */}
            <mesh position={[cosX, 0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>

            {/* Sine point on axis */}
            <mesh position={[0, sinY, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
            </mesh>

            {/* Axes labels */}
            <mesh position={[1.4, -0.2, 0]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[-0.3, 1.4, 0]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>

            {/* Circle center */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
          </group>
        )}

        {/* Wave Section */}
        {showWave && (
          <group ref={waveRef} position={[2.5, 0, 0]}>
            {/* Sine wave */}
            <Line
              points={sineWavePoints}
              color="#22c55e"
              lineWidth={2}
            />

            {/* Cosine wave */}
            <Line
              points={cosineWavePoints}
              color="#3b82f6"
              lineWidth={2}
              opacity={0.7}
            />

            {/* Tangent wave */}
            <Line
              points={tangentWavePoints}
              color="#ef4444"
              lineWidth={1}
              opacity={0.4}
            />

            {/* Animated point on sine wave */}
            <mesh position={[waveOffset, Math.sin(waveX), 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
            </mesh>

            {/* Connection line from x-axis to wave */}
            <Line
              points={[[waveOffset, -1.5, 0], [waveOffset, Math.sin(waveX), 0]]}
              color="#22c55e"
              lineWidth={1}
              opacity={0.3}
            />

            {/* Wave base line */}
            <Line points={[[-4, -1.5, 0], [4, -1.5, 0]]} color="#444" lineWidth={1} />

            {/* Legend */}
            <mesh position={[2, 2.5, 0]}>
              <planeGeometry args={[2.5, 0.8]} />
              <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {/* Main axes for entire scene */}
        <Line points={xAxisPoints} color="#666" lineWidth={1} />
        <Line points={yAxisPoints} color="#666" lineWidth={1} />
      </group>

      {/* Labels */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[5, 0.5]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default TrigonometrySceneComponent;
