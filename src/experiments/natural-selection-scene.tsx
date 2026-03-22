'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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
  position: [number, number, number];
  fitness: number;
  color: string;
  velocity: [number, number, number];
}

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
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [generation, setGeneration] = useState(0);
  const timeRef = useRef(0);

  const colors = ['#10b981', '#22c55e', '#14b8a6', '#06d6a0'];

  useEffect(() => {
    const newOrganisms: Organism[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8,
      ],
      fitness: Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ],
    }));
    setOrganisms(newOrganisms);
    setGeneration(0);
    timeRef.current = 0;
  }, [resetTrigger]);

  useEffect(() => {
    if (onDataChange && organisms.length > 0) {
      const avgFitness = organisms.reduce((sum, o) => sum + o.fitness, 0) / organisms.length;
      onDataChange({
        populationSize: organisms.length,
        avgFitness: Math.round(avgFitness * 100),
        generation,
      });
    }
  }, [organisms, generation, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;

      setOrganisms((prev) => {
        return prev.map((org) => {
          const newPos: [number, number, number] = [
            org.position[0] + org.velocity[0] * simulationSpeed * speed,
            org.position[1] + org.velocity[1] * simulationSpeed * speed,
            org.position[2] + org.velocity[2] * simulationSpeed * speed,
          ];

          for (let i = 0; i < 3; i++) {
            if (Math.abs(newPos[i]) > 5) {
              (org.velocity as [number, number, number])[i] *= -1;
            }
          }

          return { ...org, position: newPos };
        });
      });

      if (timeRef.current > 5) {
        timeRef.current = 0;
        setGeneration((g) => g + 1);

        setOrganisms((prev) => {
          const sorted = [...prev].sort((a, b) => b.fitness - a.fitness);
          const survivors = sorted.slice(0, Math.max(15, Math.floor(prev.length * (1 - selectionPressure * 0.5))));

          const offspring: Organism[] = [];
          while (survivors.length + offspring.length < 30 && survivors.length > 0) {
            const parent = survivors[Math.floor(Math.random() * survivors.length)];
            const mutation = Math.random() < mutationRate ? (Math.random() - 0.5) * 0.2 : 0;
            offspring.push({
              id: prev.length + offspring.length,
              position: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 8,
              ],
              fitness: Math.max(0, Math.min(1, parent.fitness + mutation)),
              color: parent.color,
              velocity: [
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
              ],
            });
          }

          return [...survivors, ...offspring];
        });
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#10b981" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, -3, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#064e3b" roughness={0.9} />
        </mesh>

        {organisms.map((org) => (
          <group key={org.id} position={org.position}>
            <mesh>
              <sphereGeometry args={[0.2 + org.fitness * 0.15, 16, 16]} />
              <meshStandardMaterial
                color={org.color}
                emissive={org.color}
                emissiveIntensity={org.fitness * 0.3}
              />
            </mesh>
          </group>
        ))}

        <Html position={[0, 4, 0]} distanceFactor={10}>
          <div className="bg-green-500/80 text-white px-3 py-1 rounded text-sm">
            Generation: {generation} | Population: {organisms.length}
          </div>
        </Html>

        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={selectionPressure} />
        </mesh>
        <Html position={[0, 3.6, 0]} distanceFactor={10}>
          <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs">
            Environment
          </div>
        </Html>
      </group>
    </>
  );
}
