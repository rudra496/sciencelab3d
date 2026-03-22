"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// TYPES & INTERFACES
// ============================================

export type BondType = "ionic" | "covalent" | "metallic";

export interface ChemicalBondingData {
  bondType: BondType;
  step: number;
  totalSteps: number;
  bondEnergy: number;
  electronegativityDiff: number;
  bondLength: number;
  description: string;
}

export interface ChemicalBondingSceneProps {
  bondType: BondType;
  isPlaying: boolean;
  animationSpeed: number;
  stepMode: "auto" | "manual";
  manualStep: number;
  resetTrigger?: number;
  onDataChange?: (data: ChemicalBondingData) => void;
}

// ============================================
// CONSTANTS - ELEMENT DATA
// ============================================

const ELEMENTS = {
  Na: { symbol: "Na", name: "Sodium", number: 11, mass: 23, radius: 0.9, color: "#AB5CF2", electronegativity: 0.93, valence: 1 },
  Cl: { symbol: "Cl", name: "Chlorine", number: 17, mass: 35.5, radius: 0.7, color: "#1FF01F", electronegativity: 3.16, valence: 7 },
  H: { symbol: "H", name: "Hydrogen", number: 1, mass: 1, radius: 0.4, color: "#FFFFFF", electronegativity: 2.20, valence: 1 },
  O: { symbol: "O", name: "Oxygen", number: 8, mass: 16, radius: 0.6, color: "#FF0D0D", electronegativity: 3.44, valence: 6 },
  Fe: { symbol: "Fe", name: "Iron", number: 26, mass: 56, radius: 0.7, color: "#E06633", electronegativity: 1.83, valence: 2 },
};

const BOND_ENERGIES = {
  ionic: 411, // kJ/mol Na-Cl
  covalent: 463, // kJ/mol O-H
  metallic: 100, // approximate Fe-Fe
};

// ============================================
// ANIMATION STEPS FOR EACH BOND TYPE
// ============================================

// IONIC BOND (NaCl) - 5 Steps
const IONIC_STEPS = [
  {
    step: 0,
    title: "Neutral Atoms",
    description: "Sodium (Na) has 1 valence electron. Chlorine (Cl) has 7 valence electrons. Both atoms are neutral.",
  },
  {
    step: 1,
    title: "Electron Transfer Begins",
    description: "The electronegativity difference (ΔEN = 2.23) is > 1.7, so this will be an ionic bond. Na's valence electron starts moving toward Cl.",
  },
  {
    step: 2,
    title: "Ion Formation",
    description: "Na loses its electron → Na⁺ (cation). Cl gains electron → Cl⁻ (anion). Opposite charges create electrostatic attraction.",
  },
  {
    step: 3,
    title: "Electrostatic Attraction",
    description: "Na⁺ (blue glow) and Cl⁻ (red glow) attract each other due to opposite charges. Coulomb force pulls them together.",
  },
  {
    step: 4,
    title: "Crystal Lattice Formation",
    description: "In solid NaCl, ions arrange in a crystal lattice structure. Each Na⁺ is surrounded by 6 Cl⁻ and vice versa.",
  },
];

// COVALENT BOND (H2O) - 5 Steps
const COVALENT_STEPS = [
  {
    step: 0,
    title: "Separate Atoms",
    description: "Two hydrogen atoms and one oxygen atom. Oxygen needs 2 electrons, each hydrogen needs 1 electron to complete shells.",
  },
  {
    step: 1,
    title: "Atoms Approach",
    description: "Electronegativity difference ΔEN = 1.24 (polar covalent). Atoms are attracted to form a stable molecule.",
  },
  {
    step: 2,
    title: "Electron Sharing",
    description: "Oxygen shares electrons with hydrogen. Shared pairs spend more time near oxygen (more electronegative).",
  },
  {
    step: 3,
    title: "Bond Formation",
    description: "Two O-H covalent bonds form. Each hydrogen shares its electron with oxygen, creating shared electron pairs.",
  },
  {
    step: 4,
    title: "H₂O Molecule Formed",
    description: "Water molecule formed with 104.5° bond angle. The bent shape and polar bonds make water a polar molecule.",
  },
];

