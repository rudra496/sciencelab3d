'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DNAReplicationData {
  stage: string;
  unwoundPercent: number;
  nucleotidesAdded: number;
}

interface DNAReplicationSceneProps {
  onDataChange?: (data: DNAReplicationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showHelicase?: boolean;
  showPolymerase?: boolean;
  showPrimase?: boolean;
  stage?: number;
}

const NUCLEOTIDE_COLORS = {
  A: '#ef4444', // Adenine - Red
  T: '#3b82f6', // Thymine - Blue
  G: '#22c55e', // Guanine - Green
  C: '#f59e0b', // Cytosine - Amber
};

const BASE_PAIRS = ['AT', 'TA', 'GC', 'CG', 'AT', 'TA', 'GC', 'CG', 'AT', 'TA'];

export default function DNAReplicationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showHelicase = true,
  showPolymerase = true,
  showPrimase = true,
  stage = 0,
}: DNAReplicationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const unwoundPercentRef = useRef(0);
  const nucleotidesAddedRef = useRef(0);

  // React state for UI updates (throttled)
  const [unwoundPercent, setUnwoundPercent] = useState(0);
  const [nucleotidesAdded, setNucleotidesAdded] = useState(0);
  const [uiUpdateCounter, setUiUpdateCounter] = useState(0);
  const frameCountRef = useRef(0);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    unwoundPercentRef.current = 0;
    nucleotidesAddedRef.current = 0;
    setUnwoundPercent(0);
    setNucleotidesAdded(0);
  }, [resetTrigger]);

  // Generate DNA base pairs
  const basePairs = useMemo(() => {
    const pairs: any[] = [];
    for (let i = 0; i < 40; i++) {
      const pairType = BASE_PAIRS[i % BASE_PAIRS.length];
      pairs.push({
        index: i,
        base1: pairType[0],
        base2: pairType[1],
        color1: NUCLEOTIDE_COLORS[pairType[0] as keyof typeof NUCLEOTIDE_COLORS],
        color2: NUCLEOTIDE_COLORS[pairType[1] as keyof typeof NUCLEOTIDE_COLORS],
        y: (i - 20) * 0.35,
        angle: i * 0.5,
      });
    }
    return pairs;
  }, []);

  // Calculate strand position
  const getStrandPosition = useCallback((index: number, angle: number, strand: 0 | 1, separation: number = 0) => {
    const baseAngle = angle + (strand === 0 ? 0 : Math.PI);
    const sep = separation * (strand === 0 ? -1 : 1);
    return new THREE.Vector3(
      Math.cos(baseAngle) * 1.5 + sep,
      (index - 20) * 0.35,
      Math.sin(baseAngle) * 1.5
    );
  }, []);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      // Update physics state
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.15 * simulationSpeed;
      groupRef.current.rotation.y = rotationRef.current;

      // Update unwinding based on stage
      if (stage >= 1) {
        unwoundPercentRef.current = Math.min(100, unwoundPercentRef.current + delta * 8 * simulationSpeed * speed);
      }

      // Update nucleotide addition in termination stage
      if (stage >= 2) {
        nucleotidesAddedRef.current = Math.min(40, nucleotidesAddedRef.current + delta * 4 * simulationSpeed * speed);
      }

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        setUnwoundPercent(unwoundPercentRef.current);
        setNucleotidesAdded(nucleotidesAddedRef.current);
        setUiUpdateCounter((c) => c + 1);

        if (onDataChange) {
          const stages = ['Initiation', 'Elongation', 'Termination'];
          onDataChange({
            stage: stages[Math.min(stage, 2)],
            unwoundPercent: Math.round(unwoundPercentRef.current),
            nucleotidesAdded: Math.round(nucleotidesAddedRef.current),
          });
        }
      }
    }
  });

  const separation = stage >= 1 ? (unwoundPercent / 100) * 2.5 : 0;
  const replicationProgress = stage >= 2 ? nucleotidesAdded / 40 : 0;

  // Generate backbone points for Line component
  const generateBackbonePoints = useCallback((strand: 0 | 1, startIdx = 0, endIdx = 40) => {
    const points: THREE.Vector3[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const pair = basePairs[i];
      if (pair) {
        points.push(getStrandPosition(i, pair.angle, strand, separation));
      }
    }
    return points;
  }, [basePairs, separation, getStrandPosition]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, 0, 0]} intensity={stage >= 2 ? 0.3 : 0} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* DNA Strands with Line components for backbones */}
        {basePairs.map((pair, idx) => {
          const isReplicated = idx < nucleotidesAdded;
          const isUnwound = separation > 0.5;

          return (
            <group key={pair.index}>
              {/* Original strand backbones using Line */}
              {idx % 3 === 0 && (
                <>
                  <Line
                    points={generateBackbonePoints(0, idx, Math.min(idx + 3, 40))}
                    color="#94a3b8"
                    lineWidth={2}
                    opacity={0.6}
                    transparent
                  />
                  <Line
                    points={generateBackbonePoints(1, idx, Math.min(idx + 3, 40))}
                    color="#94a3b8"
                    lineWidth={2}
                    opacity={0.6}
                    transparent
                  />
                </>
              )}

              {/* Nucleotide base pairs */}
              {(!isReplicated || stage < 2) && (
                <>
                  <mesh position={getStrandPosition(pair.index, pair.angle, 0, separation)}>
                    <sphereGeometry args={[0.14, 12, 12]} />
                    <meshStandardMaterial color={pair.color1} />
                  </mesh>
                  <mesh position={getStrandPosition(pair.index, pair.angle, 1, separation)}>
                    <sphereGeometry args={[0.14, 12, 12]} />
                    <meshStandardMaterial color={pair.color2} />
                  </mesh>

                  {/* Hydrogen bonds (show when unwinding) */}
                  {separation < 1.2 && (
                    <mesh
                      position={[
                        (getStrandPosition(pair.index, pair.angle, 0, separation).x +
                         getStrandPosition(pair.index, pair.angle, 1, separation).x) / 2,
                        pair.y,
                        (getStrandPosition(pair.index, pair.angle, 0, separation).z +
                         getStrandPosition(pair.index, pair.angle, 1, separation).z) / 2,
                      ]}
                      rotation={[0, pair.angle, Math.PI / 2]}
                    >
                      <cylinderGeometry args={[0.04, 0.04, 3 - separation, 8]} />
                      <meshStandardMaterial color="#e2e8f0" opacity={0.8} transparent />
                    </mesh>
                  )}
                </>
              )}

              {/* New strands during replication */}
              {isReplicated && stage >= 2 && (
                <>
                  {/* New complementary strand 1 */}
                  <mesh position={getStrandPosition(pair.index, pair.angle, 0, separation).multiplyScalar(1.3)}>
                    <sphereGeometry args={[0.11, 10, 10]} />
                    <meshStandardMaterial
                      color={pair.color2}
                      opacity={0.85}
                      transparent
                      emissive={pair.color2}
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                  {/* New complementary strand 2 */}
                  <mesh position={getStrandPosition(pair.index, pair.angle, 1, separation).multiplyScalar(1.3)}>
                    <sphereGeometry args={[0.11, 10, 10]} />
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

        {/* Helicase enzyme - unwinds DNA */}
        {showHelicase && stage >= 1 && unwoundPercent < 100 && (
          <group position={[0, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.7, 1.4, 16, 1, true]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.4}
                side={THREE.DoubleSide}
                transparent
                opacity={0.7}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.5, 1, 16, 1, true]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
                transparent
                opacity={0.6}
              />
            </mesh>
            <Html position={[1.2, 0, 0]} distanceFactor={10}>
              <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                Helicase
              </div>
            </Html>
          </group>
        )}

        {/* DNA Polymerase enzymes - synthesizes new strands */}
        {showPolymerase && stage >= 2 && (
          <>
            <group position={[2.8, 3, 0]}>
              <mesh>
                <dodecahedronGeometry args={[0.45]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={0.3}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, 0.9, 0]} distanceFactor={10}>
                <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Polymerase 5→3
                </div>
              </Html>
            </group>
            <group position={[-2.8, -3, 0]}>
              <mesh>
                <dodecahedronGeometry args={[0.45]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={0.3}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, -0.9, 0]} distanceFactor={10}>
                <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Polymerase
                </div>
              </Html>
            </group>
          </>
        )}

        {/* Primase enzyme - starts RNA primers */}
        {showPrimase && stage >= 1 && unwoundPercent < 100 && (
          <group position={[1.8, -4, 1.2]}>
            <mesh>
              <octahedronGeometry args={[0.35]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
                roughness={0.4}
              />
            </mesh>
            <Html position={[0, 0.6, 0]} distanceFactor={10}>
              <div className="bg-purple-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                Primase
              </div>
            </Html>
          </group>
        )}

        {/* Stage indicator */}
        <Html position={[0, 8, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 px-4 py-2 rounded-lg border border-gray-700">
            <div className="text-white text-sm font-bold">
              Stage: {['Initiation', 'Elongation', 'Termination'][Math.min(stage, 2)]}
            </div>
            {stage >= 1 && (
              <div className="text-gray-300 text-xs mt-1">
                Unwound: {Math.round(unwoundPercent)}%
              </div>
            )}
            {stage >= 2 && (
              <div className="text-gray-300 text-xs mt-1">
                Replicated: {Math.round(nucleotidesAdded)}/40 bases
              </div>
            )}
          </div>
        </Html>
      </group>
    </>
  );
}
