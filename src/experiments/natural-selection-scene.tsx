'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface NaturalSelectionData {
  populationSize: number;
  avgFitness: number;
  generation: number;
}

interface NaturalSelectionSceneProps {
  onDataChange?: (data: NaturalSelectionData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  mutationRate?: number;
  selectionPressure?: number;
  speed?: number;
}

interface Organism {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  fitness: number;
  color: string;
  size: number;
  age: number;
}

/**
 * Natural Selection scene component - Performance optimized
 * Visualizes population evolution with natural selection over generations
 */
export default function NaturalSelectionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  mutationRate = 0.1,
  selectionPressure = 0.5,
  speed = 1,
}: NaturalSelectionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const organismsRef = useRef<Organism[]>([]);
  const generationRef = useRef(0);
  const timeRef = useRef(0);
  const lastGenerationTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<NaturalSelectionData>({
    populationSize: 30,
    avgFitness: 50,
    generation: 0,
  });

  const colors = ['#10b981', '#22c55e', '#14b8a6', '#06d6a0', '#34d399', '#6ee7b7'];

  // Initialize organisms on reset
  useEffect(() => {
    const newOrganisms: Organism[] = [];
    for (let i = 0; i < 30; i++) {
      const fitness = Math.random();
      newOrganisms.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 8,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
        fitness,
        color: colors[Math.floor(fitness * colors.length)],
        size: 0.2 + fitness * 0.15,
        age: 0,
      });
    }
    organismsRef.current = newOrganisms;
    generationRef.current = 0;
    timeRef.current = 0;
    lastGenerationTimeRef.current = 0;
    frameCountRef.current = 0;
  }, [resetTrigger]);

  // Boundary lines using Line
  const boundaryLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const w = 5, h = 2.5, d = 5;

    // Bottom rectangle
    lines.push([
      [-w, -h, -d], [w, -h, -d],
    ]);
    lines.push([
      [w, -h, -d], [w, -h, d],
    ]);
    lines.push([
      [w, -h, d], [-w, -h, d],
    ]);
    lines.push([
      [-w, -h, d], [-w, -h, -d],
    ]);

    // Vertical posts
    [[-w, -h, -d], [w, -h, -d]].forEach(([x, , z]) => {
      lines.push([[x, -h, z], [x, h, z]]);
    });

    return lines;
  }, []);

  // Fitness gradient visualization
  const fitnessHeatmap = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = 0; i < 10; i++) {
      const z = -5 + i * 1.1;
      lines.push([
        [-5, -2.9, z], [5, -2.9, z],
      ]);
    }
    return lines;
  }, []);

  // Throttled updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    timeRef.current += delta * simulationSpeed * speed;
    const organisms = organismsRef.current;

    // Update organism physics
    for (const org of organisms) {
      // Random motion (Brownian motion + fitness-driven movement)
      org.velocity.x += (Math.random() - 0.5) * 0.002 * (1 + org.fitness);
      org.velocity.y += (Math.random() - 0.5) * 0.002;
      org.velocity.z += (Math.random() - 0.5) * 0.002 * (1 + org.fitness);

      // Clamp velocity
      const maxSpeed = 0.025 * (0.5 + org.fitness * 0.5) * speed;
      const currentSpeed = org.velocity.length();
      if (currentSpeed > maxSpeed) {
        org.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      org.position.add(org.velocity.clone().multiplyScalar(simulationSpeed * speed));

      // Boundary collisions
      const bounds = { x: 5, y: 2.5, z: 5 };
      if (Math.abs(org.position.x) > bounds.x) {
        org.velocity.x *= -1;
        org.position.x = Math.sign(org.position.x) * bounds.x;
      }
      if (Math.abs(org.position.y) > bounds.y) {
        org.velocity.y *= -1;
        org.position.y = Math.sign(org.position.y) * bounds.y;
      }
      if (Math.abs(org.position.z) > bounds.z) {
        org.velocity.z *= -1;
        org.position.z = Math.sign(org.position.z) * bounds.z;
      }

      // Age the organism
      org.age += delta * simulationSpeed;
    }

    // New generation every 5 seconds
    if (timeRef.current - lastGenerationTimeRef.current > 5) {
      lastGenerationTimeRef.current = timeRef.current;
      generationRef.current++;

      // Sort by fitness (natural selection)
      const sorted = [...organisms].sort((a, b) => b.fitness - a.fitness);

      // Calculate survivors based on selection pressure
      const survivorsCount = Math.max(10, Math.floor(organisms.length * (1 - selectionPressure * 0.4)));
      const survivors = sorted.slice(0, survivorsCount);

      // Create offspring from survivors
      const offspring: Organism[] = [];
      while (survivors.length + offspring.length < 30 && survivors.length > 0) {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];
        const mutation = Math.random() < mutationRate ? (Math.random() - 0.5) * 0.3 : 0;
        const newFitness = Math.max(0.05, Math.min(1, parent.fitness + mutation));

        offspring.push({
          id: organisms.length + offspring.length,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 8,
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
          ),
          fitness: newFitness,
          color: colors[Math.floor(newFitness * colors.length)],
          size: 0.2 + newFitness * 0.15,
          age: 0,
        });
      }

      // Update population
      organismsRef.current = [...survivors, ...offspring];
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const currentOrgs = organismsRef.current;
      const avgFitness = currentOrgs.reduce((sum, o) => sum + o.fitness, 0) / currentOrgs.length;

      const newData: NaturalSelectionData = {
        populationSize: currentOrgs.length,
        avgFitness: Math.round(avgFitness * 100),
        generation: generationRef.current,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Get current organisms for rendering (updated when data updates)
  const displayOrganisms = useMemo(() => {
    return organismsRef.current.map(org => ({
      ...org,
      position: org.position.clone(),
    }));
  }, [data]); // Re-compute when data updates

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#10b981" />

      <group ref={groupRef}>
        {/* Ground/environment */}
        <mesh position={[0, -3, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#064e3b" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Boundary lines */}
        {boundaryLines.map((line, i) => (
          <Line
            key={i}
            points={line}
            color="#059669"
            lineWidth={1}
            opacity={0.5}
            transparent
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
        ))}

        {/* Fitness heatmap on ground */}
        {fitnessHeatmap.map((line, i) => (
          <Line
            key={i}
            points={line}
            color={i < 3 ? '#fbbf24' : i < 6 ? '#22c55e' : '#10b981'}
            lineWidth={2}
            opacity={0.3}
            transparent
          />
        ))}

        {/* Organisms */}
        {displayOrganisms.map((org) => (
          <group key={org.id} position={org.position}>
            {/* Organism body */}
            <mesh>
              <sphereGeometry args={[org.size, 16, 16]} />
              <meshStandardMaterial
                color={org.color}
                emissive={org.color}
                emissiveIntensity={org.fitness * 0.4}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Fitness indicator (glow) */}
            {org.fitness > 0.7 && (
              <mesh>
                <sphereGeometry args={[org.size * 1.3, 12, 12]} />
                <meshBasicMaterial
                  color={org.color}
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}

            {/* Age indicator - older organisms look slightly different */}
            {org.age > 3 && (
              <mesh>
                <sphereGeometry args={[org.size * 0.5, 8, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            )}
          </group>
        ))}

        {/* Environment pressure indicator */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.3 + selectionPressure * 0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={selectionPressure * 0.8}
          />
        </mesh>

        {/* Labels */}
        <Html position={[0, 3.8, 0]} distanceFactor={10}>
          <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Generation: {data.generation} | Population: {data.populationSize}
          </div>
        </Html>

        <Html position={[0, 3.6, -2]} distanceFactor={10}>
          <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs">
            Environment Pressure
          </div>
        </Html>

        {/* Stats panel */}
        <Html position={[-4.5, 2, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div>Avg Fitness: <span className="text-green-400 font-bold">{data.avgFitness}%</span></div>
            <div>Mutation Rate: <span className="text-yellow-400">{(mutationRate * 100).toFixed(0)}%</span></div>
            <div>Selection: <span className="text-red-400">{Math.round(selectionPressure * 100)}%</span></div>
          </div>
        </Html>

        {/* Legend */}
        <Html position={[4.5, 2, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
              <span>High Fitness</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
              <span>Low Fitness</span>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
