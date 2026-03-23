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

// Trophic level configuration
const TROPHIC_INFO = {
  0: { name: 'Producers', color: '#22c55e', size: 0.18, speed: 0, energyValue: 100 },
  1: { name: 'Primary Consumers', color: '#3b82f6', size: 0.3, speed: 0.018, energyValue: 10 },
  2: { name: 'Secondary Consumers', color: '#f59e0b', size: 0.45, speed: 0.025, energyValue: 1 },
  3: { name: 'Apex Predators', color: '#ef4444', size: 0.65, speed: 0.03, energyValue: 0.1 },
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

    // Producers (plants) - at ground level
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

    // Primary consumers (herbivores) - eat producers
    for (let i = 0; i < initialPrimaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 12,
          0.3,
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

    // Secondary consumers (predators) - eat primary consumers
    for (let i = 0; i < initialSecondaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 10,
          0.5,
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

    // Apex predators - eat secondary consumers
    for (let i = 0; i < initialApexPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 8,
          0.7,
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
        org.velocity[0] += (Math.random() - 0.5) * 0.006 * simulationSpeed;
        org.velocity[2] += (Math.random() - 0.5) * 0.006 * simulationSpeed;

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

        // Lose energy over time (higher trophic levels burn more energy)
        org.energy -= delta * (2 + org.trophicLevel) * simulationSpeed;

        // Hunt for prey (consumers eat lower trophic level)
        if (org.energy < 70) {
          const preyLevel = org.trophicLevel - 1 as 0 | 1 | 2;
          const prey = organisms.find(o =>
            o.alive &&
            o.trophicLevel === preyLevel &&
            Math.sqrt(
              (o.position[0] - org.position[0]) ** 2 +
              (o.position[2] - org.position[2]) ** 2
            ) < 1
          );

          if (prey && Math.random() < predationRate) {
            prey.alive = false;
            // 10% energy transfer rule - actually very inefficient
            org.energy = Math.min(150, org.energy + 50);
          }
        }

        // Die if no energy
        if (org.energy <= 0) {
          org.alive = false;
        }
      } else {
        // Producers gain energy from sun (photosynthesis)
        org.energy = Math.min(100, org.energy + delta * 12 * simulationSpeed);
      }

      org.age += delta * simulationSpeed;
    });

    // Reproduction
    if (Math.random() < reproductionRate * delta * simulationSpeed) {
      const reproducer = organisms.find(o =>
        o.alive &&
        o.energy > 90 &&
        o.trophicLevel > 0 &&
        Math.random() < 0.12
      );

      if (reproducer) {
        reproducer.energy -= 45;
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
          energy: 45,
          age: 0,
        });
      }
    }

    // Producer regrowth
    const aliveProducers = organisms.filter(o => o.alive && o.trophicLevel === 0);
    if (aliveProducers.length < initialProducerPop && Math.random() < 0.12 * simulationSpeed) {
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
      if (populationHistoryRef.current.length > 60) {
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

      // Calculate biodiversity (Shannon index)
      const total = alive.length;
      const proportions = [
        counts.producers / total,
        counts.primary / total,
        counts.secondary / total,
        counts.apex / total,
      ].filter(p => p > 0);
      const biodiversity = -proportions.reduce((sum, p) => sum + p * Math.log(p), 0);

      // Calculate total energy (10% rule: 100 -> 10 -> 1 -> 0.1)
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
    if (history.length < 2) return [[], [], [], []] as [number, number, number][][];

    const maxPop = Math.max(...history.map(h => Math.max(h.p, h.pr, h.s, h.a)), 1);
    const xStart = -5;
    const zStart = -4;

    return [
      history.map((h, i) => [xStart + i * 0.18, 2, zStart + (h.p / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, 1.2, zStart + (h.pr / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, 0.4, zStart + (h.s / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, -0.4, zStart + (h.a / maxPop) * 2.5] as [number, number, number]),
    ];
  }, [displayData]);

  // Memoized organism rendering
  const organismElements = useMemo(() => {
    return organismsRef.current
      .filter(o => o.alive)
      .map((org) => (
        <group key={org.id} position={org.position}>
          {/* Body */}
          <mesh>
            <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size, 12, 12]} />
            <meshStandardMaterial
              color={TROPHIC_INFO[org.trophicLevel].color}
              emissive={TROPHIC_INFO[org.trophicLevel].color}
              emissiveIntensity={0.35}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          {/* Energy indicator glow */}
          {org.energy > 90 && (
            <mesh>
              <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size * 1.4, 8, 8]} />
              <meshBasicMaterial
                color={TROPHIC_INFO[org.trophicLevel].color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
          {/* Trophic level ring indicator */}
          {org.trophicLevel > 0 && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[TROPHIC_INFO[org.trophicLevel].size * 1.2, 0.02, 8, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
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

        {/* Grass details */}
        {Array.from({ length: 120 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0,
              (Math.random() - 0.5) * 15,
            ]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[0.018, 0.12, 4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        ))}

        {/* Organisms */}
        {organismElements}

        {/* Population graph */}
        <group position={[-4, 5, 4]} rotation={[-Math.PI / 3.5, 0, 0]}>
          <mesh position={[4, 0.8, -2]}>
            <boxGeometry args={[14, 3.5, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.92} />
          </mesh>

          {populationGraphData[0] && populationGraphData[0].length > 1 && (
            <Line points={populationGraphData[0]} color="#22c55e" lineWidth={2.5} />
          )}
          {populationGraphData[1] && populationGraphData[1].length > 1 && (
            <Line points={populationGraphData[1]} color="#3b82f6" lineWidth={2.5} />
          )}
          {populationGraphData[2] && populationGraphData[2].length > 1 && (
            <Line points={populationGraphData[2]} color="#f59e0b" lineWidth={2.5} />
          )}
          {populationGraphData[3] && populationGraphData[3].length > 1 && (
            <Line points={populationGraphData[3]} color="#ef4444" lineWidth={2.5} />
          )}

          <Html position={[11, 2.5, -2]} distanceFactor={15}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Population Dynamics (Lotka-Volterra)
            </div>
          </Html>
        </group>

        {/* Energy Pyramid (3D) */}
        <group position={[5, 2.5, 0]}>
          <Html position={[0, 5, 0]} distanceFactor={12}>
            <div className="bg-amber-600/90 text-white px-3 py-1 rounded text-sm font-bold">
              Energy Pyramid (10% Rule)
            </div>
          </Html>

          {/* Pyramid layers */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3, 0.3, 3]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2, 0.3, 2]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
            <meshStandardMaterial color="#f59e0b" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.6, 0.3, 0.6]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.8} />
          </mesh>

          <Html position={[2, 0.4, 0]} distanceFactor={10}>
            <div className="text-green-400 text-xs">Producers<br/>100%</div>
          </Html>
          <Html position={[1.3, 1.2, 0]} distanceFactor={10}>
            <div className="text-blue-400 text-xs">Primary<br/>10%</div>
          </Html>
          <Html position={[0.8, 1.9, 0]} distanceFactor={10}>
            <div className="text-amber-400 text-xs">Secondary<br/>1%</div>
          </Html>
          <Html position={[0.5, 2.5, 0]} distanceFactor={10}>
            <div className="text-red-400 text-xs">Apex<br/>0.1%</div>
          </Html>
        </group>

        {/* Energy flow arrows */}
        <group position={[6, 0.5, -4]}>
          <Html position={[0, 3, 0]} distanceFactor={12}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs">
              Energy Flow →
            </div>
          </Html>

          <Line
            points={[[0, 2.5, 0], [0, 1.8, 0]]}
            color="#22c55e"
            lineWidth={3}
          />
          <Html position={[0.5, 2.1, 0]} distanceFactor={10}>
            <div className="text-green-400 text-xs font-bold">100%</div>
          </Html>

          <Line
            points={[[0, 1.5, 0], [0, 0.8, 0]]}
            color="#3b82f6"
            lineWidth={2}
          />
          <Html position={[0.5, 1.1, 0]} distanceFactor={10}>
            <div className="text-blue-400 text-xs font-bold">10%</div>
          </Html>

          <Line
            points={[[0, 0.5, 0], [0, -0.2, 0]]}
            color="#f59e0b"
            lineWidth={1.5}
          />
          <Html position={[0.5, 0.1, 0]} distanceFactor={10}>
            <div className="text-amber-400 text-xs font-bold">1%</div>
          </Html>

          <Line
            points={[[0, -0.5, 0], [0, -1.2, 0]]}
            color="#ef4444"
            lineWidth={1}
          />
          <Html position={[0.5, -0.9, 0]} distanceFactor={10}>
            <div className="text-red-400 text-xs font-bold">0.1%</div>
          </Html>
        </group>

        {/* Food web diagram */}
        <Html position={[-6, 4.5, 0]} distanceFactor={12}>
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2 text-teal-400">Trophic Levels</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Level 1: Producers (Plants)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ sunlight energy</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Level 2: Primary (Herbivores)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ 10% energy transfer</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Level 3: Secondary (Predators)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ 1% energy remaining</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Level 4: Apex (Top Predators)</span>
              </div>
            </div>
          </div>
        </Html>

        {/* Main stats */}
        <Html position={[0, 4, 0]} distanceFactor={12}>
          <div className="bg-teal-600/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            Generation: {displayData.generation} | Total Energy: {displayData.totalEnergy} units
          </div>
        </Html>

        {/* Population breakdown */}
        <Html position={[5, 4.5, -4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="font-bold mb-2">Current Population</div>
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
        <Html position={[-5, 3, -5]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-purple-400">Biodiversity Index</div>
            <div className="text-lg font-bold">{displayData.biodiversityIndex}</div>
            <div className="text-xs text-gray-400">
              {displayData.biodiversityIndex > 1.3 ? '✓ Stable' : displayData.biodiversityIndex > 0.8 ? '⚠ Moderate' : '⚠ Low Diversity'}
            </div>
          </div>
        </Html>

        {/* Lotka-Volterra info */}
        <Html position={[5, 3, 4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs max-w-[180px]">
            <div className="font-bold text-cyan-400 mb-1">Population Cycles</div>
            <div className="text-gray-300 leading-relaxed">
              Prey ↑ → Predator ↑<br />
              Prey ↓ → Predator ↓<br />
              Cycle repeats naturally
            </div>
            <div className="mt-2 text-amber-400">
              More species = stable ecosystem
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
