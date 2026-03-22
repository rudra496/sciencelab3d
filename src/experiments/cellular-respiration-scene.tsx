'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface CellularRespirationData {
  stage: string;
  atpProduced: number;
  glucoseRemaining: number;
  co2Produced: number;
  nadhCount: number;
  description: string;
}

interface CellularRespirationSceneProps {
  onDataChange?: (data: CellularRespirationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  stage?: number;
  showLabels?: boolean;
}

interface Molecule {
  id: string;
  type: 'glucose' | 'pyruvate' | 'atp' | 'co2' | 'nadh' | 'fadh2' | 'electron' | 'o2' | 'h2o';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
  animProgress: number;
}

/**
 * Cellular Respiration - Complete rewrite
 * 3-stage process: Glycolysis → Krebs Cycle → Electron Transport Chain
 * Total ATP: 2 + 2 + 34 = 38
 */
export default function CellularRespirationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  stage = 0,
  showLabels = true,
}: CellularRespirationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state
  const moleculesRef = useRef<Molecule[]>([]);
  const atpCountRef = useRef(0);
  const glucoseRemainingRef = useRef(1);
  const co2ProducedRef = useRef(0);
  const nadhCountRef = useRef(0);
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated every 8 frames
  const [data, setData] = useState<CellularRespirationData>({
    stage: 'Glycolysis',
    atpProduced: 0,
    glucoseRemaining: 1,
    co2Produced: 0,
    nadhCount: 0,
    description: 'Glucose splits into 2 pyruvate molecules in the cytoplasm.',
  });

  const stages = ['Glycolysis', 'Krebs Cycle', 'Electron Transport Chain'];

  // Reset handler
  useEffect(() => {
    moleculesRef.current = [];
    atpCountRef.current = 0;
    glucoseRemainingRef.current = 1;
    co2ProducedRef.current = 0;
    nadhCountRef.current = 0;
    progressRef.current = 0;
    timeRef.current = 0;
    frameCountRef.current = 0;

    // Initialize glucose molecules
    for (let i = 0; i < 6; i++) {
      moleculesRef.current.push({
        id: `glucose-${i}`,
        type: 'glucose',
        position: new THREE.Vector3(-3.5 + Math.random() * 1.5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1),
        velocity: new THREE.Vector3(0.01 + Math.random() * 0.01, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005),
        active: true,
        animProgress: 0,
      });
    }

    // Initialize oxygen for ETC
    for (let i = 0; i < 8; i++) {
      moleculesRef.current.push({
        id: `o2-${i}`,
        type: 'o2',
        position: new THREE.Vector3(2 + Math.random() * 1.5, -1.5 + (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1),
        velocity: new THREE.Vector3(-0.005, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005),
        active: true,
        animProgress: 0,
      });
    }
  }, [resetTrigger]);

  // Mitochondrion geometry - elongated capsule with cristae
  const mitochondrionGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Elongated capsule shape
    shape.moveTo(0, 2.5);
    shape.bezierCurveTo(1.2, 2.5, 1.8, 1.5, 1.8, 0);
    shape.bezierCurveTo(1.8, -1.5, 1.2, -2.5, 0, -2.5);
    shape.bezierCurveTo(-1.2, -2.5, -1.8, -1.5, -1.8, 0);
    shape.bezierCurveTo(-1.8, 1.5, -1.2, 2.5, 0, 2.5);
    return shape;
  }, []);

  // Cristae (inner membrane folds)
  const cristaePositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 1.2 + Math.sin(i * 0.5) * 0.3;
      positions.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius * 0.6
      ));
    }
    return positions;
  }, []);

  // ETC protein complexes positions along inner membrane
  const etcComplexes = useMemo(() => {
    const complexes: { pos: THREE.Vector3; angle: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      complexes.push({
        pos: new THREE.Vector3(Math.cos(angle) * 1.5, (i - 1.5) * 1.5, Math.sin(angle) * 0.8),
        angle,
      });
    }
    return complexes;
  }, []);

  // Frame loop - physics and animation
  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta * simulationSpeed;
    progressRef.current = Math.min(100, progressRef.current + delta * 8 * simulationSpeed);
    frameCountRef.current++;

    const molecules = moleculesRef.current;

    // Update molecules based on stage
    molecules.forEach((mol) => {
      if (!mol.active) return;

      // Base movement
      mol.position.add(mol.velocity.clone().multiplyScalar(simulationSpeed));

      // Stage-specific behaviors
      if (stage === 0) {
        // GLYCOLYSIS - in cytoplasm (outside mitochondrion)
        if (mol.type === 'glucose' && mol.animProgress < 1) {
          mol.animProgress += delta * 0.3 * simulationSpeed;
          // Glucose moves toward center then splits
          if (mol.animProgress >= 1 && Math.random() < 0.02) {
            mol.type = 'pyruvate';
            mol.animProgress = 0;
            atpCountRef.current += 1; // 1 ATP per glucose split (2 total)

            // Create second pyruvate
            const newPyruvate: Molecule = {
              id: `pyruvate-${Date.now()}-${Math.random()}`,
              type: 'pyruvate',
              position: mol.position.clone().add(new THREE.Vector3(0.3, 0, 0)),
              velocity: mol.velocity.clone(),
              active: true,
              animProgress: 0,
            };
            molecules.push(newPyruvate);
          }
        }
        if (mol.type === 'pyruvate') {
          // Drift toward mitochondrion
          const dirToMito = new THREE.Vector3(-1, 0, 0).sub(mol.position).normalize().multiplyScalar(0.01);
          mol.velocity.add(dirToMito.multiplyScalar(0.1));
        }
      } else if (stage === 1) {
        // KREBS CYCLE - inside mitochondrion matrix
        if (mol.type === 'pyruvate') {
          // Convert to Acetyl-CoA and enter cycle
          mol.animProgress += delta * 0.2 * simulationSpeed;
          if (mol.animProgress > 0.5 && Math.random() < 0.01) {
            // Produce CO2
            const co2: Molecule = {
              id: `co2-${Date.now()}-${Math.random()}`,
              type: 'co2',
              position: mol.position.clone(),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.03, 0.02 + Math.random() * 0.02, (Math.random() - 0.5) * 0.03),
              active: true,
              animProgress: 0,
            };
            molecules.push(co2);
            co2ProducedRef.current += 1;

            // Produce NADH
            nadhCountRef.current += 1;
            atpCountRef.current += 0.5; // 2 ATP total from Krebs
          }
        }
        if (mol.type === 'co2') {
          // CO2 floats up and out
          mol.velocity.y = 0.02;
          if (mol.position.y > 4) mol.active = false;
        }
      } else if (stage === 2) {
        // ELECTRON TRANSPORT CHAIN
        if (mol.type === 'nadh' || (mol.type === 'pyruvate' && Math.random() < 0.01)) {
          // Convert to electrons flowing through chain
          if (Math.random() < 0.02) {
            const electron: Molecule = {
              id: `electron-${Date.now()}-${Math.random()}`,
              type: 'electron',
              position: new THREE.Vector3(1.5, (Math.random() - 0.5) * 3, 0),
              velocity: new THREE.Vector3(-0.02 - Math.random() * 0.01, (Math.random() - 0.5) * 0.01, 0),
              active: true,
              animProgress: 0,
            };
            molecules.push(electron);
          }
        }
        if (mol.type === 'electron') {
          // Flow along inner membrane
          mol.animProgress += delta * 0.5 * simulationSpeed;
          if (mol.animProgress >= 1) {
            mol.active = false;
            atpCountRef.current += 2.83; // ~34 ATP from ETC

            // ATP synthase produces ATP
            const atp: Molecule = {
              id: `atp-${Date.now()}-${Math.random()}`,
              type: 'atp',
              position: mol.position.clone().add(new THREE.Vector3(-0.5, 0, 0.3)),
              velocity: new THREE.Vector3(-0.01, 0.01, 0.01),
              active: true,
              animProgress: 0,
            };
            molecules.push(atp);
          }
        }
        if (mol.type === 'o2') {
          // Accept electrons, form water
          if (Math.random() < 0.01) {
            mol.type = 'h2o';
            mol.velocity.y = 0.01;
          }
        }
        if (mol.type === 'atp') {
          // Float away
          if (mol.position.length() > 5) mol.active = false;
        }
      }

      // Boundary constraints
      if (mol.position.length() > 6) {
        mol.velocity.multiplyScalar(-0.5);
        mol.position.normalize().multiplyScalar(6);
      }
    });

    // Clamp values
    atpCountRef.current = Math.min(38, atpCountRef.current);
    glucoseRemainingRef.current = Math.max(0, 1 - (atpCountRef.current / 38));

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const descriptions = [
        'Glucose splits into 2 pyruvate in cytoplasm. Net: 2 ATP produced.',
        'Pyruvate enters mitochondrion → Acetyl-CoA → Krebs Cycle. CO₂ released, NADH/FADH₂ produced.',
        'Electrons flow through protein complexes. ATP synthase spins, producing ATP. O₂ → H₂O.',
      ];

      const newData: CellularRespirationData = {
        stage: stages[stage],
        atpProduced: Math.round(atpCountRef.current),
        glucoseRemaining: Math.round(glucoseRemainingRef.current * 100),
        co2Produced: co2ProducedRef.current,
        nadhCount: nadhCountRef.current,
        description: descriptions[stage],
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ef4444" />

      <group ref={groupRef}>
        {/* ===== STAGE 0: GLYCOLYSIS REGION ===== */}
        {stage === 0 && showLabels && (
          <Html position={[-4, 2.5, 0]} distanceFactor={12}>
            <div className="bg-blue-500/95 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 border-blue-400">
              📍 Cytoplasm (Glycolysis)
            </div>
          </Html>
        )}

        {/* ===== MITOCHONDRION (stages 1-3) ===== */}
        {stage >= 1 && (
          <>
            {/* Outer membrane - elongated capsule */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <capsuleGeometry args={[1.8, 3.5, 16, 32]} />
              <meshPhysicalMaterial
                color="#dc2626"
                transparent
                opacity={0.15}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner membrane */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <capsuleGeometry args={[1.3, 2.5, 16, 32]} />
              <meshPhysicalMaterial
                color="#b91c1c"
                transparent
                opacity={0.2}
                roughness={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Cristae (inner membrane folds) */}
            {cristaePositions.map((pos, i) => (
              <group key={i} position={pos}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
                  <meshStandardMaterial color="#f87171" />
                </mesh>
              </group>
            ))}

            {/* Matrix label */}
            {showLabels && (
              <Html position={[0, 0, 0]} distanceFactor={10}>
                <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Matrix
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== STAGE 2: KREBS CYCLE ===== */}
        {stage === 1 && showLabels && (
          <Html position={[0, 2.5, 0]} distanceFactor={12}>
            <div className="bg-orange-500/95 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 border-orange-400">
              🔄 Krebs Cycle
            </div>
          </Html>
        )}

        {/* Krebs cycle visualization */}
        {stage === 1 && (
          <>
            {/* Cycle path */}
            <Line
              points={Array.from({ length: 32 }, (_, i) => {
                const angle = (i / 32) * Math.PI * 2;
                return [
                  Math.cos(angle) * 0.8,
                  Math.sin(angle) * 0.8,
                  0,
                ] as [number, number, number];
              })}
              color="#f59e0b"
              lineWidth={2}
              opacity={0.6}
              transparent
              dashed
            />

            {/* Cycle center */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.5 + Math.sin(timeRef.current * 3) * 0.2}
              />
            </mesh>
          </>
        )}

        {/* ===== STAGE 3: ELECTRON TRANSPORT CHAIN ===== */}
        {stage === 2 && (
          <>
            {/* Inner membrane with protein complexes */}
            {etcComplexes.map((complex, i) => (
              <group key={i} position={complex.pos}>
                {/* Protein complex */}
                <mesh>
                  <boxGeometry args={[0.3, 0.4, 0.2]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={0.4 + Math.sin(timeRef.current * 5 + i) * 0.2}
                  />
                </mesh>

                {/* ATP Synthase (last complex) */}
                {i === 3 && (
                  <>
                    {/* Rotating part */}
                    <mesh position={[0, 0.3, 0]} rotation={[timeRef.current * 5, 0, 0]}>
                      <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
                      <meshStandardMaterial
                        color="#22c55e"
                        emissive="#22c55e"
                        emissiveIntensity={0.6}
                      />
                    </mesh>
                    {/* Stator */}
                    <mesh position={[0, 0.5, 0]}>
                      <sphereGeometry args={[0.12, 12, 12]} />
                      <meshStandardMaterial
                        color="#fbbf24"
                        emissive="#fbbf24"
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                  </>
                )}
              </group>
            ))}

            {/* Electron flow path */}
            <Line
              points={Array.from({ length: 50 }, (_, i) => {
                const t = i / 50;
                const angle = t * Math.PI * 2;
                return [
                  Math.cos(angle) * 1.5,
                  (t - 0.5) * 2.5,
                  Math.sin(angle) * 0.6,
                ] as [number, number, number];
              })}
              color="#06b6d4"
              lineWidth={1}
              opacity={0.4}
              transparent
              dashed
              dashSize={0.1}
              gapSize={0.05}
            />

            {showLabels && (
              <Html position={[2, 1, 0]} distanceFactor={10}>
                <div className="bg-cyan-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                  ETC & ATP Synthase
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== MOLECULES ===== */}
        {moleculesRef.current.map((mol) => {
          if (!mol.active) return null;

          const glowIntensity = 0.3 + Math.sin(timeRef.current * 3 + mol.id.length) * 0.2;

          switch (mol.type) {
            case 'glucose':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* Hexagon ring */}
                  <mesh rotation={[0, 0, Math.PI / 6]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.08, 6]} />
                    <meshStandardMaterial
                      color="#3b82f6"
                      emissive="#3b82f6"
                      emissiveIntensity={glowIntensity}
                    />
                  </mesh>
                  {/* Carbon atoms */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <mesh
                      key={i}
                      position={[
                        Math.cos((i / 6) * Math.PI * 2) * 0.12,
                        Math.sin((i / 6) * Math.PI * 2) * 0.12,
                        0.06,
                      ]}
                    >
                      <sphereGeometry args={[0.04, 8, 8]} />
                      <meshStandardMaterial color="#1e40af" />
                    </mesh>
                  ))}
                </group>
              );

            case 'pyruvate':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[0.1, 12, 12]} />
                    <meshStandardMaterial
                      color="#f59e0b"
                      emissive="#f59e0b"
                      emissiveIntensity={glowIntensity}
                    />
                  </mesh>
                </group>
              );

            case 'atp':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* ATP molecule */}
                  <mesh>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshStandardMaterial
                      color="#22c55e"
                      emissive="#22c55e"
                      emissiveIntensity={0.6}
                    />
                  </mesh>
                  {/* Phosphate groups */}
                  {[0, 1, 2].map((i) => (
                    <mesh key={i} position={[0, (i + 1) * 0.1, 0]}>
                      <sphereGeometry args={[0.035, 6, 6]} />
                      <meshStandardMaterial color="#fbbf24" />
                    </mesh>
                  ))}
                </group>
              );

            case 'co2':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* CO2 bubble */}
                  <mesh>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial
                      color="#6b7280"
                      transparent
                      opacity={0.6}
                      emissive="#9ca3af"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                </group>
              );

            case 'electron':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={0.8 + Math.sin(timeRef.current * 10) * 0.2}
                    />
                  </mesh>
                </group>
              );

            case 'o2':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* O2 molecule */}
                  <mesh position={[-0.05, 0, 0]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={0.4}
                    />
                  </mesh>
                  <mesh position={[0.05, 0, 0]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={0.4}
                    />
                  </mesh>
                </group>
              );

            case 'h2o':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[0.07, 10, 10]} />
                    <meshStandardMaterial
                      color="#60a5fa"
                      transparent
                      opacity={0.7}
                      emissive="#3b82f6"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                </group>
              );

            default:
              return null;
          }
        })}

        {/* ===== STAGE INDICATOR ===== */}
        {showLabels && (
          <Html position={[0, -4, 0]} distanceFactor={12}>
            <div className="bg-red-500/95 text-white px-4 py-2 rounded-lg text-base font-bold shadow-lg border-2 border-red-400">
              {stages[stage]}
            </div>
          </Html>
        )}

        {/* ===== ATP COUNTER ===== */}
        {showLabels && (
          <Html position={[-4, -3, 0]} distanceFactor={12}>
            <div className="bg-green-500/95 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-2 border-green-400">
              ⚡ ATP: {data.atpProduced}/38
            </div>
          </Html>
        )}

        {/* ===== DESCRIPTION ===== */}
        {showLabels && (
          <Html position={[3, -3, 0]} distanceFactor={12}>
            <div className="bg-gray-800/95 text-white px-3 py-2 rounded-lg text-xs max-w-[200px] shadow-lg">
              {data.description}
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[12, 24, '#1a1a3e', '#1a1a3e']} position={[0, -5, 0]} />
    </>
  );
}
