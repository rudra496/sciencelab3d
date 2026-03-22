'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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
  const [codonsProcessed, setCodonsProcessed] = useState(0);
  const [aminoAcidsFormed, setAminoAcidsFormed] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    setCodonsProcessed(0);
    setAminoAcidsFormed(0);
    timeRef.current = 0;
  }, [resetTrigger]);

  const codons = useMemo(() => {
    const aminoAcids = ['Met', 'Lys', 'Arg', 'Ser', 'Leu', 'Pro', 'Gly', 'Val'];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    return aminoAcids.map((aa, i) => ({
      name: aa,
      color: colors[i % colors.length],
      position: [0, (i - 4) * 1.2, 0],
    }));
  }, []);

  useEffect(() => {
    if (onDataChange) {
      const stages = ['Transcription', 'Translation', 'Complete'];
      onDataChange({
        stage: stages[Math.min(stage, 2)],
        codonsProcessed: Math.round(codonsProcessed),
        aminoAcidsFormed: Math.round(aminoAcidsFormed),
      });
    }
  }, [stage, codonsProcessed, aminoAcidsFormed, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;

      if (stage >= 1) {
        setCodonsProcessed((p) => Math.min(8, p + delta * 2 * simulationSpeed * speed));
      }
      if (stage >= 2) {
        setAminoAcidsFormed((p) => Math.min(8, p + delta * 1.5 * simulationSpeed * speed));
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef} position={[-3, 0, 0]}>
        {stage === 0 && (
          <>
            <mesh position={[-2, 2, 0]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.3, 0.3, 8, 16]} />
              <meshStandardMaterial color="#06d6a0" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-2, 2, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.3, 0.3, 8, 16]} />
              <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
            </mesh>
            <Html position={[-3, 6, 0]} distanceFactor={10}>
              <div className="bg-purple-500/80 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                DNA Template
              </div>
            </Html>
            <Html position={[2, -2, 0]} distanceFactor={10}>
              <div className="bg-green-500/80 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                mRNA Strand
              </div>
            </Html>
            {Array.from({ length: 8 }).map((_, i) => {
              const t = timeRef.current * 0.5;
              const offset = ((i * 1.2) + t * 2) % 10 - 5;
              return (
                <group key={i} position={[offset, -2 - i * 0.3, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshStandardMaterial color="#22c55e" />
                  </mesh>
                </group>
              );
            })}
          </>
        )}

        {stage >= 1 && (
          <>
            <mesh position={[4, 3, 0]}>
              <torusGeometry args={[1.5, 0.3, 8, 16]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            <mesh position={[4, 3, 0.5]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
            <Html position={[4, 4.5, 0]} distanceFactor={10}>
              <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs">
                Ribosome
              </div>
            </Html>

            <group position={[3, 0, 0]}>
              {codons.map((codon, i) => {
                const yPos = (i - 4) * 1.2;
                const isProcessed = i < codonsProcessed;
                const isFormed = i < aminoAcidsFormed;
                return (
                  <group key={i} position={[0, yPos, 0]}>
                    {showCodons && (
                      <>
                        <mesh position={[-0.5, 0, 0]}>
                          <sphereGeometry args={[0.18, 12, 12]} />
                          <meshStandardMaterial color="#ef4444" />
                        </mesh>
                        <mesh position={[0, 0, 0]}>
                          <sphereGeometry args={[0.18, 12, 12]} />
                          <meshStandardMaterial color="#3b82f6" />
                        </mesh>
                        <mesh position={[0.5, 0, 0]}>
                          <sphereGeometry args={[0.18, 12, 12]} />
                          <meshStandardMaterial color="#22c55e" />
                        </mesh>
                      </>
                    )}
                    {isFormed && (
                      <mesh position={[1.5, 0, 0]}>
                        <sphereGeometry args={[0.35, 16, 16]} />
                        <meshStandardMaterial color={codon.color} emissive={codon.color} emissiveIntensity={0.2} />
                      </mesh>
                    )}
                    {showCodons && isProcessed && i % 3 === 0 && (
                      <Html position={[1.5, 0.5, 0]} distanceFactor={12}>
                        <div className="bg-gray-800/90 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap">
                          {codon.name}
                        </div>
                      </Html>
                    )}
                  </group>
                );
              })}
            </group>

            <Html position={[5, -4, 0]} distanceFactor={10}>
              <div className="bg-blue-500/80 text-white px-3 py-1 rounded text-sm">
                mRNA Strand
              </div>
            </Html>
            <Html position={[0, 5.5, 0]} distanceFactor={10}>
              <div className="bg-purple-500/80 text-white px-3 py-1 rounded text-sm">
                Growing Polypeptide Chain
              </div>
            </Html>
          </>
        )}
      </group>
    </>
  );
}
