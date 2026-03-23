'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface ProteinSynthesisData {
  phase: string;
  step: string;
  codonBeingRead: string;
  aminoAcidAdded: string;
  proteinLength: number;
  description: string;
  nucleotidesTranscribed: number;
}

interface ProteinSynthesisSceneProps {
  onDataChange?: (data: ProteinSynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showLabels?: boolean;
  step?: number;
}

// Amino acids with properties
const AMINO_ACIDS = [
  { name: 'Met', fullName: 'Methionine (Start)', color: '#ef4444' },
  { name: 'Lys', fullName: 'Lysine', color: '#3b82f6' },
  { name: 'Arg', fullName: 'Arginine', color: '#22c55e' },
  { name: 'Ser', fullName: 'Serine', color: '#f59e0b' },
  { name: 'Leu', fullName: 'Leucine', color: '#8b5cf6' },
  { name: 'Pro', fullName: 'Proline', color: '#ec4899' },
  { name: 'Gly', fullName: 'Glycine', color: '#14b8a6' },
  { name: 'Val', fullName: 'Valine', color: '#f97316' },
];

// DNA colors (blue tones)
const DNA_COLORS = {
  A: '#1e40af', // Dark blue
  T: '#3b82f6', // Blue
  G: '#60a5fa', // Light blue
  C: '#93c5fd', // Very light blue
};

// mRNA colors (orange tones)
const MRNA_COLORS = {
  A: '#ea580c',
  U: '#f97316',
  G: '#fb923c',
  C: '#fdba74',
};

// tRNA color
const TRNA_COLOR = '#22c55e';

// Ribosome colors
const RIBOSOME_COLORS = {
  large: '#8b5cf6',
  small: '#a78bfa',
};

// DNA template sequence (coding strand shown, template is complementary)
const DNA_SEQUENCE = ['A', 'T', 'G', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T'];

// mRNA codons (transcribed from DNA, U instead of T)
const MRNA_CODONS = [
  ['A', 'U', 'G'], // Met (start)
  ['A', 'A', 'A'], // Lys
  ['C', 'G', 'U'], // Arg
  ['U', 'C', 'U'], // Ser
  ['U', 'U', 'A'], // Leu
  ['C', 'C', 'U'], // Pro
  ['G', 'G', 'U'], // Gly
  ['G', 'U', 'U'], // Val
];

const COMPLEMENTARY_DNA: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

const COMPLEMENTARY_MRNA: Record<string, string> = {
  A: 'U',
  U: 'A',
  G: 'C',
  C: 'G',
};

const STEPS = [
  {
    phase: 'Transcription',
    name: 'DNA in Nucleus',
    desc: 'DNA double helix in nucleus. RNA Polymerase binds to promoter region.',
  },
  {
    phase: 'Transcription',
    name: 'mRNA Synthesis',
    desc: 'RNA Polymerase reads DNA 3\'→5\', builds mRNA 5\'→3\'. Uracil pairs with Adenine.',
  },
  {
    phase: 'Transcription',
    name: 'mRNA Processing & Export',
    desc: 'mRNA detaches, exits nucleus through nuclear pore into cytoplasm.',
  },
  {
    phase: 'Translation',
    name: 'Translation Initiation',
    desc: 'Ribosome binds mRNA at start codon (AUG). Initiation tRNA brings first amino acid.',
  },
  {
    phase: 'Translation',
    name: 'Elongation',
    desc: 'tRNAs bring amino acids matching codons. Polypeptide chain grows bond by bond.',
  },
  {
    phase: 'Translation',
    name: 'Termination & Folding',
    desc: 'Stop codon reached. Polypeptide chain folds into functional protein.',
  },
];

export default function ProteinSynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showLabels = true,
  step = 0,
}: ProteinSynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const rnapProgressRef = useRef(0);
  const exitProgressRef = useRef(0);
  const ribosomeProgressRef = useRef(0);
  const codonIndexRef = useRef(0);
  const aminoAcidsFormedRef = useRef(0);
  const foldingProgressRef = useRef(0);
  const nucleotidesTranscribedRef = useRef(0);

