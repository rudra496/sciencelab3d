'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface CellularRespirationData {
  atpProduced: number;
  stage: string;
  efficiency: number;
}

interface CellularRespirationSceneProps {
  onDataChange?: (data: CellularRespirationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  glucoseLevel?: number;
  oxygenLevel?: number;
  stage?: number;
}

export default function CellularRespirationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  glucoseLevel = 1,
  oxygenLevel = 1,
  stage = 0,
}: CellularRespirationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [atpProduced, setAtpProduced] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    setAtpProduced(0);
    timeRef.current = 0;
  }, [resetTrigger]);

  const cristae = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      position: [
        Math.cos((i / 12) * Math.PI * 2) * 2.2,
        Math.sin((i / 12) * Math.PI * 2) * 2.2,
        ((i - 6) % 4) * 0.6,
      ],
    }));
  }, []);

  useEffect(() => {
    if (onDataChange) {
      const stages = ['Glycolysis', 'Krebs Cycle', 'ETC'];
      onDataChange({
        atpProduced: Math.round(atpProduced),
        stage: stages[Math.min(stage, 2)],
        efficiency: Math.round(glucoseLevel * oxygenLevel * 100),
      });
    }
  }, [atpProduced, stage, glucoseLevel, oxygenLevel, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed;

      const production = glucoseLevel * oxygenLevel * (stage + 1) * 2;
      setAtpProduced((p) => Math.min(38, p + delta * production * simulationSpeed));
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#ef4444" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshPhysicalMaterial
            color="#dc2626"
            transparent
            opacity={0.2}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshPhysicalMaterial
            color="#b91c1c"
            transparent
            opacity={0.3}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {cristae.map((crista, i) => (
          <group key={i} position={[crista.position[0], crista.position[1], crista.position[2]]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.4} />
            </mesh>
            {stage >= 2 && oxygenLevel > 0.5 && (
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
          </group>
        ))}

        {stage >= 2 && (
          <>
            <group position={[1.5, 1.5, 1]}>
              {Array.from({ length: Math.min(6, Math.floor(atpProduced / 6)) }).map((_, i) => (
                <mesh key={i} position={[i * 0.3, 0, 0]}>
                  <sphereGeometry args={[0.15, 12, 12]} />
                  <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              ))}
              <Html position={[0.8, 0.5, 0]} distanceFactor={10}>
                <div className="bg-green-500/80 text-white px-2 py-1 rounded text-xs">
                  ATP
                </div>
              </Html>
            </group>
          </>
        )}

        {stage >= 0 && (
          <group position={[-2, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <Html position={[0, 0.5, 0]} distanceFactor={10}>
              <div className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                Glucose
              </div>
            </Html>
          </group>
        )}

        {stage >= 2 && oxygenLevel > 0.3 && (
          <group position={[2, -1.5, 0]}>
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} position={[i * 0.3, 0, 0]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color="#06b6d4" />
              </mesh>
            ))}
            <Html position={[0.6, 0.4, 0]} distanceFactor={10}>
              <div className="bg-cyan-500/80 text-white px-2 py-1 rounded text-xs">
                O₂
              </div>
            </Html>
          </group>
        )}

        <Html position={[0, -3, 0]} distanceFactor={10}>
          <div className="bg-red-500/80 text-white px-3 py-1 rounded text-sm">
            Mitochondria
          </div>
        </Html>

        {stage >= 1 && (
          <Html position={[0, 3, 0]} distanceFactor={10}>
            <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs">
              Matrix
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
