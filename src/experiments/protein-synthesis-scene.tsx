'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface ProteinSynthesisData {
  stage: string;
  codonsProcessed: number;
  aminoAcidsFormed: number;
}

interface ProteinSynthesisSceneProps {
  onDataChange?: (data: ProteinSynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  stage?: number;
  showCodons?: boolean;
}

// Amino acids with their properties
const AMINO_ACIDS = [
  { name: 'Met', fullName: 'Methionine', color: '#ef4444' },
  { name: 'Lys', fullName: 'Lysine', color: '#3b82f6' },
  { name: 'Arg', fullName: 'Arginine', color: '#22c55e' },
  { name: 'Ser', fullName: 'Serine', color: '#f59e0b' },
  { name: 'Leu', fullName: 'Leucine', color: '#8b5cf6' },
  { name: 'Pro', fullName: 'Proline', color: '#ec4899' },
  { name: 'Gly', fullName: 'Glycine', color: '#14b8a6' },
  { name: 'Val', fullName: 'Valine', color: '#f97316' },
];

// Nucleotide colors
const NUCLEOTIDE_COLORS = {
  A: '#ef4444',
  U: '#3b82f6',
  G: '#22c55e',
  C: '#f59e0b',
};

// mRNA sequence (codons)
const MRNA_SEQUENCE = [
  ['A', 'U', 'G'], // Met
  ['A', 'A', 'A'], // Lys
  ['C', 'G', 'U'], // Arg
  ['U', 'C', 'U'], // Ser
  ['U', 'U', 'A'], // Leu
  ['C', 'C', 'U'], // Pro
  ['G', 'G', 'U'], // Gly
  ['G', 'U', 'U'], // Val
];

export default function ProteinSynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  stage = 0,
  showCodons = true,
}: ProteinSynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const codonsProcessedRef = useRef(0);
  const aminoAcidsFormedRef = useRef(0);

  // React state for UI updates (throttled)
  const [codonsProcessed, setCodonsProcessed] = useState(0);
  const [aminoAcidsFormed, setAminoAcidsFormed] = useState(0);
  const [currentCodonIndex, setCurrentCodonIndex] = useState(0);
  const frameCountRef = useRef(0);

  // Codon animation positions
  const codonPositions = useRef<THREE.Vector3[]>([]);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    codonsProcessedRef.current = 0;
    aminoAcidsFormedRef.current = 0;
    setCodonsProcessed(0);
    setAminoAcidsFormed(0);
    setCurrentCodonIndex(0);
    codonPositions.current = [];
  }, [resetTrigger]);

  // Initialize codon positions along mRNA path
  useEffect(() => {
    if (stage >= 1) {
      codonPositions.current = MRNA_SEQUENCE.map((_, i) => new THREE.Vector3(3, (i - 4) * 1.2, 0));
    }
  }, [stage]);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      // Update physics state
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.08 * simulationSpeed;

      if (stage >= 1) {
        // Process codons during translation
        codonsProcessedRef.current = Math.min(8, codonsProcessedRef.current + delta * 1.5 * simulationSpeed * speed);

        // Form amino acids with delay after codon processing
        if (codonsProcessedRef.current > 1) {
          aminoAcidsFormedRef.current = Math.min(8, aminoAcidsFormedRef.current + delta * 1.2 * simulationSpeed * speed);
        }

        // Update current codon index for animation
        const idx = Math.floor(codonsProcessedRef.current);
        if (idx !== currentCodonIndex && idx < 8) {
          setCurrentCodonIndex(idx);
        }
      }

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        setCodonsProcessed(codonsProcessedRef.current);
        setAminoAcidsFormed(aminoAcidsFormedRef.current);

        if (onDataChange) {
          const stages = ['Transcription', 'Translation', 'Complete'];
          onDataChange({
            stage: stages[Math.min(stage, 2)],
            codonsProcessed: Math.round(codonsProcessedRef.current),
            aminoAcidsFormed: Math.round(aminoAcidsFormedRef.current),
          });
        }
      }
    }
  });

  // Generate DNA helix points for transcription stage
  const generateDNAHelixPoints = useCallback((offsetY = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = i * 0.4 + timeRef.current * 0.5;
      points.push(new THREE.Vector3(
        Math.cos(angle) * 1.2 - 2,
        i * 0.4 - 4 + offsetY,
        Math.sin(angle) * 1.2
      ));
    }
    return points;
  }, []);

  // Generate mRNA strand points
  const generateMRNAPoints = useCallback(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      points.push(new THREE.Vector3(3, (i - 5) * 1.2, 0));
    }
    return points;
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[4, 3, 2]} intensity={stage >= 1 ? 0.4 : 0} color="#f59e0b" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Transcription Stage - DNA to mRNA */}
        {stage === 0 && (
          <group position={[-3, 0, 0]}>
            {/* DNA double helix with Line */}
            <Line
              points={generateDNAHelixPoints()}
              color="#06d6a0"
              lineWidth={3}
              opacity={0.7}
              transparent
            />
            <Line
              points={generateDNAHelixPoints().map(p => new THREE.Vector3(p.x + 0.3, p.y, p.z + 0.3))}
              color="#3b82f6"
              lineWidth={3}
              opacity={0.7}
              transparent
            />

            {/* Animated mRNA nucleotides being transcribed */}
            {Array.from({ length: 8 }).map((_, i) => {
              const t = timeRef.current * 0.5;
              const progress = ((i * 1.5) + t * 2) % 10;
              const y = progress - 5;
              const x = Math.sin(progress * 0.5) * 0.5;

              return (
                <group key={i} position={[x + 2, y, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.18, 12, 12]} />
                    <meshStandardMaterial
                      color="#22c55e"
                      emissive="#22c55e"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                  {/* RNA bases */}
                  <mesh position={[0.15, 0, 0]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color={NUCLEOTIDE_COLORS[['A', 'U', 'G', 'C'][i % 4] as keyof typeof NUCLEOTIDE_COLORS]} />
                  </mesh>
                </group>
              );
            })}

            <Html position={[-3, 6, 0]} distanceFactor={10}>
              <div className="bg-purple-500/90 text-white px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                DNA Template (Transcription)
              </div>
            </Html>
            <Html position={[2, -4, 0]} distanceFactor={10}>
              <div className="bg-green-500/90 text-white px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                mRNA Strand
              </div>
            </Html>
          </group>
        )}

        {/* Translation Stage - mRNA to Protein */}
        {stage >= 1 && (
          <group>
            {/* Ribosome */}
            <group position={[4, 2.5, 0]}>
              {/* Large subunit */}
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  roughness={0.4}
                  emissive="#f59e0b"
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Small subunit */}
              <mesh position={[0, -0.5, 0]}>
                <sphereGeometry args={[0.9, 16, 16]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  roughness={0.4}
                />
              </mesh>
              {/* P-site and A-site indicators */}
              <mesh position={[-0.4, 0, 0.8]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
              </mesh>
              <mesh position={[0.4, 0, 0.8]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
              </mesh>

              <Html position={[0, 1.8, 0]} distanceFactor={10}>
                <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Ribosome
                </div>
              </Html>
            </group>

            {/* mRNA strand with codons */}
            <group position={[3, 0, 0]}>
              {/* mRNA backbone using Line */}
              <Line
                points={generateMRNAPoints()}
                color="#06b6a0"
                lineWidth={2}
                opacity={0.6}
                transparent
              />

              {/* Codons (triplets of nucleotides) */}
              {MRNA_SEQUENCE.map((codon, i) => {
                const yPos = (i - 4) * 1.2;
                const isProcessed = i < codonsProcessed;
                const isCurrent = Math.floor(codonsProcessed) === i;
                const isFormed = i < aminoAcidsFormed;

                return (
                  <group key={i} position={[0, yPos, 0]}>
                    {showCodons && (
                      <>
                        {/* Three nucleotides per codon */}
                        {codon.map((base, j) => (
                          <mesh key={j} position={[j * 0.35 - 0.35, 0, 0]}>
                            <sphereGeometry args={[0.16, 12, 12]} />
                            <meshStandardMaterial
                              color={NUCLEOTIDE_COLORS[base as keyof typeof NUCLEOTIDE_COLORS]}
                              emissive={isCurrent ? NUCLEOTIDE_COLORS[base as keyof typeof NUCLEOTIDE_COLORS] : '#000000'}
                              emissiveIntensity={isCurrent ? 0.4 : 0}
                            />
                          </mesh>
                        ))}
                      </>
                    )}

                    {/* Amino acid being formed */}
                    {isFormed && (
                      <mesh position={[1.8, 0, 0]}>
                        <sphereGeometry args={[0.4, 16, 16]} />
                        <meshStandardMaterial
                          color={AMINO_ACIDS[i].color}
                          emissive={AMINO_ACIDS[i].color}
                          emissiveIntensity={0.3}
                          roughness={0.3}
                        />
                      </mesh>
                    )}

                    {/* Show amino acid labels */}
                    {isFormed && i % 2 === 0 && (
                      <Html position={[1.8, 0.6, 0]} distanceFactor={12}>
                        <div
                          className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: AMINO_ACIDS[i].color,
                            color: 'white',
                          }}
                        >
                          {AMINO_ACIDS[i].name}
                        </div>
                      </Html>
                    )}
                  </group>
                );
              })}
            </group>

            {/* Growing polypeptide chain */}
            {aminoAcidsFormed > 0 && (
              <group position={[5, 0, 0.5]}>
                {Array.from({ length: Math.floor(aminoAcidsFormed) }).map((_, i) => (
                  <mesh key={i} position={[0, (i - Math.floor(aminoAcidsFormed) / 2) * 0.5, 0]}>
                    <sphereGeometry args={[0.3, 12, 12]} />
                    <meshStandardMaterial
                      color={AMINO_ACIDS[i].color}
                      emissive={AMINO_ACIDS[i].color}
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))}
              </group>
            )}

            <Html position={[5, 5.5, 0]} distanceFactor={10}>
              <div className="bg-blue-500/90 text-white px-3 py-1 rounded text-sm font-medium">
                mRNA → Protein Translation
              </div>
            </Html>
          </group>
        )}

        {/* Stage indicator */}
        <Html position={[0, 7, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 px-4 py-2 rounded-lg border border-gray-700">
            <div className="text-white text-sm font-bold">
              {['Transcription', 'Translation', 'Complete'][Math.min(stage, 2)]}
            </div>
            {stage >= 1 && (
              <div className="text-gray-300 text-xs mt-1">
                Codons: {Math.round(codonsProcessed)}/8 | Amino Acids: {Math.round(aminoAcidsFormed)}/8
              </div>
            )}
          </div>
        </Html>
      </group>
    </>
  );
}
