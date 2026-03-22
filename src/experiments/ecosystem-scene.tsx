'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface EcosystemData {
  primaryConsumers: number;
  secondaryConsumers: number;
  tertiaryConsumers: number;
  energyFlow: number;
  producerCount: number;
  primaryCount: number;
  secondaryCount: number;
  tertiaryCount: number;
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
  phase: number;
}

// Lotka-Volterra simulation state
interface LVState {
  producerPop: number;
  primaryPop: number;
  secondaryPop: number;
  tertiaryPop: number;
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
  const frameCountRef = useRef(0);

  // Physics state in refs
  const timeRef = useRef(0);
  const organismsRef = useRef<Organism[]>([]);
  const lvStateRef = useRef<LVState>({
    producerPop: 1,
    primaryPop: 1,
    secondaryPop: 1,
    tertiaryPop: 0.5,
  });

  // React state for UI updates (throttled)
  const [displayData, setDisplayData] = useState<EcosystemData>({
    primaryConsumers: 10,
    secondaryConsumers: 5,
    tertiaryConsumers: 2,
    energyFlow: 100,
    producerCount: 20,
    primaryCount: 10,
    secondaryCount: 5,
    tertiaryCount: 2,
  });

  // Initialize organisms
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
        phase: Math.random() * Math.PI * 2,
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
        phase: Math.random() * Math.PI * 2,
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
        phase: Math.random() * Math.PI * 2,
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
        phase: Math.random() * Math.PI * 2,
      });
    }

    organismsRef.current = newOrganisms;
    timeRef.current = 0;
    lvStateRef.current = {
      producerPop: producerPop,
      primaryPop: primaryPop,
      secondaryPop: secondaryPop,
      tertiaryPop: 0.5,
    };
  }, [resetTrigger, producerPop, primaryPop, secondaryPop]);

  // Get organism colors
  const getOrganismColor = useCallback((type: string) => {
    switch (type) {
      case 'producer': return '#22c55e';
      case 'primary': return '#3b82f6';
      case 'secondary': return '#f59e0b';
      case 'tertiary': return '#ef4444';
      default: return '#ffffff';
    }
  }, []);

  // Get organism size
  const getOrganismSize = useCallback((type: string) => {
    switch (type) {
      case 'producer': return 0.15;
      case 'primary': return 0.25;
      case 'secondary': return 0.35;
      case 'tertiary': return 0.5;
      default: return 0.2;
    }
  }, []);

  // Generate food web connection lines
  const foodWebLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    const producers = organismsRef.current.filter(o => o.type === 'producer');
    const primaries = organismsRef.current.filter(o => o.type === 'primary');
    const secondaries = organismsRef.current.filter(o => o.type === 'secondary');

    // Producer to primary connections
    producers.slice(0, 3).forEach(p => {
      primaries.slice(0, 2).forEach(pr => {
        lines.push([p.position[0], p.position[1] + 0.5, p.position[2]]);
        lines.push([pr.position[0], pr.position[1] - 0.5, pr.position[2]]);
      });
    });

    // Primary to secondary connections
    primaries.slice(0, 2).forEach(p => {
      secondaries.slice(0, 1).forEach(s => {
        lines.push([p.position[0], p.position[1] + 0.5, p.position[2]]);
        lines.push([s.position[0], s.position[1] - 0.5, s.position[2]]);
      });
    });

    return lines;
  }, [resetTrigger]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * speed;

    // Update organism positions (Lotka-Volterra inspired movement)
    organismsRef.current = organismsRef.current.map((org) => {
      if (org.type === 'producer') {
        // Producers sway gently
        const sway = Math.sin(timeRef.current * 0.5 + org.phase) * 0.1;
        return {
          ...org,
          position: [
            org.position[0] + sway * 0.1,
            org.position[1],
            org.position[2],
          ],
        };
      }

      // Consumers orbit
      const speedMult = (org.level + 1) * 0.005;
      const angle = timeRef.current * speedMult + org.phase;
      const radius = 3 + org.level * 1.5;
      const wobble = Math.sin(timeRef.current * 2 + org.id) * 0.3;

      return {
        ...org,
        position: [
          Math.cos(angle) * radius + wobble,
          org.position[1],
          Math.sin(angle) * radius + wobble,
        ],
      };
    });

    // Simulate Lotka-Volterra population dynamics
    const lv = lvStateRef.current;
    const alpha = 0.5, beta = 0.02, gamma = 0.3, lvDelta = 0.01;

    // Producer grows with carrying capacity
    const dProducer = alpha * lv.producerPop * (1 - lv.producerPop / 2);

    // Primary consumers eat producers
    const dPrimary = beta * lv.producerPop * lv.primaryPop - gamma * lv.primaryPop;

    // Secondary consumers eat primary
    const dSecondary = lvDelta * lv.primaryPop * lv.secondaryPop - gamma * 0.8 * lv.secondaryPop;

    // Tertiary consumers eat secondary
    const dTertiary = lvDelta * 0.5 * lv.secondaryPop * lv.tertiaryPop - gamma * 0.6 * lv.tertiaryPop;

    lvStateRef.current = {
      producerPop: Math.max(0.2, Math.min(2, lv.producerPop + dProducer * delta * 0.1)),
      primaryPop: Math.max(0.2, Math.min(2, lv.primaryPop + dPrimary * delta * 0.1)),
      secondaryPop: Math.max(0.2, Math.min(2, lv.secondaryPop + dSecondary * delta * 0.1)),
      tertiaryPop: Math.max(0.1, Math.min(1, lv.tertiaryPop + dTertiary * delta * 0.1)),
    };

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const producers = organismsRef.current.filter(o => o.type === 'producer').length;
      const primaries = organismsRef.current.filter(o => o.type === 'primary').length;
      const secondaries = organismsRef.current.filter(o => o.type === 'secondary').length;
      const tertiaries = organismsRef.current.filter(o => o.type === 'tertiary').length;

      const newData: EcosystemData = {
        primaryConsumers: primaries,
        secondaryConsumers: secondaries,
        tertiaryConsumers: tertiaries,
        energyFlow: lvStateRef.current.producerPop * 100,
        producerCount: producers,
        primaryCount: primaries,
        secondaryCount: secondaries,
        tertiaryCount: tertiaries,
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Memoized organism rendering
  const organismElements = useMemo(() => {
    return organismsRef.current.map((org) => (
      <group key={org.id} position={org.position}>
        <mesh>
          <sphereGeometry args={[getOrganismSize(org.type), 12, 12]} />
          <meshStandardMaterial
            color={getOrganismColor(org.type)}
            emissive={getOrganismColor(org.type)}
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        {/* Glow effect for tertiary consumers */}
        {org.type === 'tertiary' && (
          <mesh>
            <sphereGeometry args={[getOrganismSize(org.type) * 1.3, 8, 8]} />
            <meshStandardMaterial
              color={getOrganismColor(org.type)}
              transparent
              opacity={0.2}
            />
          </mesh>
        )}
      </group>
    ));
  }, [resetTrigger, getOrganismColor, getOrganismSize]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#14b8a6" />
      <pointLight position={[5, 3, 5]} intensity={0.2} color="#3b82f6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Ground plane */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#064e3b" roughness={0.95} metalness={0.1} />
        </mesh>

        {/* Energy flow visualization - pyramid */}
        <Line
          points={[
            [0, -1.8, 0],
            [3, 0, 0],
            [3, 0, 3],
            [0, 0, 3],
            [0, -1.8, 0],
            [3, 0, 0],
            [3, 0, 3],
            [0, 0, 3],
          ]}
          color="#22c55e"
          lineWidth={1}
          opacity={0.3}
          transparent
        />

        {organismElements}

        {/* Population graph - energy pyramid */}
        <group position={[-6, 0, -6]}>
          <mesh position={[0, -1 + displayData.producerCount * 0.05, 0]}>
            <boxGeometry args={[2, displayData.producerCount * 0.1, 0.2]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.2 + displayData.primaryCount * 0.05, 0]}>
            <boxGeometry args={[1.5, displayData.primaryCount * 0.1, 0.2]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 1.2 + displayData.secondaryCount * 0.05, 0]}>
            <boxGeometry args={[1, displayData.secondaryCount * 0.1, 0.2]} />
            <meshStandardMaterial color="#f59e0b" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 2 + displayData.tertiaryCount * 0.05, 0]}>
            <boxGeometry args={[0.6, displayData.tertiaryCount * 0.1, 0.2]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.7} />
          </mesh>

          <Html position={[0, 3.5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Energy Pyramid
            </div>
          </Html>
        </group>

        {/* Legend */}
        <Html position={[5, 3, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded-lg space-y-1.5 text-xs">
            <div className="font-bold text-teal-400 mb-2">Trophic Levels</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              <span>Producers (plants)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
              <span>Primary (herbivores)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>
              <span>Secondary (carnivores)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
              <span>Tertiary (apex)</span>
            </div>
          </div>
        </Html>

        {/* Energy flow label */}
        <Html position={[0, -3.5, 0]} distanceFactor={10}>
          <div className="bg-teal-500/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            Energy Flow: {Math.round(displayData.energyFlow)}% • 10% rule
          </div>
        </Html>

        {/* Lotka-Volterra info */}
        <Html position={[-5, 4, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded-lg text-xs max-w-48">
            <div className="font-bold text-purple-400 mb-1">Lotka-Volterra</div>
            <div className="text-gray-300">
              dx/dt = αx - βxy<br />
              dy/dt = δxy - γy
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
