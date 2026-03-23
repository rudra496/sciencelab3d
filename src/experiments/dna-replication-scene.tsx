'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DNAReplicationData {
  step: string;
  stage: string;
  nucleotidesAdded: number;
  description: string;
  leadingStrand: number;
  laggingStrand: number;
}

interface DNAReplicationSceneProps {
  onDataChange?: (data: DNAReplicationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showLabels?: boolean;
  step?: number;
}

// Nucleotide colors as specified: A=red, T=yellow, G=blue, C=cyan
const BASE_COLORS = {
  A: '#ef4444', // Red
  T: '#fbbf24', // Yellow
  G: '#3b82f6', // Blue
  C: '#06b6d4', // Cyan
};

const ORIGINAL_STRAND_COLOR = '#3b82f6'; // Blue
const NEW_STRAND_COLOR = '#22c55e'; // Green

const COMPLEMENTARY: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

// DNA sequence for the template (20 base pairs)
const DNA_SEQUENCE = 'ATGCGATCGATCGATCGATC';

// Step definitions with detailed descriptions
const STEPS = [
  {
    name: 'Initiation',
    stage: 'Original DNA',
    desc: 'Double-stranded DNA molecule intact. Helicase enzyme approaches origin of replication.',
  },
  {
    name: 'Unwinding',
    stage: 'Replication Fork',
    desc: 'Helicase breaks hydrogen bonds between base pairs, creating replication fork. Strands separate.',
  },
  {
    name: 'Primer Binding',
    stage: 'Primase Activity',
    desc: 'Primase synthesizes short RNA primers. DNA polymerases can now attach and begin synthesis.',
  },
  {
    name: 'Elongation',
    stage: 'DNA Polymerase',
    desc: 'Leading strand: continuous synthesis 5\'→3\'. Lagging strand: Okazaki fragments. New strands in green.',
  },
  {
    name: 'Completion',
    stage: 'Two Daughter DNA',
    desc: 'Semi-conservative replication complete! Each DNA has one original (blue) + one new strand (green).',
  },
];

export default function DNAReplicationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showLabels = true,
  step = 0,
}: DNAReplicationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const helicasePosRef = useRef(0);
  const primerProgressRef = useRef(0);
  const leadingProgressRef = useRef(0);
  const laggingProgressRef = useRef(0);
  const unwindingAmountRef = useRef(0);

  // React state for UI updates (throttled)
  const [nucleotidesAdded, setNucleotidesAdded] = useState(0);
  const [leadingStrand, setLeadingStrand] = useState(0);
  const [laggingStrand, setLaggingStrand] = useState(0);
  const frameCountRef = useRef(0);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    helicasePosRef.current = 0;
    primerProgressRef.current = 0;
    leadingProgressRef.current = 0;
    laggingProgressRef.current = 0;
    unwindingAmountRef.current = 0;
    setNucleotidesAdded(0);
    setLeadingStrand(0);
    setLaggingStrand(0);
  }, [resetTrigger, step]);

  // Generate base pair data
  const basePairs = useMemo(() => {
    const pairs: any[] = [];
    for (let i = 0; i < 20; i++) {
      const base1 = DNA_SEQUENCE[i % DNA_SEQUENCE.length];
      const base2 = COMPLEMENTARY[base1];
      pairs.push({
        index: i,
        base1,
        base2,
        color1: BASE_COLORS[base1 as keyof typeof BASE_COLORS],
        color2: BASE_COLORS[base2 as keyof typeof BASE_COLORS],
        y: (i - 10) * 0.6,
        angle: i * 0.6,
      });
    }
    return pairs;
  }, []);

  // Calculate strand position with helix rotation and unwinding
  const getStrandPosition = useCallback((
    index: number,
    angle: number,
    strand: 0 | 1,
    separation: number = 0,
    helicasePos: number = 0
  ) => {
    const baseAngle = angle + rotationRef.current + (strand === 0 ? 0 : Math.PI);
    const distFromHelicase = Math.abs(index - 10);

    // Unwinding happens at helicase position and propagates
    let unwindAmount = 0;
    if (helicasePos > 0 && distFromHelicase < helicasePos + 2) {
      const progress = 1 - (distFromHelicase / (helicasePos + 2));
      unwindAmount = Math.max(0, progress * separation);
    }

    const sep = unwindAmount * (strand === 0 ? -1 : 1);
    return new THREE.Vector3(
      Math.cos(baseAngle) * 1.8 + sep,
      (index - 10) * 0.6,
      Math.sin(baseAngle) * 1.8
    );
  }, []);

  // Generate backbone points
  const generateBackbonePoints = useCallback((
    strand: 0 | 1,
    separation: number = 0,
    helicasePos: number = 0
  ) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const pair = basePairs[i];
      if (pair) {
        const pos = getStrandPosition(i, pair.angle, strand, separation, helicasePos);
        points.push(pos);
      }
    }
    return points;
  }, [basePairs, getStrandPosition]);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.08 * simulationSpeed;

      // Step-based animations
      if (step === 1) {
        // Helicase unwinding
        helicasePosRef.current = Math.min(12, helicasePosRef.current + delta * 3 * simulationSpeed * speed);
        unwindingAmountRef.current = Math.min(3, unwindingAmountRef.current + delta * 2 * simulationSpeed * speed);
      } else if (step === 2) {
        // Primase adding primers
        helicasePosRef.current = 10;
        unwindingAmountRef.current = 3;
        primerProgressRef.current = Math.min(100, primerProgressRef.current + delta * 20 * simulationSpeed * speed);
      } else if (step === 3) {
        // Polymerase elongation
        unwindingAmountRef.current = 3;
        // Leading strand continuous (5' to 3' following helicase)
        leadingProgressRef.current = Math.min(100, leadingProgressRef.current + delta * 12 * simulationSpeed * speed);
        // Lagging strand Okazaki fragments
        laggingProgressRef.current = Math.min(100, laggingProgressRef.current + delta * 8 * simulationSpeed * speed);
      } else if (step === 4) {
        // Complete
        unwindingAmountRef.current = 3;
        leadingProgressRef.current = 100;
        laggingProgressRef.current = 100;
      }

      // Calculate nucleotides added
      const totalNucleotides = Math.floor(
        ((leadingProgressRef.current + laggingProgressRef.current) / 100) * 20
      );
      const leading = Math.floor((leadingProgressRef.current / 100) * 20);
      const lagging = Math.floor((laggingProgressRef.current / 100) * 20);

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        setNucleotidesAdded(totalNucleotides);
        setLeadingStrand(leading);
        setLaggingStrand(lagging);

        if (onDataChange) {
          onDataChange({
            step: STEPS[step].name,
            stage: STEPS[step].stage,
            nucleotidesAdded: totalNucleotides,
            description: STEPS[step].desc,
            leadingStrand: leading,
            laggingStrand: lagging,
          });
        }
      }
    }
  });

  const currentSeparation = step >= 1 ? unwindingAmountRef.current : 0;
  const currentHelicasePos = helicasePosRef.current;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={step === 1 ? 0.6 : 0} color="#f59e0b" />
      <pointLight position={[0, 0, 0]} intensity={step === 2 ? 0.4 : 0} color="#8b5cf6" />
      <pointLight position={[0, 0, 0]} intensity={step === 3 ? 0.5 : 0} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Main step indicator */}
        {showLabels && (
          <Html position={[0, 9, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-4 py-3 rounded-xl border border-gray-700 shadow-xl">
              <div className="text-white text-lg font-bold">
                {step + 1}. {STEPS[step].name}
              </div>
              <div className="text-gray-300 text-sm mt-1">{STEPS[step].desc}</div>
              {step === 3 && (
                <div className="text-gray-400 text-xs mt-2">
                  Leading: {leadingStrand}/20 | Lagging: {laggingStrand}/20
                </div>
              )}
            </div>
          </Html>
        )}

        {/* ===== DNA DOUBLE HELIX ===== */}
        <group>
          {/* Original backbones (blue lines) */}
          <Line
            points={generateBackbonePoints(0, currentSeparation, currentHelicasePos)}
            color={ORIGINAL_STRAND_COLOR}
            lineWidth={4}
            opacity={0.8}
            transparent
          />
          <Line
            points={generateBackbonePoints(1, currentSeparation, currentHelicasePos)}
            color={ORIGINAL_STRAND_COLOR}
            lineWidth={4}
            opacity={0.8}
            transparent
          />

          {/* Base pairs */}
          {basePairs.map((pair) => {
            const pos1 = getStrandPosition(pair.index, pair.angle, 0, currentSeparation, currentHelicasePos);
            const pos2 = getStrandPosition(pair.index, pair.angle, 1, currentSeparation, currentHelicasePos);
            const isSeparated = currentSeparation > 0.5;
            const helicaseProgress = step === 1 ? currentHelicasePos : step > 1 ? 12 : 0;

            // Check if this base pair has been replicated
            const isReplicated = step >= 3 && pair.index < (leadingProgressRef.current / 100) * 20;

            return (
              <group key={pair.index}>
                {/* Original bases on both strands */}
                <mesh position={pos1}>
                  <sphereGeometry args={[Math.max(0.01, 0.18), 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color1}
                    emissive={pair.color1}
                    emissiveIntensity={0.4}
                  />
                </mesh>
                <mesh position={pos2}>
                  <sphereGeometry args={[Math.max(0.01, 0.18), 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color2}
                    emissive={pair.color2}
                    emissiveIntensity={0.4}
                  />
                </mesh>

                {/* Hydrogen bonds (disappear as unwound) */}
                {!isSeparated && pair.index < helicaseProgress && (
                  <Line
                    points={[pos1, pos2]}
                    color="#e2e8f0"
                    lineWidth={2}
                    opacity={0.4}
                    transparent
                  />
                )}

                {/* RNA Primers (Step 2) - orange */}
                {step === 2 && pair.index % 4 === 0 && pair.index < (primerProgressRef.current / 100) * 20 && (
                  <>
                    <mesh position={pos1.clone().multiplyScalar(1.08)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color="#f97316"
                        emissive="#f97316"
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                    <mesh position={pos2.clone().multiplyScalar(1.08)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color="#f97316"
                        emissive="#f97316"
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                  </>
                )}

                {/* New complementary strands (Step 3 & 4) - green */}
                {isReplicated && (
                  <>
                    {/* New strand matching original strand 1 */}
                    <mesh position={pos1.clone().multiplyScalar(1.2)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color={NEW_STRAND_COLOR}
                        opacity={0.9}
                        transparent
                        emissive={NEW_STRAND_COLOR}
                        emissiveIntensity={0.3}
                      />
                    </mesh>
                    {/* New strand matching original strand 2 */}
                    <mesh position={pos2.clone().multiplyScalar(1.2)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color={NEW_STRAND_COLOR}
                        opacity={0.9}
                        transparent
                        emissive={NEW_STRAND_COLOR}
                        emissiveIntensity={0.3}
                      />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
        </group>

        {/* ===== HELICASE ENZYME (Step 1) ===== */}
        {step === 1 && showLabels && (
          <group position={[0, 0, 0]}>
            {/* Helicase body - wedge shape */}
            <mesh position={[0, 0, 2.2]}>
              <coneGeometry args={[1.2, 2, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
            {/* Helicase base */}
            <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.8, 1, 0.5, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.4}
              />
            </mesh>
            <Html position={[0, 0, 3.5]} distanceFactor={10}>
              <div className="bg-amber-500/95 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg border-2 border-amber-400">
                🧬 Helicase
              </div>
            </Html>
          </group>
        )}

        {/* ===== PRIMASE ENZYMES (Step 2) ===== */}
        {step === 2 && showLabels && (
          <>
            {/* Primase on leading strand side */}
            <group position={[2, 2, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.6), 16, 16]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <Html position={[0, 1, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
            {/* Primase on lagging strand side */}
            <group position={[-2, -2, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.6), 16, 16]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <Html position={[0, -1, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
          </>
        )}

        {/* ===== DNA POLYMERASE ENZYMES (Step 3) ===== */}
        {step === 3 && showLabels && (
          <>
            {/* Leading strand polymerase (continuous synthesis) */}
            <group position={[2.5, 3, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.8), 16, 16]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.5}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, 1.2, 0]} distanceFactor={10}>
                <div className="bg-green-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase III
                </div>
              </Html>
              <Html position={[0, -1.2, 0]} distanceFactor={10}>
                <div className="bg-green-900/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                  Leading strand (5'→3')
                </div>
              </Html>
            </group>
            {/* Lagging strand polymerase (Okazaki fragments) */}
            <group position={[-2.5, -3, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.8), 16, 16]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.5}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, -1.2, 0]} distanceFactor={10}>
                <div className="bg-green-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase III
                </div>
              </Html>
              <Html position={[0, 1.2, 0]} distanceFactor={10}>
                <div className="bg-green-900/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                  Lagging (Okazaki)
                </div>
              </Html>
            </group>
          </>
        )}

        {/* ===== LEGEND ===== */}
        {showLabels && step >= 3 && (
          <Html position={[6, -5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
              <div className="text-white font-bold mb-2">Strand Colors</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: ORIGINAL_STRAND_COLOR }} />
                  <span className="text-gray-300">Original strand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: NEW_STRAND_COLOR }} />
                  <span className="text-gray-300">New strand</span>
                </div>
              </div>
              <div className="text-white font-bold mt-3 mb-2">Base Pairs</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.A }} />
                  <span className="text-gray-300 text-[10px]">A</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.T }} />
                  <span className="text-gray-300 text-[10px]">T</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.G }} />
                  <span className="text-gray-300 text-[10px]">G</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.C }} />
                  <span className="text-gray-300 text-[10px]">C</span>
                </div>
              </div>
            </div>
          </Html>
        )}

        {/* ===== SEMI-CONSERVATIVE LABEL (Step 4) ===== */}
        {step === 4 && showLabels && (
          <Html position={[-5, 0, 0]} distanceFactor={10}>
            <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white/30">
              ✓ Semi-Conservative
              <div className="text-xs font-normal mt-1">Each DNA = 1 old + 1 new strand</div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
