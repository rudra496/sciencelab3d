"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface PhotosynthesisData {
  phase: "Light Reactions" | "Calvin Cycle";
  step: number;
  stepDescription: string;
  o2Produced: number;
  glucoseProduced: number;
  atpCount: number;
  nadphCount: number;
}

interface PhotosynthesisSceneProps {
  onDataChange?: (data: PhotosynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  lightIntensity?: number;
  co2Level?: number;
  stepMode?: "auto" | "step";
  showLabels?: boolean;
}

// Step descriptions for each phase
const STEP_DESCRIPTIONS = {
  lightReactions: [
    "Step 1: Sunlight hits chloroplast. Water molecules (H₂O) enter from below.",
    "Step 2: Light energy splits H₂O into H⁺ and O₂. Electrons flow through Photosystem I & II. O₂ bubbles escape.",
    "Step 3: ATP and NADPH are produced. 2H₂O → O₂ + 4H⁺ + 4e⁻"
  ],
  calvinCycle: [
    "Step 4: CO₂ enters chloroplast. Combines with RuBP using enzyme RuBisCO.",
    "Step 5: ATP and NADPH power conversion of 3-PGA to G3P (sugar precursor).",
    "Step 6: G3P molecules combine to form GLUCOSE (C₆H₁₂O₆). Photosynthesis complete!"
  ]
};

// Molecule types
interface Molecule {
  id: string;
  type: "H2O" | "CO2" | "O2" | "ATP" | "NADPH" | "G3P" | "glucose" | "RuBP";
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  progress: number;
  speed: number;
}

export default function PhotosynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  lightIntensity = 1,
  co2Level = 1,
  stepMode = "auto",
  showLabels = true,
}: PhotosynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const stepRef = useRef(1);
  const phaseRef = useRef<"Light Reactions" | "Calvin Cycle">("Light Reactions");
  const stepTimerRef = useRef(0);

  // Production counters
  const o2ProducedRef = useRef(0);
  const glucoseProducedRef = useRef(0);
  const atpCountRef = useRef(0);
  const nadphCountRef = useRef(0);

  // Molecules
  const moleculesRef = useRef<Molecule[]>([]);
  const [visibleMolecules, setVisibleMolecules] = useState<Molecule[]>([]);

  // React state for UI (throttled)
  const [currentData, setCurrentData] = useState<PhotosynthesisData>({
    phase: "Light Reactions",
    step: 1,
    stepDescription: STEP_DESCRIPTIONS.lightReactions[0],
    o2Produced: 0,
    glucoseProduced: 0,
    atpCount: 0,
    nadphCount: 0,
  });

  // Chloroplast geometry
  const chloroplastShape = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const theta = (i / 60) * Math.PI * 2;
      // Oval shape
      points.push([
        Math.cos(theta) * 5,
        Math.sin(theta) * 3.5,
        0
      ]);
    }
    return points;
  }, []);

  // Thylakoid discs (grana)
  const thylakoids = useMemo(() => {
    const stacks: [number, number, number][][] = [];
    for (let stack = 0; stack < 6; stack++) {
      const stackPoints: [number, number, number][] = [];
      for (let disc = 0; disc < 5; disc++) {
        stackPoints.push([
          (stack - 2.5) * 1.8,
          (disc - 2) * 0.3,
          Math.sin(stack * 0.8) * 0.5
        ]);
      }
      stacks.push(stackPoints);
    }
    return stacks;
  }, []);

  // Stroma lamellae connections
  const stromaConnections = useMemo(() => {
    const conns: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      conns.push([
        (i - 2) * 1.8,
        -1,
        Math.sin(i * 0.8) * 0.5
      ]);
    }
    return conns;
  }, []);

  // Sun rays
  const sunRays = useMemo(() => {
    const rays: [number, number, number][][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      rays.push([
        [Math.cos(angle) * 8, 6, 0],
        [Math.cos(angle) * 3, 2, 0]
      ]);
    }
    return rays;
  }, []);

  // Electron transport chain on thylakoid
  const electronChain = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push([
        (t - 0.5) * 8,
        0.5 + Math.sin(t * Math.PI * 3) * 0.2,
        0
      ]);
    }
    return points;
  }, []);

  // Reset function
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    stepRef.current = 1;
    phaseRef.current = "Light Reactions";
    stepTimerRef.current = 0;
    o2ProducedRef.current = 0;
    glucoseProducedRef.current = 0;
    atpCountRef.current = 0;
    nadphCountRef.current = 0;
    moleculesRef.current = [];
    setVisibleMolecules([]);
    setCurrentData({
      phase: "Light Reactions",
      step: 1,
      stepDescription: STEP_DESCRIPTIONS.lightReactions[0],
      o2Produced: 0,
      glucoseProduced: 0,
      atpCount: 0,
      nadphCount: 0,
    });
  }, [resetTrigger]);

  // Spawn molecule
  const spawnMolecule = useCallback((type: Molecule["type"], startPhase: "light" | "calvin") => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    let startPos: THREE.Vector3;
    let targetPos: THREE.Vector3;

    const isLight = startPhase === "light";

    switch (type) {
      case "H2O":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          -5,
          (Math.random() - 0.5) * 4
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          0.5,
          (Math.random() - 0.5) * 2
        );
        break;
      case "CO2":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          6,
          (Math.random() - 0.5) * 6
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1.5,
          (Math.random() - 0.5) * 2
        );
        break;
      case "O2":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          0.5,
          (Math.random() - 0.5) * 2
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          5,
          (Math.random() - 0.5) * 4
        );
        break;
      case "ATP":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          0.5,
          0
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1.5,
          (Math.random() - 0.5) * 2
        );
        break;
      case "NADPH":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          0.5,
          0
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1.5,
          (Math.random() - 0.5) * 2
        );
        break;
      case "RuBP":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1.5,
          0
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1,
          -1.5,
          0
        );
        break;
      case "G3P":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -1.5,
          0
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -2.5,
          0
        );
        break;
      case "glucose":
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -1.5,
          0
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          -3.5,
          (Math.random() - 0.5) * 3
        );
        break;
      default:
        startPos = new THREE.Vector3(0, 0, 0);
        targetPos = new THREE.Vector3(0, 0, 0);
    }

    const molecule: Molecule = {
      id,
      type,
      position: startPos.clone(),
      targetPosition: targetPos,
      progress: 0,
      speed: 0.2 + Math.random() * 0.15,
    };

    moleculesRef.current.push(molecule);
  }, []);

  // Get step description
  const getStepDescription = useCallback((step: number, phase: "Light Reactions" | "Calvin Cycle") => {
    const stepIndex = Math.max(0, step - 1);
    if (phase === "Light Reactions") {
      return STEP_DESCRIPTIONS.lightReactions[stepIndex] || STEP_DESCRIPTIONS.lightReactions[2];
    } else {
      return STEP_DESCRIPTIONS.calvinCycle[stepIndex] || STEP_DESCRIPTIONS.calvinCycle[2];
    }
  }, []);

  useFrame((_, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed;
      rotationRef.current += delta * 0.02 * simulationSpeed;
      groupRef.current.rotation.y = rotationRef.current;

      // Step progression in auto mode
      if (stepMode === "auto") {
        stepTimerRef.current += delta * simulationSpeed;
        const stepDuration = 5 / simulationSpeed; // 5 seconds per step

        if (stepTimerRef.current > stepDuration) {
          stepTimerRef.current = 0;
          stepRef.current++;

          if (phaseRef.current === "Light Reactions" && stepRef.current > 3) {
            phaseRef.current = "Calvin Cycle";
            stepRef.current = 1;
          } else if (phaseRef.current === "Calvin Cycle" && stepRef.current > 3) {
            phaseRef.current = "Light Reactions";
            stepRef.current = 1;
          }
        }
      }

      // Update production based on step and phase
      const step = stepRef.current;
      const phase = phaseRef.current;

      if (phase === "Light Reactions") {
        // Light reactions produce O2, ATP, NADPH
        const rate = lightIntensity * simulationSpeed;

        if (step >= 2) {
          o2ProducedRef.current = Math.min(100, o2ProducedRef.current + delta * rate * 5);
        }
        if (step >= 3) {
          atpCountRef.current = Math.min(50, atpCountRef.current + delta * rate * 2);
          nadphCountRef.current = Math.min(50, nadphCountRef.current + delta * rate * 1.5);
        }

        // Spawn H2O molecules in step 1
        if (step === 1 && frameCountRef.current % 40 === 0) {
          spawnMolecule("H2O", "light");
        }
        // Spawn O2 in step 2
        if (step === 2 && frameCountRef.current % 50 === 0 && Math.random() < 0.5) {
          spawnMolecule("O2", "light");
        }
        // Show ATP/NADPH in step 3
        if (step === 3 && frameCountRef.current % 60 === 0) {
          if (atpCountRef.current < 30) spawnMolecule("ATP", "light");
          if (nadphCountRef.current < 25) spawnMolecule("NADPH", "light");
        }
      } else {
        // Calvin cycle produces glucose
        const rate = co2Level * lightIntensity * simulationSpeed;

        if (step >= 4) {
          // Consume ATP/NADPH for Calvin cycle
          atpCountRef.current = Math.max(0, atpCountRef.current - delta * rate * 0.5);
          nadphCountRef.current = Math.max(0, nadphCountRef.current - delta * rate * 0.4);
        }
        if (step === 4 && frameCountRef.current % 50 === 0) {
          spawnMolecule("CO2", "calvin");
          spawnMolecule("RuBP", "calvin");
        }
        if (step === 5 && frameCountRef.current % 60 === 0) {
          spawnMolecule("G3P", "calvin");
        }
        if (step === 6) {
          glucoseProducedRef.current = Math.min(100, glucoseProducedRef.current + delta * rate * 3);
          if (frameCountRef.current % 80 === 0 && Math.random() < 0.4) {
            spawnMolecule("glucose", "calvin");
          }
        }
      }

      // Update molecules
      moleculesRef.current = moleculesRef.current.filter(mol => {
        mol.progress += delta * mol.speed * simulationSpeed;
        mol.position.lerp(mol.targetPosition, delta * mol.speed * simulationSpeed);
        return mol.progress < 1;
      });

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        const newData: PhotosynthesisData = {
          phase,
          step: stepRef.current,
          stepDescription: getStepDescription(stepRef.current, phase),
          o2Produced: Math.round(o2ProducedRef.current),
          glucoseProduced: Math.round(glucoseProducedRef.current),
          atpCount: Math.round(atpCountRef.current),
          nadphCount: Math.round(nadphCountRef.current),
        };
        setCurrentData(newData);
        setVisibleMolecules([...moleculesRef.current]);
        onDataChange?.(newData);
      }
    }
  });

  const renderMolecule = (mol: Molecule) => {
    const colors: Record<string, string> = {
      H2O: "#06b6d4",
      CO2: "#3b82f6",
      O2: "#ef4444",
      ATP: "#fbbf24",
      NADPH: "#22c55e",
      G3P: "#a78bfa",
      glucose: "#a855f7",
      RuBP: "#14b8a6",
    };

    const sizes: Record<string, number> = {
      H2O: 0.2,
      CO2: 0.25,
      O2: 0.15,
      ATP: 0.22,
      NADPH: 0.2,
      G3P: 0.25,
      glucose: 0.35,
      RuBP: 0.18,
    };

    const color = colors[mol.type] || "#888";
    const size = sizes[mol.type] || 0.2;

    return (
      <group key={mol.id} position={mol.position}>
        <mesh>
          <sphereGeometry args={[size, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        {showLabels && (
          <Html position={[0, size + 0.12, 0]} distanceFactor={12} center>
            <div
              className="text-[10px] font-bold px-1 py-0.5 rounded whitespace-nowrap"
              style={{ backgroundColor: color, color: "white" }}
            >
              {mol.type}
            </div>
          </Html>
        )}
      </group>
    );
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={lightIntensity * 2}
        color="#fef08a"
      />
      <pointLight position={[0, 5, 0]} intensity={lightIntensity * 0.8} color="#fbbf24" />
      <pointLight position={[0, -2, 0]} intensity={0.4} color="#22c55e" />

      <group ref={groupRef}>
        {/* Chloroplast outer membrane */}
        <Line points={chloroplastShape} color="#22c55e" lineWidth={3} opacity={0.4} transparent />
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[5, 32, 16]} />
          <meshStandardMaterial
            color="#22c55e"
            transparent
            opacity={0.08}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Sun rays */}
        {lightIntensity > 0.3 && phaseRef.current === "Light Reactions" && (
          <group>
            {sunRays.map((ray, i) => (
              <Line key={i} points={ray} color="#fbbf24" lineWidth={1} opacity={lightIntensity * 0.3} transparent />
            ))}
          </group>
        )}

        {/* Thylakoid stacks (grana) */}
        {thylakoids.map((stack, stackIndex) => (
          <group key={stackIndex}>
            {stack.map((pos, discIndex) => (
              <group key={discIndex} position={pos}>
                {/* Thylakoid disc */}
                <mesh rotation={[0, 0, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 0.12, 16]} />
                  <meshStandardMaterial color="#059669" roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Light absorption glow */}
                {phaseRef.current === "Light Reactions" && lightIntensity > 0.5 && (
                  <mesh position={[0, 0.2, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial
                      color="#fbbf24"
                      emissive="#fbbf24"
                      emissiveIntensity={lightIntensity * Math.sin(timeRef.current * 2) * 0.5 + 0.5}
                    />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        ))}

        {/* Stroma lamellae */}
        {stromaConnections.map((pos, i) => (
          <group key={i} position={pos}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.12, 0.6, 8, 12]} />
              <meshStandardMaterial color="#047857" transparent opacity={0.8} />
            </mesh>
          </group>
        ))}

        {/* Electron transport chain (glowing on thylakoid) */}
        {phaseRef.current === "Light Reactions" && stepRef.current >= 2 && (
          <Line
            points={electronChain}
            color="#fbbf24"
            lineWidth={2}
            opacity={0.6 + Math.sin(timeRef.current * 5) * 0.2}
            transparent
          />
        )}

        {/* Stroma (Calvin cycle area) */}
        <group position={[0, -1.8, 0]}>
          <mesh>
            <sphereGeometry args={[2.2, 16, 16]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.05} />
          </mesh>
          {/* RuBisCO enzyme indicator */}
          {phaseRef.current === "Calvin Cycle" && co2Level > 0.3 && (
            <group>
              {[0, 1, 2].map((i) => (
                <mesh
                  key={i}
                  position={[
                    Math.cos((i * Math.PI * 2) / 3) * 1.2,
                    0,
                    Math.sin((i * Math.PI * 2) / 3) * 1.2,
                  ]}
                >
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshStandardMaterial
                    color="#14b8a6"
                    emissive="#14b8a6"
                    emissiveIntensity={co2Level * 0.5 * (Math.sin(timeRef.current * 3 + i) * 0.3 + 0.7)}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>

        {/* Animated molecules */}
        {visibleMolecules.map(renderMolecule)}

        {/* Labels */}
        {showLabels && (
          <>
            <Html position={[0, -4, 0]} distanceFactor={10}>
              <div className="bg-green-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                Chloroplast
              </div>
            </Html>
            {phaseRef.current === "Light Reactions" && (
              <Html position={[0, 2.5, 0]} distanceFactor={12}>
                <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs">
                  Thylakoids (Light Reactions)
                </div>
              </Html>
            )}
            {phaseRef.current === "Calvin Cycle" && (
              <Html position={[0, -3, 2]} distanceFactor={12}>
                <div className="bg-emerald-700/90 text-white px-2 py-1 rounded text-xs">
                  Stroma (Calvin Cycle)
                </div>
              </Html>
            )}
            {phaseRef.current === "Calvin Cycle" && co2Level > 0.3 && (
              <Html position={[1.5, -1.8, 0]} distanceFactor={12}>
                <div className="bg-teal-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                  RuBisCO
                </div>
              </Html>
            )}
            {phaseRef.current === "Light Reactions" && stepRef.current >= 2 && (
              <>
                <Html position={[-3.5, 1, 0]} distanceFactor={12}>
                  <div className="bg-yellow-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                    Photosystem II
                  </div>
                </Html>
                <Html position={[3.5, 1, 0]} distanceFactor={12}>
                  <div className="bg-orange-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                    Photosystem I
                  </div>
                </Html>
              </>
            )}
          </>
        )}
      </group>
    </>
  );
}
