"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface FourierTransformData {
  currentAmplitude: number;
  frequency: number;
  harmonicCount: number;
}

export interface FourierTransformSceneProps {
  frequency: number;
  harmonicCount: number;
  waveSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: FourierTransformData) => void;
}

/**
 * Fourier Transform scene component
 * Visualizes wave synthesis by adding sine waves together
 */
export function FourierTransformSceneComponent({
  frequency,
  harmonicCount,
  waveSpeed,
  isPlaying,
  onDataChange
}: FourierTransformSceneProps) {
  const timeRef = useRef(0);
  const [wavePoints, setWavePoints] = useState<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      pts.push([(i - 100) * 0.1, 0, 0]);
    }
    return pts;
  });

  // Calculate composite wave at position x
  const calculateWave = (x: number, t: number) => {
    let y = 0;
    for (let h = 1; h <= harmonicCount; h++) {
      const amplitude = 1 / h;
      y += amplitude * Math.sin(h * frequency * x + t * waveSpeed);
    }
    return y;
  };

  // Report data changes
  useEffect(() => {
    onDataChange?.({
      currentAmplitude: calculateWave(0, timeRef.current),
      frequency,
      harmonicCount,
    });
  }, [frequency, harmonicCount, waveSpeed, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta;

    // Update the main wave line
    const newPoints: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.1;
      const y = calculateWave(x, timeRef.current);
      newPoints.push([x, y, 0]);
    }
    setWavePoints(newPoints);
  });

  // Generate static harmonic wave points
  const harmonicWaves = useMemo(() => {
    const waves: { harmonic: number; color: string; points: [number, number, number][] }[] = [];
    for (let h = 1; h <= Math.min(harmonicCount, 5); h++) {
      const color = new THREE.Color().setHSL((h * 0.15) % 1, 0.8, 0.5).getStyle();
      const points: [number, number, number][] = [];
      for (let i = 0; i <= 200; i++) {
        const x = (i - 100) * 0.1;
        const y = (1 / h) * Math.sin(h * frequency * x);
        points.push([x, y, 0]);
      }
      waves.push({ harmonic: h, color, points });
    }
    return waves;
  }, [harmonicCount, frequency]);

  return (
    <>
      {/* Grid for reference */}
      <gridHelper args={[30, 30, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      {/* Main composite wave */}
      <Line points={wavePoints} color="#8b5cf6" lineWidth={2} />

      {/* Individual harmonic waves (shown below) */}
      {harmonicWaves.map(({ harmonic, color, points }) => (
        <Line
          key={harmonic}
          points={points}
          color={color}
          lineWidth={1}
          opacity={0.6}
          transparent
          position={[0, -5 - harmonic * 1.5, 0] as unknown as THREE.Vector3}
        />
      ))}

      {/* Circular visualization of harmonics */}
      <group>
        {Array.from({ length: Math.min(harmonicCount, 5) }, (_, i) => (
          <mesh key={i} position={[i * 3, 5, 0]}>
            <ringGeometry args={[1.5 / (i + 1) - 0.02, 1.5 / (i + 1), 32]} />
            <meshBasicMaterial
              color={new THREE.Color().setHSL(((i + 1) * 0.15) % 1, 0.8, 0.5)}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Labels */}
      <mesh position={[0, 8, 0]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default FourierTransformSceneComponent;
