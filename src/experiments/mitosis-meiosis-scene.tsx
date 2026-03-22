'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface MitosisMeiosisData {
  phase: string;
  chromosomesCount: number;
  daughterCells: number;
}

interface MitosisMeiosisSceneProps {
  onDataChange?: (data: MitosisMeiosisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  stage?: number;
  mode?: 'mitosis' | 'meiosis';
}

export default function MitosisMeiosisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  stage = 0,
  mode = 'mitosis',
}: MitosisMeiosisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [resetTrigger, stage]);

  const phases = mode === 'mitosis'
    ? ['Prophase', 'Metaphase', 'Anaphase', 'Telophase']
    : ['Meiosis I', 'Meiosis II'];

  useEffect(() => {
    if (onDataChange) {
      const phase = phases[Math.min(stage, phases.length - 1)];
      const chromosomesCount = mode === 'mitosis' ? 46 : 23;
      const daughterCells = mode === 'mitosis' ? Math.min(2, stage + 1) : Math.min(4, stage === 3 ? 4 : stage + 1);
      onDataChange({
        phase,
        chromosomesCount,
        daughterCells,
      });
    }
  }, [stage, mode, phases, onDataChange]);

  useFrame((state, delta) => {
    if (isPlaying) {
      setProgress((p) => Math.min(100, p + delta * 10 * simulationSpeed * speed));
    }
  });

  const chromosomes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      color: i % 2 === 0 ? '#3b82f6' : '#ef4444',
      baseAngle: (i / 8) * Math.PI * 2,
    }));
  }, []);

  const getChromosomePosition = (i: number, stage: number) => {
    const phaseProgress = progress / 100;
    const chr = chromosomes[i];

    switch (stage) {
      case 0: // Prophase
        return {
          x: Math.cos(chr.baseAngle) * (1.5 - phaseProgress * 0.5),
          y: Math.sin(chr.baseAngle) * 0.3,
          z: Math.sin(chr.baseAngle) * (1.5 - phaseProgress * 0.5),
        };
      case 1: // Metaphase
        return {
          x: (i - 3.5) * 0.4,
          y: 0,
          z: 0,
        };
      case 2: // Anaphase
        const sep = phaseProgress * 2;
        return [
          { x: sep, y: 0, z: 0 },
          { x: -sep, y: 0, z: 0 },
        ];
      case 3: // Telophase
        const finalSep = 2;
        return [
          { x: finalSep, y: 0, z: 0 },
          { x: -finalSep, y: 0, z: 0 },
        ];
      default:
        return { x: 0, y: 0, z: 0 };
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#f59e0b" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshPhysicalMaterial
            color="#f59e0b"
            transparent
            opacity={0.1}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {chromosomes.map((chr, i) => {
          const pos = getChromosomePosition(i, stage);
          if (Array.isArray(pos)) {
            return pos.map((p, idx) => (
              <group key={`${i}-${idx}`} position={[p.x, p.y, p.z]}>
                <mesh>
                  <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>
                <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>
              </group>
            ));
          }
          return (
            <group key={i} position={[pos.x, pos.y, pos.z]}>
              <mesh>
                <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                <meshStandardMaterial color={chr.color} />
              </mesh>
              <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color={chr.color} />
              </mesh>
            </group>
          );
        })}

        {stage >= 3 && (
          <>
            <mesh position={[2.5, 0, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial
                color="#f59e0b"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-2.5, 0, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial
                color="#f59e0b"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {mode === 'meiosis' && stage >= 3 && (
          <>
            <mesh position={[2.5, 2, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.15}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[2.5, -2, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.15}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[-2.5, 2, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.15}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[-2.5, -2, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.15}
                roughness={0.3}
              />
            </mesh>
          </>
        )}

        <Html position={[0, -3.5, 0]} distanceFactor={10}>
          <div className={`${mode === 'mitosis' ? 'bg-amber-500' : 'bg-pink-500'}/80 text-white px-3 py-1 rounded text-sm`}>
            {mode === 'mitosis' ? 'Mitosis' : 'Meiosis'} - {phases[Math.min(stage, phases.length - 1)]}
          </div>
        </Html>
      </group>
    </>
  );
}
