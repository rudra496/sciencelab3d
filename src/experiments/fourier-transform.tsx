"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function FourierTransformScene() {
  const waveRef = useRef<THREE.Mesh>(null);
  const spectrumRef = useRef<THREE.Group>(null);

  const { harmonics, showWaveform, showSpectrum, animationSpeed } = useControls("Fourier Transform", {
    harmonics: { value: 5, min: 1, max: 10, step: 1, label: "Number of Harmonics" },
    showWaveform: { value: true, label: "Show Waveform" },
    showSpectrum: { value: true, label: "Show Frequency Spectrum" },
    animationSpeed: { value: 1, min: 0.2, max: 3, step: 0.1, label: "Animation Speed" },
  });

  // Harmonic amplitudes (square wave approximation)
  const amplitudes = useMemo(() => {
    const amps: number[] = [];
    for (let i = 1; i <= 10; i++) {
      // Square wave: 1, 1/3, 1/5, 1/7, ...
      amps.push(1 / (2 * i - 1));
    }
    return amps;
  }, []);

  useFrame((_, delta) => {
    if (!waveRef.current) return;
    const time = performance.now() * 0.001 * animationSpeed;

    // Update waveform geometry
    const positions = waveRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
      let y = 0;

      // Sum harmonics
      for (let h = 0; h < harmonics; h++) {
        const freq = h + 1;
        const amp = amplitudes[h];
        y += amp * Math.sin(freq * x - time * 2);
      }

      positions.array[i * 3] = x;
      positions.array[i * 3 + 1] = y;
      positions.array[i * 3 + 2] = 0;
    }

    positions.needsUpdate = true;
    waveRef.current.geometry.computeVertexNormals();

    // Rotate spectrum
    if (spectrumRef.current) {
      spectrumRef.current.rotation.y += delta * 0.3;
    }
  });

  // Waveform points
  const waveformPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
      let y = 0;
      for (let h = 0; h < harmonics; h++) {
        y += amplitudes[h] * Math.sin((h + 1) * x);
      }
      points.push([x, y, 0]);
    }
    return points;
  }, [harmonics, amplitudes]);

  // Individual harmonic components
  const harmonicLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const segments = 100;

    for (let h = 0; h < harmonics; h++) {
      const points: [number, number, number][] = [];
      const amp = amplitudes[h];

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
        const y = amp * Math.sin((h + 1) * x);
        points.push([x, y - 3 - h * 0.5, 0]);
      }

      lines.push(points);
    }

    return lines;
  }, [harmonics, amplitudes]);

  return (
    <>
      {/* Main waveform */}
      {showWaveform && (
        <mesh ref={waveRef}>
          <planeGeometry args={[Math.PI * 4, 3, 200, 1]} />
          <meshStandardMaterial
            color="#ff6b35"
            wireframe
            emissive="#ff6b35"
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Waveform line */}
      {showWaveform && (
        <Line
          points={waveformPoints}
          color="#ff6b35"
          lineWidth={2}
        />
      )}

      {/* Individual harmonics */}
      {harmonicLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={`hsl(${i * 36}, 70%, 50%)`}
          lineWidth={1}
          opacity={0.6}
          transparent
        />
      ))}

      {/* Frequency spectrum */}
      {showSpectrum && (
        <group ref={spectrumRef} position={[4, 0, 0]}>
          {Array.from({ length: harmonics }).map((_, i) => {
            const amp = amplitudes[i];
            return (
              <mesh key={i} position={[i * 0.5, amp / 2, 0]}>
                <boxGeometry args={[0.3, amp, 0.3]} />
                <meshStandardMaterial
                  color={`hsl(${i * 36}, 70%, 50%)`}
                  emissive={`hsl(${i * 36}, 70%, 50%)`}
                  emissiveIntensity={0.4}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Reference axis */}
      <mesh position={[0, -4, 0]}>
        <boxGeometry args={[Math.PI * 4 + 1, 0.02, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-Math.PI * 2 - 0.5, 0, 0]}>
        <boxGeometry args={[0.02, 8, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Spectrum axis */}
      {showSpectrum && (
        <>
          <mesh position={[4, -1, 0]}>
            <boxGeometry args={[6, 0.02, 0.02]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[1, 0, 0]}>
            <boxGeometry args={[0.02, 3, 0.02]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        </>
      )}

      <gridHelper args={[16, 32, "#1a1a3e", "#1a1a3e"]} position={[0, -5, 0]} />
    </>
  );
}
