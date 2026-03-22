'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface MitosisMeiosisData {
  phase: string;
  chromosomesCount: number;
  daughterCells: number;
  description: string;
}

interface MitosisMeiosisSceneProps {
  onDataChange?: (data: MitosisMeiosisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  stage?: number;
  mode?: 'mitosis' | 'meiosis';
  showLabels?: boolean;
}

interface Chromosome {
  id: number;
  pairId: number;
  color: string;
  homologousColor: string;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  angle: number;
  condensed: boolean;
  separated: boolean;
}

/**
 * Mitosis & Meiosis - Complete rewrite
 * MITOSIS: 5 stages - Prophase, Metaphase, Anaphase, Telophase, Cytokinesis
 * MEIOSIS: Meiosis I (homologous separation) + Meiosis II (sister chromatid separation)
 */
export default function MitosisMeiosisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  stage = 0,
  mode = 'mitosis',
  showLabels = true,
}: MitosisMeiosisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const spinningRef = useRef(false);

  // React state - updated every 8 frames
  const [data, setData] = useState<MitosisMeiosisData>({
    phase: 'Prophase',
    chromosomesCount: mode === 'mitosis' ? 46 : 46,
    daughterCells: 1,
    description: 'Chromosomes condense and nuclear envelope dissolves.',
  });

  const mitosisPhases = ['Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'];
  const meiosisPhases = ['Prophase I', 'Metaphase I', 'Anaphase I', 'Telophase I', 'Prophase II', 'Metaphase II', 'Anaphase II', 'Telophase II'];

  // Chromosome colors for homologous pairs
  const chromosomeColors = [
    { primary: '#ef4444', homologous: '#dc2626' }, // Red pair
    { primary: '#3b82f6', homologous: '#2563eb' }, // Blue pair
    { primary: '#22c55e', homologous: '#16a34a' }, // Green pair
    { primary: '#f59e0b', homologous: '#d97706' }, // Orange pair
  ];

  // Initialize chromosomes
  const chromosomesRef = useRef<Chromosome[]>([]);

  useEffect(() => {
    progressRef.current = 0;
    timeRef.current = 0;
    frameCountRef.current = 0;
    spinningRef.current = false;

    // Create 8 chromosomes (4 homologous pairs)
    chromosomesRef.current = [];
    for (let pair = 0; pair < 4; pair++) {
      for (let chr = 0; chr < 2; chr++) {
        const angle = ((pair * 2 + chr) / 8) * Math.PI * 2;
        chromosomesRef.current.push({
          id: pair * 2 + chr,
          pairId: pair,
          color: chromosomeColors[pair].primary,
          homologousColor: chromosomeColors[pair].homologous,
          position: new THREE.Vector3(
            Math.cos(angle) * 1.5,
            (Math.random() - 0.5) * 0.5,
            Math.sin(angle) * 1.5
          ),
          targetPosition: new THREE.Vector3(0, 0, 0),
          angle,
          condensed: false,
          separated: false,
        });
      }
    }
  }, [resetTrigger, mode]);

  // Get chromosome target positions based on stage
  const getChromosomeTargets = (chr: Chromosome, currentStage: number, progress: number) => {
    const phaseProgress = Math.min(progress / 100, 1);
    const stageIndex = mode === 'mitosis' ? currentStage : Math.floor(currentStage / 2);

    switch (stageIndex) {
      case 0: // Prophase - chromosomes condense and move toward center
        {
          const radius = 1.5 - phaseProgress * 0.8;
          return new THREE.Vector3(
            Math.cos(chr.angle) * radius,
            Math.sin(chr.angle) * 0.3,
            Math.sin(chr.angle) * radius
          );
        }
      case 1: // Metaphase - align at equator
        {
          const xPos = (chr.id - 3.5) * 0.35;
          return new THREE.Vector3(xPos, 0, 0);
        }
      case 2: // Anaphase - separate to poles
        {
          const separation = phaseProgress * 2.8;
          // In Meiosis I, homologous pairs separate
          // In Mitosis, sister chromatids separate
          const direction = chr.id % 2 === 0 ? 1 : -1;
          return new THREE.Vector3(direction * separation, 0, 0);
        }
      case 3: // Telophase - complete separation
        {
          const finalSep = 3;
          const direction = chr.id % 2 === 0 ? 1 : -1;
          return new THREE.Vector3(direction * finalSep, 0, 0);
        }
      case 4: // Cytokinesis / Prophase II
        if (mode === 'meiosis') {
          // Meiosis II - chromosomes still at poles
          const pole = chr.id % 2 === 0 ? 1 : -1;
          return new THREE.Vector3(pole * 1.5, 0, 0);
        }
        return new THREE.Vector3((chr.id % 2 === 0 ? 1 : -1) * 3.5, 0, 0);
      default: // Meiosis II stages
        {
          const pole = chr.id % 2 === 0 ? 1 : -1;
          const subStage = currentStage % 2;
          if (subStage >= 2) {
            // Anaphase II - sister chromatids separate
            const separation = phaseProgress * 1.2;
            return new THREE.Vector3(pole * (1.5 + separation), 0, 0);
          }
          return new THREE.Vector3(pole * 1.5, 0, 0);
        }
    }
  };

  // Spindle fiber lines
  const spindleLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 0.3;
      const z = Math.sin(angle) * 0.3;
      lines.push([
        [x, 0, z], // Centrosome
        [Math.cos(angle) * 3, 0, Math.sin(angle) * 3], // Periphery
      ]);
    }
    return lines;
  }, []);

  // Crossing over visualization points (Meiosis I only)
  const crossingOverPoints = useMemo(() => {
    if (mode !== 'meiosis') return [];
    return [0, 1, 2, 3].map((pairId) => ({
      pairId,
      position: new THREE.Vector3((pairId - 1.5) * 0.5, 0.15, 0),
    }));
  }, [mode]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta * simulationSpeed;
    progressRef.current = Math.min(100, progressRef.current + delta * 10 * simulationSpeed);
    frameCountRef.current++;
    spinningRef.current = true;

    // Update chromosome positions
    chromosomesRef.current.forEach((chr) => {
      const target = getChromosomeTargets(chr, stage, progressRef.current);
      chr.position.lerp(target, 0.05 * simulationSpeed);
      chr.targetPosition.copy(target);

      // Update condensation state
      if (stage >= 0) chr.condensed = true;
      if (stage >= 2) chr.separated = true;
    });

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const currentPhase = mode === 'mitosis'
        ? mitosisPhases[stage]
        : meiosisPhases[stage];

      let chromosomeCount = 46;
      let daughterCells = 1;

      if (mode === 'mitosis') {
        daughterCells = stage >= 4 ? 2 : 1;
      } else {
        // Meiosis
        if (stage < 4) {
          // Meiosis I
          daughterCells = stage >= 3 ? 2 : 1;
          chromosomeCount = stage >= 2 ? 23 : 46; // Homologous pairs separate
        } else {
          // Meiosis II
          daughterCells = 4;
          chromosomeCount = 23; // Haploid
        }
      }

      const descriptions = mode === 'mitosis' ? [
        'Chromosomes condense into visible X shapes. Nuclear envelope begins to dissolve.',
        'Chromosomes align at the metaphase plate (center). Spindle fibers attach to centromeres.',
        'Sister chromatids separate and move toward opposite poles.',
        'Two new nuclei form. Chromosomes decondense. Cell begins to pinch.',
        'Cell splits into 2 identical daughter cells, each with 46 chromosomes.',
      ] : [
        'Homologous chromosomes pair up and crossing over occurs.',
        'Homologous pairs align at the center.',
        'Homologous chromosomes separate to opposite poles.',
        'Two cells form, each with 23 chromosomes (haploid).',
        'Chromosomes condense again in both daughter cells.',
        'Chromosomes align at the center of each cell.',
        'Sister chromatids separate in each cell.',
        'Four haploid daughter cells form (gametes).',
      ];

      const newData: MitosisMeiosisData = {
        phase: currentPhase,
        chromosomesCount: chromosomeCount,
        daughterCells,
        description: descriptions[Math.min(stage, descriptions.length - 1)],
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  const currentPhase = mode === 'mitosis'
    ? mitosisPhases[stage]
    : meiosisPhases[stage];

  const primaryColor = mode === 'mitosis' ? '#f59e0b' : '#ec4899';

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.4} color={primaryColor} />

      <group ref={groupRef}>
        {/* ===== CELL MEMBRANE ===== */}
        {stage < 4 && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3.5, 32, 32]} />
            <meshPhysicalMaterial
              color={primaryColor}
              transparent
              opacity={0.1}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* ===== NUCLEAR ENVELOPE (visible in prophase, dissolves after) ===== */}
        {stage === 0 && (
          <>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshPhysicalMaterial
                color="#7c3aed"
                transparent
                opacity={0.15 - (progressRef.current / 100) * 0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            {showLabels && (
              <Html position={[0, 2.5, 0]} distanceFactor={10}>
                <div className="bg-purple-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Nuclear Envelope
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== SPINDLE FIBERS (Metaphase - Anaphase) ===== */}
        {stage >= 1 && stage <= 2 && (
          <>
            {spindleLines.map((line, i) => (
              <Line
                key={i}
                points={line}
                color="#fcd34d"
                lineWidth={1}
                opacity={0.3}
                transparent
                dashed
                dashSize={0.1}
                gapSize={0.05}
              />
            ))}
            {/* Centrosomes */}
            <mesh position={[3.5, 0, 0]}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial
                color="#fcd34d"
                emissive="#fcd34d"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[-3.5, 0, 0]}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial
                color="#fcd34d"
                emissive="#fcd34d"
                emissiveIntensity={0.5}
              />
            </mesh>
            {showLabels && (
              <Html position={[4, 0.5, 0]} distanceFactor={10}>
                <div className="bg-yellow-500/90 text-white px-2 py-1 rounded text-xs">
                  Centrosome
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== METAPHASE PLATE ===== */}
        {stage === 1 && (
          <>
            <Line
              points={Array.from({ length: 40 }, (_, i) => [
                (i - 20) * 0.1,
                0,
                -0.3,
              ] as [number, number, number])}
              color="#ffffff"
              lineWidth={2}
              opacity={0.3}
              transparent
              dashed
            />
            {showLabels && (
              <Html position={[0, 1, 0]} distanceFactor={10}>
                <div className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                  Metaphase Plate
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== CROSSING OVER (Meiosis I Prophase) ===== */}
        {mode === 'meiosis' && stage === 0 && (
          <>
            {crossingOverPoints.map((point) => (
              <group key={point.pairId} position={point.position}>
                {/* Chiasma - X shape where crossing over occurs */}
                <Line
                  points={[
                    [-0.1, 0, -0.1],
                    [0.1, 0, 0.1],
                    [0.1, 0, -0.1],
                    [-0.1, 0, 0.1],
                  ]}
                  color="#f472b6"
                  lineWidth={2}
                  opacity={0.6}
                />
                <mesh position={[0, 0.1, 0]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial
                    color="#ec4899"
                    emissive="#ec4899"
                    emissiveIntensity={0.5 + Math.sin(timeRef.current * 4) * 0.3}
                  />
                </mesh>
              </group>
            ))}
            {showLabels && (
              <Html position={[0, 1.5, 0]} distanceFactor={10}>
                <div className="bg-pink-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Crossing Over
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== CHROMOSOMES ===== */}
        {chromosomesRef.current.map((chr) => {
          const isSeparated = chr.separated || stage >= 2;
          const showBothChromatids = !isSeparated;

          return (
            <group key={chr.id} position={chr.position}>
              {/* Primary chromatid */}
              <group rotation={[0, 0, Math.PI / 2]}>
                {/* Chromatid arm */}
                <mesh>
                  <capsuleGeometry args={[0.06, 0.5, 8, 8]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>

                {/* Centromere */}
                <mesh position={[0, 0.12, 0]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial color={chr.color} />
                </mesh>

                {/* Sister chromatid (before separation) */}
                {showBothChromatids && (
                  <mesh position={[0.04, 0, 0]}>
                    <capsuleGeometry args={[0.06, 0.5, 8, 8]} />
                    <meshStandardMaterial
                      color={chr.color}
                      opacity={0.7}
                      transparent
                    />
                  </mesh>
                )}
              </group>

              {/* Sister chromatid (after separation in anaphase) */}
              {isSeparated && stage >= 2 && stage <= 3 && (
                <group position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <mesh>
                    <capsuleGeometry args={[0.06, 0.5, 8, 8]} />
                    <meshStandardMaterial color={chr.color} />
                  </mesh>
                  <mesh position={[0, 0.12, 0]}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial color={chr.color} />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}

        {/* ===== DAUGHTER CELLS (Telophase/Cytokinesis) ===== */}
        {stage >= 3 && (
          <>
            {/* Daughter cell 1 */}
            <mesh position={[mode === 'meiosis' && stage >= 4 ? 2.5 : 3, 0, 0]}>
              <sphereGeometry args={[1.8, 32, 32]} />
              <meshPhysicalMaterial
                color={primaryColor}
                transparent
                opacity={0.12}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Daughter cell 2 */}
            <mesh position={[mode === 'meiosis' && stage >= 4 ? -2.5 : -3, 0, 0]}>
              <sphereGeometry args={[1.8, 32, 32]} />
              <meshPhysicalMaterial
                color={primaryColor}
                transparent
                opacity={0.12}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Reforming nuclei */}
            {(stage === 3 || stage === 7) && (
              <>
                <mesh position={[3, 0, 0]}>
                  <sphereGeometry args={[0.9, 24, 24]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.15}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[-3, 0, 0]}>
                  <sphereGeometry args={[0.9, 24, 24]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.15}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
          </>
        )}

        {/* ===== MEIOSIS II - Additional daughter cells ===== */}
        {mode === 'meiosis' && stage >= 4 && (
          <>
            {/* Third cell */}
            <mesh position={[2.5, 2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.1}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Fourth cell */}
            <mesh position={[2.5, -2, 0]}>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                transparent
                opacity={0.1}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Additional nuclei */}
            {stage >= 7 && (
              <>
                <mesh position={[2.5, 2, 0]}>
                  <sphereGeometry args={[0.6, 20, 20]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.12}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[2.5, -2, 0]}>
                  <sphereGeometry args={[0.6, 20, 20]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.12}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[-2.5, 2, 0]}>
                  <sphereGeometry args={[0.6, 20, 20]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.12}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[-2.5, -2, 0]}>
                  <sphereGeometry args={[0.6, 20, 20]} />
                  <meshPhysicalMaterial
                    color="#7c3aed"
                    transparent
                    opacity={0.12}
                    roughness={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
          </>
        )}

        {/* ===== CLEAVAGE FURROW (Telophase/Cytokinesis) ===== */}
        {stage >= 3 && stage <= 4 && (
          <Line
            points={[
              [0, -1.5, 0],
              [0, 1.5, 0],
            ]}
            color={primaryColor}
            lineWidth={3}
            opacity={0.5}
            transparent
          />
        )}

        {/* ===== PHASE INDICATOR ===== */}
        {showLabels && (
          <Html position={[0, -4.5, 0]} distanceFactor={12}>
            <div className={`${mode === 'mitosis' ? 'bg-amber-500' : 'bg-pink-500'}/95 text-white px-4 py-2 rounded-lg text-base font-bold shadow-lg border-2 border-white/30`}>
              {mode === 'mitosis' ? '🧬 Mitosis' : '🧬 Meiosis'} - {currentPhase}
            </div>
          </Html>
        )}

        {/* ===== INFO PANEL ===== */}
        {showLabels && (
          <Html position={[0, 4, 0]} distanceFactor={10}>
            <div className="bg-gray-800/95 text-white px-3 py-2 rounded-lg text-xs max-w-[250px] shadow-lg">
              <div className="font-bold mb-1">{data.daughterCells} daughter cell{data.daughterCells !== 1 ? 's' : ''}</div>
              <div>{data.chromosomesCount} chromosomes</div>
              <div className="mt-1 text-gray-400 text-[10px]">{data.description}</div>
            </div>
          </Html>
        )}

        {/* ===== CHROMOSOME KEY ===== */}
        {showLabels && stage <= 2 && (
          <Html position={[-4, 3, 0]} distanceFactor={10}>
            <div className="bg-gray-800/95 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
              <div className="font-bold mb-2">Chromosomes</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span>Pair 1</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span>Pair 2</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span>Pair 3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span>Pair 4</span>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[12, 24, '#1a1a3e', '#1a1a3e']} position={[0, -5, 0]} />
    </>
  );
}
