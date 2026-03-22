'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface CellularRespirationData {
  atpProduced: number;
  stage: string;
  efficiency: number;
}

interface CellularRespirationSceneProps {
  onDataChange?: (data: CellularRespirationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  glucoseLevel?: number;
  oxygenLevel?: number;
  stage?: number;
}

interface Molecule {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'glucose' | 'pyruvate' | 'atp' | 'nad' | 'fadh' | 'o2' | 'co2';
  active: boolean;
}

/**
 * Cellular Respiration scene component - Performance optimized
 * Visualizes ATP production in mitochondria through glycolysis, Krebs cycle, and ETC
 */
export default function CellularRespirationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  glucoseLevel = 1,
  oxygenLevel = 1,
  stage = 0,
}: CellularRespirationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const moleculesRef = useRef<Molecule[]>([]);
  const atpProducedRef = useRef(0);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<CellularRespirationData>({
    atpProduced: 0,
    stage: 'Glycolysis',
    efficiency: 100,
  });

  // Initialize molecules on reset
  useEffect(() => {
    const molecules: Molecule[] = [];

    // Initialize glucose molecules based on glucose level
    for (let i = 0; i < Math.floor(6 * glucoseLevel); i++) {
      molecules.push({
        position: new THREE.Vector3(
          -2 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
        type: 'glucose',
        active: true,
      });
    }

    // Initialize oxygen molecules for ETC
    for (let i = 0; i < Math.floor(8 * oxygenLevel); i++) {
      molecules.push({
        position: new THREE.Vector3(
          2 + (Math.random() - 0.5) * 2,
          -1.5 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
        ),
        type: 'o2',
        active: true,
      });
    }

    moleculesRef.current = molecules;
    atpProducedRef.current = 0;
    timeRef.current = 0;
    frameCountRef.current = 0;
  }, [resetTrigger, glucoseLevel, oxygenLevel]);

  // Throttled data updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    timeRef.current += delta * simulationSpeed;
    const molecules = moleculesRef.current;

    // Update molecule physics based on stage
    for (const mol of molecules) {
      if (!mol.active) continue;

      // Add random motion (Brownian motion)
      mol.velocity.x += (Math.random() - 0.5) * 0.003;
      mol.velocity.y += (Math.random() - 0.5) * 0.003;
      mol.velocity.z += (Math.random() - 0.5) * 0.003;

      // Clamp velocity
      const maxSpeed = 0.03;
      const currentSpeed = mol.velocity.length();
      if (currentSpeed > maxSpeed) {
        mol.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      mol.position.add(mol.velocity.clone().multiplyScalar(simulationSpeed));

      // Boundary constraints based on molecule type
      const boundary = 3;
      if (mol.position.length() > boundary) {
        mol.velocity.multiplyScalar(-1);
        mol.position.normalize().multiplyScalar(boundary);
      }

      // Stage-specific transformations
      if (mol.type === 'glucose' && stage >= 1) {
        // Glycolysis -> Krebs cycle: transform to pyruvate
        if (Math.random() < 0.005 * glucoseLevel * simulationSpeed) {
          mol.type = 'pyruvate';
          atpProducedRef.current += 2;
        }
      }

      if (mol.type === 'pyruvate' && stage >= 2) {
        // Krebs cycle: produce ATP, NADH, FADH2
        if (Math.random() < 0.003 * glucoseLevel * simulationSpeed) {
          atpProducedRef.current += 1;
        }
      }

      if (mol.type === 'o2' && stage >= 2 && oxygenLevel > 0.3) {
        // ETC: oxygen produces most ATP
        if (Math.random() < 0.008 * oxygenLevel * simulationSpeed) {
          atpProducedRef.current += 3;
        }
      }
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const stages = ['Glycolysis', 'Krebs Cycle', 'ETC'];
      const newAtpProduced = Math.min(38, Math.round(atpProducedRef.current));
      const efficiency = Math.round(glucoseLevel * oxygenLevel * 100);

      const newData: CellularRespirationData = {
        atpProduced: newAtpProduced,
        stage: stages[Math.min(stage, 2)],
        efficiency,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Cristae (inner membrane folds) - static
  const cristae = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      position: [
        Math.cos((i / 12) * Math.PI * 2) * 2.2,
        Math.sin((i / 12) * Math.PI * 2) * 2.2,
        ((i - 6) % 4) * 0.6,
      ] as [number, number, number],
    }));
  }, []);

  // Membrane lines using Line from drei
  const membraneLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      lines.push([
        Math.cos(angle) * 2.5,
        Math.sin(angle) * 2.5,
        -2,
      ]);
      lines.push([
        Math.cos(angle) * 2.5,
        Math.sin(angle) * 2.5,
        2,
      ]);
    }
    return lines;
  }, []);

  // Cristae lines
  const cristaeLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 2.2;
      const y = Math.sin(angle) * 2.2;
      const z = ((i - 6) % 4) * 0.6;
      lines.push([x * 0.8, y * 0.8, z]);
      lines.push([x, y, z]);
    }
    return lines;
  }, []);

  // Electron transport chain path lines (for ETC stage)
  const etcPathLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 4;
      lines.push([
        Math.cos(angle) * 1.8 * (0.5 + t * 0.5),
        Math.sin(angle) * 1.8 * (0.5 + t * 0.5),
        -1 + t * 2,
      ]);
    }
    return lines;
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.6} color="#ef4444" />

      <group ref={groupRef}>
        {/* Outer mitochondrial membrane */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshPhysicalMaterial
            color="#dc2626"
            transparent
            opacity={0.15}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner mitochondrial membrane */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshPhysicalMaterial
            color="#b91c1c"
            transparent
            opacity={0.2}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer membrane structure using Line */}
        <Line
          points={membraneLines}
          color="#ef4444"
          lineWidth={1}
          opacity={0.4}
          transparent
        />

        {/* Cristae using Line */}
        <Line
          points={cristaeLines}
          color="#f87171"
          lineWidth={2}
          opacity={0.5}
          transparent
        />

        {/* Cristae with ATP production sites */}
        {cristae.map((crista, i) => (
          <group key={i} position={[crista.position[0], crista.position[1], crista.position[2]]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.4} />
            </mesh>

            {/* ATP synthase complexes (for ETC stage) */}
            {stage >= 2 && oxygenLevel > 0.5 && (
              <>
                <mesh position={[0, 0.5, 0]}>
                  <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={0.6}
                  />
                </mesh>
                <mesh position={[0, 0.7, 0]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </>
            )}
          </group>
        ))}

        {/* Electron transport chain path visualization */}
        {stage >= 2 && (
          <Line
            points={etcPathLines}
            color="#06b6d4"
            lineWidth={2}
            opacity={0.6}
            transparent
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
        )}

        {/* ATP molecules being produced */}
        {stage >= 2 && (
          <group position={[1.5, 1.5, 1]}>
            {Array.from({ length: Math.min(6, Math.floor(data.atpProduced / 6)) }).map((_, i) => (
              <group key={i} position={[i * 0.35, 0, 0]}>
                <mesh>
                  <sphereGeometry args={[0.15, 12, 12]} />
                  <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.5 + Math.sin(timeRef.current * 5 + i) * 0.2}
                  />
                </mesh>
                {/* Phosphate groups */}
                {[0, 1, 2].map((j) => (
                  <mesh key={j} position={[0, 0.12 * (j + 1), 0]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshStandardMaterial color="#fbbf24" />
                  </mesh>
                ))}
              </group>
            ))}
            <Html position={[1, 0.6, 0]} distanceFactor={10}>
              <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                ATP ({data.atpProduced}/38)
              </div>
            </Html>
          </group>
        )}

        {/* Glucose molecules */}
        {stage >= 0 && (
          <group position={[-2, 0, 0]}>
            {Array.from({ length: Math.min(4, Math.ceil(glucoseLevel * 2)) }).map((_, i) => (
              <group key={i} position={[(i % 2) * 0.6 - 0.3, Math.floor(i / 2) * 0.6 - 0.3, 0]}>
                <mesh>
                  <boxGeometry args={[0.4, 0.4, 0.4]} />
                  <meshStandardMaterial
                    color="#3b82f6"
                    emissive="#3b82f6"
                    emissiveIntensity={0.3}
                  />
                </mesh>
                {/* Carbon atoms */}
                {[0, 1, 2, 3, 4, 5].map((j) => (
                  <mesh
                    key={j}
                    position={[
                      (j % 2) * 0.15 - 0.075,
                      (Math.floor(j / 3)) * 0.15 - 0.075,
                      0.22,
                    ]}
                  >
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshStandardMaterial color="#1e40af" />
                  </mesh>
                ))}
              </group>
            ))}
            <Html position={[0, 0.8, 0]} distanceFactor={10}>
              <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                Glucose
              </div>
            </Html>
          </group>
        )}

        {/* Oxygen molecules */}
        {stage >= 2 && oxygenLevel > 0.3 && (
          <group position={[2, -1.5, 0]}>
            {Array.from({ length: Math.min(6, Math.ceil(oxygenLevel * 3)) }).map((_, i) => (
              <group key={i} position={[(i % 3) * 0.4 - 0.4, Math.floor(i / 3) * 0.4 - 0.2, 0]}>
                {/* O2 molecule - two oxygen atoms */}
                <mesh position={[-0.08, 0, 0]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={0.4}
                  />
                </mesh>
                <mesh position={[0.08, 0, 0]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              </group>
            ))}
            <Html position={[0, 0.6, 0]} distanceFactor={10}>
              <div className="bg-cyan-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                O₂ (Oxygen)
              </div>
            </Html>
          </group>
        )}

        {/* Stage indicator */}
        <Html position={[0, -3.2, 0]} distanceFactor={10}>
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Mitochondria - {data.stage}
          </div>
        </Html>

        {/* Matrix label */}
        {stage >= 1 && (
          <Html position={[0, 3, 0]} distanceFactor={10}>
            <div className="bg-amber-500/80 text-white px-3 py-1 rounded text-xs">
              Matrix (Krebs Cycle)
            </div>
          </Html>
        )}

        {/* Intermembrane space label */}
        {stage >= 2 && (
          <Html position={[2.5, 1, 0]} distanceFactor={10}>
            <div className="bg-cyan-500/80 text-white px-2 py-1 rounded text-xs">
              Intermembrane Space
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -4, 0]} />
    </>
  );
}