  // React state for UI updates (throttled)
  const [currentCodon, setCurrentCodon] = useState('AUG');
  const [currentAminoAcid, setCurrentAminoAcid] = useState('Met');
  const [proteinLength, setProteinLength] = useState(0);
  const frameCountRef = useRef(0);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    rnapProgressRef.current = 0;
    exitProgressRef.current = 0;
    ribosomeProgressRef.current = 0;
    codonIndexRef.current = 0;
    aminoAcidsFormedRef.current = 0;
    foldingProgressRef.current = 0;
    nucleotidesTranscribedRef.current = 0;
    setCurrentCodon('AUG');
    setCurrentAminoAcid('Met');
    setProteinLength(0);
  }, [resetTrigger, step]);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.06 * simulationSpeed;

      // Step-based animations
      if (step === 1) {
        // mRNA synthesis
        rnapProgressRef.current = Math.min(100, rnapProgressRef.current + delta * 10 * simulationSpeed * speed);
        nucleotidesTranscribedRef.current = Math.min(15, nucleotidesTranscribedRef.current + delta * 1.5 * simulationSpeed * speed);
      } else if (step === 2) {
        // mRNA exiting nucleus
        rnapProgressRef.current = 100;
        nucleotidesTranscribedRef.current = 15;
        exitProgressRef.current = Math.min(100, exitProgressRef.current + delta * 15 * simulationSpeed * speed);
      } else if (step === 3) {
        // Ribosome binding
        ribosomeProgressRef.current = Math.min(100, ribosomeProgressRef.current + delta * 25 * simulationSpeed * speed);
      } else if (step === 4) {
        // tRNA bringing amino acids, elongation
        codonIndexRef.current = Math.min(8, codonIndexRef.current + delta * 1.2 * simulationSpeed * speed);
        aminoAcidsFormedRef.current = Math.min(8, aminoAcidsFormedRef.current + delta * 1 * simulationSpeed * speed);
      } else if (step === 5) {
        // Protein folding
        aminoAcidsFormedRef.current = 8;
        foldingProgressRef.current = Math.min(100, foldingProgressRef.current + delta * 20 * simulationSpeed * speed);
      }

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        const idx = Math.floor(codonIndexRef.current);
        if (idx < 8 && idx >= 0) {
          const codon = MRNA_CODONS[idx].join('');
          setCurrentCodon(codon);
          setCurrentAminoAcid(AMINO_ACIDS[idx].name);
        }
        setProteinLength(Math.floor(aminoAcidsFormedRef.current));

        if (onDataChange) {
          onDataChange({
            phase: STEPS[step].phase,
            step: STEPS[step].name,
            codonBeingRead: currentCodon,
            aminoAcidAdded: currentAminoAcid,
            proteinLength: Math.floor(aminoAcidsFormedRef.current),
            description: STEPS[step].desc,
            nucleotidesTranscribed: Math.floor(nucleotidesTranscribedRef.current),
          });
        }
      }
    }
  });

  // Generate DNA helix points
  const generateDNAHelixPoints = useCallback((offsetY = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = i * 0.5 + rotationRef.current;
      points.push(new THREE.Vector3(
        Math.cos(angle) * 1.3 - 4,
        i * 0.5 - 4 + offsetY,
        Math.sin(angle) * 1.3
      ));
    }
    return points;
  }, [rotationRef.current]);

  // Generate mRNA strand points
  const generateMRNAPoints = useCallback((offsetX = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      points.push(new THREE.Vector3(1.5 + offsetX, (i - 4) * 1.2, 0));
    }
    return points;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-4, 0, 0]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[2, 0, 0]} intensity={step >= 3 ? 0.4 : 0} color="#f97316" />
      <pointLight position={[4, 2, 0]} intensity={step >= 3 ? 0.4 : 0} color="#8b5cf6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Step indicator */}
        {showLabels && (
          <Html position={[0, 8, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-4 py-3 rounded-xl border border-gray-700 shadow-xl">
              <div className="text-white text-lg font-bold">
                {STEPS[step].phase}: {STEPS[step].name}
              </div>
              <div className="text-gray-300 text-sm mt-1">{STEPS[step].desc}</div>
              {(step === 4 || step === 5) && (
                <div className="text-gray-400 text-xs mt-2">
                  Codon: {currentCodon} | AA: {currentAminoAcid} | Protein: {proteinLength}/8
                </div>
              )}
              {step === 1 && (
                <div className="text-gray-400 text-xs mt-2">
                  Nucleotides: {Math.floor(nucleotidesTranscribedRef.current)}/15
                </div>
              )}
            </div>
          </Html>
        )}

        {/* ===== TRANSCRIPTION PHASE (Steps 0-2) ===== */}
        {step <= 2 && (
          <group>
            {/* Nucleus boundary */}
            <mesh position={[-3, 1.5, 0]}>
              <sphereGeometry args={[Math.max(0.01, 5.5), 32, 32]} />
              <meshStandardMaterial
                color="#1e3a5f"
                transparent
                opacity={0.12}
                side={THREE.BackSide}
              />
            </mesh>

            {/* DNA double helix */}
            <Line
              points={generateDNAHelixPoints()}
              color="#3b82f6"
              lineWidth={3}
              opacity={0.7}
              transparent
            />
            <Line
              points={generateDNAHelixPoints().map(p => new THREE.Vector3(p.x + 0.4, p.y, p.z + 0.4))}
              color="#60a5fa"
              lineWidth={3}
              opacity={0.7}
              transparent
            />

            {/* DNA bases */}
            {DNA_SEQUENCE.map((base, i) => (
              <group key={i}>
                <mesh position={[Math.cos(i * 0.5 + rotationRef.current) * 1.3 - 4, i * 0.5 - 4, Math.sin(i * 0.5 + rotationRef.current) * 1.3]}>
                  <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                  <meshStandardMaterial color={DNA_COLORS[base as keyof typeof DNA_COLORS]} />
                </mesh>
                <mesh position={[Math.cos(i * 0.5 + rotationRef.current) * 1.3 - 4 + 0.4, i * 0.5 - 4, Math.sin(i * 0.5 + rotationRef.current) * 1.3 + 0.4]}>
                  <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                  <meshStandardMaterial color={DNA_COLORS[COMPLEMENTARY_DNA[base as keyof typeof COMPLEMENTARY_DNA] as keyof typeof DNA_COLORS]} />
                </mesh>
              </group>
            ))}

            {/* RNA Polymerase */}
            {(step >= 0 && step <= 2) && (
              <group position={[-4, -4 + (rnapProgressRef.current / 100) * 5, 1.5]}>
                <mesh>
                  <sphereGeometry args={[Math.max(0.01, 1), 16, 16]} />
                  <meshStandardMaterial
                    color="#dc2626"
                    emissive="#dc2626"
                    emissiveIntensity={0.4}
                  />
                </mesh>
                {showLabels && (
                  <Html position={[1.8, 0, 0]} distanceFactor={10}>
                    <div className="bg-red-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      RNA Polymerase
                    </div>
                  </Html>
                )}
              </group>
            )}

            {/* Growing mRNA strand */}
            {step >= 1 && (
              <group position={[-2.5, -4 + (rnapProgressRef.current / 100) * 5, 0]}>
                {Array.from({ length: Math.floor((rnapProgressRef.current / 100) * 8) }).map((_, i) => (
                  <group key={i} position={[i * 0.4, 0, 0]}>
                    <mesh>
                      <sphereGeometry args={[Math.max(0.01, 0.1), 8, 8]} />
                      <meshStandardMaterial color={MRNA_COLORS.A} />
                    </mesh>
                    <mesh position={[0.08, 0.08, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.08), 8, 8]} />
                      <meshStandardMaterial color={MRNA_COLORS[['A', 'U', 'G', 'C'][i % 4] as keyof typeof MRNA_COLORS]} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {/* mRNA exiting nucleus (Step 2) */}
            {step === 2 && (
              <group position={[-2.5 + (exitProgressRef.current / 100) * 5, 0, 0]}>
                <Line points={generateMRNAPoints()} color="#f97316" lineWidth={2.5} opacity={0.8} transparent />
                {MRNA_CODONS.map((codon, i) => (
                  <group key={i} position={[1.5, (i - 4) * 1.2, 0]}>
                    {codon.map((base, j) => (
                      <mesh key={j} position={[j * 0.3, 0, 0]}>
                        <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                        <meshStandardMaterial color={MRNA_COLORS[base as keyof typeof MRNA_COLORS]} />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {/* Nuclear pore */}
            {step === 2 && showLabels && (
              <Html position={[0.5, 0, 0]} distanceFactor={10}>
                <div className="bg-blue-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  Nuclear Pore → Cytoplasm
                </div>
              </Html>
            )}
          </group>
        )}

        {/* ===== TRANSLATION PHASE (Steps 3-5) ===== */}
        {step >= 3 && (
          <group>
            {/* mRNA strand in cytoplasm */}
            <Line points={generateMRNAPoints()} color="#f97316" lineWidth={2.5} opacity={0.8} transparent />

            {/* mRNA codons with base labels */}
            {MRNA_CODONS.map((codon, i) => {
              const isProcessed = i < aminoAcidsFormedRef.current;
              const isCurrent = Math.floor(codonIndexRef.current) === i;

              return (
                <group key={i} position={[1.5, (i - 4) * 1.2, 0]}>
                  {codon.map((base, j) => (
                    <mesh key={j} position={[j * 0.32, 0, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.15), 10, 10]} />
                      <meshStandardMaterial
                        color={MRNA_COLORS[base as keyof typeof MRNA_COLORS]}
                        emissive={isCurrent ? MRNA_COLORS[base as keyof typeof MRNA_COLORS] : '#000000'}
                        emissiveIntensity={isCurrent ? 0.5 : 0}
                      />
                    </mesh>
                  ))}

                  {/* tRNA bringing amino acid */}
                  {isCurrent && showLabels && (
                    <group position={[1, 0, 0.6]}>
                      <mesh>
                        <sphereGeometry args={[Math.max(0.01, 0.35), 12, 12]} />
                        <meshStandardMaterial
                          color={TRNA_COLOR}
                          emissive={TRNA_COLOR}
                          emissiveIntensity={0.4}
                        />
                      </mesh>
                      {/* Anticodon (complementary to codon) */}
                      {codon.map((base, j) => (
                        <mesh key={j} position={[0.2, j * 0.16 - 0.16, 0.25]}>
                          <sphereGeometry args={[Math.max(0.01, 0.09), 8, 8]} />
                          <meshStandardMaterial color={MRNA_COLORS[COMPLEMENTARY_MRNA[base as keyof typeof COMPLEMENTARY_MRNA] as keyof typeof MRNA_COLORS]} />
                        </mesh>
                      ))}
                      {showLabels && (
                        <Html position={[0, 0.7, 0]} distanceFactor={12}>
                          <div className="bg-green-500/95 text-white px-2 py-1 rounded text-xs font-bold">
                            tRNA
                          </div>
                        </Html>
                      )}
                    </group>
                  )}

                  {/* Amino acid in chain */}
                  {isProcessed && (
                    <mesh position={[1.8, 0, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.38), 16, 16]} />
                      <meshStandardMaterial
                        color={AMINO_ACIDS[i].color}
                        emissive={AMINO_ACIDS[i].color}
                        emissiveIntensity={0.35}
                      />
                    </mesh>
                  )}

                  {/* Amino acid labels */}
                  {isProcessed && i % 2 === 0 && showLabels && (
                    <Html position={[1.8, 0.7, 0]} distanceFactor={12}>
                      <div
                        className="px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: AMINO_ACIDS[i].color, color: 'white' }}
                      >
                        {AMINO_ACIDS[i].name}
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}

            {/* Ribosome */}
            <group position={[3.5, 2, 0]}>
              {/* Large subunit */}
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[Math.max(0.01, 1.4), 16, 16]} />
                <meshStandardMaterial
                  color={RIBOSOME_COLORS.large}
                  emissive={RIBOSOME_COLORS.large}
                  emissiveIntensity={0.25}
                  roughness={0.4}
                />
              </mesh>
              {/* Small subunit */}
              <mesh position={[0, -0.7, 0]}>
                <sphereGeometry args={[Math.max(0.01, 1.1), 16, 16]} />
                <meshStandardMaterial
                  color={RIBOSOME_COLORS.small}
                  roughness={0.4}
                />
              </mesh>
              {showLabels && (
                <Html position={[0, 2.2, 0]} distanceFactor={10}>
                  <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    Ribosome
                  </div>
                </Html>
              )}
            </group>

            {/* Growing polypeptide chain */}
            {aminoAcidsFormedRef.current > 0 && (
              <group position={[4.5, 0, 1]}>
                {Array.from({ length: Math.floor(aminoAcidsFormedRef.current) }).map((_, i) => (
                  <mesh key={i} position={[0, (i - Math.floor(aminoAcidsFormedRef.current) / 2) * 0.55, 0]}>
                    <sphereGeometry args={[Math.max(0.01, 0.32), 12, 12]} />
                    <meshStandardMaterial
                      color={AMINO_ACIDS[i].color}
                      emissive={AMINO_ACIDS[i].color}
                      emissiveIntensity={0.25}
                    />
                  </mesh>
                ))}
              </group>
            )}

            {/* Folded protein (Step 5) */}
            {step === 5 && foldingProgressRef.current > 0 && (
              <group position={[6, -1, 0]} rotation={[0, foldingProgressRef.current * 0.06, 0]}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 0.9 + Math.sin(angle * 2.5) * 0.25;
                  return (
                    <mesh key={i} position={[
                      Math.cos(angle) * radius,
                      Math.sin(angle * 3.5) * 0.6,
                      Math.sin(angle) * radius
                    ]}>
                      <sphereGeometry args={[Math.max(0.01, 0.42), 16, 16]} />
                      <meshStandardMaterial
                        color={AMINO_ACIDS[i].color}
                        emissive={AMINO_ACIDS[i].color}
                        emissiveIntensity={0.35}
                      />
                    </mesh>
                  );
                })}
                {showLabels && (
                  <Html position={[0, 1.8, 0]} distanceFactor={10}>
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
                      ✨ Complete Protein!
                    </div>
                  </Html>
                )}
              </group>
            )}
          </group>
        )}

        {/* ===== CENTRAL DOGMA FLOW ARROW ===== */}
        {showLabels && step >= 2 && (
          <group>
            <Html position={[0, -6, 0]} distanceFactor={10}>
              <div className="bg-gray-800/95 px-4 py-2 rounded-lg border border-gray-600">
                <div className="text-white text-sm font-bold text-center">
                  DNA <span className="text-gray-400">→</span> mRNA <span className="text-gray-400">→</span> Protein
                </div>
                <div className="text-gray-400 text-xs text-center mt-1">
                  Central Dogma of Molecular Biology
                </div>
              </div>
            </Html>
          </group>
        )}

        {/* ===== MOLECULE LEGEND ===== */}
        {showLabels && (
          <Html position={[-7, -5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
              <div className="text-white font-bold mb-2">Molecules</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-300">DNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-300">mRNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300">tRNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-gray-300">Ribosome</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
