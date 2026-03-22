'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface NaturalSelectionData {
  generation: number;
  populationCount: number;
  percentGreen: number;
  percentRed: number;
  averageSize: number;
  percentSurviving: number;
}

interface NaturalSelectionSceneProps {
  onDataChange?: (data: NaturalSelectionData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  mutationRate?: number;
  predatorSpeed?: number;
  initialPopulation?: number;
  generationSpeed?: number;
}

interface Organism {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  size: number; // 0.3-1.0 (small=fast, big=slow)
  color: 'green' | 'red'; // green=camouflaged, red=visible
  alive: boolean;
  age: number;
}

interface Predator {
  id: number;
  position: [number, number, number];
  target: number | null;
}

export default function NaturalSelectionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  mutationRate = 0.1,
  predatorSpeed = 1,
  initialPopulation = 40,
  generationSpeed = 1,
}: NaturalSelectionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const organismsRef = useRef<Organism[]>([]);
  const predatorRef = useRef<Predator>({ id: 0, position: [0, 0, 0], target: null });
  const generationRef = useRef(0);
  const generationTimeRef = useRef(0);
  const generationDataRef = useRef<{ gen: number; green: number; red: number; avgSize: number }[]>([]);
  const timeRef = useRef(0);

  // React state for UI updates (throttled)
  const [displayData, setDisplayData] = useState<NaturalSelectionData>({
    generation: 0,
    populationCount: initialPopulation,
    percentGreen: 50,
    percentRed: 50,
    averageSize: 0.6,
    percentSurviving: 100,
  });

  // Initialize population
  useEffect(() => {
    const newOrganisms: Organism[] = [];
    for (let i = 0; i < initialPopulation; i++) {
      const isGreen = Math.random() > 0.5;
      const size = 0.3 + Math.random() * 0.7;
      newOrganisms.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 14,
          0,
          (Math.random() - 0.5) * 14,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          0,
          (Math.random() - 0.5) * 0.02,
        ],
        size,
        color: isGreen ? 'green' : 'red',
        alive: true,
        age: 0,
      });
    }
    organismsRef.current = newOrganisms;
    predatorRef.current = { id: 0, position: [0, 0, 0], target: null };
    generationRef.current = 0;
    generationTimeRef.current = 0;
    generationDataRef.current = [];
    timeRef.current = 0;
  }, [resetTrigger, initialPopulation]);

  // Get organism speed based on size (smaller = faster)
  const getSpeed = useCallback((size: number) => {
    return 0.02 * (1.2 - size); // Size 0.3 => fast, Size 1.0 => slow
  }, []);

  // Get detection probability (red = more visible, large = more visible)
  const getVisibility = useCallback((org: Organism) => {
    let visibility = 0.3;
    if (org.color === 'red') visibility += 0.5;
    visibility += org.size * 0.3;
    return Math.min(1, visibility);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * generationSpeed;

    const organisms = organismsRef.current;
    const predator = predatorRef.current;

    // Update organisms (Brownian motion with size-based speed)
    organisms.forEach((org) => {
      if (!org.alive) return;

      const speed = getSpeed(org.size);
      org.velocity[0] += (Math.random() - 0.5) * 0.01 * simulationSpeed;
      org.velocity[2] += (Math.random() - 0.5) * 0.01 * simulationSpeed;

      // Clamp velocity
      const currentSpeed = Math.sqrt(org.velocity[0] ** 2 + org.velocity[2] ** 2);
      if (currentSpeed > speed) {
        const factor = speed / currentSpeed;
        org.velocity[0] *= factor;
        org.velocity[2] *= factor;
      }

      org.position[0] += org.velocity[0] * simulationSpeed;
      org.position[2] += org.velocity[2] * simulationSpeed;

      // Wrap around boundaries
      const bound = 7;
      if (org.position[0] > bound) org.position[0] = -bound;
      if (org.position[0] < -bound) org.position[0] = bound;
      if (org.position[2] > bound) org.position[2] = -bound;
      if (org.position[2] < -bound) org.position[2] = bound;

      org.age += delta * simulationSpeed;
    });

    // Predator hunting behavior
    const aliveOrgs = organisms.filter(o => o.alive);
    if (aliveOrgs.length > 0) {
      // Find nearest visible target or pick random
      let target = aliveOrgs.find(o => o.id === predator.target);
      if (!target || !target.alive) {
        const visibleOrgs = aliveOrgs.filter(o => Math.random() < getVisibility(o));
        target = visibleOrgs.length > 0
          ? visibleOrgs[Math.floor(Math.random() * visibleOrgs.length)]
          : aliveOrgs[Math.floor(Math.random() * aliveOrgs.length)];
        predator.target = target?.id ?? null;
      }

      if (target) {
        const dx = target.position[0] - predator.position[0];
        const dz = target.position[2] - predator.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        const predSpeed = 0.03 * predatorSpeed * simulationSpeed;

        if (dist > 0.5) {
          predator.position[0] += (dx / dist) * predSpeed;
          predator.position[2] += (dz / dist) * predSpeed;
        } else {
          // Catch and eat
          target.alive = false;
          predator.target = null;
        }
      }
    }

    // Check for new generation (every 6 seconds adjusted by speed)
    if (timeRef.current - generationTimeRef.current > 6 / generationSpeed) {
      generationTimeRef.current = timeRef.current;
      const newGen = generationRef.current + 1;
      generationRef.current = newGen;

      // Record data for graph
      const survivors = organisms.filter(o => o.alive);
      const greenCount = survivors.filter(o => o.color === 'green').length;
      const redCount = survivors.filter(o => o.color === 'red').length;
      const avgSize = survivors.reduce((sum, o) => sum + o.size, 0) / survivors.length;

      generationDataRef.current.push({ gen: newGen, green: greenCount, red: redCount, avgSize });

      // Survivors reproduce
      const offspring: Organism[] = [];
      while (survivors.length + offspring.length < initialPopulation && survivors.length > 0) {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];
        const hasMutation = Math.random() < mutationRate;

        offspring.push({
          id: organisms.length + offspring.length,
          position: [
            parent.position[0] + (Math.random() - 0.5) * 2,
            0,
            parent.position[2] + (Math.random() - 0.5) * 2,
          ],
          velocity: [
            (Math.random() - 0.5) * 0.02,
            0,
            (Math.random() - 0.5) * 0.02,
          ],
          size: hasMutation ? Math.max(0.3, Math.min(1, parent.size + (Math.random() - 0.5) * 0.3)) : parent.size,
          color: hasMutation ? (Math.random() > 0.5 ? 'green' : 'red') : parent.color,
          alive: true,
          age: 0,
        });
      }

      organismsRef.current = [...survivors, ...offspring];
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const currentOrgs = organismsRef.current.filter(o => o.alive);
      const greenCount = currentOrgs.filter(o => o.color === 'green').length;
      const redCount = currentOrgs.filter(o => o.color === 'red').length;
      const avgSize = currentOrgs.reduce((sum, o) => sum + o.size, 0) / currentOrgs.length;
      const surviving = Math.round((currentOrgs.length / initialPopulation) * 100);

      const newData: NaturalSelectionData = {
        generation: generationRef.current,
        populationCount: currentOrgs.length,
        percentGreen: Math.round((greenCount / currentOrgs.length) * 100),
        percentRed: Math.round((redCount / currentOrgs.length) * 100),
        averageSize: Math.round(avgSize * 100) / 100,
        percentSurviving: surviving,
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Graph data for Line component
  const populationGraphData = useMemo(() => {
    const data = generationDataRef.current;
    if (data.length === 0) return [];

    const points: [number, number, number][] = [];
    const maxPop = initialPopulation;
    const xStart = -6;
    const zStart = -6;

    data.forEach((d, i) => {
      const x = xStart + i * 0.5;
      // Green line
      points.push([x, 1, zStart + (d.green / maxPop) * 3]);
      if (i < data.length - 1) {
        points.push([x + 0.5, 1, zStart + (data[i + 1].green / maxPop) * 3]);
      }
    });

    return points;
  }, [displayData, initialPopulation]);

  const redGraphData = useMemo(() => {
    const data = generationDataRef.current;
    if (data.length === 0) return [];

    const points: [number, number, number][] = [];
    const maxPop = initialPopulation;
    const xStart = -6;
    const zStart = -6;

    data.forEach((d, i) => {
      const x = xStart + i * 0.5;
      // Red line
      points.push([x, 0.5, zStart + (d.red / maxPop) * 3]);
      if (i < data.length - 1) {
        points.push([x + 0.5, 0.5, zStart + (data[i + 1].red / maxPop) * 3]);
      }
    });

    return points;
  }, [displayData, initialPopulation]);

  // Memoized organism rendering
  const organismElements = useMemo(() => {
    return organismsRef.current
      .filter(o => o.alive)
      .map((org) => (
        <group key={org.id} position={org.position}>
          <mesh>
            <sphereGeometry args={[org.size * 0.25, 12, 12]} />
            <meshStandardMaterial
              color={org.color === 'green' ? '#22c55e' : '#ef4444'}
              emissive={org.color === 'green' ? '#22c55e' : '#ef4444'}
              emissiveIntensity={0.3}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
        </group>
      ));
  }, [displayData]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.5} />

      <group ref={groupRef}>
        {/* Grass field (green plane) */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Grass texture details */}
        {Array.from({ length: 200 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0,
              (Math.random() - 0.5) * 15,
            ]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[0.02, 0.15, 4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        ))}

        {/* Organisms */}
        {organismElements}

        {/* Predator (large red triangle/cone) */}
        <mesh position={[predatorRef.current.position[0], 0.5, predatorRef.current.position[2]]}>
          <coneGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#dc2626"
            emissiveIntensity={0.5}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[predatorRef.current.position[0], 0.5, predatorRef.current.position[2]]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>

        {/* Population graph */}
        <group position={[-5, 3, 5]} rotation={[-Math.PI / 3, 0, 0]}>
          {/* Graph background */}
          <mesh position={[3, 0.5, -1.5]}>
            <boxGeometry args={[8, 2, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.8} />
          </mesh>

          {/* Green population line */}
          {populationGraphData.length > 1 && (
            <Line points={populationGraphData} color="#22c55e" lineWidth={3} />
          )}

          {/* Red population line */}
          {redGraphData.length > 1 && (
            <Line points={redGraphData} color="#ef4444" lineWidth={3} />
          )}

          <Html position={[7, 1.5, -1.5]} distanceFactor={15}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Population Over Generations
            </div>
          </Html>
        </group>

        {/* Labels and indicators */}
        <Html position={[0, 3, 0]} distanceFactor={12}>
          <div className="bg-green-600/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            Generation: {displayData.generation} | Population: {displayData.populationCount}
          </div>
        </Html>

        <Html position={[-6, 2.5, 5]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="font-bold text-green-400 mb-2">Trait Distribution</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Green (Camouflaged): {displayData.percentGreen}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Red (Visible): {displayData.percentRed}%</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div>Avg Size: {displayData.averageSize}</div>
              <div className="text-xs text-gray-400">Smaller = Faster, Harder to Catch</div>
            </div>
          </div>
        </Html>

        <Html position={[6, 2, 0]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-amber-400 mb-2">Selection Pressure</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4" style={{ background: '#dc2626', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
              <span>Predator Hunts Visible Organisms</span>
            </div>
            <div className="text-green-400 mt-2">
              ✓ Camouflaged (green) survives more
            </div>
            <div className="text-red-400">
              ✗ Visible (red) gets eaten more
            </div>
            <div className="text-blue-400 mt-2">
              ⚡ Smaller = Faster escape
            </div>
          </div>
        </Html>

        {/* Arrow showing selection pressure */}
        <group position={[2, 1, 2]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>

        {/* Survival rate indicator */}
        <Html position={[0, -2, 0]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm">
            Surviving to Next Generation: <span className="font-bold text-yellow-400">{displayData.percentSurviving}%</span>
          </div>
        </Html>
      </group>
    </>
  );
}
