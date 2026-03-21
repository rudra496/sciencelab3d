"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { calculateWaveSpeed, calculateWavelength, calculateAngularFrequency } from "@/utils/physics";

interface WaveInterferenceSceneProps {
  onDataChange?: (data: WaveData) => void;
  frequency?: number;
  amplitude?: number;
  sourceSeparation?: number;
  waveSpeed?: number;
  showNodes?: boolean;
  showIntensity?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  onReset?: () => void;
  resetTrigger?: number;
}

export interface WaveData {
  wavelength: number;
  waveNumber: number;
  angularFrequency: number;
  maxIntensity: number;
  constructiveCount: number;
  destructiveCount: number;
  isPlaying: boolean;
  simulationSpeed: number;
}

/**
 * OPTIMIZED Wave Interference Scene
 * - Proper physics: y = A·sin(kr - ωt)
 * - Play/pause support
 * - Speed control
 * - Performance optimized
 */
export function WaveInterferenceSceneComponent({
  onDataChange,
  frequency = 2,
  amplitude = 0.8,
  sourceSeparation = 4,
  waveSpeed = 3,
  showNodes = true,
  showIntensity = true,
  isPlaying = true,
  simulationSpeed = 1,
  onReset,
  resetTrigger,
}: WaveInterferenceSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const dataUpdateTimer = useRef(0);
  const lastDataRef = useRef<WaveData | null>(null);

  // Calculate physics constants (cached)
  const physicsParams = useMemo(() => {
    const wavelength = calculateWavelength(waveSpeed, frequency);
    const waveNumber = (2 * Math.PI) / wavelength;
    const angularFreq = calculateAngularFrequency(frequency);
    return { wavelength, waveNumber, angularFreq };
  }, [waveSpeed, frequency]);

  // Create geometry once and reuse
  const meshGeometry = useMemo(() => {
    const segments = 100; // Optimized for performance
    const size = 30;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const colors = new Float32Array((segments + 1) * (segments + 1) * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Calculate node and antinode positions (memoized)
  const markers = useMemo(() => {
    if (!showNodes) return { nodes: [] as [number, number, number][], antinodes: [] as [number, number, number][] };

    const nodes: [number, number, number][] = [];
    const antinodes: [number, number, number][] = [];
    const L = 15;
    const d = sourceSeparation;
    const { wavelength } = physicsParams;

    for (let m = -5; m <= 5; m++) {
      const y = (m * wavelength * L) / d;
      if (Math.abs(y) < 12) antinodes.push([L, y, 0.5]);

      const yDestructive = ((m + 0.5) * wavelength * L) / d;
      if (Math.abs(yDestructive) < 12) nodes.push([L, yDestructive, 0.3]);
    }

    return { nodes, antinodes };
  }, [physicsParams.wavelength, sourceSeparation, showNodes]);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      timeRef.current = 0;
      dataUpdateTimer.current = 0;
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Update time only if playing
    if (isPlaying) {
      timeRef.current += delta * simulationSpeed;
    }
    const t = timeRef.current;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = meshRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    const s1x = -sourceSeparation / 2;
    const s2x = sourceSeparation / 2;
    const { waveNumber, angularFreq } = physicsParams;

    let maxIntensity = 0;
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx = i * (segments + 1) + j;
        const x = positions[idx * 3];
        const y = positions[idx * 3 + 1];

        const d1 = Math.sqrt((x - s1x) ** 2 + y * y);
        const d2 = Math.sqrt((x - s2x) ** 2 + y * y);

        const att1 = 1 / Math.sqrt(Math.max(d1, 0.5));
        const att2 = 1 / Math.sqrt(Math.max(d2, 0.5));

        const wave1 = att1 * Math.sin(waveNumber * d1 - angularFreq * t);
        const wave2 = att2 * Math.sin(waveNumber * d2 - angularFreq * t);
        const combined = wave1 + wave2;

        positions[idx * 3 + 2] = combined * amplitude;

        // Water colors
        const normalized = (combined + 2) / 4;
        const height = combined * amplitude;
        const depth = Math.max(0, Math.min(1, (height + amplitude * 2) / (amplitude * 4)));

        colors[idx * 3] = 0.1 + depth * 0.2 + normalized * 0.3;
        colors[idx * 3 + 1] = 0.4 + depth * 0.3 + normalized * 0.3;
        colors[idx * 3 + 2] = 0.6 + depth * 0.2 + normalized * 0.2;

        maxIntensity = Math.max(maxIntensity, Math.abs(combined));
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Recompute normals every 3rd frame
    if (Math.floor(t * 60) % 3 === 0) {
      meshRef.current.geometry.computeVertexNormals();
    }

    // Throttled data update
    dataUpdateTimer.current += delta;
    if (dataUpdateTimer.current >= 0.1) {
      dataUpdateTimer.current = 0;

      const newData: WaveData = {
        wavelength: physicsParams.wavelength,
        waveNumber: physicsParams.waveNumber,
        angularFrequency: physicsParams.angularFreq,
        maxIntensity,
        constructiveCount: markers.antinodes.length,
        destructiveCount: markers.nodes.length,
        isPlaying,
        simulationSpeed,
      };

      if (!lastDataRef.current || lastDataRef.current.maxIntensity !== newData.maxIntensity) {
        lastDataRef.current = newData;
        onDataChange?.(newData);
      }
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      meshGeometry.dispose();
    };
  }, [meshGeometry]);

  return (
    <group>
      {/* Lighting */}
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[-10, 5, 5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[10, 5, 5]} intensity={0.3} color="#ec4899" />

      {/* Water surface */}
      <mesh ref={meshRef} geometry={meshGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          metalness={0.3}
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Source emitters */}
      <group position={[-sourceSeparation / 2, 1, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={isPlaying ? 1 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1 + Math.sin(timeRef.current * 3) * 0.1}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
        </mesh>
      </group>

      <group position={[sourceSeparation / 2, 1, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={isPlaying ? 1 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1 + Math.sin(timeRef.current * 3) * 0.1}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Node and Antinode markers */}
      {showNodes && (
        <>
          {markers.antinodes.map((pos, i) => (
            <group key={`anti-${i}`} position={pos}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.4, 16]} />
                <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
              </mesh>
            </group>
          ))}

          {markers.nodes.map((pos, i) => (
            <group key={`node-${i}`} position={pos}>
              <Line points={[[-0.15, -0.15, 0.1], [0.15, 0.15, 0.1]]} color="#ef4444" lineWidth={3} />
              <Line points={[[-0.15, 0.15, 0.1], [0.15, -0.15, 0.1]]} color="#ef4444" lineWidth={3} />
            </group>
          ))}
        </>
      )}

      {/* Wavelength circles */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`wave-${i}`} position={[-sourceSeparation / 2, 0.6, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[physicsParams.wavelength * (i + 1), physicsParams.wavelength * (i + 1) + 0.05, 64]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`wave2-${i}`} position={[sourceSeparation / 2, 0.6, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[physicsParams.wavelength * (i + 1), physicsParams.wavelength * (i + 1) + 0.05, 64]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}

      {/* Basin edges */}
      <mesh position={[0, 0.4, -15]}>
        <boxGeometry args={[31, 0.3, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 15]}>
        <boxGeometry args={[31, 0.3, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-15, 0.4, 0]}>
        <boxGeometry args={[1, 0.3, 30]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[15, 0.4, 0]}>
        <boxGeometry args={[1, 0.3, 30]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[32, 0.5, 32]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
    </group>
  );
}

export default WaveInterferenceSceneComponent;
