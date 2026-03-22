'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

export interface CellStructureData {
  selectedOrganelle: string;
  organelleCount: number;
}

interface CellStructureSceneProps {
  onDataChange?: (data: CellStructureData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  showLabels?: boolean;
  rotationEnabled?: boolean;
  showNucleus?: boolean;
  showMitochondria?: boolean;
  showER?: boolean;
  showGolgi?: boolean;
  showRibosomes?: boolean;
  showLysosomes?: boolean;
  showMembrane?: boolean;
}

export default function CellStructureSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  showLabels = true,
  rotationEnabled = true,
  showNucleus = true,
  showMitochondria = true,
  showER = true,
  showGolgi = true,
  showRibosomes = true,
  showLysosomes = true,
  showMembrane = true,
}: CellStructureSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cellRef = useRef<THREE.Group>(null);

  const organelles = useMemo(() => {
    const orgs: any[] = [];
    if (showNucleus) orgs.push({ name: 'Nucleus', color: '#3b82f6', scale: [1.8, 1.8, 1.8] });
    if (showMitochondria) orgs.push({ name: 'Mitochondria', color: '#ef4444', scale: [0.4, 0.6, 0.4] });
    if (showER) orgs.push({ name: 'Endoplasmic Reticulum', color: '#06d6a0', scale: [1.2, 0.8, 1.2] });
    if (showGolgi) orgs.push({ name: 'Golgi Apparatus', color: '#f59e0b', scale: [0.8, 0.5, 0.8] });
    if (showRibosomes) orgs.push({ name: 'Ribosomes', color: '#8b5cf6', scale: [0.15, 0.15, 0.15] });
    if (showLysosomes) orgs.push({ name: 'Lysosomes', color: '#ec4899', scale: [0.25, 0.25, 0.25] });
    return orgs;
  }, [showNucleus, showMitochondria, showER, showGolgi, showRibosomes, showLysosomes]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        selectedOrganelle: 'None',
        organelleCount: organelles.length,
      });
    }
  }, [organelles, onDataChange]);

  useFrame((state, delta) => {
    if (cellRef.current && isPlaying && rotationEnabled) {
      cellRef.current.rotation.y += delta * 0.1 * simulationSpeed;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#06d6a0" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <group ref={cellRef}>
          {showMembrane && (
            <mesh>
              <sphereGeometry args={[4, 32, 32]} />
              <meshPhysicalMaterial
                color="#06d6a0"
                transparent
                opacity={0.15}
                roughness={0.2}
                metalness={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {showNucleus && (
            <group position={[0, 0, 0]}>
              <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 1.6]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
              </mesh>
              {showLabels && (
                <Html position={[0, 2, 0]} distanceFactor={8}>
                  <div className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                    Nucleus
                  </div>
                </Html>
              )}
            </group>
          )}

          {showMitochondria && (
            <>
              <group position={[2, 0.5, 0]} rotation={[0, 0.5, 0]}>
                <mesh>
                  <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
                <mesh position={[0.1, 0, 0.2]}>
                  <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.4} />
                </mesh>
                {showLabels && (
                  <Html position={[0, 0.8, 0]} distanceFactor={8}>
                    <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs">
                      Mitochondria
                    </div>
                  </Html>
                )}
              </group>
              <group position={[-1.5, -0.8, 1]} rotation={[0, -0.8, 0.3]}>
                <mesh>
                  <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
              </group>
            </>
          )}

          {showER && (
            <group position={[0, 1.2, 0]}>
              <mesh>
                <torusGeometry args={[1, 0.15, 8, 32]} />
                <meshStandardMaterial color="#06d6a0" roughness={0.4} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
                <torusGeometry args={[0.8, 0.12, 8, 32]} />
                <meshStandardMaterial color="#059669" roughness={0.4} />
              </mesh>
              {showLabels && (
                <Html position={[1.3, 0, 0]} distanceFactor={8}>
                  <div className="bg-green-500/80 text-white px-2 py-1 rounded text-xs">
                    ER
                  </div>
                </Html>
              )}
            </group>
          )}

          {showGolgi && (
            <group position={[-2, -0.5, 0]}>
              {[0, 1, 2, 3].map((i) => (
                <mesh key={i} position={[0, i * 0.15, 0]}>
                  <sphereGeometry args={[0.4 - i * 0.08, 16, 16]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
              ))}
              {showLabels && (
                <Html position={[0, 0.8, 0]} distanceFactor={8}>
                  <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs">
                    Golgi
                  </div>
                </Html>
              )}
            </group>
          )}

          {showRibosomes && (
            <>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 2.8;
                return (
                  <mesh
                    key={i}
                    position={[Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius]}
                  >
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color="#8b5cf6" roughness={0.3} />
                  </mesh>
                );
              })}
              {showLabels && (
                <Html position={[2.5, 0.5, 2.5]} distanceFactor={8}>
                  <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs">
                    Ribosomes
                  </div>
                </Html>
              )}
            </>
          )}

          {showLysosomes && (
            <>
              <group position={[1.5, -1.5, 1.5]}>
                <mesh>
                  <sphereGeometry args={[0.25, 16, 16]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} />
                </mesh>
              </group>
              <group position={[-1.8, 1, -2]}>
                <mesh>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial color="#ec4899" roughness={0.3} />
                </mesh>
              </group>
              {showLabels && (
                <Html position={[1.8, -1.8, 1.8]} distanceFactor={8}>
                  <div className="bg-pink-500/80 text-white px-2 py-1 rounded text-xs">
                    Lysosome
                  </div>
                </Html>
              )}
            </>
          )}
        </group>
      </group>
    </>
  );
}
