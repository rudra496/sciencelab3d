'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface PhotosynthesisData {
  lightReactionRate: number;
  calvinCycleRate: number;
  glucoseProduced: number;
  oxygenReleased: number;
}

interface PhotosynthesisSceneProps {
  onDataChange?: (data: PhotosynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  lightIntensity?: number;
  co2Level?: number;
  waterLevel?: number;
}

export default function PhotosynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  lightIntensity = 1,
  co2Level = 1,
  waterLevel = 1,
}: PhotosynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [glucoseProduced, setGlucoseProduced] = useState(0);
  const [oxygenReleased, setOxygenReleased] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    setGlucoseProduced(0);
    setOxygenReleased(0);
    timeRef.current = 0;
  }, [resetTrigger]);

  const thylakoids = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        Math.cos(i * 0.8) * 1.5,
        (i - 4) * 0.4,
        Math.sin(i * 0.8) * 1.5,
      ] as [number, number, number],
    }));
  }, []);

  useEffect(() => {
    if (onDataChange) {
      const lightReactionRate = lightIntensity * waterLevel;
      const calvinCycleRate = co2Level * lightIntensity * 0.8;
      onDataChange({
        lightReactionRate,
        calvinCycleRate,
        glucoseProduced: Math.round(glucoseProduced),
        oxygenReleased: Math.round(oxygenReleased),
      });
    }
  }, [lightIntensity, co2Level, waterLevel, glucoseProduced, oxygenReleased, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed;

      const lightReactionRate = lightIntensity * waterLevel;
      const calvinCycleRate = co2Level * lightIntensity * 0.8;

      setGlucoseProduced((p) => Math.min(100, p + delta * calvinCycleRate * 5 * simulationSpeed));
      setOxygenReleased((p) => Math.min(100, p + delta * lightReactionRate * 3 * simulationSpeed));
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={lightIntensity} color="#fef3c7" />
      <pointLight position={[0, -5, 0]} intensity={0.5} color="#22c55e" />
      <pointLight position={[5, 5, 5]} intensity={lightIntensity * 0.8} color="#fbbf24" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshPhysicalMaterial
            color="#22c55e"
            transparent
            opacity={0.15}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <group position={[0, 0, 0]}>
          {thylakoids.map((thylakoid, i) => (
            <group key={i} position={thylakoid.position}>
              <mesh>
                <capsuleGeometry args={[0.3, 1.5, 8, 16]} />
                <meshStandardMaterial color="#059669" roughness={0.4} />
              </mesh>
              <mesh position={[0.4, 0, 0]}>
                <capsuleGeometry args={[0.2, 1, 8, 12]} />
                <meshStandardMaterial color="#047857" roughness={0.5} />
              </mesh>
              {lightIntensity > 0.5 && (
                <mesh position={[0, 0, 0.5]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={lightIntensity}
                  />
                </mesh>
              )}
            </group>
          ))}
        </group>

        <group position={[2, 0, 2]}>
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <Html position={[0, 1, 0]} distanceFactor={10}>
            <div className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
              CO₂
            </div>
          </Html>
        </group>

        <group position={[-2, 0, 2]}>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#06b6d4" />
          </mesh>
          <Html position={[0, 0.8, 0]} distanceFactor={10}>
            <div className="bg-cyan-500/80 text-white px-2 py-1 rounded text-xs">
              H₂O
            </div>
          </Html>
        </group>

        {glucoseProduced > 10 && (
          <group position={[0, -2.5, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.2} />
            </mesh>
            <Html position={[0, 0.6, 0]} distanceFactor={10}>
              <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs">
                Glucose
              </div>
            </Html>
          </group>
        )}

        {oxygenReleased > 10 && (
          <group position={[0, 2.5, 0]}>
            {Array.from({ length: Math.min(5, Math.floor(oxygenReleased / 20)) }).map((_, i) => (
              <mesh key={i} position={[i * 0.5 - 1, 0, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
              </mesh>
            ))}
            <Html position={[0, 0.5, 0]} distanceFactor={10}>
              <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs">
                O₂
              </div>
            </Html>
          </group>
        )}

        <Html position={[0, -4, 0]} distanceFactor={10}>
          <div className="bg-green-500/80 text-white px-3 py-1 rounded text-sm">
            Chloroplast
          </div>
        </Html>
      </group>
    </>
  );
}
