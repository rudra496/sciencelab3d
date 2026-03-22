'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface DNAReplicationData {
  stage: string;
  unwoundPercent: number;
  nucleotidesAdded: number;
}

interface DNAReplicationSceneProps {
  onDataChange?: (data: DNAReplicationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showHelicase?: boolean;
  showPolymerase?: boolean;
  showPrimase?: boolean;
  stage?: number;
}

export default function DNAReplicationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showHelicase = true,
  showPolymerase = true,
  showPrimase = true,
  stage = 0,
}: DNAReplicationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [unwoundPercent, setUnwoundPercent] = useState(0);
  const [nucleotidesAdded, setNucleotidesAdded] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    setUnwoundPercent(0);
    setNucleotidesAdded(0);
    timeRef.current = 0;
  }, [resetTrigger]);

  const basePairs = useMemo(() => {
    const pairs: any[] = [];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
    for (let i = 0; i < 30; i++) {
      pairs.push({
        index: i,
        colors: [colors[i % 4], colors[(i + 2) % 4]],
        y: (i - 15) * 0.4,
        angle: i * 0.5,
      });
    }
    return pairs;
  }, []);

  useEffect(() => {
    if (onDataChange) {
      const stages = ['Initiation', 'Elongation', 'Termination'];
      onDataChange({
        stage: stages[Math.min(stage, 2)],
        unwoundPercent: Math.round(unwoundPercent),
        nucleotidesAdded: Math.round(nucleotidesAdded),
      });
    }
  }, [stage, unwoundPercent, nucleotidesAdded, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      groupRef.current.rotation.y += delta * 0.2 * simulationSpeed;
      timeRef.current += delta * simulationSpeed * speed;

      if (stage >= 1) {
        setUnwoundPercent((p) => Math.min(100, p + delta * 10 * simulationSpeed * speed));
      }
      if (stage >= 2) {
        setNucleotidesAdded((p) => Math.min(60, p + delta * 5 * simulationSpeed * speed));
      }
    }
  });

  const getStrandPosition = (index: number, angle: number, strand: 0 | 1, separation: number = 0) => {
    const baseAngle = angle + (strand === 0 ? 0 : Math.PI);
    const sep = separation * (strand === 0 ? -1 : 1);
    return {
      x: Math.cos(baseAngle) * 1.5 + sep,
      y: (index - 15) * 0.4,
      z: Math.sin(baseAngle) * 1.5,
    };
  };

  const separation = stage >= 1 ? (unwoundPercent / 100) * 2 : 0;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {basePairs.map((pair) => {
          const pos1 = getStrandPosition(pair.index, pair.angle, 0, separation);
          const pos2 = getStrandPosition(pair.index, pair.angle, 1, separation);
          const midIndex = pair.index - 15;

          return (
            <group key={pair.index}>
              {stage < 2 || pair.index > nucleotidesAdded / 2 ? (
                <>
                  <mesh position={[pos1.x, pos1.y, pos1.z]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshStandardMaterial color={pair.colors[0]} />
                  </mesh>
                  <mesh position={[pos2.x, pos2.y, pos2.z]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshStandardMaterial color={pair.colors[1]} />
                  </mesh>
                  {separation < 1 && (
                    <mesh
                      position={[
                        (pos1.x + pos2.x) / 2,
                        (pos1.y + pos2.y) / 2,
                        (pos1.z + pos2.z) / 2,
                      ]}
                      rotation={[0, pair.angle, Math.PI / 2]}
                    >
                      <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
                      <meshStandardMaterial color="#f1f5f9" />
                    </mesh>
                  )}
                </>
              ) : (
                <>
                  {[0, 1].map((strand) => {
                    const pos = strand === 0 ? pos1 : pos2;
                    return (
                      <group key={strand}>
                        <mesh position={[pos.x, pos.y, pos.z]}>
                          <sphereGeometry args={[0.15, 12, 12]} />
                          <meshStandardMaterial color={pair.colors[strand]} />
                        </mesh>
                        <mesh position={[pos.x * 1.3, pos.y, pos.z * 1.3]}>
                          <sphereGeometry args={[0.12, 12, 12]} />
                          <meshStandardMaterial color={pair.colors[(strand + 1) % 2]} opacity={0.7} transparent />
                        </mesh>
                      </group>
                    );
                  })}
                </>
              )}
            </group>
          );
        })}

        {showHelicase && stage >= 1 && unwoundPercent < 100 && (
          <group position={[0, 0, 0]}>
            <mesh>
              <coneGeometry args={[0.8, 1.2, 8]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
            </mesh>
            <Html position={[1, 0, 0]} distanceFactor={10}>
              <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                Helicase
              </div>
            </Html>
          </group>
        )}

        {showPolymerase && stage >= 2 && (
          <>
            <group position={[2.5, 2, 0]}>
              <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
              </mesh>
              <Html position={[0, 0.8, 0]} distanceFactor={10}>
                <div className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                  Polymerase
                </div>
              </Html>
            </group>
            <group position={[-2.5, -2, 0]}>
              <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
              </mesh>
            </group>
          </>
        )}

        {showPrimase && stage >= 1 && (
          <group position={[1.5, -3, 1]}>
            <mesh>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>
            <Html position={[0, 0.5, 0]} distanceFactor={10}>
              <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs">
                Primase
              </div>
            </Html>
          </group>
        )}
      </group>
    </>
  );
}
