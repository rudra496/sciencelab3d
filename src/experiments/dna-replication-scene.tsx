'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DNAReplicationData {
  step: string;
  enzymes: string[];
  nucleotidesAdded: number;
  description: string;
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

// Nucleotide colors as specified: A=green, T=red, G=blue, C=yellow
const NUCLEOTIDE_COLORS = {
  A: '#22c55e', // Green
  T: '#ef4444', // Red
  G: '#3b82f6', // Blue
  C: '#eab308', // Yellow
};

const COMPLEMENTARY: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

// DNA sequence for the template
const DNA_SEQUENCE = 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCG';

const STEPS = [
  { name: 'Intact DNA', enzymes: [], desc: 'Double-stranded DNA molecule rotating intact' },
  { name: 'Helicase Unzips', enzymes: ['Helicase'], desc: 'Helicase breaks hydrogen bonds, creating replication fork' },
  { name: 'Primase', enzymes: ['Primase'], desc: 'Primase synthesizes short RNA primers on each strand' },
  { name: 'DNA Polymerase', enzymes: ['DNA Polymerase'], desc: 'Polymerase adds complementary nucleotides to each strand' },
  { name: 'Two Daughter DNA', enzymes: [], desc: 'Two complete DNA molecules formed (semi-conservative)' },
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
  const polymeraseProgressRef = useRef(0);
  const nucleotidesAddedRef = useRef(0);

  // React state for UI updates (throttled)
  const [nucleotidesAdded, setNucleotidesAdded] = useState(0);
  const [uiStep, setUiStep] = useState(0);
  const frameCountRef = useRef(0);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    helicasePosRef.current = 0;
    primerProgressRef.current = 0;
    polymeraseProgressRef.current = 0;
    nucleotidesAddedRef.current = 0;
    setNucleotidesAdded(0);
    setUiStep(step);
  }, [resetTrigger, step]);

  // Generate base pairs for DNA
  const basePairs = useMemo(() => {
    const pairs: any[] = [];
    for (let i = 0; i < 30; i++) {
      const base1 = DNA_SEQUENCE[i % DNA_SEQUENCE.length];
      const base2 = COMPLEMENTARY[base1];
      pairs.push({
        index: i,
        base1,
        base2,
        color1: NUCLEOTIDE_COLORS[base1 as keyof typeof NUCLEOTIDE_COLORS],
        color2: NUCLEOTIDE_COLORS[base2 as keyof typeof NUCLEOTIDE_COLORS],
        y: (i - 15) * 0.5,
        angle: i * 0.5,
      });
    }
    return pairs;
  }, []);

  // Calculate strand positions with unwinding
  const getStrandPosition = useCallback((
    index: number,
    angle: number,
    strand: 0 | 1,
    separation: number = 0,
    unwindCenter: number = 0
  ) => {
    const baseAngle = angle + rotationRef.current + (strand === 0 ? 0 : Math.PI);
    const distFromCenter = index - unwindCenter;
    const unwindAmount = Math.max(0, 1 - Math.abs(distFromCenter) * 0.15) * separation;
    const sep = unwindAmount * (strand === 0 ? -1 : 1);
    return new THREE.Vector3(
      Math.cos(baseAngle) * 1.5 + sep,
      (index - 15) * 0.5,
      Math.sin(baseAngle) * 1.5
    );
  }, []);

  // Generate backbone points for Line component
  const generateBackbonePoints = useCallback((
    strand: 0 | 1,
    separation: number = 0,
    unwindCenter: number = 0,
    offsetMultiplier: number = 1
  ) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      const pair = basePairs[i];
      if (pair) {
        const pos = getStrandPosition(i, pair.angle, strand, separation, unwindCenter);
        points.push(pos.clone().multiplyScalar(offsetMultiplier));
      }
    }
    return points;
  }, [basePairs, getStrandPosition]);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      // Update physics state
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.1 * simulationSpeed;

      // Step-based animations
      if (step === 1) {
        // Helicase unzipping
        helicasePosRef.current = Math.min(15, helicasePosRef.current + delta * 3 * simulationSpeed * speed);
      } else if (step === 2) {
        // Primase adding primers
        primerProgressRef.current = Math.min(100, primerProgressRef.current + delta * 20 * simulationSpeed * speed);
      } else if (step === 3) {
        // Polymerase adding nucleotides
        polymeraseProgressRef.current = Math.min(100, polymeraseProgressRef.current + delta * 15 * simulationSpeed * speed);
        nucleotidesAddedRef.current = Math.min(30, nucleotidesAddedRef.current + delta * 4 * simulationSpeed * speed);
      } else if (step === 4) {
        nucleotidesAddedRef.current = 30;
      }

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        setNucleotidesAdded(nucleotidesAddedRef.current);

        if (onDataChange) {
          onDataChange({
            step: STEPS[step].name,
            enzymes: STEPS[step].enzymes,
            nucleotidesAdded: Math.round(nucleotidesAddedRef.current),
            description: STEPS[step].desc,
          });
        }
      }
    }
  });

  // Calculate current state based on step
  const getSeparation = useCallback(() => {
    if (step === 0) return 0;
    if (step === 1) return (helicasePosRef.current / 15) * 3;
    return 3;
  }, [step, helicasePosRef.current]);

  const separation = getSeparation();

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={step === 1 ? 0.5 : 0} color="#f59e0b" />
      <pointLight position={[0, 0, 0]} intensity={step === 2 ? 0.4 : 0} color="#8b5cf6" />
      <pointLight position={[0, 0, 0]} intensity={step === 3 ? 0.4 : 0} color="#3b82f6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Step indicator */}
        {showLabels && (
          <Html position={[0, 9, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-4 py-3 rounded-xl border border-gray-700 shadow-xl">
              <div className="text-white text-lg font-bold">{STEPS[step].name}</div>
              <div className="text-gray-300 text-sm mt-1">{STEPS[step].desc}</div>
              {step === 3 && (
                <div className="text-gray-400 text-xs mt-2">
                  Nucleotides: {Math.round(nucleotidesAdded)}/30
                </div>
              )}
            </div>
          </Html>
        )}

        {/* DNA Double Helix */}
        <group>
          {/* Backbone strands using Line */}
          <Line
            points={generateBackbonePoints(0, separation, 15, 1)}
            color="#60a5fa"
            lineWidth={3}
            opacity={0.7}
            transparent
          />
          <Line
            points={generateBackbonePoints(1, separation, 15, 1)}
            color="#60a5fa"
            lineWidth={3}
            opacity={0.7}
            transparent
          />

          {/* Base pairs */}
          {basePairs.map((pair) => {
            const pos1 = getStrandPosition(pair.index, pair.angle, 0, separation, 15);
            const pos2 = getStrandPosition(pair.index, pair.angle, 1, separation, 15);
            const isUnwound = separation > 0.5;
            const helicaseProgress = step === 1 ? helicasePosRef.current : step > 1 ? 15 : 0;

            return (
              <group key={pair.index}>
                {/* Original bases */}
                <mesh position={pos1}>
                  <sphereGeometry args={[0.15, 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color1}
                    emissive={pair.color1}
                    emissiveIntensity={0.3}
                  />
                </mesh>
                <mesh position={pos2}>
                  <sphereGeometry args={[0.15, 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color2}
                    emissive={pair.color2}
                    emissiveIntensity={0.3}
                  />
                </mesh>

                {/* Hydrogen bonds (break as helicase passes) */}
                {!isUnwound && pair.index < helicaseProgress && (
                  <Line
                    points={[pos1, pos2]}
                    color="#e2e8f0"
                    lineWidth={1}
                    opacity={0.5}
                    transparent
                  />
                )}

                {/* Primers (Step 2) */}
                {step === 2 && pair.index % 5 === 0 && pair.index < (primerProgressRef.current / 100) * 30 && (
                  <>
                    <mesh position={pos1.clone().multiplyScalar(1.1)}>
                      <sphereGeometry args={[0.12, 10, 10]} />
                      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={pos2.clone().multiplyScalar(1.1)}>
                      <sphereGeometry args={[0.12, 10, 10]} />
                      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
                    </mesh>
                  </>
                )}

                {/* New complementary strands (Step 3 & 4) */}
                {step >= 3 && pair.index < nucleotidesAddedRef.current && (
                  <>
                    <mesh position={pos1.clone().multiplyScalar(1.25)}>
                      <sphereGeometry args={[0.12, 10, 10]} />
                      <meshStandardMaterial
                        color={pair.color2}
                        opacity={0.85}
                        transparent
                        emissive={pair.color2}
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                    <mesh position={pos2.clone().multiplyScalar(1.25)}>
                      <sphereGeometry args={[0.12, 10, 10]} />
                      <meshStandardMaterial
                        color={pair.color1}
                        opacity={0.85}
                        transparent
                        emissive={pair.color1}
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
        </group>

        {/* Helicase Enzyme (Step 1) */}
        {step === 1 && showLabels && (
          <group position={[0, helicasePosRef.current - 7.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.4}
                roughness={0.3}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.8]}>
              <coneGeometry args={[0.6, 1.2, 8]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
            </mesh>
            <Html position={[1.2, 0, 0]} distanceFactor={10}>
              <div className="bg-amber-500/95 text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                Helicase
              </div>
            </Html>
          </group>
        )}

        {/* Primase Enzymes (Step 2) */}
        {step === 2 && showLabels && (
          <>
            <group position={[1.5, -3, 0.5]}>
              <mesh>
                <sphereGeometry args={[0.5, 12, 12]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.4}
                />
              </mesh>
              <Html position={[0, 0.8, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
            <group position={[-1.5, 3, 0.5]}>
              <mesh>
                <sphereGeometry args={[0.5, 12, 12]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.4}
                />
              </mesh>
              <Html position={[0, 0.8, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
          </>
        )}

        {/* DNA Polymerase Enzymes (Step 3) */}
        {step === 3 && showLabels && (
          <>
            <group position={[2, polymeraseProgressRef.current / 100 * 10 - 5, 0]}>
              <mesh>
                <sphereGeometry args={[0.7, 16, 16]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={0.4}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, 1, 0]} distanceFactor={10}>
                <div className="bg-blue-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase 5'→3'
                </div>
              </Html>
            </group>
            <group position={[-2, -polymeraseProgressRef.current / 100 * 10 + 5, 0]}>
              <mesh>
                <sphereGeometry args={[0.7, 16, 16]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={0.4}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, -1, 0]} distanceFactor={10}>
                <div className="bg-blue-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase
                </div>
              </Html>
            </group>
          </>
        )}

        {/* Nucleotide legend */}
        {showLabels && step >= 3 && (
          <Html position={[6, -6, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs">
              <div className="text-white font-bold mb-2">Nucleotides</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NUCLEOTIDE_COLORS.A }} />
                  <span className="text-gray-300">Adenine (A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NUCLEOTIDE_COLORS.T }} />
                  <span className="text-gray-300">Thymine (T)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NUCLEOTIDE_COLORS.G }} />
                  <span className="text-gray-300">Guanine (G)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NUCLEOTIDE_COLORS.C }} />
                  <span className="text-gray-300">Cytosine (C)</span>
                </div>
              </div>
            </div>
          </Html>
        )}

        {/* Semi-conservative label (Step 4) */}
        {step === 4 && showLabels && (
          <Html position={[-6, 0, 0]} distanceFactor={10}>
            <div className="bg-green-500/95 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
              Semi-Conservative Replication
              <div className="text-xs font-normal mt-1">Each DNA has 1 old + 1 new strand</div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
