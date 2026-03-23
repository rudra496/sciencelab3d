'use client';

import { useRef, useMemo, useEffect, useState, memo, useCallback } from 'react';
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
  isMaternal: boolean;
  crossedOver: boolean;
  chromatidOffset: number;
}

interface CellDivisionState {
  chromosomes: Chromosome[];
  progress: number;
  nucleusOpacity: number;
  cellPinch: number;
  spindleOpacity: number;
}

// Maternal (blue) and Paternal (red) chromosome colors
const CHROMOSOME_COLORS = [
  { maternal: '#3b82f6', paternal: '#ef4444' },
  { maternal: '#60a5fa', paternal: '#f87171' },
  { maternal: '#93c5fd', paternal: '#fca5a5' },
  { maternal: '#2563eb', paternal: '#dc2626' },
];

const MITOSIS_STAGES = ['Interphase', 'Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'];
const MEIOSIS_STAGES = ['Prophase I', 'Metaphase I', 'Anaphase I', 'Telophase I', 'Prophase II', 'Metaphase II', 'Anaphase II', 'Telophase II'];

/**
 * Mitosis & Meiosis - Advanced 3D visualization with side-by-side comparison
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
  // State for both divisions
  const mitosisStateRef = useRef<CellDivisionState>({
    chromosomes: [],
    progress: 0,
    nucleusOpacity: 1,
    cellPinch: 0,
    spindleOpacity: 0,
  });

  const meiosisStateRef = useRef<CellDivisionState>({
    chromosomes: [],
    progress: 0,
    nucleusOpacity: 1,
    cellPinch: 0,
    spindleOpacity: 0,
  });

  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  const [data, setData] = useState<MitosisMeiosisData>({
    phase: 'Interphase',
    chromosomesCount: 46,
    daughterCells: 1,
    description: 'Cell prepares for division. DNA replicates.',
  });

  // Initialize chromosomes
  const initializeChromosomes = useCallback(() => {
    const chromosomes: Chromosome[] = [];
    for (let pair = 0; pair < 4; pair++) {
      const baseAngle = (pair / 4) * Math.PI * 2;

      // Maternal chromosome (from mother)
      chromosomes.push({
        id: pair * 2,
        pairId: pair,
        color: CHROMOSOME_COLORS[pair].maternal,
        homologousColor: CHROMOSOME_COLORS[pair].paternal,
        position: new THREE.Vector3(
          Math.cos(baseAngle) * 1.5,
          (Math.random() - 0.5) * 0.5,
          Math.sin(baseAngle) * 1.5
        ),
        targetPosition: new THREE.Vector3(),
        angle: baseAngle,
        condensed: false,
        separated: false,
        isMaternal: true,
        crossedOver: false,
        chromatidOffset: 0,
      });

      // Paternal chromosome (from father)
      chromosomes.push({
        id: pair * 2 + 1,
        pairId: pair,
        color: CHROMOSOME_COLORS[pair].paternal,
        homologousColor: CHROMOSOME_COLORS[pair].maternal,
        position: new THREE.Vector3(
          Math.cos(baseAngle + Math.PI) * 1.5,
          (Math.random() - 0.5) * 0.5,
          Math.sin(baseAngle + Math.PI) * 1.5
        ),
        targetPosition: new THREE.Vector3(),
        angle: baseAngle + Math.PI,
        condensed: false,
        separated: false,
        isMaternal: false,
        crossedOver: false,
        chromatidOffset: 0,
      });
    }
    return chromosomes;
  }, []);

  // Reset states
  useEffect(() => {
    timeRef.current = 0;
    frameCountRef.current = 0;

    mitosisStateRef.current = {
      chromosomes: initializeChromosomes(),
      progress: 0,
      nucleusOpacity: 1,
      cellPinch: 0,
      spindleOpacity: 0,
    };

    meiosisStateRef.current = {
      chromosomes: initializeChromosomes(),
      progress: 0,
      nucleusOpacity: 1,
      cellPinch: 0,
      spindleOpacity: 0,
    };
  }, [resetTrigger, initializeChromosomes]);

  // Calculate chromosome target positions for Mitosis
  const getMitosisTargets = (chr: Chromosome, currentStage: number, progress: number) => {
    const t = Math.min(progress / 100, 1);

    switch (currentStage) {
      case 0: // Interphase - scattered as threads
        const spreadRadius = 1.8 - t * 0.3;
        return new THREE.Vector3(
          Math.cos(chr.angle) * spreadRadius,
          Math.sin(chr.angle * 2) * 0.3,
          Math.sin(chr.angle) * spreadRadius
        );

      case 1: // Prophase - condense toward center
        const condenseRadius = 1.5 - t * 0.8;
        return new THREE.Vector3(
          Math.cos(chr.angle) * condenseRadius,
          (chr.pairId - 1.5) * 0.3 * (1 - t * 0.5),
          Math.sin(chr.angle) * condenseRadius
        );

      case 2: // Metaphase - line up at equator
        const xPos = (chr.pairId - 1.5) * 0.5;
        return new THREE.Vector3(xPos, 0, (chr.isMaternal ? -0.1 : 0.1));

      case 3: // Anaphase - sister chromatids separate
        const separation = t * 3.5;
        const direction = chr.isMaternal ? 1 : -1;
        return new THREE.Vector3(direction * separation, (chr.pairId - 1.5) * 0.4, 0);

      case 4: // Telophase - reach poles
        return new THREE.Vector3((chr.isMaternal ? 4 : -4), (chr.pairId - 1.5) * 0.5, 0);

      case 5: // Cytokinesis - final positions
        return new THREE.Vector3((chr.isMaternal ? 5 : -5), (chr.pairId - 1.5) * 0.5, 0);

      default:
        return chr.position.clone();
    }
  };

  // Calculate chromosome target positions for Meiosis
  const getMeiosisTargets = (chr: Chromosome, currentStage: number, progress: number) => {
    const t = Math.min(progress / 100, 1);

    switch (currentStage) {
      case 0: // Prophase I - pairing and crossing over
        if (t < 0.5) {
          // Coming together
          const pairAngle = chr.pairId * Math.PI * 0.5;
          return new THREE.Vector3(
            Math.cos(pairAngle) * (1.5 - t),
            (chr.pairId - 1.5) * 0.5,
            Math.sin(pairAngle) * (1.5 - t)
          );
        } else {
          // Paired up
          return new THREE.Vector3(
            (chr.pairId - 1.5) * 0.8,
            0,
            chr.isMaternal ? -0.15 : 0.15
          );
        }

      case 1: // Metaphase I - homologous pairs align
        return new THREE.Vector3(
          (chr.pairId - 1.5) * 0.7,
          0,
          chr.isMaternal ? -0.1 : 0.1
        );

      case 2: // Anaphase I - homologous chromosomes separate
        const separation1 = t * 3;
        const direction1 = chr.isMaternal ? 1 : -1;
        return new THREE.Vector3(direction1 * separation1, (chr.pairId - 1.5) * 0.3, 0);

      case 3: // Telophase I - two cells form
        return new THREE.Vector3((chr.isMaternal ? 3.5 : -3.5), (chr.pairId - 1.5) * 0.4, 0);

      case 4: // Prophase II - re-condense
        const pole = chr.isMaternal ? 1 : -1;
        return new THREE.Vector3(pole * 2.5, (chr.pairId - 1.5) * 0.3, 0);

      case 5: // Metaphase II - align again
        const pole2 = chr.isMaternal ? 1 : -1;
        return new THREE.Vector3(pole2 * 1.5, (chr.pairId - 1.5) * 0.3, 0);

      case 6: // Anaphase II - sister chromatids separate
        const pole3 = chr.isMaternal ? 1 : -1;
        const separation2 = t * 1.8;
        return new THREE.Vector3(pole3 * (1.5 + separation2), (chr.pairId - 1.5) * 0.35, 0);

      case 7: // Telophase II - four cells
        const pole4 = chr.isMaternal ? 1 : -1;
        const yOffset = (chr.pairId % 2 === 0 ? 1 : -1) * 1.5;
        return new THREE.Vector3(pole4 * 3, yOffset, 0);

      default:
        return chr.position.clone();
    }
  };

  // Render chromosome pair (sister chromatids)
  const ChromosomePair = memo(({ chr, isSeparated }: { chr: Chromosome; isSeparated: boolean }) => {
    const chromatidWidth = 0.08;
    const chromatidLength = chr.condensed ? 0.5 : 0.7;
    const color = chr.crossedOver ? chr.homologousColor : chr.color;

    return (
      <group position={chr.position}>
        {/* Sister chromatid 1 */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidLength), 8]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Centromere */}
        <mesh position={[0, chromatidLength / 2, 0]}>
          <sphereGeometry args={[Math.max(0.01, 0.12), 12, 12]} />
          <meshStandardMaterial color={chr.color} roughness={0.3} />
        </mesh>

        {/* Sister chromatid 2 (attached or separated) */}
        {!isSeparated ? (
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidLength), 8]} />
            <meshStandardMaterial color={chr.color} roughness={0.4} metalness={0.1} opacity={0.8} transparent />
          </mesh>
        ) : (
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidWidth), Math.max(0.01, chromatidLength), 8]} />
            <meshStandardMaterial color={chr.color} roughness={0.4} metalness={0.1} />
          </mesh>
        )}
      </group>
    );
  });

  // Render cell with membrane, nucleus, etc.
  const Cell = memo(({
    position,
    state,
    isMitosis,
    currentStage
  }: {
    position: [number, number, number];
    state: CellDivisionState;
    isMitosis: boolean;
    currentStage: number;
  }) => {
    const color = isMitosis ? '#f59e0b' : '#ec4899';
    const isTelophase = currentStage === 4 || currentStage === 3 && !isMitosis;
    const isCytokinesis = currentStage === 5 || (currentStage === 7 && !isMitosis);

    // Spindle fibers
    const spindleFibers = useMemo(() => {
      const fibers: [number, number, number][][] = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 0.3;
        const z = Math.sin(angle) * 0.3;
        fibers.push([
          [x, 0, z],
          [Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5],
        ]);
      }
      return fibers;
    }, []);

    return (
      <group position={position}>
        {/* Cell membrane */}
        <mesh scale={[1 - state.cellPinch * 0.3, 1, 1]}>
          <sphereGeometry args={[Math.max(0.01, 3.5), 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.15}
            roughness={0.2}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Nuclear envelope */}
        {state.nucleusOpacity > 0.01 && (
          <mesh>
            <sphereGeometry args={[Math.max(0.01, 2), 32, 32]} />
            <meshPhysicalMaterial
              color="#7c3aed"
              transparent
              opacity={state.nucleusOpacity * 0.2}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Centrosomes */}
        {(currentStage >= 1 && currentStage <= 3) && (
          <>
            <mesh position={[3.8, 0, 0]}>
              <cylinderGeometry args={[Math.max(0.01, 0.15), Math.max(0.01, 0.15), Math.max(0.01, 0.4), 8]} />
              <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-3.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[Math.max(0.01, 0.15), Math.max(0.01, 0.15), Math.max(0.01, 0.4), 8]} />
              <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}

        {/* Spindle fibers */}
        {state.spindleOpacity > 0.01 && (currentStage >= 1 && currentStage <= 3) && (
          <>
            {spindleFibers.map((fiber, i) => (
              <Line
                key={i}
                points={fiber}
                color="#fcd34d"
                lineWidth={1}
                opacity={state.spindleOpacity * 0.4}
                transparent
                dashed
                dashSize={0.1}
                gapSize={0.05}
              />
            ))}
          </>
        )}

        {/* Metaphase plate indicator */}
        {currentStage === 2 && (
          <Line
            points={Array.from({ length: 30 }, (_, i) => [
              (i - 15) * 0.15,
              0,
              -0.2,
            ] as [number, number, number])}
            color="#ffffff"
            lineWidth={2}
            opacity={0.3}
            transparent
            dashed
          />
        )}

        {/* Crossing over visualization (Meiosis I Prophase) */}
        {!isMitosis && currentStage === 0 && state.progress > 40 && (
          <>
            {CHROMOSOME_COLORS.map((_, pairId) => (
              <group key={pairId} position={[(pairId - 1.5) * 0.8, 0.3, 0]}>
                {/* Chiasma marker */}
                <Line
                  points={[
                    [-0.1, 0, -0.1],
                    [0.1, 0, 0.1],
                    [0.1, 0, -0.1],
                    [-0.1, 0, 0.1],
                  ]}
                  color="#f472b6"
                  lineWidth={2}
                  opacity={0.8}
                />
                <mesh position={[0, 0.1, 0]}>
                  <sphereGeometry args={[Math.max(0.01, 0.05), 8, 8]} />
                  <meshStandardMaterial
                    color="#ec4899"
                    emissive="#ec4899"
                    emissiveIntensity={0.6 + Math.sin(timeRef.current * 5) * 0.3}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Chromosomes */}
        {state.chromosomes.map((chr) => {
          const isSeparated = state.progress > 50 && (currentStage === 3 || currentStage === 6);
          return <ChromosomePair key={chr.id} chr={chr} isSeparated={isSeparated} />;
        })}

        {/* Cleavage furrow (during cytokinesis) */}
        {(currentStage === 4 || currentStage === 5 || currentStage === 7) && (
          <Line
            points={[
              [0, -3, 0],
              [0, 3, 0],
            ]}
            color={color}
            lineWidth={3}
            opacity={0.5}
            transparent
          />
        )}

        {/* Daughter cells (telophase/cytokinesis) */}
        {currentStage >= 4 && (
          <>
            <mesh position={[3.5, 0, 0]}>
              <sphereGeometry args={[Math.max(0.01, 2), 24, 24]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.15} roughness={0.2} />
            </mesh>
            <mesh position={[-3.5, 0, 0]}>
              <sphereGeometry args={[Math.max(0.01, 2), 24, 24]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.15} roughness={0.2} />
            </mesh>

            {/* Reforming nuclei */}
            {(currentStage === 4 || currentStage === 5 || currentStage === 7) && (
              <>
                <mesh position={[3.5, 0, 0]}>
                  <sphereGeometry args={[Math.max(0.01, 0.9), 20, 20]} />
                  <meshPhysicalMaterial color="#7c3aed" transparent opacity={0.2} roughness={0.3} />
                </mesh>
                <mesh position={[-3.5, 0, 0]}>
                  <sphereGeometry args={[Math.max(0.01, 0.9), 20, 20]} />
                  <meshPhysicalMaterial color="#7c3aed" transparent opacity={0.2} roughness={0.3} />
                </mesh>
              </>
            )}
          </>
        )}

        {/* Additional cells for Meiosis II */}
        {!isMitosis && currentStage >= 7 && (
          <>
            <mesh position={[3, 2.2, 0]}>
              <sphereGeometry args={[Math.max(0.01, 1.3), 20, 20]} />
              <meshPhysicalMaterial color="#f472b6" transparent opacity={0.12} roughness={0.2} />
            </mesh>
            <mesh position={[3, -2.2, 0]}>
              <sphereGeometry args={[Math.max(0.01, 1.3), 20, 20]} />
              <meshPhysicalMaterial color="#f472b6" transparent opacity={0.12} roughness={0.2} />
            </mesh>
            <mesh position={[-3, 2.2, 0]}>
              <sphereGeometry args={[Math.max(0.01, 1.3), 20, 20]} />
              <meshPhysicalMaterial color="#f472b6" transparent opacity={0.12} roughness={0.2} />
            </mesh>
            <mesh position={[-3, -2.2, 0]}>
              <sphereGeometry args={[Math.max(0.01, 1.3), 20, 20]} />
              <meshPhysicalMaterial color="#f472b6" transparent opacity={0.12} roughness={0.2} />
            </mesh>
          </>
        )}
      </group>
    );
  });

  // Animation loop
  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta * simulationSpeed;
    frameCountRef.current++;

    // Update mitosis
    const mitosisTargetStage = mode === 'mitosis' ? stage : Math.min(stage, MITOSIS_STAGES.length - 1);
    mitosisStateRef.current.progress = Math.min(100, mitosisStateRef.current.progress + delta * 15 * simulationSpeed);

    mitosisStateRef.current.chromosomes.forEach((chr) => {
      const target = getMitosisTargets(chr, mitosisTargetStage, mitosisStateRef.current.progress);
      chr.position.lerp(target, 0.05 * simulationSpeed);
      chr.condensed = mitosisTargetStage >= 1;
    });

    // Update meiosis
    const meiosisTargetStage = mode === 'meiosis' ? stage : Math.min(stage, MEIOSIS_STAGES.length - 1);
    meiosisStateRef.current.progress = Math.min(100, meiosisStateRef.current.progress + delta * 15 * simulationSpeed);

    meiosisStateRef.current.chromosomes.forEach((chr) => {
      const target = getMeiosisTargets(chr, meiosisTargetStage, meiosisStateRef.current.progress);
      chr.position.lerp(target, 0.05 * simulationSpeed);
      chr.condensed = meiosisTargetStage >= 1;
      chr.crossedOver = meiosisTargetStage === 0 && meiosisStateRef.current.progress > 50;
    });

    // Update nucleus opacity based on stage
    const getNucleusOpacity = (currentStage: number) => {
      if (currentStage === 0) return 1;
      if (currentStage === 1) return Math.max(0, 1 - (mitosisStateRef.current.progress / 100));
      if (currentStage >= 4) return Math.min(0.3, (mitosisStateRef.current.progress / 100) * 0.3);
      return 0;
    };

    mitosisStateRef.current.nucleusOpacity = getNucleusOpacity(mitosisTargetStage);
    meiosisStateRef.current.nucleusOpacity = getNucleusOpacity(meiosisTargetStage);

    mitosisStateRef.current.spindleOpacity = (mitosisTargetStage >= 1 && mitosisTargetStage <= 3) ? 1 : 0;
    meiosisStateRef.current.spindleOpacity = (meiosisTargetStage >= 1 && meiosisTargetStage <= 6) ? 1 : 0;

    mitosisStateRef.current.cellPinch = (mitosisTargetStage === 5) ? mitosisStateRef.current.progress / 100 : 0;
    meiosisStateRef.current.cellPinch = (meiosisTargetStage === 7) ? meiosisStateRef.current.progress / 100 : 0;

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const currentPhase = mode === 'mitosis'
        ? MITOSIS_STAGES[stage]
        : MEIOSIS_STAGES[stage];

      let chromosomeCount = 46;
      let daughterCells = 1;

      if (mode === 'mitosis') {
        daughterCells = stage >= 5 ? 2 : 1;
      } else {
        if (stage < 4) {
          daughterCells = stage >= 3 ? 2 : 1;
          chromosomeCount = stage >= 2 ? 23 : 46;
        } else {
          daughterCells = stage >= 7 ? 4 : 2;
          chromosomeCount = 23;
        }
      }

      const descriptions = mode === 'mitosis' ? [
        'Cell grows, DNA replicates. Chromosomes are invisible as chromatin.',
        'Chromosomes condense into visible X shapes. Nuclear envelope dissolves. Spindle fibers form.',
        'Chromosomes align at metaphase plate. Spindle fibers attach to centromeres.',
        'Sister chromatids separate and move to opposite poles.',
        'Chromosomes reach poles, new nuclear envelopes form.',
        'Cell divides through cleavage furrow. 2 identical daughter cells result.',
      ] : [
        'Homologous chromosomes pair up (synapsis). Crossing over creates genetic diversity.',
        'Homologous pairs align at metaphase plate (not individual chromosomes).',
        'Homologous chromosomes separate. Sister chromatids remain attached.',
        'Two haploid cells form. Each chromosome still has two sister chromatids.',
        'Chromosomes condense again in both daughter cells.',
        'Chromosomes align at the center of each cell.',
        'Sister chromatids finally separate and move to opposite poles.',
        'Four genetically unique haploid gametes form.',
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

  // Determine which stages to show
  const showBoth = stage === 99;
  const mitosisStage = Math.min(stage, MITOSIS_STAGES.length - 1);
  const meiosisStage = Math.min(stage, MEIOSIS_STAGES.length - 1);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-6, 0, 5]} intensity={0.2} color="#f59e0b" />
      <pointLight position={[6, 0, 5]} intensity={0.2} color="#ec4899" />

      <group>
        {/* Title Labels */}
        {showLabels && (
          <>
            <Html position={[-6, 5.5, 0]} distanceFactor={12}>
              <div className="bg-amber-500/95 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg border-2 border-white/30">
                🧬 MITOSIS
              </div>
            </Html>
            <Html position={[6, 5.5, 0]} distanceFactor={12}>
              <div className="bg-pink-500/95 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg border-2 border-white/30">
                🧬 MEIOSIS
              </div>
            </Html>
          </>
        )}

        {/* Mitosis Cell (Left) */}
        <Cell
          position={[-6, 0, 0]}
          state={mitosisStateRef.current}
          isMitosis={true}
          currentStage={mitosisStage}
        />

        {/* Meiosis Cell (Right) */}
        <Cell
          position={[6, 0, 0]}
          state={meiosisStateRef.current}
          isMitosis={false}
          currentStage={meiosisStage}
        />

        {/* Stage indicator */}
        {showLabels && (
          <Html position={[0, -6, 0]} distanceFactor={12}>
            <div className={`${mode === 'mitosis' ? 'bg-amber-600' : 'bg-pink-600'}/95 text-white px-4 py-2 rounded-lg text-base font-bold shadow-lg`}>
              {mode === 'mitosis' ? 'Mitosis' : 'Meiosis'} - {mode === 'mitosis' ? MITOSIS_STAGES[stage] : MEIOSIS_STAGES[stage]}
            </div>
          </Html>
        )}

        {/* Current info panel */}
        {showLabels && (
          <Html position={[0, 4, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 text-white px-4 py-3 rounded-lg text-sm max-w-xs shadow-lg border border-gray-700">
              <div className="font-bold mb-2 text-lg">{data.phase}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daughter cells:</span>
                  <span className="font-bold">{data.daughterCells}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chromosomes:</span>
                  <span className="font-bold">{data.chromosomesCount}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                  {data.description}
                </div>
              </div>
            </div>
          </Html>
        )}

        {/* Legend */}
        {showLabels && (
          <Html position={[-10, 3, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-gray-700">
              <div className="font-bold mb-2">Chromosome Colors</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CHROMOSOME_COLORS[0].maternal }} />
                  <span>Maternal (blue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CHROMOSOME_COLORS[0].paternal }} />
                  <span>Paternal (red)</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[24, 48, '#1a1a3e', '#1a1a3e']} position={[0, -7, 0]} />
    </>
  );
}
