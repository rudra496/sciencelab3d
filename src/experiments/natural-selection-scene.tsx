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
  percentSmall: number;
  percentLarge: number;
  averageSize: number;
  percentSurviving: number;
  environmentPhase: string;
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
  size: number; // 0-1 (0=small/fast, 1=big/slow)
  color: 'green' | 'red'; // green=camouflaged in grass, red=visible
  alive: boolean;
  age: number;
}

interface Predator {
  id: number;
  position: [number, number, number];
  target: number | null;
}

type EnvironmentPhase = 'grass' | 'dirt' | 'snow';

export default function NaturalSelectionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  mutationRate = 0.15,
  predatorSpeed = 1,
  initialPopulation = 40,
  generationSpeed = 1,
}: NaturalSelectionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const organismsRef = useRef<Organism[]>([]);
  const predatorRef = useRef<Predator>({ id: 0, position: [0, 0, 0], target: null });
  const nextIdRef = useRef(0); // Global ID counter to avoid duplicates
  const generationRef = useRef(0);
  const generationTimeRef = useRef(0);
  const generationDataRef = useRef<{ gen: number; green: number; red: number; avgSize: number }[]>([]);
  const timeRef = useRef(0);
  const environmentPhaseRef = useRef<EnvironmentPhase>('grass');
  const environmentTimerRef = useRef(0);

  // React state for UI updates (throttled)
  const [displayData, setDisplayData] = useState<NaturalSelectionData>({
    generation: 0,
    populationCount: initialPopulation,
    percentGreen: 50,
    percentRed: 50,
    percentSmall: 50,
    percentLarge: 50,
    averageSize: 0.5,
    percentSurviving: 100,
    environmentPhase: 'Grassland',
  });

  // Environment colors
  const environmentColors = {
    grass: { background: '#1a2e1a', ground: '#15803d', name: 'Grassland', advantage: 'green' },
    dirt: { background: '#2e251a', ground: '#8B4513', name: 'Dirt Field', advantage: 'red' },
    snow: { background: '#1a1e2e', ground: '#e0e7ff', name: 'Snowy Area', advantage: 'none' },
  };

  // Initialize population
  useEffect(() => {
    const newOrganisms: Organism[] = [];
    nextIdRef.current = 0; // Reset ID counter
    for (let i = 0; i < initialPopulation; i++) {
      const isGreen = Math.random() > 0.5;
      const size = Math.random(); // 0-1
      newOrganisms.push({
        id: nextIdRef.current++,
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
    environmentPhaseRef.current = 'grass';
    environmentTimerRef.current = 0;
  }, [resetTrigger, initialPopulation]);

  // Get organism speed based on size (smaller = faster)
  const getSpeed = useCallback((size: number) => {
    return 0.025 * (1 - size * 0.7); // Size 0 => fast, Size 1 => slow
  }, []);

  // Get detection probability based on color and environment
  const getVisibility = useCallback((org: Organism, env: EnvironmentPhase): number => {
    let visibility = 0.2 + org.size * 0.3; // Base visibility + size factor

    // Environment affects color camouflage
    if (env === 'grass') {
      if (org.color === 'green') visibility -= 0.4; // Green camouflaged in grass
      else visibility += 0.3; // Red stands out
    } else if (env === 'dirt') {
      if (org.color === 'red') visibility -= 0.3; // Red blends with dirt
      else visibility += 0.2; // Green stands out
    } else if (env === 'snow') {
      // Both visible in snow
      visibility += 0.1;
    }

    return Math.max(0.05, Math.min(1, visibility));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * generationSpeed;

    const organisms = organismsRef.current;
    const predator = predatorRef.current;

    // Environment changes every 15 seconds
    environmentTimerRef.current += delta * simulationSpeed;
    if (environmentTimerRef.current > 15) {
      environmentTimerRef.current = 0;
      const phases: EnvironmentPhase[] = ['grass', 'dirt', 'snow'];
      const currentIndex = phases.indexOf(environmentPhaseRef.current);
      environmentPhaseRef.current = phases[(currentIndex + 1) % phases.length];
    }

    const currentEnv = environmentPhaseRef.current;

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
        const visibleOrgs = aliveOrgs.filter(o => Math.random() < getVisibility(o, currentEnv));
        target = visibleOrgs.length > 0
          ? visibleOrgs[Math.floor(Math.random() * visibleOrgs.length)]
          : aliveOrgs[Math.floor(Math.random() * aliveOrgs.length)];
        predator.target = target?.id ?? null;
      }

      if (target) {
        const dx = target.position[0] - predator.position[0];
        const dz = target.position[2] - predator.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        const predSpeed = 0.035 * predatorSpeed * simulationSpeed;

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

        // Mutate size
        let newSize = parent.size;
        if (hasMutation) {
          newSize = Math.max(0, Math.min(1, parent.size + (Math.random() - 0.5) * 0.4));
        }

        // Mutate color (less likely)
        let newColor = parent.color;
        if (hasMutation && Math.random() < 0.3) {
          newColor = parent.color === 'green' ? 'red' : 'green';
        }

        offspring.push({
          id: nextIdRef.current++,
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
          size: newSize,
          color: newColor,
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
      const smallCount = currentOrgs.filter(o => o.size < 0.5).length;
      const largeCount = currentOrgs.filter(o => o.size >= 0.5).length;
      const avgSize = currentOrgs.reduce((sum, o) => sum + o.size, 0) / currentOrgs.length;
      const surviving = Math.round((currentOrgs.length / initialPopulation) * 100);

      const envInfo = environmentColors[currentEnv];

      const newData: NaturalSelectionData = {
        generation: generationRef.current,
        populationCount: currentOrgs.length,
        percentGreen: Math.round((greenCount / currentOrgs.length) * 100),
        percentRed: Math.round((redCount / currentOrgs.length) * 100),
        percentSmall: Math.round((smallCount / currentOrgs.length) * 100),
        percentLarge: Math.round((largeCount / currentOrgs.length) * 100),
        averageSize: Math.round(avgSize * 100) / 100,
        percentSurviving: surviving,
        environmentPhase: envInfo.name,
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
    const zStart = -5;

    data.forEach((d, i) => {
      const x = xStart + i * 0.5;
      // Green line
      points.push([x, 0.5, zStart + (d.green / maxPop) * 3]);
      if (i < data.length - 1) {
        points.push([x + 0.5, 0.5, zStart + (data[i + 1].green / maxPop) * 3]);
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
    const zStart = -5;

    data.forEach((d, i) => {
      const x = xStart + i * 0.5;
      // Red line
      points.push([x, 0, zStart + (d.red / maxPop) * 3]);
      if (i < data.length - 1) {
        points.push([x + 0.5, 0, zStart + (data[i + 1].red / maxPop) * 3]);
      }
    });

    return points;
  }, [displayData, initialPopulation]);

  const currentEnv = environmentPhaseRef.current;
  const envInfo = environmentColors[currentEnv];

  // Memoized organism rendering
  const organismElements = useMemo(() => {
    return organismsRef.current
      .filter(o => o.alive)
      .map((org) => (
        <group key={org.id} position={org.position}>
          {/* Organism body */}
          <mesh>
            <sphereGeometry args={[0.15 + org.size * 0.1, 12, 12]} />
            <meshStandardMaterial
              color={org.color === 'green' ? '#22c55e' : '#ef4444'}
              emissive={org.color === 'green' ? '#22c55e' : '#ef4444'}
              emissiveIntensity={0.4}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          {/* Size indicator glow */}
          {org.size < 0.3 && (
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial
                color="#3b82f6"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>
      ));
  }, [displayData, currentEnv]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.3} color={envInfo.ground} />

      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.5} />

      <group ref={groupRef}>
        {/* Ground with environment-based color */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color={envInfo.ground} roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Environment details (grass/snow/rocks) */}
        {currentEnv === 'grass' && Array.from({ length: 150 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0,
              (Math.random() - 0.5) * 15,
            ]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[0.02, 0.12, 4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        ))}
        {currentEnv === 'snow' && Array.from({ length: 100 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0.05,
              (Math.random() - 0.5) * 15,
            ]}
          >
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        ))}
        {currentEnv === 'dirt' && Array.from({ length: 50 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0,
              (Math.random() - 0.5) * 15,
            ]}
          >
            <dodecahedronGeometry args={[0.1]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
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
        <group position={[-5, 4, 5]} rotation={[-Math.PI / 3, 0, 0]}>
          {/* Graph background */}
          <mesh position={[3, 0.25, -1.5]}>
            <boxGeometry args={[8, 1.5, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.9} />
          </mesh>

          {/* Green population line */}
          {populationGraphData.length > 1 && (
            <Line points={populationGraphData} color="#22c55e" lineWidth={3} />
          )}

          {/* Red population line */}
          {redGraphData.length > 1 && (
            <Line points={redGraphData} color="#ef4444" lineWidth={3} />
          )}

          <Html position={[7, 1, -1.5]} distanceFactor={15}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Population Over Generations
            </div>
          </Html>
        </group>

        {/* Size histogram */}
        <group position={[5, 4, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[3, 2, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.9} />
          </mesh>
          {/* Size bars */}
          <mesh position={[-0.8, 0.5, 0]}>
            <boxGeometry args={[0.4, Math.max(0.01, displayData.percentSmall / 50), 0.1]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[0.8, 0.5, 0]}>
            <boxGeometry args={[0.4, Math.max(0.01, displayData.percentLarge / 50), 0.1]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <Html position={[0, 1.8, 0]} distanceFactor={12}>
            <div className="text-xs text-white">Size Distribution</div>
          </Html>
        </group>

        {/* Main stats label */}
        <Html position={[0, 5, 0]} distanceFactor={12}>
          <div className={`bg-gradient-to-r px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${
            currentEnv === 'grass' ? 'from-green-600/90 to-green-700/90 text-white' :
            currentEnv === 'dirt' ? 'from-amber-700/90 to-amber-800/90 text-white' :
            'from-blue-400/90 to-blue-500/90 text-white'
          }`}>
            {envInfo.name} | Generation: {displayData.generation} | Population: {displayData.populationCount}
          </div>
        </Html>

        {/* Environment indicator */}
        <Html position={[0, -2.5, 0]} distanceFactor={15}>
          <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${
            currentEnv === 'grass' ? 'bg-green-600/90 text-white' :
            currentEnv === 'dirt' ? 'bg-amber-700/90 text-white' :
            'bg-blue-400/90 text-gray-900'
          }`}>
            Environment: {envInfo.name} {currentEnv === 'grass' ? '(🌿 Green Advantage)' : currentEnv === 'dirt' ? '(🟤 Red Advantage)' : '(❄️ Both Visible)'}
          </div>
        </Html>

        {/* Trait Distribution */}
        <Html position={[-6, 3, 4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="font-bold text-green-400 mb-2">Color Traits</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Green (Camouflaged in grass): {displayData.percentGreen}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Red (Visible in grass): {displayData.percentRed}%</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="font-bold text-blue-400 mb-1">Size Traits</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Small (Fast): {displayData.percentSmall}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Large (Slow): {displayData.percentLarge}%</span>
              </div>
            </div>
          </div>
        </Html>

        {/* Selection Pressure Info */}
        <Html position={[6, 3, 0]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs max-w-[200px]">
            <div className="font-bold text-amber-400 mb-2">How Natural Selection Works</div>
            <div className="space-y-1 text-gray-300">
              <div>1. Environment favors certain traits</div>
              <div>2. Camouflaged organisms survive more</div>
              <div>3. Small organisms escape faster</div>
              <div>4. Survivors pass traits to offspring</div>
              <div>5. Population adapts over generations</div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-green-400">✓ Camouflaged = Less visible</div>
              <div className="text-blue-400">✓ Small = Fast escape</div>
            </div>
          </div>
        </Html>

        {/* Predator indicator */}
        <Html position={[0, 2.5, -3]} distanceFactor={12}>
          <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs">
            🔴 Predator Hunts Visible Organisms
          </div>
        </Html>

        {/* Survival rate indicator */}
        <Html position={[0, -1.8, 3]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm">
            Surviving to Next Generation: <span className="font-bold text-yellow-400">{displayData.percentSurviving}%</span>
          </div>
        </Html>
      </group>
    </>
  );
}
