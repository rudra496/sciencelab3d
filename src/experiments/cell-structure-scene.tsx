'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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

// Organelle types and their properties
const ORGANELLE_INFO = {
  Nucleus: {
    description: 'Control center containing DNA',
    color: '#3b82f6',
  },
  Mitochondria: {
    description: 'Powerhouse of the cell',
    color: '#ef4444',
  },
  ER: {
    description: 'Transport network for proteins',
    color: '#06d6a0',
  },
  Golgi: {
    description: 'Processes and packages proteins',
    color: '#f59e0b',
  },
  Ribosomes: {
    description: 'Protein synthesis factories',
    color: '#8b5cf6',
  },
  Lysosome: {
    description: 'Digestive organelles',
    color: '#ec4899',
  },
  Membrane: {
    description: 'Protective outer barrier',
    color: '#06d6a0',
  },
};

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

  // Physics state in refs
  const rotationRef = useRef(0);
  const selectedOrganelleRef = useRef<string>('None');
  const hoverOrganelleRef = useRef<string | null>(null);

  // React state for UI updates (throttled)
  const [selectedOrganelle, setSelectedOrganelle] = useState('None');
  const [uiUpdateCounter, setUiUpdateCounter] = useState(0);
  const frameCountRef = useRef(0);

  const organelles = useMemo(() => {
    const orgs: any[] = [];
    if (showNucleus) orgs.push({ name: 'Nucleus', color: '#3b82f6' });
    if (showMitochondria) orgs.push({ name: 'Mitochondria', color: '#ef4444' });
    if (showER) orgs.push({ name: 'ER', color: '#06d6a0' });
    if (showGolgi) orgs.push({ name: 'Golgi', color: '#f59e0b' });
    if (showRibosomes) orgs.push({ name: 'Ribosomes', color: '#8b5cf6' });
    if (showLysosomes) orgs.push({ name: 'Lysosome', color: '#ec4899' });
    if (showMembrane) orgs.push({ name: 'Membrane', color: '#06d6a0' });
    return orgs;
  }, [showNucleus, showMitochondria, showER, showGolgi, showRibosomes, showLysosomes, showMembrane]);

  // Click handler for organelles
  const handleOrganelleClick = useCallback((organelleName: string) => {
    selectedOrganelleRef.current = organelleName;
    setSelectedOrganelle(organelleName);
  }, []);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    // Update physics state
    if (isPlaying && rotationEnabled) {
      rotationRef.current += delta * 0.1 * simulationSpeed;
      if (cellRef.current) {
        cellRef.current.rotation.y = rotationRef.current;
      }
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0 && onDataChange) {
      setUiUpdateCounter((c) => c + 1);
      onDataChange({
        selectedOrganelle: selectedOrganelleRef.current,
        organelleCount: organelles.length,
      });
    }
  });

  const isSelected = (name: string) => selectedOrganelle === name;
  const isHovered = (name: string) => hoverOrganelleRef.current === name;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#06d6a0" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <group ref={cellRef}>
          {showMembrane && (
            <mesh
              onPointerOver={() => (hoverOrganelleRef.current = 'Membrane')}
              onPointerOut={() => (hoverOrganelleRef.current = null)}
              onClick={() => handleOrganelleClick('Membrane')}
            >
              <sphereGeometry args={[4, 32, 32]} />
              <meshPhysicalMaterial
                color="#06d6a0"
                transparent
                opacity={isSelected('Membrane') ? 0.3 : 0.15}
                roughness={0.2}
                metalness={0.1}
                emissive={isSelected('Membrane') ? '#06d6a0' : '#000000'}
                emissiveIntensity={isSelected('Membrane') ? 0.3 : 0}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {showNucleus && (
            <group position={[0, 0, 0]}>
              <mesh
                onPointerOver={() => (hoverOrganelleRef.current = 'Nucleus')}
                onPointerOut={() => (hoverOrganelleRef.current = null)}
                onClick={() => handleOrganelleClick('Nucleus')}
              >
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  roughness={0.4}
                  emissive={isSelected('Nucleus') ? '#3b82f6' : '#000000'}
                  emissiveIntensity={isSelected('Nucleus') ? 0.4 : 0}
                />
              </mesh>
              <mesh position={[0, 0, 1.6]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
              </mesh>
              {showLabels && (
                <Html position={[0, 2, 0]} distanceFactor={8}>
                  <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                    Nucleus
                  </div>
                </Html>
              )}
            </group>
          )}

          {showMitochondria && (
            <>
              <group position={[2, 0.5, 0]} rotation={[0, 0.5, 0]}>
                <mesh
                  onPointerOver={() => (hoverOrganelleRef.current = 'Mitochondria')}
                  onPointerOut={() => (hoverOrganelleRef.current = null)}
                  onClick={() => handleOrganelleClick('Mitochondria')}
                >
                  <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
                  <meshStandardMaterial
                    color="#ef4444"
                    roughness={0.3}
                    emissive={isSelected('Mitochondria') ? '#ef4444' : '#000000'}
                    emissiveIntensity={isSelected('Mitochondria') ? 0.4 : 0}
                  />
                </mesh>
                <mesh position={[0.1, 0, 0.2]}>
                  <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.4} />
                </mesh>
                {showLabels && (
                  <Html position={[0, 0.8, 0]} distanceFactor={8}>
                    <div className="bg-red-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                      Mitochondria
                    </div>
                  </Html>
                )}
              </group>
              <group position={[-1.5, -0.8, 1]} rotation={[0, -0.8, 0.3]}>
                <mesh
                  onPointerOver={() => (hoverOrganelleRef.current = 'Mitochondria')}
                  onPointerOut={() => (hoverOrganelleRef.current = null)}
                  onClick={() => handleOrganelleClick('Mitochondria')}
                >
                  <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
                  <meshStandardMaterial
                    color="#ef4444"
                    roughness={0.3}
                    emissive={isSelected('Mitochondria') ? '#ef4444' : '#000000'}
                    emissiveIntensity={isSelected('Mitochondria') ? 0.4 : 0}
                  />
                </mesh>
              </group>
            </>
          )}

          {showER && (
            <group position={[0, 1.2, 0]}>
              <mesh
                onPointerOver={() => (hoverOrganelleRef.current = 'ER')}
                onPointerOut={() => (hoverOrganelleRef.current = null)}
                onClick={() => handleOrganelleClick('ER')}
              >
                <torusGeometry args={[1, 0.15, 8, 32]} />
                <meshStandardMaterial
                  color="#06d6a0"
                  roughness={0.4}
                  emissive={isSelected('ER') ? '#06d6a0' : '#000000'}
                  emissiveIntensity={isSelected('ER') ? 0.4 : 0}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
                <torusGeometry args={[0.8, 0.12, 8, 32]} />
                <meshStandardMaterial color="#059669" roughness={0.4} />
              </mesh>
              {showLabels && (
                <Html position={[1.3, 0, 0]} distanceFactor={8}>
                  <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                    Endoplasmic Reticulum
                  </div>
                </Html>
              )}
            </group>
          )}

          {showGolgi && (
            <group position={[-2, -0.5, 0]}>
              {[0, 1, 2, 3].map((i) => (
                <mesh
                  key={i}
                  position={[0, i * 0.15, 0]}
                  onPointerOver={() => (hoverOrganelleRef.current = 'Golgi')}
                  onPointerOut={() => (hoverOrganelleRef.current = null)}
                  onClick={() => handleOrganelleClick('Golgi')}
                >
                  <sphereGeometry args={[0.4 - i * 0.08, 16, 16]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    roughness={0.4}
                    emissive={isSelected('Golgi') ? '#f59e0b' : '#000000'}
                    emissiveIntensity={isSelected('Golgi') ? 0.4 : 0}
                  />
                </mesh>
              ))}
              {showLabels && (
                <Html position={[0, 0.8, 0]} distanceFactor={8}>
                  <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                    Golgi Apparatus
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
                    onPointerOver={() => (hoverOrganelleRef.current = 'Ribosomes')}
                    onPointerOut={() => (hoverOrganelleRef.current = null)}
                    onClick={() => handleOrganelleClick('Ribosomes')}
                  >
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial
                      color="#8b5cf6"
                      roughness={0.3}
                      emissive={isSelected('Ribosomes') ? '#8b5cf6' : '#000000'}
                      emissiveIntensity={isSelected('Ribosomes') ? 0.4 : 0}
                    />
                  </mesh>
                );
              })}
              {showLabels && (
                <Html position={[2.5, 0.5, 2.5]} distanceFactor={8}>
                  <div className="bg-purple-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                    Ribosomes
                  </div>
                </Html>
              )}
            </>
          )}

          {showLysosomes && (
            <>
              <group position={[1.5, -1.5, 1.5]}>
                <mesh
                  onPointerOver={() => (hoverOrganelleRef.current = 'Lysosome')}
                  onPointerOut={() => (hoverOrganelleRef.current = null)}
                  onClick={() => handleOrganelleClick('Lysosome')}
                >
                  <sphereGeometry args={[0.25, 16, 16]} />
                  <meshStandardMaterial
                    color="#ec4899"
                    roughness={0.3}
                    emissive={isSelected('Lysosome') ? '#ec4899' : '#000000'}
                    emissiveIntensity={isSelected('Lysosome') ? 0.4 : 0}
                  />
                </mesh>
              </group>
              <group position={[-1.8, 1, -2]}>
                <mesh
                  onPointerOver={() => (hoverOrganelleRef.current = 'Lysosome')}
                  onPointerOut={() => (hoverOrganelleRef.current = null)}
                  onClick={() => handleOrganelleClick('Lysosome')}
                >
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color="#ec4899"
                    roughness={0.3}
                    emissive={isSelected('Lysosome') ? '#ec4899' : '#000000'}
                    emissiveIntensity={isSelected('Lysosome') ? 0.4 : 0}
                  />
                </mesh>
              </group>
              {showLabels && (
                <Html position={[1.8, -1.8, 1.8]} distanceFactor={8}>
                  <div className="bg-pink-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                    Lysosome
                  </div>
                </Html>
              )}
            </>
          )}
        </group>

        {/* Info panel for selected organelle */}
        {selectedOrganelle !== 'None' && ORGANELLE_INFO[selectedOrganelle as keyof typeof ORGANELLE_INFO] && (
          <Html position={[0, -5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 border-l-4 p-3 rounded text-white max-w-xs">
              <div className="font-bold text-sm mb-1" style={{ color: ORGANELLE_INFO[selectedOrganelle as keyof typeof ORGANELLE_INFO].color }}>
                {selectedOrganelle}
              </div>
              <div className="text-xs text-gray-300">
                {ORGANELLE_INFO[selectedOrganelle as keyof typeof ORGANELLE_INFO].description}
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
