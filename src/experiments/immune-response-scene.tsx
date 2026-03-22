'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
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
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
  rotation: THREE.Vector3;
}

interface Antibody {
  id: number;
  position: THREE.Vector3;
  targetId: number | null;
  active: boolean;
}

interface TCell {
  angle: number;
  radius: number;
  verticalOffset: number;
}

/**
 * Immune Response scene component - Performance optimized
 * Visualizes immune system fighting viral infection in a blood vessel
 */
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

  // Performance refs - physics state updated every frame
  const virusesRef = useRef<Virus[]>([]);
  const antibodiesRef = useRef<Antibody[]>([]);
  const tCellsRef = useRef<TCell[]>([]);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<ImmuneResponseData>({
    virusCount: 10,
    antibodyCount: 0,
    tCellCount: 2,
  });

  // Initialize on reset
  useEffect(() => {
    const newViruses: Virus[] = [];
    for (let i = 0; i < Math.floor(10 * virusLevel); i++) {
      newViruses.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 10,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
        ),
        active: true,
        rotation: new THREE.Vector3(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ),
      });
    }

    virusesRef.current = newViruses;
    antibodiesRef.current = [];
    tCellsRef.current = Array.from({ length: 2 }, (_, i) => ({
      angle: (i / 2) * Math.PI * 2,
      radius: 4,
      verticalOffset: 0,
    }));
    timeRef.current = 0;
    frameCountRef.current = 0;
  }, [resetTrigger, virusLevel]);

  // Blood vessel structure
  const vesselStructure = useMemo(() => {
    const lines: [number, number, number][][] = [];

    // Circular cross-section rings
    for (let x = -8; x <= 8; x += 2) {
      const ring: [number, number, number][] = [];
      for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        ring.push([
          x,
          Math.sin(angle) * 3.5,
          Math.cos(angle) * 3.5,
        ]);
      }
      lines.push(ring);
    }

    // Longitudinal lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const y = Math.sin(angle) * 3.5;
      const z = Math.cos(angle) * 3.5;
      lines.push([
        [-8, y, z],
        [8, y, z],
      ]);
    }

    return lines;
  }, []);

  // Red blood cell flow indicators
  const flowLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = 0; i < 6; i++) {
      const y = (i - 2.5) * 1.2;
      const z = Math.sin(i * 0.8) * 2;
      lines.push([
        [-10, y, z],
        [10, y, z],
      ]);
    }
    return lines;
  }, []);

  // Throttled updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    timeRef.current += delta * simulationSpeed * speed;
    const viruses = virusesRef.current;
    const antibodies = antibodiesRef.current;

    // Update virus physics
    for (const virus of viruses) {
      if (!virus.active) continue;

      // Random motion
      virus.velocity.x += (Math.random() - 0.5) * 0.002;
      virus.velocity.y += (Math.random() - 0.5) * 0.002;
      virus.velocity.z += (Math.random() - 0.5) * 0.002;

      // Clamp velocity
      const maxSpeed = 0.02 * speed;
      const currentSpeed = virus.velocity.length();
      if (currentSpeed > maxSpeed) {
        virus.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      virus.position.add(virus.velocity.clone().multiplyScalar(simulationSpeed * speed));

      // Rotate virus
      virus.rotation.x += delta * 2;
      virus.rotation.y += delta * 1.5;

      // Boundary collisions
      const bounds = 6;
      if (Math.abs(virus.position.x) > bounds) virus.velocity.x *= -1;
      if (Math.abs(virus.position.y) > bounds) virus.velocity.y *= -1;
      if (Math.abs(virus.position.z) > bounds) virus.velocity.z *= -1;

      // Keep within bounds
      virus.position.x = Math.max(-bounds, Math.min(bounds, virus.position.x));
      virus.position.y = Math.max(-bounds, Math.min(bounds, virus.position.y));
      virus.position.z = Math.max(-bounds, Math.min(bounds, virus.position.z));
    }

    // Spawn new viruses periodically
    if (Math.random() < 0.001 * virusLevel * simulationSpeed && viruses.length < 35) {
      const newId = Math.max(0, ...viruses.map((v) => v.id)) + 1;
      viruses.push({
        id: newId,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
        ),
        active: true,
        rotation: new THREE.Vector3(0, 0, 0),
      });
    }

    // Spawn antibodies
    if (Math.random() < 0.025 * antibodyRate * simulationSpeed && viruses.length > 0) {
      const newId = Math.max(0, ...antibodies.map((a) => a.id), 0) + 1;
      const targetVirus = viruses.filter(v => v.active)[Math.floor(Math.random() * viruses.filter(v => v.active).length)];
      if (targetVirus) {
        antibodies.push({
          id: newId,
          position: new THREE.Vector3(5, 2, 5),
          targetId: targetVirus.id,
          active: true,
        });
      }
    }

    // Update antibody positions and targeting
    for (let i = antibodies.length - 1; i >= 0; i--) {
      const ab = antibodies[i];
      if (!ab.active) {
        antibodies.splice(i, 1);
        continue;
      }

      if (ab.targetId !== null) {
        const target = viruses.find((v) => v.id === ab.targetId && v.active);
        if (target) {
          const direction = new THREE.Vector3()
            .subVectors(target.position, ab.position)
            .normalize();
          ab.position.add(direction.multiplyScalar(0.06 * simulationSpeed * speed));

          const distance = ab.position.distanceTo(target.position);
          if (distance < 0.5) {
            // Antibody neutralizes virus
            target.active = false;
            ab.active = false;
          }
        } else {
          ab.active = false;
        }
      }
    }

    // Clean up inactive viruses
    for (let i = viruses.length - 1; i >= 0; i--) {
      if (!viruses[i].active) {
        viruses.splice(i, 1);
      }
    }

    // Update T-cells (rotate around the vessel)
    for (const tCell of tCellsRef.current) {
      tCell.angle += delta * 0.5 * simulationSpeed * speed;
    }

    // Spawn more T-cells over time
    if (timeRef.current > 10 && tCellsRef.current.length < 8) {
      tCellsRef.current.push({
        angle: timeRef.current * 0.5,
        radius: 4,
        verticalOffset: 0,
      });
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const newData: ImmuneResponseData = {
        virusCount: viruses.filter(v => v.active).length,
        antibodyCount: antibodies.length,
        tCellCount: tCellsRef.current.length,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Get display data for rendering
  const displayData = useMemo(() => ({
    viruses: virusesRef.current.filter(v => v.active).map(v => ({
      ...v,
      position: v.position.clone(),
      rotation: v.rotation.clone(),
    })),
    antibodies: antibodiesRef.current.filter(a => a.active).map(a => ({
      ...a,
      position: a.position.clone(),
    })),
    tCells: tCellsRef.current.map(t => ({ ...t })),
  }), [data]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#f97316" />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#ef4444" />

      <group ref={groupRef}>
        {/* Blood vessel (outer shell) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[6.5, 32, 32]} />
          <meshPhysicalMaterial
            color="#f97316"
            transparent
            opacity={0.06}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Vessel structure lines */}
        {vesselStructure.map((line, i) => (
          <Line
            key={i}
            points={line}
            color="#ea580c"
            lineWidth={1}
            opacity={0.3}
            transparent
            dashed={i >= 8}
            dashSize={0.2}
            gapSize={0.1}
          />
        ))}

        {/* Blood flow indicators */}
        {flowLines.map((line, i) => (
          <Line
            key={i}
            points={line}
            color="#dc2626"
            lineWidth={1}
            opacity={0.2}
            transparent
            dashed
            dashSize={0.3}
            gapSize={0.2}
          />
        ))}

        {/* Viruses */}
        {displayData.viruses.map((virus) => (
          <group key={virus.id} position={virus.position} rotation={[virus.rotation.x, virus.rotation.y, virus.rotation.z]}>
            {/* Virus core */}
            <mesh>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.4}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Spike proteins */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <group
                  key={i}
                  rotation={[0, 0, angle]}
                  position={[Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0]}
                >
                  <mesh position={[0.12, 0, 0]}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshStandardMaterial color="#fca5a5" />
                  </mesh>
                </group>
              );
            })}

            {/* RNA strands (inside) */}
            {Array.from({ length: 3 }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 0.15,
                  (Math.random() - 0.5) * 0.15,
                  (Math.random() - 0.5) * 0.15,
                ]}
              >
                <sphereGeometry args={[0.04, 4, 4]} />
                <meshStandardMaterial color="#fbbf24" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Antibodies (Y-shaped) */}
        {displayData.antibodies.map((ab) => (
          <group key={ab.id} position={ab.position}>
            {/* Antibody stem */}
            <mesh>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshStandardMaterial
                color="#3b82f6"
                emissive="#3b82f6"
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Antibody arms */}
            <mesh position={[0.08, 0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.06, 0.06]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>
            <mesh position={[0.08, 0.12, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.06, 0.06]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>

            {/* Binding sites */}
            <mesh position={[0.14, 0.2, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial
                color="#93c5fd"
                emissive="#93c5fd"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.14, 0.2, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial
                color="#93c5fd"
                emissive="#93c5fd"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}

        {/* T-cells */}
        {displayData.tCells.map((tCell, i) => (
          <group
            key={`tcell-${i}`}
            position={[
              Math.cos(tCell.angle) * tCell.radius,
              tCell.verticalOffset,
              Math.sin(tCell.angle) * tCell.radius,
            ]}
          >
            {/* T-cell body */}
            <mesh>
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshStandardMaterial
                color="#22c55e"
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>

            {/* Receptor sites */}
            {Array.from({ length: 5 }).map((_, j) => {
              const angle = (j / 5) * Math.PI * 2;
              return (
                <mesh
                  key={j}
                  position={[
                    Math.cos(angle) * 0.35,
                    Math.sin(angle) * 0.35,
                    0,
                  ]}
                >
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial
                    color="#16a34a"
                    emissive="#16a34a"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              );
            })}

            {/* Nucleus */}
            <mesh>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
        ))}

        {/* Labels */}
        <Html position={[0, -5.5, 0]} distanceFactor={10}>
          <div className="bg-orange-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Immune Response Battle
            <div className="text-xs mt-1 opacity-80">
              {data.virusCount} viruses • {data.antibodyCount} antibodies • {data.tCellCount} T-cells
            </div>
          </div>
        </Html>

        <Html position={[0, 5, 0]} distanceFactor={10}>
          <div className="bg-red-600/90 text-white px-3 py-1 rounded text-xs font-medium">
            Blood Vessel Environment
          </div>
        </Html>

        {/* Legend */}
        <Html position={[-5, 3, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1.5">
            <div className="font-bold text-sm mb-2">Immune Components</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Virus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>Antibody</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>T-Cell</span>
            </div>
          </div>
        </Html>

        {/* Battle status */}
        <Html position={[5, 3, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-sm mb-2">Battle Status</div>
            <div className={data.virusCount < 5 ? 'text-green-400' : 'text-red-400'}>
              {data.virusCount < 5 ? '✓ Winning' : '⚠ Fighting'}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {data.antibodyCount > data.virusCount ? 'Antibodies dominant' : 'Virus spreading'}
            </div>
          </div>
        </Html>
      </group>

      {/* Background glow for blood vessel */}
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#dc2626" distance={15} />
    </>
  );
}
