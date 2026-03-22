'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface EcosystemData {
  primaryConsumers: number;
  secondaryConsumers: number;
  tertiaryConsumers: number;
  energyFlow: number;
}

interface EcosystemSceneProps {
  onDataChange?: (data: EcosystemData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  producerPop?: number;
  primaryPop?: number;
  secondaryPop?: number;
  speed?: number;
}

interface Organism {
  id: number;
  position: [number, number, number];
  level: number;
  type: 'producer' | 'primary' | 'secondary' | 'tertiary';
}

export default function EcosystemSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  producerPop = 1,
  primaryPop = 1,
  secondaryPop = 1,
  speed = 1,
}: EcosystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const newOrganisms: Organism[] = [];

    const producerCount = Math.floor(20 * producerPop);
    const primaryCount = Math.floor(10 * primaryPop);
    const secondaryCount = Math.floor(5 * secondaryPop);
    const tertiaryCount = Math.floor(2);

    for (let i = 0; i < producerCount; i++) {
      newOrganisms.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 12,
          -1.5,
          (Math.random() - 0.5) * 12,
        ],
        level: 0,
        type: 'producer',
      });
    }

    for (let i = 0; i < primaryCount; i++) {
      newOrganisms.push({
        id: producerCount + i,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 10,
        ],
        level: 1,
        type: 'primary',
      });
    }

    for (let i = 0; i < secondaryCount; i++) {
      newOrganisms.push({
        id: producerCount + primaryCount + i,
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 8,
        ],
        level: 2,
        type: 'secondary',
      });
    }

    for (let i = 0; i < tertiaryCount; i++) {
      newOrganisms.push({
        id: producerCount + primaryCount + secondaryCount + i,
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 6,
        ],
        level: 3,
        type: 'tertiary',
      });
    }

    setOrganisms(newOrganisms);
    timeRef.current = 0;
  }, [resetTrigger, producerPop, primaryPop, secondaryPop]);

  useEffect(() => {
    if (onDataChange) {
      const primary = organisms.filter((o) => o.type === 'primary').length;
      const secondary = organisms.filter((o) => o.type === 'secondary').length;
      const tertiary = organisms.filter((o) => o.type === 'tertiary').length;
      const energyFlow = producerPop * 100;

      onDataChange({
        primaryConsumers: primary,
        secondaryConsumers: secondary,
        tertiaryConsumers: tertiary,
        energyFlow,
      });
    }
  }, [organisms, producerPop, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;

      setOrganisms((prev) =>
        prev.map((org) => {
          if (org.type === 'producer') return org;

          const speedMult = (org.level + 1) * 0.005;
          const angle = timeRef.current * speedMult + org.id;
          const radius = 3 + org.level * 1.5;

          return {
            ...org,
            position: [
              Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
              org.position[1],
              Math.sin(angle) * radius + (Math.random() - 0.5) * 2,
            ],
          };
        })
      );
    }
  });

  const getOrganismColor = (type: string) => {
    switch (type) {
      case 'producer': return '#22c55e';
      case 'primary': return '#3b82f6';
      case 'secondary': return '#f59e0b';
      case 'tertiary': return '#ef4444';
      default: return '#ffffff';
    }
  };

  const getOrganismSize = (type: string) => {
    switch (type) {
      case 'producer': return 0.15;
      case 'primary': return 0.25;
      case 'secondary': return 0.35;
      case 'tertiary': return 0.5;
      default: return 0.2;
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#14b8a6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, -2, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#064e3b" roughness={0.9} />
        </mesh>

        {organisms.map((org) => (
          <group key={org.id} position={org.position}>
            <mesh>
              <sphereGeometry args={[getOrganismSize(org.type), 12, 12]} />
              <meshStandardMaterial
                color={getOrganismColor(org.type)}
                emissive={getOrganismColor(org.type)}
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        ))}

        <Html position={[0, -3.5, 0]} distanceFactor={10}>
          <div className="bg-teal-500/80 text-white px-3 py-1 rounded text-sm">
            Food Web: Energy flows from producers → consumers
          </div>
        </Html>

        <Html position={[5, 3, 0]} distanceFactor={10}>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white">Producers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-white">Primary Consumers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-white">Secondary Consumers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-white">Tertiary Consumers</span>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