// METALLIC BOND (Fe lattice) - 4 Steps
const METALLIC_STEPS = [
  {
    step: 0,
    title: "Metal Atoms",
    description: "Iron (Fe) atoms have low electronegativity (1.83) and few valence electrons. They readily lose electrons.",
  },
  {
    step: 1,
    title: "Lattice Formation",
    description: "Metal atoms arrange in a close-packed crystal lattice structure. Each atom touches many neighbors.",
  },
  {
    step: 2,
    title: "Electron Delocalization",
    description: "Valence electrons become delocalized - they're not bound to any specific atom. They form an 'electron sea'.",
  },
  {
    step: 3,
    title: "Electron Sea",
    description: "Delocalized electrons (blue spheres) move freely throughout the lattice, creating metallic bonding.",
  },
];

// ============================================
// ATOM SPHERE COMPONENT
// ============================================

interface AtomProps {
  element: keyof typeof ELEMENTS;
  position: [number, number, number];
  glowColor?: string;
  glowIntensity?: number;
  showLabel?: boolean;
  ionLabel?: string;
}

function Atom({ element, position, glowColor, glowIntensity = 0, showLabel = true, ionLabel }: AtomProps) {
  const el = ELEMENTS[element];
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Glow effect */}
      {glowIntensity > 0 && (
        <mesh>
          <sphereGeometry args={[el.radius * 1.6, 32, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={glowIntensity * 0.35}
          />
        </mesh>
      )}

      {/* Main atom */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[el.radius, 32, 32]} />
        <meshStandardMaterial
          color={el.color}
          metalness={0.4}
          roughness={0.5}
          emissive={el.color}
          emissiveIntensity={glowIntensity * 0.5}
        />
      </mesh>

      {/* Label */}
      {showLabel && (
        <Html position={[0, el.radius + 0.6, 0]} center distanceFactor={10}>
          <div className="text-xs font-bold whitespace-nowrap pointer-events-none select-none bg-black/60 px-2 py-1 rounded text-white">
            {el.symbol}
            {ionLabel && <span className="ml-1">{ionLabel}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================
// ELECTRON COMPONENT
// ============================================

interface ElectronProps {
  position: [number, number, number];
  orbiting?: boolean;
  orbitCenter?: [number, number, number];
  orbitSpeed?: number;
}

function Electron({ position, orbiting, orbitCenter = [0, 0, 0], orbitSpeed = 2 }: ElectronProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && orbiting) {
      const time = performance.now() * 0.001;
      meshRef.current.position.x = orbitCenter[0] + Math.cos(time * orbitSpeed) * 0.25;
      meshRef.current.position.y = orbitCenter[1] + Math.sin(time * orbitSpeed) * 0.25;
      meshRef.current.position.z = orbitCenter[2] + Math.sin(time * orbitSpeed * 0.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}

// ============================================
// IONIC LATTICE COMPONENT
// ============================================

interface IonicLatticeProps {
  progress: number;
}

function IonicLattice({ progress }: IonicLatticeProps) {
  const latticeSize = 3;
  const spacing = 2.2;
  const visibleAtoms = Math.floor(progress * (latticeSize * latticeSize * 2));

  const atoms = useMemo(() => {
    const result: Array<{ type: "Na" | "Cl"; pos: [number, number, number] }> = [];
    for (let x = 0; x < latticeSize; x++) {
      for (let y = 0; y < latticeSize; y++) {
        for (let z = 0; z < 2; z++) {
          const isNa = (x + y + z) % 2 === 0;
          result.push({
            type: isNa ? "Na" : "Cl",
            pos: [
              (x - latticeSize / 2) * spacing,
              (y - latticeSize / 2) * spacing,
              (z - 0.5) * spacing * 1.4
            ] as [number, number, number]
          });
        }
      }
    }
    return result;
  }, [latticeSize, spacing]);

  return (
    <group>
      {atoms.slice(0, visibleAtoms).map((atom, i) => (
        <Atom
          key={i}
          element={atom.type}
          position={atom.pos}
          glowColor={atom.type === "Na" ? "#3b82f6" : "#ef4444"}
          glowIntensity={1}
          showLabel={false}
          ionLabel={atom.type === "Na" ? "+" : "⁻"}
        />
      ))}
    </group>
  );
}

// ============================================
// WATER MOLECULE COMPONENT
// ============================================

interface WaterMoleculeProps {
  oPos: [number, number, number];
  h1Pos: [number, number, number];
  h2Pos: [number, number, number];
  bondOpacity: number;
  overlapOpacity: number;
  angleProgress: number;
}

function WaterMolecule({ oPos, h1Pos, h2Pos, bondOpacity, overlapOpacity, angleProgress }: WaterMoleculeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  // Calculate positions based on angle progress
  const angle = useMemo(() => {
    const targetAngle = 104.5 * (Math.PI / 180);
    return targetAngle * angleProgress;
  }, [angleProgress]);

  const h1FinalPos: [number, number, number] = [
    -Math.sin(angle / 2) * 1.2,
    -Math.cos(angle / 2) * 1.2,
    0
  ];

  const h2FinalPos: [number, number, number] = [
    Math.sin(angle / 2) * 1.2,
    -Math.cos(angle / 2) * 1.2,
    0
  ];

  return (
    <group ref={groupRef}>
      {/* Oxygen */}
      <Atom element="O" position={oPos} showLabel={false} />

      {/* Bond lines */}
      {bondOpacity > 0 && (
        <>
          <Line
            points={[oPos, h1Pos]}
            color="#22c55e"
            lineWidth={3}
            opacity={bondOpacity}
            transparent
          />
          <Line
            points={[oPos, h2Pos]}
            color="#22c55e"
            lineWidth={3}
            opacity={bondOpacity}
            transparent
          />
        </>
      )}

      {/* Electron overlap clouds */}
      {overlapOpacity > 0 && (
        <>
          <mesh position={[(oPos[0] + h1Pos[0]) / 2, (oPos[1] + h1Pos[1]) / 2, (oPos[2] + h1Pos[2]) / 2]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={overlapOpacity * 0.25}
              emissive="#3b82f6"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[(oPos[0] + h2Pos[0]) / 2, (oPos[1] + h2Pos[1]) / 2, (oPos[2] + h2Pos[2]) / 2]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={overlapOpacity * 0.25}
              emissive="#3b82f6"
              emissiveIntensity={0.4}
            />
          </mesh>
        </>
      )}

      {/* Hydrogens */}
      <Atom element="H" position={h1Pos} showLabel={false} />
      <Atom element="H" position={h2Pos} showLabel={false} />

      {/* Shared electrons */}
      {overlapOpacity > 0.5 && (
        <>
          <Electron position={[(oPos[0] + h1Pos[0]) / 2, (oPos[1] + h1Pos[1]) / 2, 0.25]} orbiting orbitCenter={[(oPos[0] + h1Pos[0]) / 2, (oPos[1] + h1Pos[1]) / 2, 0]} />
          <Electron position={[(oPos[0] + h2Pos[0]) / 2, (oPos[1] + h2Pos[1]) / 2, 0.25]} orbiting orbitCenter={[(oPos[0] + h2Pos[0]) / 2, (oPos[1] + h2Pos[1]) / 2, 0]} />
        </>
      )}
    </group>
  );
}

// ============================================
// METALLIC LATTICE COMPONENT
// ============================================

interface MetallicLatticeProps {
  latticeProgress: number;
  electronVisibility: number;
  electronMotion: number;
  glowIntensity: number;
}

function MetallicLattice({ latticeProgress, electronVisibility, electronMotion, glowIntensity }: MetallicLatticeProps) {
  const atoms = useMemo(() => {
    const result: [number, number, number][] = [];
    const size = 3;
    const spacing = 2.0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          result.push([
            (x - size / 2 + 0.5) * spacing,
            (y - size / 2 + 0.5) * spacing,
            (z - size / 2 + 0.5) * spacing
          ]);
        }
      }
    }
    return result;
  }, []);

  const electronCount = 18;
  const electronsRef = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    if (electronMotion > 0) {
      const time = performance.now() * 0.001 * electronMotion;
      electronsRef.current.forEach((electron, i) => {
        if (electron) {
          const speed = 0.6 + (i % 5) * 0.15;
          const offset = i * 0.6;
          electron.position.x = Math.sin(time * speed + offset) * 2.8;
          electron.position.y = Math.cos(time * speed * 0.8 + offset) * 2.8;
          electron.position.z = Math.sin(time * speed * 1.2 + offset) * 2.8;
        }
      });
    }
  });

  const visibleAtoms = Math.floor(latticeProgress * atoms.length);

  return (
    <group>
      {/* Metal atoms */}
      {atoms.slice(0, visibleAtoms).map((pos, i) => (
        <Atom
          key={`atom-${i}`}
          element="Fe"
          position={pos}
          glowColor="#E06633"
          glowIntensity={glowIntensity}
          showLabel={false}
        />
      ))}

      {/* Delocalized electrons */}
      {electronVisibility > 0 && Array.from({ length: electronCount }).map((_, i) => (
        <mesh
          key={`electron-${i}`}
          ref={(el) => { if (el) electronsRef.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={1.2}
            transparent
            opacity={electronVisibility}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// PHYSICS STATE INTERFACE
// ============================================

interface PhysicsState {
  stepProgress: number;
  currentStep: number;
  timeInStep: number;
  // Ionic bond positions
  naPos: [number, number, number];
  clPos: [number, number, number];
  electronPos: [number, number, number];
  naGlow: number;
  clGlow: number;
  naPlus: boolean;
  clMinus: boolean;
  latticeVisible: boolean;
  ionicLatticeProgress: number;
  // Covalent bond positions
  oPos: [number, number, number];
  h1Pos: [number, number, number];
  h2Pos: [number, number, number];
  overlapOpacity: number;
  bondOpacity: number;
  angleProgress: number;
  // Metallic bond state
  latticeFormed: boolean;
  latticeProgress: number;
  electronVisibility: number;
  electronMotion: number;
  glowIntensity: number;
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

export function ChemicalBondingSceneComponent({
  bondType,
  isPlaying,
  animationSpeed,
  stepMode,
  manualStep,
  resetTrigger,
  onDataChange,
}: ChemicalBondingSceneProps) {
  // Physics state refs (update every frame, no React re-render)
  const physicsRef = useRef({
    stepProgress: 0,
    currentStep: 0,
    timeInStep: 0,
    // Ionic bond positions
    naPos: [-3, 0, 0] as [number, number, number],
    clPos: [3, 0, 0] as [number, number, number],
    electronPos: [-2.5, 0, 0] as [number, number, number],
    naGlow: 0,
    clGlow: 0,
    naPlus: false,
    clMinus: false,
    latticeVisible: false,
    ionicLatticeProgress: 0,
    // Covalent bond positions
    oPos: [0, 0, 0] as [number, number, number],
    h1Pos: [-4, 0, 0] as [number, number, number],
    h2Pos: [4, 0, 0] as [number, number, number],
    overlapOpacity: 0,
    bondOpacity: 0,
    angleProgress: 0,
    // Metallic bond state
    latticeFormed: false,
    latticeProgress: 0,
    electronVisibility: 0,
    electronMotion: 0,
    glowIntensity: 0,
  });

  // React state for display - update only every 8 frames
  const [displayStep, setDisplayStep] = useState(0);
  const [displayData, setDisplayData] = useState<ChemicalBondingData | null>(null);

  // Data callback throttle (8 frames at 60fps = ~0.133s)
  const frameCounterRef = useRef(0);
  const dataTimerRef = useRef(0);

  // Reset physics state when resetTrigger changes
  useEffect(() => {
    physicsRef.current = {
      stepProgress: 0,
      currentStep: 0,
      timeInStep: 0,
      naPos: [-3, 0, 0],
      clPos: [3, 0, 0],
      electronPos: [-2.5, 0, 0],
      naGlow: 0,
      clGlow: 0,
      naPlus: false,
      clMinus: false,
      latticeVisible: false,
      ionicLatticeProgress: 0,
      oPos: [0, 0, 0],
      h1Pos: [-4, 0, 0],
      h2Pos: [4, 0, 0],
      overlapOpacity: 0,
      bondOpacity: 0,
      angleProgress: 0,
      latticeFormed: false,
      latticeProgress: 0,
      electronVisibility: 0,
      electronMotion: 0,
      glowIntensity: 0,
    };
    setDisplayStep(0);
  }, [resetTrigger, bondType]);

  // Calculate bond properties
  const bondData = useMemo(() => {
    switch (bondType) {
      case "ionic":
        return {
          bondEnergy: BOND_ENERGIES.ionic,
          electronegativityDiff: ELEMENTS.Cl.electronegativity - ELEMENTS.Na.electronegativity,
          bondLength: 2.82,
        };
      case "covalent":
        return {
          bondEnergy: BOND_ENERGIES.covalent,
          electronegativityDiff: ELEMENTS.O.electronegativity - ELEMENTS.H.electronegativity,
          bondLength: 0.96,
        };
      case "metallic":
        return {
          bondEnergy: BOND_ENERGIES.metallic,
          electronegativityDiff: 0,
          bondLength: 2.48,
        };
    }
  }, [bondType]);

  // Get steps array
  const currentSteps = bondType === "ionic" ? IONIC_STEPS : bondType === "covalent" ? COVALENT_STEPS : METALLIC_STEPS;

  // Update physics
  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.05);
    const dt = rawDt * animationSpeed;
    const phys = physicsRef.current;

    // Update step
    if (stepMode === "auto" && isPlaying) {
      phys.timeInStep += dt;
      const stepDuration = 3;
      phys.stepProgress = Math.min(phys.timeInStep / stepDuration, 1);

      if (phys.stepProgress >= 1) {
        phys.timeInStep = 0;
        phys.stepProgress = 0;
        phys.currentStep = (phys.currentStep + 1) % currentSteps.length;
      }
    } else {
      phys.currentStep = manualStep;
      phys.stepProgress = 1;
    }

    // Update physics state based on bond type and step
    const t = phys.stepProgress;
    const step = phys.currentStep;

    switch (bondType) {
      case "ionic":
        updateIonicPhysics(phys, step, t);
        break;
      case "covalent":
        updateCovalentPhysics(phys, step, t);
        break;
      case "metallic":
        updateMetallicPhysics(phys, step, t);
        break;
    }

    // Update React state only every 8 frames
    frameCounterRef.current++;
    if (frameCounterRef.current >= 8) {
      frameCounterRef.current = 0;
      setDisplayStep(phys.currentStep);
    }

    // Throttled data callback
    dataTimerRef.current += rawDt;
    if (dataTimerRef.current >= 0.133) {
      dataTimerRef.current = 0;
      const stepInfo = currentSteps[phys.currentStep];
      const data: ChemicalBondingData = {
        bondType,
        step: phys.currentStep,
        totalSteps: currentSteps.length,
        bondEnergy: bondData.bondEnergy,
        electronegativityDiff: bondData.electronegativityDiff,
        bondLength: bondData.bondLength,
        description: stepInfo.title + ": " + stepInfo.description,
      };
      onDataChange?.(data);
      setDisplayData(data);
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />
      <pointLight position={[0, 5, 8]} intensity={0.5} color="#8b5cf6" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#050510" roughness={0.95} />
      </mesh>
      <gridHelper args={[30, 30, "#1a1a3e", "#0a0a1e"]} position={[0, -4.99, 0]} />

      {/* Main scene - render based on bond type */}
      {bondType === "ionic" && renderIonicScene(physicsRef.current)}
      {bondType === "covalent" && renderCovalentScene(physicsRef.current)}
      {bondType === "metallic" && renderMetallicScene(physicsRef.current)}

      {/* Step indicator */}
      <Html position={[0, 6, 0]} center>
        <div className="bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-lg font-bold text-white">
            Step {displayStep + 1}/{currentSteps.length}
          </div>
          <div className="text-sm text-emerald-400">
            {currentSteps[displayStep]?.title || ""}
          </div>
        </div>
      </Html>

      {/* Element Legend */}
      <Html position={[-6, 4, 0]}>
        <div className="bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm text-white text-xs">
          <div className="font-bold mb-1">Elements</div>
          {bondType === "ionic" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: ELEMENTS.Na.color }}></div>
                <span>Na (Sodium)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: ELEMENTS.Cl.color }}></div>
                <span>Cl (Chlorine)</span>
              </div>
            </>
          )}
          {bondType === "covalent" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: ELEMENTS.O.color }}></div>
                <span>O (Oxygen)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: ELEMENTS.H.color }}></div>
                <span>H (Hydrogen)</span>
              </div>
            </>
          )}
          {bondType === "metallic" && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: ELEMENTS.Fe.color }}></div>
              <span>Fe (Iron) + Delocalized e⁻</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ============================================
