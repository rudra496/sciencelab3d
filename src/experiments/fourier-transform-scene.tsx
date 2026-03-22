"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface FourierTransformData {
  currentAmplitude: number;
  frequency: number;
  harmonicCount: number;
  waveformType: string;
}

export interface FourierTransformSceneProps {
  frequency: number;
  harmonicCount: number;
  waveSpeed: number;
  isPlaying: boolean;
  waveformType?: "square" | "triangle" | "sawtooth" | "custom";
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
  waveformType = "square",
  onDataChange
}: FourierTransformSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const timeRef = useRef(0);
  const wavePointsRef = useRef<[number, number, number][]>([]);

  // React state for UI updates (throttled)
  const [currentAmplitude, setCurrentAmplitude] = useState(0);
  const [wavePoints, setWavePoints] = useState<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      pts.push([(i - 100) * 0.1, 0, 0]);
    }
    return pts;
  });

  // Calculate composite wave at position x using Fourier series
  const calculateWave = useCallback((x: number, t: number) => {
    let y = 0;
    const harmonics = Math.min(harmonicCount, 10);

    switch (waveformType) {
      case "square":
        // Square wave: odd harmonics with amplitude 1/n
        for (let h = 1; h <= harmonics; h += 2) {
          const amplitude = (4 / Math.PI) * (1 / h);
          y += amplitude * Math.sin(h * frequency * x + t * waveSpeed);
        }
        break;
      case "triangle":
        // Triangle wave: odd harmonics with alternating signs and amplitude 1/n²
        for (let h = 1; h <= harmonics; h += 2) {
          const sign = Math.pow(-1, (h - 1) / 2);
          const amplitude = (8 / (Math.PI * Math.PI)) * sign / (h * h);
          y += amplitude * Math.sin(h * frequency * x + t * waveSpeed);
        }
        break;
      case "sawtooth":
        // Sawtooth wave: all harmonics with amplitude 1/n
        for (let h = 1; h <= harmonics; h++) {
          const amplitude = (1 / Math.PI) * (h % 2 === 0 ? -1 : 1) / h;
          y += amplitude * Math.sin(h * frequency * x + t * waveSpeed);
        }
        break;
      case "custom":
      default:
        // Custom: standard harmonic series
        for (let h = 1; h <= harmonics; h++) {
          const amplitude = 1 / h;
          y += amplitude * Math.sin(h * frequency * x + t * waveSpeed);
        }
        break;
    }
    return y;
  }, [frequency, harmonicCount, waveSpeed, waveformType]);

  // Report data changes
  useEffect(() => {
    const amp = calculateWave(0, timeRef.current);
    setCurrentAmplitude(amp);
    onDataChange?.({
      currentAmplitude: amp,
      frequency,
      harmonicCount,
      waveformType,
    });
  }, [frequency, harmonicCount, waveSpeed, waveformType, calculateWave, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta;

    // Update physics state - main wave line
    const newPoints: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.1;
      const y = calculateWave(x, timeRef.current);
      newPoints.push([x, y, 0]);
    }
    wavePointsRef.current = newPoints;

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      setWavePoints(newPoints);
      const amp = calculateWave(0, timeRef.current);
      setCurrentAmplitude(amp);
      onDataChange?.({
        currentAmplitude: amp,
        frequency,
        harmonicCount,
        waveformType,
      });
    }
  });

  // Generate static harmonic wave points
  const harmonicWaves = useMemo(() => {
    const waves: { harmonic: number; color: string; points: [number, number, number][] }[] = [];
    const harmonics = Math.min(harmonicCount, 5);

    for (let h = 1; h <= harmonics; h++) {
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

  // Frequency spectrum visualization
  const spectrumBars = useMemo(() => {
    const bars: { harmonic: number; height: number; color: string }[] = [];
    const harmonics = Math.min(harmonicCount, 8);

    for (let h = 1; h <= harmonics; h++) {
      const amplitude = waveformType === "square" && h % 2 === 1
        ? (4 / Math.PI) * (1 / h)
        : waveformType === "triangle" && h % 2 === 1
        ? Math.abs((8 / (Math.PI * Math.PI)) / (h * h))
        : 1 / h;

      bars.push({
        harmonic: h,
        height: amplitude * 2,
        color: new THREE.Color().setHSL((h * 0.12) % 1, 0.8, 0.55).getStyle(),
      });
    }
    return bars;
  }, [harmonicCount, waveformType]);

  return (
    <>
      {/* Grid for reference */}
      <gridHelper args={[30, 30, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      <group ref={groupRef}>
        {/* Main composite wave */}
        <Line points={wavePoints} color="#8b5cf6" lineWidth={3} />

        {/* Individual harmonic waves (shown below) */}
        {harmonicWaves.map(({ harmonic, color, points }) => (
          <Line
            key={harmonic}
            points={points}
            color={color}
            lineWidth={1}
            opacity={0.5}
            transparent
            position={[0, -5 - harmonic * 1.2, 0] as unknown as THREE.Vector3}
          />
        ))}

        {/* Harmonic labels */}
        {harmonicWaves.map(({ harmonic, color }) => (
          <group key={harmonic} position={[-12, -5 - harmonic * 1.2, 0]}>
            <mesh>
              <planeGeometry args={[2, 0.3]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
          </group>
        ))}

        {/* Frequency spectrum visualization */}
        <group position={[0, 5, 0]}>
          <mesh position={[0, -0.5, 0]}>
            <planeGeometry args={[16, 0.1]} />
            <meshStandardMaterial color="#1a1a3e" />
          </mesh>
          {spectrumBars.map(({ harmonic, height, color }) => (
            <group key={harmonic} position={[(harmonic - 4) * 1.5, height / 2, 0]}>
              <mesh>
                <boxGeometry args={[0.8, height, 0.2]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                  metalness={0.5}
                  roughness={0.2}
                />
              </mesh>
              {/* Harmonic number label */}
              <mesh position={[0, -0.6, 0]}>
                <planeGeometry args={[0.8, 0.3]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
              </mesh>
            </group>
          ))}

          {/* Spectrum label */}
          <mesh position={[0, 3, 0]}>
            <planeGeometry args={[8, 0.6]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Circular visualization of harmonics (phasor diagram) */}
        <group position={[-8, 0, 0]}>
          {Array.from({ length: Math.min(harmonicCount, 4) }, (_, i) => {
            const radius = 0.8 + i * 0.4;
            const phase = (timeRef.current * waveSpeed * (i + 1)) % (Math.PI * 2);
            return (
              <group key={i}>
                {/* Circle */}
                <mesh>
                  <ringGeometry args={[radius - 0.02, radius, 32]} />
                  <meshBasicMaterial
                    color={new THREE.Color().setHSL(((i + 1) * 0.15) % 1, 0.7, 0.4)}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Phasor arrow */}
                <Line
                  points={[[0, 0, 0], [Math.cos(phase) * radius, Math.sin(phase) * radius, 0]]}
                  color={new THREE.Color().setHSL(((i + 1) * 0.15) % 1, 0.8, 0.5).getStyle()}
                  lineWidth={2}
                />
                {/* Phasor tip */}
                <mesh position={[Math.cos(phase) * radius, Math.sin(phase) * radius, 0]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial
                    color={new THREE.Color().setHSL(((i + 1) * 0.15) % 1, 0.8, 0.5).getStyle()}
                    emissive={new THREE.Color().setHSL(((i + 1) * 0.15) % 1, 0.8, 0.5).getStyle()}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Waveform type indicator */}
        <mesh position={[8, 4, 0]}>
          <planeGeometry args={[4, 0.8]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>
      </group>
    </>
  );
}

export default FourierTransformSceneComponent;
