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
  fadh2Count: number;
  description: string;
  atpFromGlycolysis: number;
  atpFromPyruvate: number;
  atpFromKrebs: number;
  atpFromETC: number;
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
  type: 'glucose' | 'pyruvate' | 'atp' | 'co2' | 'nadh' | 'fadh2' | 'electron' | 'o2' | 'h2o' | 'acetylCoA' | 'proton';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
  animProgress: number;
  rotation?: number;
}

/**
 * CELLULAR RESPIRATION - Complete Rebuild
 * 4 stages with immersive 3D visualization
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
  const krebsRef = useRef<THREE.Group>(null);
  const atpSynthaseRef = useRef<THREE.Group>(null);

  // Physics state
  const moleculesRef = useRef<Molecule[]>([]);
  const atpCountRef = useRef(0);
  const atpGlycolysisRef = useRef(0);
  const atpPyruvateRef = useRef(0);
  const atpKrebsRef = useRef(0);
  const atpETCRef = useRef(0);
  const co2ProducedRef = useRef(0);
  const nadhCountRef = useRef(0);
  const fadh2CountRef = useRef(0);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state
  const [data, setData] = useState<CellularRespirationData>({
    stage: 'Glycolysis',
    atpProduced: 0,
    glucoseRemaining: 100,
    co2Produced: 0,
    nadhCount: 0,
    fadh2Count: 0,
    description: 'Glucose (6C) splits into 2 pyruvate (3C) in cytoplasm. Net: 2 ATP + 2 NADH.',
    atpFromGlycolysis: 0,
    atpFromPyruvate: 0,
    atpFromKrebs: 0,
    atpFromETC: 0,
  });

  const stages = ['Glycolysis', 'Pyruvate Oxidation', 'Krebs Cycle', 'Electron Transport Chain'];

  const stageDescriptions = [
    'Glucose (6C) splits into 2 pyruvate (3C) in cytoplasm. Net: 2 ATP + 2 NADH produced.',
    'Each pyruvate (3C) → Acetyl-CoA (2C) + CO₂. 2 NADH produced for entire glucose.',
    'Acetyl-CoA enters Krebs Cycle. Produces 2 ATP, 6 NADH, 2 FADH₂, and 4 CO₂ per glucose.',
    'Electrons flow through protein complexes. ATP synthase produces ~32-34 ATP. O₂ → H₂O.',
  ];

  // Hexagonal glucose ring vertices
  const glucoseRingPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      pts.push([Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0]);
    }
    return pts;
  }, []);

  // Mitochondria outer membrane shape
  const mitochondriaShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 3.2);
    shape.bezierCurveTo(1.8, 3.2, 2.6, 2.2, 2.6, 0);
    shape.bezierCurveTo(2.6, -2.2, 1.8, -3.2, 0, -3.2);
    shape.bezierCurveTo(-1.8, -3.2, -2.6, -2.2, -2.6, 0);
    shape.bezierCurveTo(-2.6, 2.2, -1.8, 3.2, 0, 3.2);
    return shape;
  }, []);

  // ETC protein complex positions on inner membrane
  const etcComplexes = useMemo(() => {
    const complexes: { id: string; pos: THREE.Vector3; color: string; label: string; isATPSynthase: boolean }[] = [
      { id: 'I', pos: new THREE.Vector3(1.6, 2, 0), color: '#f59e0b', label: 'I', isATPSynthase: false },
      { id: 'II', pos: new THREE.Vector3(-1.8, 1.2, 0), color: '#8b5cf6', label: 'II', isATPSynthase: false },
      { id: 'III', pos: new THREE.Vector3(1.8, -0.4, 0), color: '#ef4444', label: 'III', isATPSynthase: false },
      { id: 'IV', pos: new THREE.Vector3(-1.6, -1.6, 0), color: '#06b6d4', label: 'IV', isATPSynthase: false },
      { id: 'ATP', pos: new THREE.Vector3(0, 0, 0), color: '#22c55e', label: 'ATP Synthase', isATPSynthase: true },
    ];
    return complexes;
  }, []);

  // Proton gradient visualization points
  const protonGradientPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 2.1 + Math.sin(i * 0.5) * 0.15;
      pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, (i % 3 - 1) * 0.3]);
    }
    return pts;
  }, []);

  // Reset handler
  useEffect(() => {
    moleculesRef.current = [];
    atpCountRef.current = 0;
    atpGlycolysisRef.current = 0;
    atpPyruvateRef.current = 0;
    atpKrebsRef.current = 0;
    atpETCRef.current = 0;
    co2ProducedRef.current = 0;
    nadhCountRef.current = 0;
    fadh2CountRef.current = 0;
    timeRef.current = 0;
    frameCountRef.current = 0;

    // Initialize glucose molecules (orange hexagonal rings)
    for (let i = 0; i < 6; i++) {
      moleculesRef.current.push({
        id: `glucose-${i}`,
        type: 'glucose',
        position: new THREE.Vector3(-5 + Math.random() * 2, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 1.5),
        velocity: new THREE.Vector3(0.015 + Math.random() * 0.01, (Math.random() - 0.5) * 0.008, (Math.random() - 0.5) * 0.008),
        active: true,
        animProgress: 0,
      });
    }

    // Initialize protons for ETC gradient
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      moleculesRef.current.push({
        id: `proton-${i}`,
        type: 'proton',
        position: new THREE.Vector3(Math.cos(angle) * 2.3, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 1),
        velocity: new THREE.Vector3(0, 0, 0),
        active: false, // Only active in ETC stage
        animProgress: 0,
      });
    }

    // Initialize oxygen molecules for ETC
    for (let i = 0; i < 8; i++) {
      moleculesRef.current.push({
        id: `o2-${i}`,
        type: 'o2',
        position: new THREE.Vector3(-1.5 + Math.random() * 3, -2.5 + (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1.5),
        velocity: new THREE.Vector3(0, 0.008, 0),
        active: false,
        animProgress: 0,
      });
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta * simulationSpeed;
    frameCountRef.current++;

    const molecules = moleculesRef.current;

    // Animate molecules based on current stage
    molecules.forEach((mol) => {
      if (!mol.active) {
        // Activate protons in ETC stage
        if (stage === 3 && mol.type === 'proton') {
          mol.active = true;
        }
        // Activate oxygen in ETC stage
        if (stage === 3 && mol.type === 'o2') {
          mol.active = true;
        }
        return;
      }

      mol.position.add(mol.velocity.clone().multiplyScalar(simulationSpeed));

      if (stage === 0) {
        // ===== GLYCOLYSIS =====
        if (mol.type === 'glucose') {
          mol.animProgress += delta * 0.35 * simulationSpeed;
          // Glucose splits into 2 pyruvate
          if (mol.animProgress >= 1 && Math.random() < 0.03) {
            // Check glycolysis cap (max 2 ATP)
            if (atpGlycolysisRef.current >= 2) {
              mol.animProgress = 0;
              return;
            }

            mol.type = 'pyruvate';
            mol.animProgress = 0;
            atpGlycolysisRef.current = Math.min(2, atpGlycolysisRef.current + 0.5);
            atpCountRef.current = Math.min(38, atpCountRef.current + 0.5);

            // Create ATP molecule (green glowing orb)
            const atp: Molecule = {
              id: `atp-${Date.now()}-${Math.random()}`,
              type: 'atp',
              position: mol.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.015, 0.02, (Math.random() - 0.5) * 0.01),
              active: true,
              animProgress: 0,
            };
            molecules.push(atp);

            // Create second pyruvate
            const pyruvate2: Molecule = {
              id: `pyruvate-${Date.now()}-${Math.random()}`,
              type: 'pyruvate',
              position: mol.position.clone().add(new THREE.Vector3(0.4, 0.2, 0)),
              velocity: mol.velocity.clone(),
              active: true,
              animProgress: 0,
            };
            molecules.push(pyruvate2);
          }
        }
        if (mol.type === 'pyruvate') {
          // Move towards mitochondria
          const dirToMito = new THREE.Vector3(-1, 0, 0).sub(mol.position).normalize().multiplyScalar(0.008);
          mol.velocity.add(dirToMito.multiplyScalar(0.15));
        }
        if (mol.type === 'atp') {
          if (mol.position.length() > 6) mol.active = false;
        }
      } else if (stage === 1) {
        // ===== PYRUVATE OXIDATION =====
        if (mol.type === 'pyruvate') {
          mol.animProgress += delta * 0.3 * simulationSpeed;
          if (mol.animProgress > 0.6 && Math.random() < 0.02) {
            // Release CO2 (gray gas particle)
            const co2: Molecule = {
              id: `co2-${Date.now()}-${Math.random()}`,
              type: 'co2',
              position: mol.position.clone(),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.03, 0.025, (Math.random() - 0.5) * 0.03),
              active: true,
              animProgress: 0,
            };
            molecules.push(co2);
            co2ProducedRef.current += 1;

            // Produce NADH (blue carrier)
            nadhCountRef.current += 0.5;
            // Pyruvate oxidation produces no net ATP, but let's cap at 2 for display consistency
            atpPyruvateRef.current = Math.min(2, atpPyruvateRef.current + 0.5);

            const nadh: Molecule = {
              id: `nadh-${Date.now()}-${Math.random()}`,
              type: 'nadh',
              position: mol.position.clone().add(new THREE.Vector3(0.3, 0.2, 0)),
              velocity: new THREE.Vector3(0.01, 0.01, 0),
              active: true,
              animProgress: 0,
            };
            molecules.push(nadh);

            // Convert to Acetyl-CoA
            mol.type = 'acetylCoA';
          }
        }
        if (mol.type === 'acetylCoA') {
          // Move to Krebs cycle center
          const dirToCenter = new THREE.Vector3(0, 0, 0).sub(mol.position).normalize().multiplyScalar(0.012);
          mol.velocity.add(dirToCenter);
        }
        if (mol.type === 'co2') {
          mol.velocity.y = 0.02;
          if (mol.position.y > 5) mol.active = false;
        }
        if (mol.type === 'nadh') {
          if (mol.position.length() > 5) mol.active = false;
        }
      } else if (stage === 2) {
        // ===== KREBS CYCLE =====
        if (mol.type === 'acetylCoA') {
          mol.animProgress += delta * 0.25 * simulationSpeed;
          if (mol.animProgress > 0.5 && Math.random() < 0.015) {
            // Produce CO2
            const co2: Molecule = {
              id: `co2-${Date.now()}-${Math.random()}`,
              type: 'co2',
              position: mol.position.clone(),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.035, 0.022, (Math.random() - 0.5) * 0.035),
              active: true,
              animProgress: 0,
            };
            molecules.push(co2);
            co2ProducedRef.current += 1;

            // Produce NADH (3 per cycle)
            nadhCountRef.current += 0.15;

            // Produce FADH2 (1 per cycle)
            if (Math.random() < 0.33) {
              fadh2CountRef.current += 0.1;
              const fadh2: Molecule = {
                id: `fadh2-${Date.now()}-${Math.random()}`,
                type: 'fadh2',
                position: mol.position.clone().add(new THREE.Vector3(-0.2, 0.2, 0)),
                velocity: new THREE.Vector3(-0.008, 0.008, 0),
                active: true,
                animProgress: 0,
              };
              molecules.push(fadh2);
            }

            // Produce ATP (1 per cycle) - cap at 2 ATP total
            if (atpKrebsRef.current < 2) {
              atpKrebsRef.current = Math.min(2, atpKrebsRef.current + 0.25);
              atpCountRef.current = Math.min(38, atpCountRef.current + 0.25);
            }
            const atp: Molecule = {
              id: `atp-${Date.now()}-${Math.random()}`,
              type: 'atp',
              position: mol.position.clone().add(new THREE.Vector3(0, 0.3, 0)),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.012, 0.015, (Math.random() - 0.5) * 0.008),
              active: true,
              animProgress: 0,
            };
            molecules.push(atp);

            // Continue cycle - reset animation
            mol.animProgress = 0;
          }
        }
        if (mol.type === 'co2') {
          mol.velocity.y = 0.018;
          if (mol.position.y > 5) mol.active = false;
        }
        if (mol.type === 'nadh' || mol.type === 'fadh2') {
          if (mol.position.length() > 4.5) mol.active = false;
        }
      } else if (stage === 3) {
        // ===== ELECTRON TRANSPORT CHAIN =====
        if (mol.type === 'proton') {
          // Protons pumped through membrane
          const innerMembraneRadius = 1.6;
          const outerRadius = 2.3;
          const currentRadius = Math.sqrt(mol.position.x ** 2 + (mol.position.z / 0.7) ** 2);

          if (currentRadius > innerMembraneRadius) {
            // Proton in intermembrane space - accumulate for gradient
            mol.velocity.y += (Math.random() - 0.5) * 0.003;
          } else {
            // Proton flows back through ATP synthase
            const dirToSynthase = new THREE.Vector3(0, mol.position.y * 0.95, 0).sub(mol.position).normalize().multiplyScalar(0.015);
            mol.velocity.add(dirToSynthase);

            // When proton passes through ATP synthase, produce ATP
            // Stop ATP production when caps are reached
            if (Math.abs(mol.position.x) < 0.3 && Math.random() < 0.08) {
              // Check if we've reached the ATP caps before producing more
              if (atpCountRef.current >= 38 || atpETCRef.current >= 34) {
                // ATP production complete - don't create more molecules
                mol.active = false;
                return;
              }

              atpETCRef.current = Math.min(34, atpETCRef.current + 1.1);
              atpCountRef.current = Math.min(38, atpCountRef.current + 1.1);

              const atp: Molecule = {
                id: `atp-${Date.now()}-${Math.random()}`,
                type: 'atp',
                position: new THREE.Vector3(0, mol.position.y, 0.5),
                velocity: new THREE.Vector3(0.008, 0.008, 0.012),
                active: true,
                animProgress: 0,
              };
              molecules.push(atp);
            }
          }
        }

        if ((mol.type === 'nadh' || mol.type === 'fadh2') && Math.random() < 0.02) {
          // Donate electrons
          const electron: Molecule = {
            id: `electron-${Date.now()}-${Math.random()}`,
            type: 'electron',
            position: mol.position.clone(),
            velocity: new THREE.Vector3(-0.035 - Math.random() * 0.02, (Math.random() - 0.5) * 0.015, 0),
            active: true,
            animProgress: 0,
          };
          molecules.push(electron);
          mol.active = false;
        }

        if (mol.type === 'electron') {
          mol.animProgress += delta * 0.6 * simulationSpeed;
          // Move through complexes
          if (mol.animProgress >= 1) {
            mol.active = false;
            // Electron accepted by oxygen
          }
        }

        if (mol.type === 'o2') {
          // Final electron acceptor - forms water
          if (Math.random() < 0.015) {
            mol.type = 'h2o';
            mol.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.012, 0.01, (Math.random() - 0.5) * 0.012);
          }
        }

        if (mol.type === 'atp' || mol.type === 'h2o') {
          if (mol.position.length() > 6) mol.active = false;
        }
      }

      // Boundary constraints
      if (mol.position.length() > 7) {
        mol.velocity.multiplyScalar(-0.4);
        mol.position.normalize().multiplyScalar(7);
      }
    });

    // Clamp ATP to max 38
    atpCountRef.current = Math.min(38, atpCountRef.current);

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const newData: CellularRespirationData = {
        stage: stages[stage],
        atpProduced: Math.round(atpCountRef.current),
        glucoseRemaining: Math.max(0, 100 - Math.round((atpCountRef.current / 38) * 100)),
        co2Produced: co2ProducedRef.current,
        nadhCount: Math.round(nadhCountRef.current),
        fadh2Count: Math.round(fadh2CountRef.current),
        description: stageDescriptions[stage],
        atpFromGlycolysis: Math.round(atpGlycolysisRef.current),
        atpFromPyruvate: Math.round(atpPyruvateRef.current),
        atpFromKrebs: Math.round(atpKrebsRef.current),
        atpFromETC: Math.round(atpETCRef.current),
      };

      setData(newData);
      onDataChange?.(newData);
    }

    // Rotate Krebs cycle
    if (krebsRef.current && stage === 2) {
      krebsRef.current.rotation.z += delta * simulationSpeed * 0.8;
    }

    // Rotate ATP synthase
    if (atpSynthaseRef.current && stage === 3) {
      atpSynthaseRef.current.rotation.z += delta * simulationSpeed * 8;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#ef4444" />
      <pointLight position={[-4, 2, 3]} intensity={0.3} color="#f59e0b" />

      <group ref={groupRef}>
        {/* ===== BACKGROUND GRID ===== */}
        <gridHelper args={[16, 32, '#1a1a3e', '#1a1a3e']} position={[0, -5.5, 0]} />

        {/* ===== STAGE 0: GLYCOLYSIS REGION ===== */}
        {stage === 0 && (
          <>
            {/* Cytoplasm background */}
            <mesh position={[-4, 0, -0.5]}>
              <sphereGeometry args={[Math.max(0.001, 3.5), 32, 32]} />
              <meshStandardMaterial color="#1e3a5f" transparent opacity={0.08} />
            </mesh>

            {showLabels && (
              <Html position={[-5.5, 3.5, 0]} distanceFactor={12}>
                <div className="bg-blue-600/95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-blue-400">
                  🫧 Cytoplasm - Glycolysis
                </div>
              </Html>
            )}

            {/* Enzyme indicators */}
            {Array.from({ length: 4 }).map((_, i) => (
              <group key={i} position={[-5 + i * 1.5, -2, 0.5]}>
                <mesh>
                  <sphereGeometry args={[Math.max(0.001, 0.15), 8, 8]} />
                  <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5 + Math.sin(timeRef.current * 4 + i) * 0.3} />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* ===== MITOCHONDRION (stages 1-3) ===== */}
        {stage >= 1 && (
          <>
            {/* Outer membrane */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <capsuleGeometry args={[Math.max(0.001, 2.4), Math.max(0.001, 4.8), 16, 32]} />
              <meshPhysicalMaterial
                color="#b91c1c"
                transparent
                opacity={0.15}
                roughness={0.3}
                metalness={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner membrane */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <capsuleGeometry args={[Math.max(0.001, 1.7), Math.max(0.001, 3.8), 16, 32]} />
              <meshPhysicalMaterial
                color="#991b1b"
                transparent
                opacity={0.2}
                roughness={0.4}
                metalness={0.15}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Cristae (inner membrane folds) */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2 + Math.PI / 6;
              const radius = 1.5 + Math.sin(i * 0.6) * 0.25;
              return (
                <group key={i} position={[Math.cos(angle) * radius, (i - 6) * 0.55, Math.sin(angle) * radius * 0.6]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[Math.max(0.001, 0.08), Math.max(0.001, 0.08), Math.max(0.001, 0.7), 8]} />
                    <meshStandardMaterial color="#f87171" transparent opacity={0.6} />
                  </mesh>
                </group>
              );
            })}

            {/* Matrix label */}
            {showLabels && (
              <Html position={[0, 0, 0]} distanceFactor={10}>
                <div className="bg-amber-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                  Mitochondrial Matrix
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== STAGE 1: PYRUVATE OXIDATION ===== */}
        {stage === 1 && (
          <>
            {showLabels && (
              <Html position={[0, 4, 0]} distanceFactor={12}>
                <div className="bg-orange-500/95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-orange-400">
                  Pyruvate Oxidation
                </div>
              </Html>
            )}

            {/* Conversion arrow visualization */}
            <Line
              points={[
                [-2, 1.5, 0],
                [-0.5, 0, 0],
                [0, -0.5, 0],
              ]}
              color="#f59e0b"
              lineWidth={3}
              opacity={0.6}
              transparent
              dashed
            />

            {/* CO2 release indicators */}
            {Array.from({ length: 3 }).map((_, i) => (
              <group key={i} position={[-1 + i * 0.5, 2.5 + i * 0.3, 0]}>
                <mesh>
                  <sphereGeometry args={[Math.max(0.001, 0.08), 8, 8]} />
                  <meshStandardMaterial
                    color="#9ca3af"
                    transparent
                    opacity={0.5 - i * 0.12}
                    emissive="#9ca3af"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* ===== STAGE 2: KREBS CYCLE ===== */}
        {stage === 2 && (
          <>
            {showLabels && (
              <Html position={[0, 4, 0]} distanceFactor={12}>
                <div className="bg-green-600/95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-green-400">
                  🔄 Krebs Cycle (Citric Acid Cycle)
                </div>
              </Html>
            )}

            {/* Rotating Krebs cycle pathway */}
            <group ref={krebsRef} position={[0, 0, 0]}>
              {/* Main cycle circle */}
              <Line
                points={Array.from({ length: 48 }, (_, i) => {
                  const angle = (i / 48) * Math.PI * 2;
                  return [Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0] as [number, number, number];
                })}
                color="#22c55e"
                lineWidth={3}
                opacity={0.7}
              />

              {/* Step markers on cycle */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <group key={i} position={[Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0]}>
                    <mesh>
                      <sphereGeometry args={[Math.max(0.001, 0.12), 12, 12]} />
                      <meshStandardMaterial
                        color="#22c55e"
                        emissive="#22c55e"
                        emissiveIntensity={0.6 + Math.sin(timeRef.current * 5 + i) * 0.3}
                      />
                    </mesh>
                  </group>
                );
              })}

              {/* Cycle center */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[Math.max(0.001, 0.3), 16, 16]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.5 + Math.sin(timeRef.current * 3) * 0.25}
                />
              </mesh>
            </group>

            {/* Output indicators */}
            {showLabels && (
              <>
                <Html position={[2, 2, 0]} distanceFactor={12}>
                  <div className="bg-gray-900/90 px-3 py-2 rounded text-xs border border-gray-700">
                    <div className="text-gray-400">Outputs per glucose:</div>
                    <div className="text-green-400">• 2 ATP</div>
                    <div className="text-blue-400">• 6 NADH</div>
                    <div className="text-purple-400">• 2 FADH₂</div>
                    <div className="text-gray-400">• 4 CO₂</div>
                  </div>
                </Html>
              </>
            )}
          </>
        )}

        {/* ===== STAGE 3: ELECTRON TRANSPORT CHAIN ===== */}
        {stage === 3 && (
          <>
            {showLabels && (
              <Html position={[0, 4.5, 0]} distanceFactor={12}>
                <div className="bg-cyan-600/95 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-cyan-400">
                  ⚡ Electron Transport Chain
                </div>
              </Html>
            )}

            {/* ETC protein complexes */}
            {etcComplexes.map((complex) => (
              <group key={complex.id} position={complex.pos}>
                <mesh>
                  <boxGeometry args={[Math.max(0.001, 0.4), Math.max(0.001, 0.5), Math.max(0.001, 0.3)]} />
                  <meshStandardMaterial
                    color={complex.color}
                    emissive={complex.color}
                    emissiveIntensity={0.5 + Math.sin(timeRef.current * 6 + complex.id.length) * 0.3}
                  />
                </mesh>

                {showLabels && (
                  <Html position={[0, 0.4, 0]} distanceFactor={8}>
                    <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-gray-700">
                      {complex.label}
                    </div>
                  </Html>
                )}

                {/* ATP Synthase rotor */}
                {complex.isATPSynthase && (
                  <group ref={atpSynthaseRef}>
                    <mesh position={[0, 0.4, 0]}>
                      <cylinderGeometry args={[Math.max(0.001, 0.2), Math.max(0.001, 0.2), Math.max(0.001, 0.4), 12]} />
                      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.7} />
                    </mesh>
                    <mesh position={[0, 0.7, 0]}>
                      <sphereGeometry args={[Math.max(0.001, 0.16), 12, 12]} />
                      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
                    </mesh>
                    {/* Rotor blades */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 0.25, 0.4, Math.sin((i / 3) * Math.PI * 2) * 0.25]} rotation={[0, 0, (i / 3) * Math.PI * 2]}>
                        <boxGeometry args={[Math.max(0.001, 0.15), Math.max(0.001, 0.02), Math.max(0.001, 0.3)]} />
                        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
                      </mesh>
                    ))}
                  </group>
                )}
              </group>
            ))}

            {/* Proton gradient visualization */}
            <Line
              points={protonGradientPoints}
              color="#fbbf24"
              lineWidth={1.5}
              opacity={0.4}
              transparent
              dashed
            />

            {/* H+ labels for proton gradient */}
            {showLabels && (
              <Html position={[2.5, 2, 0]} distanceFactor={12}>
                <div className="bg-yellow-600/90 text-white px-2 py-1 rounded text-xs font-bold">
                  H⁺ Gradient
                </div>
              </Html>
            )}

            {/* Electron flow path */}
            <Line
              points={Array.from({ length: 50 }, (_, i) => {
                const t = i / 50;
                return [
                  Math.cos(t * Math.PI * 2) * 1.8,
                  (t - 0.5) * 4,
                  0,
                ] as [number, number, number];
              })}
              color="#06b6d4"
              lineWidth={2}
              opacity={0.5}
              transparent
              dashed
            />

            {/* Water formation indicator */}
            {showLabels && (
              <Html position={[-2, -3, 0]} distanceFactor={12}>
                <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-bold">
                  O₂ + e⁻ → H₂O
                </div>
              </Html>
            )}
          </>
        )}

        {/* ===== MOLECULES ===== */}
        {moleculesRef.current.map((mol) => {
          if (!mol.active) return null;

          const pulse = 0.4 + Math.sin(timeRef.current * 4 + mol.id.length) * 0.25;

          switch (mol.type) {
            case 'glucose':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* Hexagonal ring */}
                  <Line points={glucoseRingPoints} color="#f97316" lineWidth={2.5} />
                  {/* Carbon atoms */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    return (
                      <mesh key={i} position={[Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0]}>
                        <sphereGeometry args={[Math.max(0.001, 0.055), 8, 8]} />
                        <meshStandardMaterial color="#ea580c" emissive="#f97316" emissiveIntensity={pulse} />
                      </mesh>
                    );
                  })}
                </group>
              );

            case 'pyruvate':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.14), 12, 12]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={pulse} />
                  </mesh>
                </group>
              );

            case 'acetylCoA':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.16), 12, 12]} />
                    <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={pulse} />
                  </mesh>
                </group>
              );

            case 'atp':
              return (
                <group key={mol.id} position={mol.position}>
                  {/* Glowing ATP orb */}
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.15), 16, 16]} />
                    <meshStandardMaterial
                      color="#22c55e"
                      emissive="#22c55e"
                      emissiveIntensity={0.8}
                      transparent
                      opacity={0.9}
                    />
                  </mesh>
                  {/* Phosphate groups */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <mesh key={i} position={[0.08 * (i + 1), 0.08, 0]}>
                      <sphereGeometry args={[Math.max(0.001, 0.045), 8, 8]} />
                      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
                    </mesh>
                  ))}
                </group>
              );

            case 'co2':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.1), 12, 12]} />
                    <meshStandardMaterial
                      color="#9ca3af"
                      transparent
                      opacity={0.6}
                      emissive="#9ca3af"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                </group>
              );

            case 'nadh':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.13), 12, 12]} />
                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} />
                  </mesh>
                  {/* Carrier molecule visualization */}
                  <mesh position={[0.08, 0, 0]}>
                    <boxGeometry args={[Math.max(0.001, 0.08), Math.max(0.001, 0.08), Math.max(0.001, 0.08)]} />
                    <meshStandardMaterial color="#1e40af" />
                  </mesh>
                </group>
              );

            case 'fadh2':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.13), 12, 12]} />
                    <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.7} />
                  </mesh>
                </group>
              );

            case 'electron':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.06), 8, 8]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={0.9 + Math.sin(timeRef.current * 15) * 0.4}
                    />
                  </mesh>
                </group>
              );

            case 'proton':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.07), 8, 8]} />
                    <meshStandardMaterial
                      color="#fbbf24"
                      emissive="#fbbf24"
                      emissiveIntensity={0.6 + Math.sin(timeRef.current * 8 + mol.id.length) * 0.3}
                    />
                  </mesh>
                </group>
              );

            case 'o2':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh position={[-0.07, 0, 0]}>
                    <sphereGeometry args={[Math.max(0.001, 0.1), 10, 10]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
                  </mesh>
                  <mesh position={[0.07, 0, 0]}>
                    <sphereGeometry args={[Math.max(0.001, 0.1), 10, 10]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
                  </mesh>
                </group>
              );

            case 'h2o':
              return (
                <group key={mol.id} position={mol.position}>
                  <mesh>
                    <sphereGeometry args={[Math.max(0.001, 0.09), 10, 10]} />
                    <meshStandardMaterial
                      color="#60a5fa"
                      transparent
                      opacity={0.8}
                      emissive="#3b82f6"
                      emissiveIntensity={0.4}
                    />
                  </mesh>
                </group>
              );

            default:
              return null;
          }
        })}

        {/* ===== DATA DISPLAY ===== */}
        {showLabels && (
          <>
            {/* Stage indicator */}
            <Html position={[0, -5.5, 0]} distanceFactor={12}>
              <div className="bg-red-600/95 text-white px-5 py-2 rounded-lg text-base font-bold shadow-lg border-2 border-red-400">
                Stage {stage + 1}: {stages[stage]}
              </div>
            </Html>

            {/* ATP breakdown panel */}
            <Html position={[-5.5, -3.5, 0]} distanceFactor={12}>
              <div className="bg-gray-900/95 px-4 py-3 rounded-lg shadow-lg border border-gray-700 min-w-[200px]">
                <div className="text-white font-bold text-sm mb-3">⚡ ATP Production</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Glycolysis:</span>
                    <span className="text-blue-400 font-bold">{data.atpFromGlycolysis} ATP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Pyruvate Ox:</span>
                    <span className="text-orange-400 font-bold">{data.atpFromPyruvate} ATP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Krebs Cycle:</span>
                    <span className="text-green-400 font-bold">{data.atpFromKrebs} ATP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>ETC:</span>
                    <span className="text-cyan-400 font-bold">{data.atpFromETC} ATP</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-white font-bold text-sm">
                    <span>Total:</span>
                    <span className={`${data.atpProduced >= 38 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {data.atpProduced >= 38 ? '✓ ' : ''}{data.atpProduced}/38 ATP
                    </span>
                  </div>
                  {data.atpProduced >= 38 && (
                    <div className="mt-2 text-xs text-yellow-400 font-bold text-center animate-pulse">
                      🎉 Cellular Respiration Complete!
                    </div>
                  )}
                </div>
              </div>
            </Html>

            {/* Molecule count panel */}
            <Html position={[5, -3.5, 0]} distanceFactor={12}>
              <div className="bg-gray-900/95 px-4 py-3 rounded-lg shadow-lg border border-gray-700 min-w-[180px]">
                <div className="text-white font-bold text-sm mb-3">🧪 Molecules</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>CO₂ Produced:</span>
                    <span className="text-gray-300 font-bold">{data.co2Produced}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>NADH:</span>
                    <span className="text-blue-400 font-bold">{data.nadhCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>FADH₂:</span>
                    <span className="text-purple-400 font-bold">{data.fadh2Count}</span>
                  </div>
                </div>
              </div>
            </Html>

            {/* Description panel */}
            <Html position={[0, 5.5, 0]} distanceFactor={12}>
              <div className="bg-gray-800/95 text-white px-4 py-2 rounded-lg text-xs max-w-[300px] shadow-lg border border-gray-700 text-center">
                {data.description}
              </div>
            </Html>
          </>
        )}
      </group>
    </>
  );
}
