'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface ImmuneResponseData {
  virusCount: number;
  antibodyCount: number;
  tCellCount: number;
}

interface ImmuneResponseSceneProps {
  onDataChange?: (data: ImmuneResponseData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  virusLevel?: number;
  antibodyRate?: number;
  speed?: number;
}

interface Virus {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
}

interface Antibody {
  id: number;
  position: [number, number, number];
  targetId: number | null;
}

export default function ImmuneResponseSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  virusLevel = 1,
  antibodyRate = 1,
  speed = 1,
}: ImmuneResponseSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [viruses, setViruses] = useState<Virus[]>([]);
  const [antibodies, setAntibodies] = useState<Antibody[]>([]);
  const [tCells, setTCells] = useState<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const newViruses: Virus[] = Array.from({ length: Math.floor(10 * virusLevel) }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 10,
      ],
      velocity: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ],
    }));
    setViruses(newViruses);
    setAntibodies([]);
    setTCells(2);
    timeRef.current = 0;
  }, [resetTrigger, virusLevel]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        virusCount: viruses.length,
        antibodyCount: antibodies.length,
        tCellCount: tCells,
      });
    }
  }, [viruses.length, antibodies.length, tCells, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;

      setViruses((prev) => {
        const updated = prev.map((v) => {
          const newPos: [number, number, number] = [
            v.position[0] + v.velocity[0] * simulationSpeed * speed,
            v.position[1] + v.velocity[1] * simulationSpeed * speed,
            v.position[2] + v.velocity[2] * simulationSpeed * speed,
          ];

          for (let i = 0; i < 3; i++) {
            if (Math.abs(newPos[i]) > 6) {
              (v.velocity as [number, number, number])[i] *= -1;
            }
          }

          return { ...v, position: newPos };
        });

        if (Math.random() < 0.001 * virusLevel * simulationSpeed && updated.length < 30) {
          const newId = Math.max(0, ...updated.map((v) => v.id)) + 1;
          updated.push({
            id: newId,
            position: [
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
            ],
            velocity: [
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
            ],
          });
        }

        return updated;
      });

      setAntibodies((prev) => {
        let updated = [...prev];

        if (Math.random() < 0.02 * antibodyRate * simulationSpeed && viruses.length > 0) {
          const newId = Math.max(0, ...prev.map((a) => a.id), 0) + 1;
          const targetVirus = viruses[Math.floor(Math.random() * viruses.length)];
          updated.push({
            id: newId,
            position: [5, 2, 5],
            targetId: targetVirus.id,
          });
        }

        updated = updated.map((ab) => {
          if (ab.targetId !== null) {
            const target = viruses.find((v) => v.id === ab.targetId);
            if (target) {
              const dx = target.position[0] - ab.position[0];
              const dy = target.position[1] - ab.position[1];
              const dz = target.position[2] - ab.position[2];
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

              if (dist < 0.5) {
                setViruses((v) => v.filter((vir) => vir.id !== ab.targetId));
                return null;
              }

              return {
                ...ab,
                position: [
                  ab.position[0] + (dx / dist) * 0.05 * simulationSpeed * speed,
                  ab.position[1] + (dy / dist) * 0.05 * simulationSpeed * speed,
                  ab.position[2] + (dz / dist) * 0.05 * simulationSpeed * speed,
                ] as [number, number, number],
              };
            }
          }
          return ab;
        }).filter((ab): ab is Antibody => ab !== null);

        return updated;
      });

      if (timeRef.current > 10 && tCells < 8) {
        setTCells((t) => Math.min(8, t + 1));
        timeRef.current = 0;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#f97316" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshPhysicalMaterial
            color="#f97316"
            transparent
            opacity={0.05}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {viruses.map((virus) => (
          <group key={virus.id} position={virus.position}>
            <mesh>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 6) * Math.PI * 2) * 0.25,
                  Math.sin((i / 6) * Math.PI * 2) * 0.25,
                  0,
                ]}
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#fca5a5" />
              </mesh>
            ))}
          </group>
        ))}

        {antibodies.map((ab) => (
          <group key={ab.id} position={ab.position}>
            <mesh>
              <boxGeometry args={[0.15, 0.15, 0.4]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}

        {Array.from({ length: tCells }).map((_, i) => (
          <group
            key={`tcell-${i}`}
            position={[
              Math.cos((i / tCells) * Math.PI * 2 + timeRef.current * 0.5) * 4,
              0,
              Math.sin((i / tCells) * Math.PI * 2 + timeRef.current * 0.5) * 4,
            ]}
          >
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
          </group>
        ))}

        <Html position={[0, -5, 0]} distanceFactor={10}>
          <div className="bg-orange-500/80 text-white px-3 py-1 rounded text-sm">
            Immune Response: {viruses.length} viruses | {antibodies.length} antibodies
          </div>
        </Html>
      </group>
    </>
  );
}