// PHYSICS UPDATE FUNCTIONS
// ============================================

function updateIonicPhysics(phys: PhysicsState, step: number, t: number) {
  switch (step) {
    case 0:
      phys.naPos = [-3, 0, 0];
      phys.clPos = [3, 0, 0];
      phys.electronPos = [-2.5, 0, 0];
      phys.naGlow = 0;
      phys.clGlow = 0;
      phys.naPlus = false;
      phys.clMinus = false;
      phys.latticeVisible = false;
      break;
    case 1:
      phys.naPos = [-3 + t * 0.5, 0, 0];
      phys.clPos = [3 - t * 0.3, 0, 0];
      phys.electronPos = [-2.5 + t * 3.5, Math.sin(t * Math.PI) * 0.5, 0];
      phys.naGlow = 0;
      phys.clGlow = t * 0.3;
      phys.naPlus = false;
      phys.clMinus = false;
      phys.latticeVisible = false;
      break;
    case 2:
      phys.naPos = [-2, 0, 0];
      phys.clPos = [2.3, 0, 0];
      phys.electronPos = [1.5 + t * 0.5, Math.sin(t * Math.PI * 2) * 0.2, 0];
      phys.naGlow = t * 0.8;
      phys.clGlow = 0.8;
      phys.naPlus = true;
      phys.clMinus = true;
      phys.latticeVisible = false;
      break;
    case 3:
      phys.naPos = [-2 + t * 1, 0, 0];
      phys.clPos = [2.3 - t * 1, 0, 0];
      phys.electronPos = [2, Math.sin(t * 5) * 0.15, 0];
      phys.naGlow = 0.8;
      phys.clGlow = 0.8;
      phys.naPlus = true;
      phys.clMinus = true;
      phys.latticeVisible = false;
      break;
    case 4:
      phys.latticeVisible = true;
      phys.ionicLatticeProgress = t;
      phys.naGlow = 1;
      phys.clGlow = 1;
      phys.naPlus = true;
      phys.clMinus = true;
      break;
  }
}

