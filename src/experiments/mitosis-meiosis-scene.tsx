'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface MitosisMeiosisData {
  phase: string;
  chromosomesCount: number;
  daughterCells: number;
}

interface MitosisMeiosisSceneProps {
  onDataChange?: (data: MitosisMeiosisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  stage?: number;
  mode?: 'mitosis' | 'meiosis';
}

interface Chromosome {
  id: number;
  baseAngle: number;
  color: string;
  position: THREE.Vector3;
  sisterPosition?: THREE.Vector3;
}

/**
 * Mitosis & Meiosis scene component - Performance optimized
 * Visualizes cell division with chromosomes separating into daughter cells
 */
export default function MitosisMeiosisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  stage = 0,
  mode = 'mitosis',
}: MitosisMeiosisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<MitosisMeiosisData>({
    phase: 'Prophase',
    chromosomesCount: 46,
    daughterCells: 1,
  });

  const phases = mode === 'mitosis'
    ? ['Prophase', 'Metaphase', 'Anaphase', 'Telophase']
    : ['Meiosis I', 'Meiosis II'];

  // Reset on trigger change
  useEffect(() => {
    progressRef.current = 0;
    timeRef.current = 0;
    frameCountRef.current = 0;
  }, [resetTrigger, stage]);

  // Initialize chromosomes
  const chromosomes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      color: i % 2 === 0 ? '#3b82f6' : '#ef4444',
      baseAngle: (i / 8) * Math.PI * 2,
      position: new THREE.Vector3(
        Math.cos((i / 8) * Math.PI * 2) * 1.5,
        (Math.random() - 0.5) * 0.3,
        Math.sin((i / 8) * Math.PI * 2) * 1.5,
      ),
    }));
  }, []);

  // Get chromosome position based on stage
  const getChromosomePositions = (chr: Chromosome, stage: number, progress: number) => {
    const phaseProgress = Math.min(progress / 100, 1);

    switch (stage) {
      case 0: // Prophase / Meiosis I - chromosomes condense and move toward center
        {
          const radius = 1.5 - phaseProgress * 0.5;
          return {
            primary: new THREE.Vector3(
              Math.cos(chr.baseAngle) * radius,
              Math.sin(chr.baseAngle) * 0.3,
              Math.sin(chr.baseAngle) * radius,
            ),
            sister: undefined,
          };
        }
      case 1: // Metaphase - align at equator
        {
          const xPos = (chr.id - 3.5) * 0.4;
          return {
            primary: new THREE.Vector3(xPos, 0, 0),
            sister: undefined,
          };
        }
      case 2: // Anaphase - sister chromatids separate
        {
          const separation = phaseProgress * 2.5;
          return {
            primary: new THREE.Vector3(separation, 0, 0),
            sister: new THREE.Vector3(-separation, 0, 0),
          };
        }
      case 3: // Telophase - complete separation
        {
          const finalSep = 2.8;
          return {
            primary: new THREE.Vector3(finalSep, 0, 0),
            sister: new THREE.Vector3(-finalSep, 0, 0),
          };
        }
      default:
        return {
          primary: new THREE.Vector3(0, 0, 0),
          sister: undefined,
        };
    }
  };

  // Spindle fiber lines
  const spindleLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 0.3;
      const z = Math.sin(angle) * 0.3;
      lines.push([
        [x, 0, z], // Centrosome
        [Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5], // Periphery
      ]);
    }
    return lines;
  }, []);

  // Metaphase plate line
  const metaphasePlate = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = -16; i <= 16; i++) {
      points.push([i * 0.1, 0, -0.5]);
      points.push([i * 0.1, 0, 0.5]);
    }
    return points;
  }, []);

  // Throttled updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    timeRef.current += delta * simulationSpeed * speed;
    progressRef.current = Math.min(100, progressRef.current + delta * 10 * simulationSpeed * speed);
    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const phase = phases[Math.min(stage, phases.length - 1)];
      const chromosomesCount = mode === 'mitosis' ? 46 : 23;
      let daughterCells = 1;

      if (mode === 'mitosis') {
        daughterCells = stage >= 3 ? 2 : 1;
      } else {
        // Meiosis produces 4 cells
        daughterCells = stage >= 3 ? 4 : stage >= 1 ? 2 : 1;
      }

      const newData: MitosisMeiosisData = {
        phase,
        chromosomesCount,
        daughterCells,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.4} color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'} />

      <group ref={groupRef}>
        {/* Main cell membrane */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshPhysicalMaterial
            color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'}
            transparent
            opacity={0.12}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Nuclear envelope (visible in prophase) */}
        {stage === 0 && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.8, 32, 32]} />
            <meshPhysicalMaterial
              color="#7c3aed"
              transparent
              opacity={0.15}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Spindle fibers */}
        {stage >= 1 && stage <= 2 && (
          <>
            {spindleLines.map((line, i) => (
              <Line
                key={i}
                points={line}
                color="#fcd34d"
                lineWidth={1}
                opacity={0.4}
                transparent
                dashed
                dashSize={0.1}
                gapSize={0.05}
              />
            ))}
            {/* Centrosomes */}
            <mesh position={[3.2, 0, 0]}>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial
                color="#fcd34d"
                emissive="#fcd34d"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[-3.2, 0, 0]}>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial
                color="#fcd34d"
                emissive="#fcd34d"
                emissiveIntensity={0.5}
              />
            </mesh>
          </>
        )}

        {/* Metaphase plate */}
        {stage === 1 && (
          <Line
            points={metaphasePlate}
            color="#ffffff"
            lineWidth={2}
            opacity={0.3}
            transparent
            dashed
          />
        )}

        {/* Chromosomes */}
        {chromosomes.map((chr, i) => {
          const positions = getChromosomePositions(chr, stage, progressRef.current);

          return (
            <group key={chr.id}>
              {/* Primary chromatid */}
              <group position={positions.primary}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>
                {/* Centromere */}
                <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>
                {/* Second chromatid (paired before anaphase) */}
                {stage < 2 && (
                  <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                    <meshStandardMaterial color={chr.color} opacity={0.7} transparent />
                  </mesh>
                )}
              </group>

              {/* Sister chromatid (after separation in anaphase) */}
              {stage >= 2 && positions.sister && (
                <group position={positions.sister}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.08, 0.4, 8, 8]} />
                    <meshStandardMaterial color={chr.color} />
                  </mesh>
                  <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshStandardMaterial color={chr.color} />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}

        {/* Daughter cells forming in telophase */}
        {stage >= 3 && (
          <>
            {/* First daughter cell */}
            <mesh position={[2.5, 0, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial
                color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'}
                transparent
                opacity={0.18}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Second daughter cell */}
            <mesh position={[-2.5, 0, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial
                color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'}
                transparent
                opacity={0.18}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Nuclear envelopes reforming */}
            <mesh position={[2.5, 0, 0]}>
              <sphereGeometry args={[0.8, 24, 24]} />
              <meshPhysicalMaterial
                color="#7c3aed"
                transparent
                opacity={0.2}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-2.5, 0, 0]}>
              <sphereGeometry args={[0.8, 24, 24]} />
              <meshPhysicalMaterial
                color="#7c3aed"
                transparent
                opacity={0.2}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Meiosis II - additional division */}
        {mode === 'meiosis' && stage >= 3 && (
          <>
            {/* Third daughter cell */}
            <mesh position={[2.5, 2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Fourth daughter cell */}
            <mesh position={[2.5, -2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Additional cells for other side */}
            <mesh position={[-2.5, 2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-2.5, -2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Cleavage furrow (anaphase/telophase) */}
        {stage >= 2 && (
          <Line
            points={[
              [0, -1, 0],
              [0, 1, 0],
            ]}
            color={mode === 'mitosis' ? '#f59e0b' : '#ec4899'}
            lineWidth={3}
            opacity={0.6}
            transparent
          />
        )}

        {/* Labels */}
        <Html position={[0, -3.8, 0]} distanceFactor={10}>
          <div className={`${mode === 'mitosis' ? 'bg-amber-500' : 'bg-pink-500'}/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg`}>
            {mode === 'mitosis' ? 'Mitosis' : 'Meiosis'} - {data.phase}
          </div>
        </Html>

        {/* Additional info */}
        <Html position={[0, 4, 0]} distanceFactor={10}>
          <div className="bg-gray-800/80 text-white px-3 py-1 rounded text-xs">
            {data.daughterCells} daughter cell{data.daughterCells !== 1 ? 's' : ''} • {data.chromosomesCount} chromosomes
          </div>
        </Html>

        {/* Cell type indicator */}
        {mode === 'meiosis' && (
          <Html position={[4, 0, 0]} distanceFactor={10}>
            <div className="bg-pink-500/80 text-white px-2 py-1 rounded text-xs">
              Gamete Formation
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -5, 0]} />
    </>
  );
}
