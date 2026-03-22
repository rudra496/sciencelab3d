'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface DiffusionData {
  highConcentration: number;
  lowConcentration: number;
  equilibrium: number;
}

interface DiffusionSceneProps {
  onDataChange?: (data: DiffusionData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  temperature?: number;
  permeability?: number;
  concentration?: number;
  speed?: number;
}

interface Particle {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  side: 'left' | 'right';
}

export default function DiffusionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  temperature = 1,
  permeability = 1,
  concentration = 1,
  speed = 1,
}: DiffusionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = Math.floor(40 * concentration);
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 5 - 3,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ],
        side: 'left',
      });
    }

    setParticles(newParticles);
  }, [resetTrigger, concentration]);

  useEffect(() => {
    if (onDataChange && particles.length > 0) {
      const leftCount = particles.filter((p) => p.position[0] < 0).length;
      const rightCount = particles.filter((p) => p.position[0] >= 0).length;
      const total = particles.length;
      const equilibrium = Math.abs(leftCount - rightCount) / total;

      onDataChange({
        highConcentration: leftCount,
        lowConcentration: rightCount,
        equilibrium: Math.round((1 - equilibrium) * 100),
      });
    }
  }, [particles, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      const tempMult = temperature * 2;
      const permChance = permeability * 0.1;

      setParticles((prev) =>
        prev.map((p) => {
          const newVel: [number, number, number] = [
            p.velocity[0] + (Math.random() - 0.5) * 0.005 * tempMult,
            p.velocity[1] + (Math.random() - 0.5) * 0.005 * tempMult,
            p.velocity[2] + (Math.random() - 0.5) * 0.005 * tempMult,
          ];

          const maxSpeed = 0.05 * temperature * speed;
          const currentSpeed = Math.sqrt(newVel[0] ** 2 + newVel[1] ** 2 + newVel[2] ** 2);
          if (currentSpeed > maxSpeed) {
            newVel[0] *= maxSpeed / currentSpeed;
            newVel[1] *= maxSpeed / currentSpeed;
            newVel[2] *= maxSpeed / currentSpeed;
          }

          let newPos: [number, number, number] = [
            p.position[0] + newVel[0] * simulationSpeed * speed,
            p.position[1] + newVel[1] * simulationSpeed * speed,
            p.position[2] + newVel[2] * simulationSpeed * speed,
          ];

          if (Math.abs(newPos[1]) > 2.5) {
            newVel[1] *= -1;
            newPos[1] = Math.sign(newPos[1]) * 2.5;
          }
          if (Math.abs(newPos[2]) > 2.5) {
            newVel[2] *= -1;
            newPos[2] = Math.sign(newPos[2]) * 2.5;
          }

          const membraneX = 0;
          const nearMembrane = Math.abs(newPos[0] - membraneX) < 0.3;

          if (nearMembrane && Math.random() > permChance) {
            newVel[0] *= -1;
            newPos[0] = p.position[0];
          } else if (newPos[0] < -6 || newPos[0] > 6) {
            newVel[0] *= -1;
            newPos[0] = p.position[0];
          }

          return {
            ...p,
            position: newPos,
            velocity: newVel,
            side: newPos[0] < 0 ? 'left' : 'right',
          };
        })
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[6, 5, 5]} />
          <meshPhysicalMaterial
            color="#6366f1"
            transparent
            opacity={0.05}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[6, 5, 5]} />
          <meshPhysicalMaterial
            color="#a855f7"
            transparent
            opacity={0.05}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 5, 16]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>

        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -2 + i * 1, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}

        {particles.map((p) => (
          <group key={p.id} position={p.position}>
            <mesh>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color={p.side === 'left' ? '#6366f1' : '#a855f7'}
                emissive={p.side === 'left' ? '#6366f1' : '#a855f7'}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}

        <Html position={[-3, -3.5, 0]} distanceFactor={10}>
          <div className="bg-indigo-500/80 text-white px-2 py-1 rounded text-xs">
            High Concentration
          </div>
        </Html>

        <Html position={[3, -3.5, 0]} distanceFactor={10}>
          <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs">
            Low Concentration
          </div>
        </Html>

        <Html position={[0, 3.5, 0]} distanceFactor={10}>
          <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs">
            Semi-Permeable Membrane
          </div>
        </Html>
      </group>
    </>
  );
}