function updateCovalentPhysics(phys: PhysicsState, step: number, t: number) {
  switch (step) {
    case 0:
      phys.oPos = [0, 0, 0];
      phys.h1Pos = [-4, 0, 0];
      phys.h2Pos = [4, 0, 0];
      phys.overlapOpacity = 0;
      phys.bondOpacity = 0;
      phys.angleProgress = 0;
      break;
    case 1:
      const dist = 4 - 2.5 * t;
      phys.oPos = [0, 0, 0];
      phys.h1Pos = [-dist, 0, 0];
      phys.h2Pos = [dist, 0, 0];
      phys.overlapOpacity = t > 0.5 ? (t - 0.5) * 2 : 0;
      phys.bondOpacity = 0;
      phys.angleProgress = 0;
      break;
    case 2:
      phys.oPos = [0, 0, 0];
      phys.h1Pos = [-1.2, 0, 0];
      phys.h2Pos = [1.2, 0, 0];
      phys.overlapOpacity = 0.6;
      phys.bondOpacity = t > 0.7 ? (t - 0.7) / 0.3 : 0;
      phys.angleProgress = 0;
      break;
    case 3:
      phys.oPos = [0, 0, 0];
      phys.h1Pos = [-1.2, 0, 0];
      phys.h2Pos = [1.2, 0, 0];
      phys.overlapOpacity = 0.6;
      phys.bondOpacity = 1;
      phys.angleProgress = t;
      break;
    case 4:
      phys.oPos = [0, 0, 0];
      phys.h1Pos = [-1.2, 0, 0];
      phys.h2Pos = [1.2, 0, 0];
      phys.overlapOpacity = 0.6;
      phys.bondOpacity = 1;
      phys.angleProgress = 1;
      break;
  }
}

