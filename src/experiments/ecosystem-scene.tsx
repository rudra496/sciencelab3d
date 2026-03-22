'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface EcosystemData {
  producerCount: number;
  primaryCount: number;
  secondaryCount: number;
  apexCount: number;
  totalEnergy: number;
  generation: number;
  biodiversityIndex: number;
}

interface EcosystemSceneProps {
  onDataChange?: (data: EcosystemData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  initialProducerPop?: number;
  initialPrimaryPop?: number;
  initialSecondaryPop?: number;
  initialApexPop?: number;
  reproductionRate?: number;
  predationRate?: number;
  speed?: number;
}

interface Organism {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  trophicLevel: 0 | 1 | 2 | 3; // 0=producer, 1=primary, 2=secondary, 3=apex
  alive: boolean;
  energy: number;
  age: number;
}

// Trophic level names and colors
const TROPHIC_INFO = {
  0: { name: 'Producers', color: '#22c55e', size: 0.15, speed: 0 },
  1: { name: 'Primary Consumers', color: '#3b82f6', size: 0.25, speed: 0.015 },
  2: { name: 'Secondary Consumers', color: '#f59e0b', size: 0.35, speed: 0.02 },
  3: { name: 'Apex Predator', color: '#ef4444', size: 0.5, speed: 0.025 },
};

export default function EcosystemSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  initialProducerPop = 30,
  initialPrimaryPop = 15,
  initialSecondaryPop = 6,
  initialApexPop = 2,
  reproductionRate = 0.5,
  predationRate = 0.3,
  speed = 1,
}: EcosystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const organismsRef = useRef<Organism[]>([]);
  const populationHistoryRef = useRef<{ p: number; pr: number; s: number; a: number }[]>([]);
  const timeRef = useRef(0);
  const generationRef = useRef(0);

  // React state for UI updates (throttled)
  const [displayData, setDisplayData] = useState<EcosystemData>({
    producerCount: initialProducerPop,
    primaryCount: initialPrimaryPop,
    secondaryCount: initialSecondaryPop,
    apexCount: initialApexPop,
    totalEnergy: 1000,
    generation: 0,
    biodiversityIndex: 1.5,
  });

  // Initialize organisms
  useEffect(() => {
    const organisms: Organism[] = [];
    let id = 0;

    // Producers (plants)
    for (let i = 0; i < initialProducerPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 14,
          0,
          (Math.random() - 0.5) * 14,
        ],
        velocity: [0, 0, 0],
        trophicLevel: 0,
        alive: true,
        energy: 100,
        age: 0,
      });
    }

    // Primary consumers (herbivores)
    for (let i = 0; i < initialPrimaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 12,
          0.2,
          (Math.random() - 0.5) * 12,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.01,
          0,
          (Math.random() - 0.5) * 0.01,
        ],
        trophicLevel: 1,
        alive: true,
        energy: 80,
        age: 0,
      });
    }

    // Secondary consumers (predators)
    for (let i = 0; i < initialSecondaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 10,
          0.3,
          (Math.random() - 0.5) * 10,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.015,
          0,
          (Math.random() - 0.5) * 0.015,
        ],
        trophicLevel: 2,
        alive: true,
        energy: 100,
        age: 0,
      });
    }

    // Apex predators
    for (let i = 0; i < initialApexPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 8,
          0.4,
          (Math.random() - 0.5) * 8,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          0,
          (Math.random() - 0.5) * 0.02,
        ],
        trophicLevel: 3,
        alive: true,
        energy: 150,
        age: 0,
      });
    }

    organismsRef.current = organisms;
    populationHistoryRef.current = [];
    timeRef.current = 0;
    generationRef.current = 0;
  }, [resetTrigger, initialProducerPop, initialPrimaryPop, initialSecondaryPop, initialApexPop]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * speed;

    const organisms = organismsRef.current;

    // Update organisms
    organisms.forEach((org) => {
      if (!org.alive) return;

      const info = TROPHIC_INFO[org.trophicLevel];

      // Producers sway, consumers move
      if (org.trophicLevel > 0) {
        org.velocity[0] += (Math.random() - 0.5) * 0.005 * simulationSpeed;
        org.velocity[2] += (Math.random() - 0.5) * 0.005 * simulationSpeed;

        // Clamp velocity
        const currentSpeed = Math.sqrt(org.velocity[0] ** 2 + org.velocity[2] ** 2);
        if (currentSpeed > info.speed) {
          const factor = info.speed / currentSpeed;
          org.velocity[0] *= factor;
          org.velocity[2] *= factor;
        }

        org.position[0] += org.velocity[0] * simulationSpeed;
        org.position[2] += org.velocity[2] * simulationSpeed;

        // Wrap boundaries
        const bound = 7;
        if (org.position[0] > bound) org.position[0] = -bound;
        if (org.position[0] < -bound) org.position[0] = bound;
        if (org.position[2] > bound) org.position[2] = -bound;
        if (org.position[2] < -bound) org.position[2] = bound;

        // Lose energy over time
        org.energy -= delta * 2 * simulationSpeed;

        // Hunt for prey (consumers eat lower trophic level)
        if (org.energy < 60) {
          const preyLevel = org.trophicLevel - 1 as 0 | 1 | 2;
          const prey = organisms.find(o =>
            o.alive &&
            o.trophicLevel === preyLevel &&
            Math.sqrt(
              (o.position[0] - org.position[0]) ** 2 +
              (o.position[2] - org.position[2]) ** 2
            ) < 0.8
          );

          if (prey && Math.random() < predationRate) {
            prey.alive = false;
            org.energy = Math.min(150, org.energy + 70);
          }
        }

        // Die if no energy
        if (org.energy <= 0) {
          org.alive = false;
        }
      } else {
        // Producers gain energy from sun
        org.energy = Math.min(100, org.energy + delta * 10 * simulationSpeed);
      }

      org.age += delta * simulationSpeed;
    });

    // Reproduction
    if (Math.random() < reproductionRate * delta * simulationSpeed) {
      const reproducer = organisms.find(o =>
        o.alive &&
        o.energy > 100 &&
        o.trophicLevel > 0 &&
        Math.random() < 0.1
      );

      if (reproducer) {
        reproducer.energy -= 40;
        organisms.push({
          id: organisms.length,
          position: [
            reproducer.position[0] + (Math.random() - 0.5) * 2,
            reproducer.position[1],
            reproducer.position[2] + (Math.random() - 0.5) * 2,
          ],
          velocity: [
            (Math.random() - 0.5) * 0.01,
            0,
            (Math.random() - 0.5) * 0.01,
          ],
          trophicLevel: reproducer.trophicLevel,
          alive: true,
          energy: 50,
          age: 0,
        });
      }
    }

    // Producer regrowth
    const aliveProducers = organisms.filter(o => o.alive && o.trophicLevel === 0);
    if (aliveProducers.length < initialProducerPop && Math.random() < 0.1 * simulationSpeed) {
      organisms.push({
        id: organisms.length,
        position: [
          (Math.random() - 0.5) * 14,
          0,
          (Math.random() - 0.5) * 14,
        ],
        velocity: [0, 0, 0],
        trophicLevel: 0,
        alive: true,
        energy: 50,
        age: 0,
      });
    }

    // Record population data every second
    if (Math.floor(timeRef.current) > Math.floor(timeRef.current - delta * simulationSpeed)) {
      const counts = {
        p: organisms.filter(o => o.alive && o.trophicLevel === 0).length,
        pr: organisms.filter(o => o.alive && o.trophicLevel === 1).length,
        s: organisms.filter(o => o.alive && o.trophicLevel === 2).length,
        a: organisms.filter(o => o.alive && o.trophicLevel === 3).length,
      };
      populationHistoryRef.current.push(counts);
      // Keep last 50 data points
      if (populationHistoryRef.current.length > 50) {
        populationHistoryRef.current.shift();
      }
      generationRef.current++;
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const alive = organisms.filter(o => o.alive);
      const counts = {
        producers: alive.filter(o => o.trophicLevel === 0).length,
        primary: alive.filter(o => o.trophicLevel === 1).length,
        secondary: alive.filter(o => o.trophicLevel === 2).length,
        apex: alive.filter(o => o.trophicLevel === 3).length,
      };

      // Calculate biodiversity (Shannon index approximation)
      const total = alive.length;
      const proportions = [
        counts.producers / total,
        counts.primary / total,
        counts.secondary / total,
        counts.apex / total,
      ].filter(p => p > 0);
      const biodiversity = -proportions.reduce((sum, p) => sum + p * Math.log(p), 0);

      // Calculate total energy (10% transfer rule)
      const totalEnergy = counts.producers * 100 +
        counts.primary * 10 +
        counts.secondary * 1 +
        counts.apex * 0.1;

      const newData: EcosystemData = {
        producerCount: counts.producers,
        primaryCount: counts.primary,
        secondaryCount: counts.secondary,
        apexCount: counts.apex,
        totalEnergy: Math.round(totalEnergy),
        generation: generationRef.current,
        biodiversityIndex: Math.round(biodiversity * 100) / 100,
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Population graph data
  const populationGraphData = useMemo(() => {
    const history = populationHistoryRef.current;
    if (history.length < 2) return [];

    const maxPop = Math.max(...history.map(h => Math.max(h.p, h.pr, h.s, h.a)), 1);
    const points: [number, number, number][] = [];
    const xStart = -5;
    const zStart = -5;

    // Each trophic level gets a different line
    return [
      history.map((h, i) => [xStart + i * 0.2, 2, zStart + (h.p / maxPop) * 3] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.2, 1.5, zStart + (h.pr / maxPop) * 3] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.2, 1, zStart + (h.s / maxPop) * 3] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.2, 0.5, zStart + (h.a / maxPop) * 3] as [number, number, number]),
    ];
  }, [displayData]);

  // Memoized organism rendering
  const organismElements = useMemo(() => {
    return organismsRef.current
      .filter(o => o.alive)
      .map((org) => (
        <group key={org.id} position={org.position}>
          <mesh>
            <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size, 12, 12]} />
            <meshStandardMaterial
              color={TROPHIC_INFO[org.trophicLevel].color}
              emissive={TROPHIC_INFO[org.trophicLevel].color}
              emissiveIntensity={0.3}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          {/* Energy indicator glow */}
          {org.energy > 100 && (
            <mesh>
              <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size * 1.3, 8, 8]} />
              <meshBasicMaterial
                color={TROPHIC_INFO[org.trophicLevel].color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>
      ));
  }, [displayData]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.5} />

      <group ref={groupRef}>
        {/* Ground */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Organisms */}
        {organismElements}

        {/* Population graph */}
        <group position={[-4, 4, 4]} rotation={[-Math.PI / 3, 0, 0]}>
          {/* Graph background */}
          <mesh position={[3, 1, -1.5]}>
            <boxGeometry args={[12, 3, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.9} />
          </mesh>

          {/* Population lines */}
          {populationGraphData[0] && populationGraphData[0].length > 1 && (
            <Line points={populationGraphData[0]} color="#22c55e" lineWidth={2} />
          )}
          {populationGraphData[1] && populationGraphData[1].length > 1 && (
            <Line points={populationGraphData[1]} color="#3b82f6" lineWidth={2} />
          )}
          {populationGraphData[2] && populationGraphData[2].length > 1 && (
            <Line points={populationGraphData[2]} color="#f59e0b" lineWidth={2} />
          )}
          {populationGraphData[3] && populationGraphData[3].length > 1 && (
            <Line points={populationGraphData[3]} color="#ef4444" lineWidth={2} />
          )}

          <Html position={[9, 2.5, -1.5]} distanceFactor={15}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Population Over Time
            </div>
          </Html>
        </group>

        {/* Energy flow arrows */}
        <group position={[6, 1, 0]}>
          {/* Sun to producers */}
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
          </mesh>
          <Line
            points={[[0, 3.5, 0], [0, 2, 0]]}
            color="#fbbf24"
            lineWidth={2}
            dashed
          />
          <Html position={[0.5, 3, 0]} distanceFactor={12}>
            <div className="text-yellow-400 text-xs font-bold">100%</div>
          </Html>

          {/* Producers to primary */}
          <Line
            points={[[0, 1.5, 0], [0, 0.5, 0]]}
            color="#22c55e"
            lineWidth={2}
          />
          <Html position={[0.5, 1, 0]} distanceFactor={12}>
            <div className="text-green-400 text-xs font-bold">10%</div>
          </Html>

          {/* Primary to secondary */}
          <Line
            points={[[0, 0, 0], [0, -1, 0]]}
            color="#3b82f6"
            lineWidth={2}
          />
          <Html position={[0.5, -0.5, 0]} distanceFactor={12}>
            <div className="text-blue-400 text-xs font-bold">1%</div>
          </Html>

          {/* Secondary to apex */}
          <Line
            points={[[0, -1.5, 0], [0, -2.5, 0]]}
            color="#f59e0b"
            lineWidth={2}
          />
          <Html position={[0.5, -2, 0]} distanceFactor={12}>
            <div className="text-amber-400 text-xs font-bold">0.1%</div>
          </Html>
        </group>

        {/* Food web diagram */}
        <Html position={[-6, 4, 0]} distanceFactor={12}>
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2 text-purple-400">Food Web</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Producers (Plants)</span>
              </div>
              <div className="ml-4">↓</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Primary (Herbivores)</span>
              </div>
              <div className="ml-4">↓</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Secondary (Predators)</span>
              </div>
              <div className="ml-4">↓</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Apex (Top Predator)</span>
              </div>
            </div>
          </div>
        </Html>

        {/* Main stats label */}
        <Html position={[0, 3.5, 0]} distanceFactor={12}>
          <div className="bg-teal-600/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            Generation: {displayData.generation} | Total Energy: {displayData.totalEnergy}
          </div>
        </Html>

        {/* Population breakdown */}
        <Html position={[5, 3, -4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="font-bold mb-2">Population</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Producers: {displayData.producerCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Herbivores: {displayData.primaryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Predators: {displayData.secondaryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Apex: {displayData.apexCount}</span>
            </div>
          </div>
        </Html>

        {/* Biodiversity indicator */}
        <Html position={[-5, 2.5, -5]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-purple-400">Biodiversity Index</div>
            <div className="text-lg font-bold">{displayData.biodiversityIndex}</div>
            <div className="text-xs text-gray-400">
              {displayData.biodiversityIndex > 1.3 ? 'Stable' : displayData.biodiversityIndex > 0.8 ? 'Moderate' : 'Low'}
            </div>
          </div>
        </Html>

        {/* Lotka-Volterra info */}
        <Html position={[5, 2.5, 4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-cyan-400 mb-1">Lotka-Volterra Dynamics</div>
            <div className="text-gray-300">
              Prey population grows →<br />
              Predator population grows →<br />
              Prey declines →<br />
              Predator declines →<br />
              Cycle repeats
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
