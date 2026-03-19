"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function WaveInterferenceScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { frequency, amplitude, separation, speed } = useControls("Waves", {
    frequency: { value: 2, min: 0.5, max: 8, step: 0.1, label: "Frequency" },
    amplitude: { value: 0.5, min: 0.1, max: 2, step: 0.05, label: "Amplitude" },
    separation: { value: 3, min: 0.5, max: 8, step: 0.1, label: "Source Separation" },
    speed: { value: 2, min: 0.5, max: 5, step: 0.1, label: "Wave Speed" },
  });

  const segments = 100;
  const size = 12;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    return geo;
  }, []);

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta * speed;
    const t = timeRef.current;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = meshRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const posArray = posAttr.array;
    const colorArray = colorAttr?.array;

    // Source positions
    const s1x = -separation / 2;
    const s1y = 0;
    const s2x = separation / 2;
    const s2y = 0;

    const k = (2 * Math.PI * frequency) / 3;
    const omega = 2 * Math.PI * speed;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx = (i * (segments + 1) + j);
        const x = (posArray[idx * 3] / size + 0.5) * size;
        const y = (posArray[idx * 3 + 1] / size + 0.5) * size;

        // Distance from each source
        const d1 = Math.sqrt((x - s1x) ** 2 + (y - s1y) ** 2);
        const d2 = Math.sqrt((x - s2x) ** 2 + (y - s2y) ** 2);

        // Wave superposition
        const wave1 = (amplitude / Math.max(1, Math.sqrt(d1))) * Math.sin(k * d1 - omega * t);
        const wave2 = (amplitude / Math.max(1, Math.sqrt(d2))) * Math.sin(k * d2 - omega * t);
        const z = wave1 + wave2;

        posArray[idx * 3 + 2] = z;

        // Color based on displacement
        if (colorArray) {
          const normalized = (z + 2) / 4;
          // Blue for negative, red for positive
          colorArray[idx * 3] = Math.max(0, normalized);
          colorArray[idx * 3 + 1] = 0.1;
          colorArray[idx * 3 + 2] = Math.max(0, 1 - normalized);
        }
      }
    }

    posAttr.needsUpdate = true;
    if (colorAttr) colorAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <>
      <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Source markers */}
      <mesh position={[-separation / 2, 0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[separation / 2, 0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.5} />
      </mesh>

      {/* Source labels using small spheres */}
      <mesh position={[-separation / 2, 0.9, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[separation / 2, 0.9, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
    </>
  );
}