function updateMetallicPhysics(phys: PhysicsState, step: number, t: number) {
  switch (step) {
    case 0:
      phys.latticeFormed = false;
      phys.latticeProgress = 0;
      phys.electronVisibility = 0;
      phys.electronMotion = 0;
      phys.glowIntensity = 0;
      break;
    case 1:
      phys.latticeFormed = true;
      phys.latticeProgress = t;
      phys.electronVisibility = 0;
      phys.electronMotion = 0;
      phys.glowIntensity = 0;
      break;
    case 2:
      phys.latticeFormed = true;
      phys.latticeProgress = 1;
      phys.electronVisibility = t;
      phys.electronMotion = 0;
      phys.glowIntensity = t * 0.3;
      break;
    case 3:
      phys.latticeFormed = true;
      phys.latticeProgress = 1;
      phys.electronVisibility = 1;
      phys.electronMotion = t;
      phys.glowIntensity = 0.3;
      break;
  }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderIonicScene(phys: PhysicsState) {
  if (!phys.latticeVisible) {
    return (
      <>
        <Atom
          element="Na"
          position={phys.naPos}
          glowColor="#3b82f6"
          glowIntensity={phys.naGlow}
          ionLabel={phys.naPlus ? "+" : undefined}
        />
        <Atom
          element="Cl"
          position={phys.clPos}
          glowColor="#ef4444"
          glowIntensity={phys.clGlow}
          ionLabel={phys.clMinus ? "⁻" : undefined}
        />
        <Electron position={phys.electronPos} />
      </>
    );
  }
  return <IonicLattice progress={phys.ionicLatticeProgress} />;
}

function renderCovalentScene(phys: PhysicsState) {
  return (
    <WaterMolecule
      oPos={phys.oPos}
      h1Pos={phys.h1Pos}
      h2Pos={phys.h2Pos}
      bondOpacity={phys.bondOpacity}
      overlapOpacity={phys.overlapOpacity}
      angleProgress={phys.angleProgress}
    />
  );
}

function renderMetallicScene(phys: PhysicsState) {
  return (
    <MetallicLattice
      latticeProgress={phys.latticeProgress}
      electronVisibility={phys.electronVisibility}
      electronMotion={phys.electronMotion}
      glowIntensity={phys.glowIntensity}
    />
  );
}

export default ChemicalBondingSceneComponent;
