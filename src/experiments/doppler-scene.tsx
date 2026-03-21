"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface DopplerSceneProps {
  onDataChange?: (data: DopplerData) => void;
  sourceFrequency?: number;
  sourceVelocity?: number;
  waveSpeed?: number;
  showWavefronts?: boolean;
  showCompression?: boolean;
  resetTrigger?: number;
}

export interface DopplerData {
  observedFrequency: number;
  sourceFrequency: number;
  dopplerShift: number;
  machNumber: number;
  wavelength: number;
  shiftType: "redshift" | "blueshift" | "none";
}

/**
 * World-class Doppler Effect Simulation
 */
export function DopplerSceneComponent({
  onDataChange,
  sourceFrequency = 2,
  sourceVelocity = 5,
  waveSpeed = 10,
  showWavefronts = true,
  showCompression = true,
  resetTrigger,
}: DopplerSceneProps) {
  const sourceRef = useRef<THREE.Mesh>(null);
  const wavesRef = useRef<THREE.Group>(null);

  const timeRef = useRef(0);
  const sourcePositionRef = useRef(0);
  const waves = useRef<Array<{ position: number; time: number }>>([]);

  const [data, setData] = useState<DopplerData>({
    observedFrequency: sourceFrequency,
    sourceFrequency,
    dopplerShift: 0,
    machNumber: sourceVelocity / waveSpeed,
    wavelength: waveSpeed / sourceFrequency,
    shiftType: "none",
  });

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      sourcePositionRef.current = -15;
      waves.current = [];
      timeRef.current = 0;
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update source position (oscillating back and forth)
    const oscillationSpeed = 0.3;
    const amplitude = 12;
    sourcePositionRef.current = Math.sin(timeRef.current * oscillationSpeed) * amplitude;

    if (sourceRef.current) {
      sourceRef.current.position.x = sourcePositionRef.current;
    }

    // Emit new wave at regular intervals
    const waveInterval = 1 / sourceFrequency;
    const lastWave = waves.current[waves.current.length - 1];
    if (!lastWave || timeRef.current - lastWave.time >= waveInterval) {
      waves.current.push({
        position: sourcePositionRef.current,
        time: timeRef.current,
      });
      // Keep only last 20 waves
      if (waves.current.length > 20) {
        waves.current.shift();
      }
    }

    // Calculate Doppler shift for observer at right side (x = 15)
    const observerX = 15;
    const sourceX = sourcePositionRef.current;
    const sourceVel = Math.cos(timeRef.current * oscillationSpeed) * amplitude * oscillationSpeed;

    // Doppler formula: f' = f * (v / (v - vs))
    // Positive vs means moving away from observer
    let observedFreq: number;
    let shiftType: "redshift" | "blueshift" | "none";

    if (sourceVel > 0) {
      // Moving away from observer (right)
      observedFreq = sourceFrequency * (waveSpeed / (waveSpeed + sourceVel));
      shiftType = "redshift";
    } else if (sourceVel < 0) {
      // Moving towards observer (right)
      observedFreq = sourceFrequency * (waveSpeed / (waveSpeed - Math.abs(sourceVel)));
      shiftType = "blueshift";
    } else {
      observedFreq = sourceFrequency;
      shiftType = "none";
    }

    const machNumber = Math.abs(sourceVel) / waveSpeed;
    const dopplerShift = observedFreq - sourceFrequency;

    const newData: DopplerData = {
      observedFrequency: observedFreq,
      sourceFrequency,
      dopplerShift,
      machNumber,
      wavelength: waveSpeed / observedFreq,
      shiftType,
    };

    setData(newData);
    onDataChange?.(newData);
  });

  // Wave rings
  const waveElements = useMemo(() => {
    return waves.current.map((wave, i) => {
      const age = timeRef.current - wave.time;
      const radius = age * waveSpeed;
      const opacity = Math.max(0, 1 - age / 5);

      return (
        <group key={i} position={[wave.position, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
            <meshBasicMaterial
              color={data.shiftType === "blueshift" ? "#3b82f6" : data.shiftType === "redshift" ? "#ef4444" : "#22c55e"}
              transparent
              opacity={opacity * 0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    });
  }, [timeRef.current, data.shiftType]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[80, 80, "#1a1a3e", "#0a0a1e"]} position={[0, -1.99, 0]} />

      {/* Observer position */}
      <group position={[15, 0, 0]}>
        {/* Observer marker */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Observer label */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        {/* Ear symbol */}
        <mesh position={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ddd" />
        </mesh>
      </group>

      {/* Sound source */}
      <mesh ref={sourceRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Source glow */}
      <mesh ref={sourceRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Wavefronts */}
      {showWavefronts && (
        <group ref={wavesRef}>
          {waves.current.map((wave, i) => {
            const age = timeRef.current - wave.time;
            const radius = age * waveSpeed;
            const opacity = Math.max(0, 0.8 - age / 4);

            return (
              <group key={i} position={[wave.position, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius - 0.08, radius + 0.08, 64]} />
                  <meshBasicMaterial
                    color={
                      sourcePositionRef.current < wave.position
                        ? "#3b82f6" // Compressed (blueshift)
                        : "#ef4444" // Expanded (redshift)
                    }
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Center line */}
      <Line
        points={[[-30, 0, 0], [30, 0, 0]]}
        color="#333"
        lineWidth={2}
        opacity={0.5}
        transparent
      />

      {/* Direction indicator */}
      <group position={[0, -1.5, 0]}>
        <Line
          points={[[-10, 0, 0], [10, 0, 0]]}
          color="#666"
          lineWidth={3}
          dashed
          dashSize={0.5}
          gapSize={0.3}
        />
        {/* Arrowheads */}
        <mesh position={[-10.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[10.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      </group>

      {/* Mach cone (supersonic) */}
      {data.machNumber >= 1 && (
        <group position={[sourcePositionRef.current, 0, 0]}>
          {/* Mach cone visualization */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[15, 30, 2]} />
          <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Frequency visualizer */}
      {showCompression && (
        <group position={[-20, 5, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry args={[8, 4]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
          {/* Wave representation */}
          <group position={[0, 0, 0.1]}>
            {Array.from({ length: 20 }).map((_, i) => {
              const x = (i - 10) * 0.4;
              const wavelength = data.wavelength;
              const compression = data.shiftType === "blueshift" ? 0.5 : data.shiftType === "redshift" ? 1.5 : 1;
              const y = Math.sin((x / wavelength) * Math.PI * 4) * 0.5;
              const width = compression * 0.3;

              return (
                <mesh key={i} position={[x, y, 0]}>
                  <boxGeometry args={[width, 0.1, 0.1]} />
                  <meshBasicMaterial
                    color={data.shiftType === "blueshift" ? "#3b82f6" : data.shiftType === "redshift" ? "#ef4444" : "#22c55e"}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
    </group>
  );
}

export default DopplerSceneComponent;
