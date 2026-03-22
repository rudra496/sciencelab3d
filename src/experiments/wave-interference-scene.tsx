"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface WaveInterferenceSceneProps {
  onDataChange?: (data: WaveData) => void;
  frequency?: number;
  amplitude?: number;
  wavelength?: number;
  sourceSeparation?: number;
  showNodes?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export interface WaveData {
  wavelength: number;
  frequency: number;
  sourceSeparation: number;
  maxAmplitude: number;
  constructiveNodes: number;
  destructiveNodes: number;
  waveSpeed: number;
}

// Physics state stored in refs (NOT React state)
interface PhysicsState {
  time: number;
  maxAmplitude: number;
  frameCount: number;
  lastDataUpdate: number;
}

/**
 * VISUALLY STUNNING Wave Interference Scene
 * - 2D wave surface with height = sum of wave amplitudes from 2 point sources
 * - Vertex colors: red=crest, blue=trough
 * - Uses refs for physics state (NOT React state)
 * - Updates React state every 5-10 frames only
 * - Shows constructive (bright) and destructive (dark) interference nodes
 */
export function WaveInterferenceSceneComponent({
  onDataChange,
  frequency = 2,
  amplitude = 1,
  wavelength = 3,
  sourceSeparation = 6,
  showNodes = true,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger,
}: WaveInterferenceSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const physicsStateRef = useRef<PhysicsState>({
    time: 0,
    maxAmplitude: 0,
    frameCount: 0,
    lastDataUpdate: 0,
  });

  // Calculate derived physics constants (memoized)
  const waveSpeed = wavelength * frequency;
  const waveNumber = (2 * Math.PI) / wavelength;
  const angularFrequency = 2 * Math.PI * frequency;

  // High-resolution geometry for smooth wave visualization
  const meshGeometry = useMemo(() => {
    const segments = 150; // Higher resolution for smoother visuals
    const size = 40;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const colors = new Float32Array((segments + 1) * (segments + 1) * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Calculate node positions for interference pattern
  const interferenceNodes = useMemo(() => {
    if (!showNodes) return { constructive: [] as number[], destructive: [] as number[] };

    const constructive: number[] = [];
    const destructive: number[] = [];
    const maxDistance = 18;

    // Calculate hyperbolic nodal lines
    for (let y = -maxDistance; y <= maxDistance; y += 0.5) {
      const x = Math.sqrt(maxDistance * maxDistance - y * y);
      if (isNaN(x)) continue;

      // Constructive: path difference = n * wavelength
      for (let m = 0; m < 10; m++) {
        const pathDiff = m * wavelength;
        const d1 = Math.sqrt((x + sourceSeparation/2) ** 2 + y * y);
        const d2 = Math.sqrt((x - sourceSeparation/2) ** 2 + y * y);
        if (Math.abs(d1 - d2 - pathDiff) < 0.5) {
          constructive.push(y);
          break;
        }
      }

      // Destructive: path difference = (n + 0.5) * wavelength
      for (let m = 0; m < 10; m++) {
        const pathDiff = (m + 0.5) * wavelength;
        const d1 = Math.sqrt((x + sourceSeparation/2) ** 2 + y * y);
        const d2 = Math.sqrt((x - sourceSeparation/2) ** 2 + y * y);
        if (Math.abs(d1 - d2 - pathDiff) < 0.5) {
          destructive.push(y);
          break;
        }
      }
    }

    return { constructive, destructive };
  }, [wavelength, sourceSeparation, showNodes]);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      physicsStateRef.current = {
        time: 0,
        maxAmplitude: 0,
        frameCount: 0,
        lastDataUpdate: 0,
      };
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = physicsStateRef;

    // Update time only if playing (using refs, not React state)
    if (isPlaying) {
      state.current.time += delta * simulationSpeed;
    }
    const t = state.current.time;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = meshRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    const s1x = -sourceSeparation / 2;
    const s2x = sourceSeparation / 2;
    const segments = 150;
    const size = 40;
    const halfSize = size / 2;

    let maxAmp = 0;

    // Update each vertex
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx = i * (segments + 1) + j;

        // Grid position
        const x = (j / segments) * size - halfSize;
        const y = (i / segments) * size - halfSize;

        // Distance from each source
        const d1 = Math.sqrt((x - s1x) ** 2 + y * y);
        const d2 = Math.sqrt((x - s2x) ** 2 + y * y);

        // Wave equation: y = A * sin(k*r - ω*t) with distance attenuation
        const att1 = Math.max(0.1, 1 / (1 + d1 * 0.15));
        const att2 = Math.max(0.1, 1 / (1 + d2 * 0.15));

        const wave1 = att1 * Math.sin(waveNumber * d1 - angularFrequency * t);
        const wave2 = att2 * Math.sin(waveNumber * d2 - angularFrequency * t);
        const combined = wave1 + wave2;

        // Update height (Z coordinate in plane geometry, becomes Y after rotation)
        const height = combined * amplitude;
        positions[idx * 3 + 2] = height;

        // Track max amplitude
        maxAmp = Math.max(maxAmp, Math.abs(height));

        // Vertex colors: RED = crest (positive), BLUE = trough (negative)
        // Normalize combined wave from [-2, 2] to [0, 1]
        const normalized = (combined + 2) / 4;

        if (combined > 0) {
          // Crest: Red with white highlights
          const intensity = Math.min(1, combined / 1.5);
          colors[idx * 3] = 0.8 + intensity * 0.2;     // R: bright red
          colors[idx * 3 + 1] = intensity * 0.3;       // G: slight
          colors[idx * 3 + 2] = intensity * 0.2;       // B: minimal
        } else {
          // Trough: Blue with cyan highlights
          const intensity = Math.min(1, Math.abs(combined) / 1.5);
          colors[idx * 3] = intensity * 0.2;            // R: minimal
          colors[idx * 3 + 1] = intensity * 0.5;        // G: cyan tint
          colors[idx * 3 + 2] = 0.8 + intensity * 0.2;  // B: bright blue
        }

        // Add constructive interference glow (bright yellow-white)
        if (Math.abs(combined) > 1.5) {
          const glow = (Math.abs(combined) - 1.5) / 0.5;
          colors[idx * 3] = Math.min(1, colors[idx * 3] + glow * 0.5);
          colors[idx * 3 + 1] = Math.min(1, colors[idx * 3 + 1] + glow * 0.5);
          colors[idx * 3 + 2] = Math.min(1, colors[idx * 3 + 2] + glow * 0.3);
        }
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Recompute normals every 4th frame for performance
    state.current.frameCount++;
    if (state.current.frameCount % 4 === 0) {
      meshRef.current.geometry.computeVertexNormals();
    }

    // Update physics state
    state.current.maxAmplitude = maxAmp;

    // Throttled data update: every 5-10 frames
    state.current.lastDataUpdate++;
    if (state.current.lastDataUpdate >= 7 && onDataChange) {
      state.current.lastDataUpdate = 0;

      const newData: WaveData = {
        wavelength,
        frequency,
        sourceSeparation,
        maxAmplitude: maxAmp,
        constructiveNodes: interferenceNodes.constructive.length,
        destructiveNodes: interferenceNodes.destructive.length,
        waveSpeed,
      };

      onDataChange(newData);
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      meshGeometry.dispose();
    };
  }, [meshGeometry]);

  // Animated source positions
  const pulseScale = 1 + Math.sin(physicsStateRef.current.time * 5) * 0.15;

  return (
    <group>
      {/* Enhanced lighting for dramatic effect */}
      <pointLight position={[0, 15, 0]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-15, 8, 8]} intensity={0.6} color="#ff4444" />
      <pointLight position={[15, 8, 8]} intensity={0.6} color="#4444ff" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />

      {/* Main wave surface with stunning red/blue colors */}
      <mesh
        ref={meshRef}
        geometry={meshGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.8, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          metalness={0.4}
          roughness={0.2}
          envMapIntensity={0.8}
          emissive="#1a1a2e"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Left source emitter (Red theme) */}
      <group position={[-sourceSeparation / 2, 1.2, 0]}>
        {/* Glowing core */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#ff3333"
            emissive="#ff0000"
            emissiveIntensity={isPlaying ? 2 : 0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Pulsing rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale}>
          <ringGeometry args={[0.6, 0.75, 32]} />
          <meshBasicMaterial color="#ff6666" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale * 1.5}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.4} />
        </mesh>
        {/* Glow sphere */}
        <mesh scale={1.2}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={isPlaying ? 0.3 : 0.1}
          />
        </mesh>
      </group>

      {/* Right source emitter (Blue theme) */}
      <group position={[sourceSeparation / 2, 1.2, 0]}>
        {/* Glowing core */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#3333ff"
            emissive="#0000ff"
            emissiveIntensity={isPlaying ? 2 : 0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Pulsing rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale}>
          <ringGeometry args={[0.6, 0.75, 32]} />
          <meshBasicMaterial color="#6666ff" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale * 1.5}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#4444ff" transparent opacity={0.4} />
        </mesh>
        {/* Glow sphere */}
        <mesh scale={1.2}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color="#0000ff"
            transparent
            opacity={isPlaying ? 0.3 : 0.1}
          />
        </mesh>
      </group>

      {/* Wavelength reference circles from left source */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`wave1-${i}`} position={[-sourceSeparation / 2, 0.85, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                wavelength * (i + 1) * 0.8,
                wavelength * (i + 1) * 0.8 + 0.08,
                64
              ]}
            />
            <meshBasicMaterial
              color="#ff4444"
              transparent
              opacity={0.15 - i * 0.02}
            />
          </mesh>
        </group>
      ))}

      {/* Wavelength reference circles from right source */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`wave2-${i}`} position={[sourceSeparation / 2, 0.85, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                wavelength * (i + 1) * 0.8,
                wavelength * (i + 1) * 0.8 + 0.08,
                64
              ]}
            />
            <meshBasicMaterial
              color="#4444ff"
              transparent
              opacity={0.15 - i * 0.02}
            />
          </mesh>
        </group>
      ))}

      {/* Constructive interference nodes (bright yellow/green) */}
      {showNodes && interferenceNodes.constructive.map((y, i) => (
        <group key={`constructive-${i}`} position={[12, 0.9, y]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.35, 16]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* Destructive interference nodes (dark X marks) */}
      {showNodes && interferenceNodes.destructive.map((y, i) => (
        <group key={`destructive-${i}`} position={[12, 0.9, y]}>
          <Line
            points={[[-0.2, -0.2, 0.05], [0.2, 0.2, 0.05]]}
            color="#ffaa00"
            lineWidth={3}
          />
          <Line
            points={[[-0.2, 0.2, 0.05], [0.2, -0.2, 0.05]]}
            color="#ffaa00"
            lineWidth={3}
          />
        </group>
      ))}

      {/* Basin/frame */}
      <group position={[0, 0.3, 0]}>
        <mesh position={[0, 0, -20.5]} receiveShadow>
          <boxGeometry args={[42, 0.4, 1]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 20.5]} receiveShadow>
          <boxGeometry args={[42, 0.4, 1]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-20.5, 0, 0]} receiveShadow>
          <boxGeometry args={[1, 0.4, 41]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[20.5, 0, 0]} receiveShadow>
          <boxGeometry args={[1, 0.4, 41]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[42, 0.4, 42]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.3} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export default WaveInterferenceSceneComponent;
