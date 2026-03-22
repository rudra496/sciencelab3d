"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export interface TitrationData {
  dropsAdded: number;
  volumeAdded: number;
  currentPH: number;
  acidConcentration: number;
  baseConcentration: number;
  acidType: string;
  baseType: string;
  indicatorType: string;
  equivalencePointVolume: number;
  acidStrength: string;
  baseStrength: string;
  isNearEquivalence: boolean;
  isPastEquivalence: boolean;
  titrationCurve: { volume: number; ph: number }[];
}

export interface TitrationSceneProps {
  acidConcentration: number;
  baseConcentration: number;
  acidType: "HCl" | "CH3COOH";
  baseType: "NaOH" | "KOH";
  indicatorType: "universal" | "phenolphthalein" | "methyl-orange" | "bromothymol";
  dripSpeed: number;
  isDripping: boolean;
  manualDripTrigger: number;
  onDataChange?: (data: TitrationData) => void;
}

// Acid-base dissociation constants
const ACID_PROPERTIES: Record<string, { Ka: number; pKa: number; strength: string }> = {
  HCl: { Ka: 1e7, pKa: -7, strength: "Strong Acid" },
  CH3COOH: { Ka: 1.8e-5, pKa: 4.76, strength: "Weak Acid" },
};

const BASE_PROPERTIES: Record<string, { strength: string }> = {
  NaOH: { strength: "Strong Base" },
  KOH: { strength: "Strong Base" },
};

/**
 * Calculate pH for titration using appropriate chemistry
 */
function calculateTitrationPH(
  volumeAdded: number,
  acidVolume: number,
  acidConc: number,
  baseConc: number,
  acidType: string
): number {
  const acidProps = ACID_PROPERTIES[acidType];
  const initialMolesAcid = acidVolume * acidConc / 1000;
  const molesBaseAdded = volumeAdded * baseConc / 1000;
  const totalVolume = acidVolume + volumeAdded;

  if (acidType === "HCl") {
    // Strong acid - strong base titration
    if (molesBaseAdded < initialMolesAcid) {
      // Before equivalence - excess H+
      const excessH = (initialMolesAcid - molesBaseAdded) / totalVolume * 1000;
      return -Math.log10(Math.max(excessH, 1e-14));
    } else if (Math.abs(molesBaseAdded - initialMolesAcid) < 0.00001) {
      // At equivalence
      return 7.0;
    } else {
      // After equivalence - excess OH-
      const excessOH = (molesBaseAdded - initialMolesAcid) / totalVolume * 1000;
      const pOH = -Math.log10(Math.max(excessOH, 1e-14));
      return 14 - pOH;
    }
  } else {
    // Weak acid - strong base titration (acetic acid)
    if (molesBaseAdded === 0) {
      // Initial pH of weak acid
      const hConc = Math.sqrt(acidProps.Ka * acidConc);
      return -Math.log10(Math.max(hConc, 1e-14));
    } else if (molesBaseAdded < initialMolesAcid) {
      // Buffer region - Henderson-Hasselbalch
      const molesAcidRemaining = initialMolesAcid - molesBaseAdded;
      const ratio = molesBaseAdded / molesAcidRemaining;
      return acidProps.pKa + Math.log10(Math.max(ratio, 0.001));
    } else if (Math.abs(molesBaseAdded - initialMolesAcid) < 0.00001) {
      // At equivalence - hydrolysis of conjugate base
      const saltConc = initialMolesAcid / totalVolume * 1000;
      const Kb = 1e-14 / acidProps.Ka;
      const ohConc = Math.sqrt(Kb * saltConc);
      const pOH = -Math.log10(Math.max(ohConc, 1e-14));
      return 14 - pOH;
    } else {
      // After equivalence - excess OH- dominates
      const excessOH = (molesBaseAdded - initialMolesAcid) / totalVolume * 1000;
      const pOH = -Math.log10(Math.max(excessOH, 1e-14));
      return 14 - pOH;
    }
  }
}

/**
 * Generate full titration curve for visualization
 */
function generateTitrationCurve(
  acidVolume: number,
  acidConc: number,
  baseConc: number,
  acidType: string,
  maxVolume: number
): { volume: number; ph: number }[] {
  const curve: { volume: number; ph: number }[] = [];
  for (let v = 0; v <= maxVolume; v += 0.5) {
    curve.push({
      volume: v,
      ph: calculateTitrationPH(v, acidVolume, acidConc, baseConc, acidType),
    });
  }
  return curve;
}

/**
 * Get universal indicator color based on pH
 */
function getUniversalIndicatorColor(pH: number): THREE.Color {
  if (pH < 3) return new THREE.Color(0.9, 0.1, 0.1); // Red
  if (pH < 5) return new THREE.Color(1.0, 0.5, 0.0); // Orange
  if (pH < 6) return new THREE.Color(1.0, 0.9, 0.1); // Yellow
  if (pH < 7.5) return new THREE.Color(0.2, 0.8, 0.3); // Green
  if (pH < 10) return new THREE.Color(0.2, 0.4, 1.0); // Blue
  return new THREE.Color(0.6, 0.2, 0.8); // Purple
}

/**
 * Get indicator color based on pH and indicator type
 */
function getIndicatorColor(pH: number, indicatorType: string): THREE.Color {
  switch (indicatorType) {
    case "universal":
      return getUniversalIndicatorColor(pH);
    case "phenolphthalein":
      // Colorless below 8.2, pink/magenta above
      if (pH < 8.2) return new THREE.Color(0.95, 0.97, 1.0);
      if (pH < 10) return new THREE.Color(1.0, 0.4, 0.7);
      return new THREE.Color(1.0, 0.2, 0.5);
    case "methyl-orange":
      // Red below 3.1, orange 3.1-4.4, yellow above
      if (pH < 3.1) return new THREE.Color(1.0, 0.15, 0.1);
      if (pH < 4.4) return new THREE.Color(1.0, 0.5, 0.1);
      return new THREE.Color(1.0, 0.9, 0.2);
    case "bromothymol":
      // Yellow below 6, green 6-7.6, blue above
      if (pH < 6) return new THREE.Color(1.0, 0.85, 0.2);
      if (pH < 7.6) return new THREE.Color(0.4, 0.75, 0.3);
      return new THREE.Color(0.2, 0.4, 1.0);
    default:
      return getUniversalIndicatorColor(pH);
  }
}

/**
 * Titration scene component - realistic 3D lab setup with burette and flask
 */
export function TitrationSceneComponent({
  acidConcentration,
  baseConcentration,
  acidType,
  baseType,
  indicatorType,
  dripSpeed,
  isDripping,
  manualDripTrigger,
  onDataChange
}: TitrationSceneProps) {
  // Mesh refs
  const buretteRef = useRef<THREE.Mesh>(null);
  const flaskRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const tapRef = useRef<THREE.Mesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    dropsAdded: 0,
    volumeAdded: 0,
    lastDripTime: 0,
    lastManualTrigger: 0,
    frameCount: 0,
    drops: [] as { time: number; active: boolean; y: number }[],
    curveData: [] as { volume: number; ph: number }[],
  });

  const ACID_VOLUME = 25; // mL - initial acid volume in flask
  const DROP_VOLUME = 0.05; // mL per drop

  const [data, setData] = useState<TitrationData>({
    dropsAdded: 0,
    volumeAdded: 0,
    currentPH: 1,
    acidConcentration,
    baseConcentration,
    acidType,
    baseType,
    indicatorType,
    equivalencePointVolume: 0,
    acidStrength: ACID_PROPERTIES[acidType].strength,
    baseStrength: BASE_PROPERTIES[baseType].strength,
    isNearEquivalence: false,
    isPastEquivalence: false,
    titrationCurve: [],
  });

  // Calculate equivalence point volume
  const equivalencePointVolume = useMemo(() => {
    return (ACID_VOLUME * acidConcentration) / baseConcentration;
  }, [acidConcentration, baseConcentration]);

  // Generate titration curve
  const titrationCurve = useMemo(() => {
    return generateTitrationCurve(ACID_VOLUME, acidConcentration, baseConcentration, acidType, equivalencePointVolume * 1.5);
  }, [acidConcentration, baseConcentration, acidType, equivalencePointVolume]);

  // Update physics curve data when parameters change
  useEffect(() => {
    physicsRef.current.curveData = titrationCurve;
  }, [titrationCurve]);

  // Handle manual drip
  useEffect(() => {
    if (manualDripTrigger > physicsRef.current.lastManualTrigger) {
      physicsRef.current.dropsAdded++;
      physicsRef.current.volumeAdded += DROP_VOLUME;
      physicsRef.current.lastManualTrigger = manualDripTrigger;
    }
  }, [manualDripTrigger]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const physics = physicsRef.current;

    // Auto drip when playing
    if (isDripping && time - physics.lastDripTime > (1.1 - dripSpeed) * 0.5) {
      physics.dropsAdded++;
      physics.volumeAdded += DROP_VOLUME;
      physics.lastDripTime = time;

      // Add new drop to animation
      const inactiveIndex = physics.drops.findIndex(d => !d.active);
      if (inactiveIndex === -1) {
        physics.drops.push({ time: time * 1000, active: true, y: 2.0 });
      } else {
        physics.drops[inactiveIndex] = { time: time * 1000, active: true, y: 2.0 };
      }
    }

    // Animate drops
    for (const drop of physics.drops) {
      if (drop.active) {
        drop.y -= dt * 4;
        if (drop.y < 0.6) {
          drop.active = false;
        }
      }
    }

    // Calculate current pH
    const currentPH = calculateTitrationPH(
      physics.volumeAdded,
      ACID_VOLUME,
      acidConcentration,
      baseConcentration,
      acidType
    );

    const isNearEquivalence = Math.abs(physics.volumeAdded - equivalencePointVolume) < 2;
    const isPastEquivalence = physics.volumeAdded > equivalencePointVolume;

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const newData: TitrationData = {
        dropsAdded: physics.dropsAdded,
        volumeAdded: physics.volumeAdded,
        currentPH,
        acidConcentration,
        baseConcentration,
        acidType,
        baseType,
        indicatorType,
        equivalencePointVolume,
        acidStrength: ACID_PROPERTIES[acidType].strength,
        baseStrength: BASE_PROPERTIES[baseType].strength,
        isNearEquivalence,
        isPastEquivalence,
        titrationCurve: physics.curveData,
      };
      setData(newData);
      onDataChange?.(newData);
    }

    // Animate liquid surface
    if (liquidRef.current) {
      const positions = liquidRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.array[i * 3];
        const y = positions.array[i * 3 + 1];
        const waveIntensity = isNearEquivalence ? 0.04 : 0.015;
        positions.array[i * 3 + 2] =
          Math.sin(x * 3 + time * 2.5) * waveIntensity +
          Math.cos(y * 3 + time * 2) * waveIntensity;
      }
      positions.needsUpdate = true;
    }

    // Animate tap when dripping
    if (tapRef.current && isDripping) {
      tapRef.current.rotation.z = Math.sin(time * 10) * 0.1;
    }
  });

  const liquidColor = getIndicatorColor(data.currentPH, indicatorType);
  const liquidHeight = 0.4 + (data.volumeAdded / 100) * 1.2;

  // Convert curve to Line points
  const curvePoints = useMemo(() => {
    return titrationCurve.map(pt =>
      new THREE.Vector3(
        ((pt.volume / (equivalencePointVolume * 1.5)) - 0.5) * 2.4,
        ((pt.ph - 7) / 7) * 1.8,
        0
      )
    );
  }, [titrationCurve, equivalencePointVolume]);

  // Current point on curve
  const currentPoint = useMemo(() => {
    const x = ((data.volumeAdded / (equivalencePointVolume * 1.5)) - 0.5) * 2.4;
    const y = ((data.currentPH - 7) / 7) * 1.8;
    return new THREE.Vector3(Math.max(-1.2, Math.min(1.2, x)), Math.max(-0.9, Math.min(0.9, y)), 0);
  }, [data.volumeAdded, data.currentPH, equivalencePointVolume]);

  // Active drops for rendering
  const activeDrops = physicsRef.current.drops.filter(d => d.active).slice(-8);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 3, 2]} intensity={0.3} />

      {/* === LAB STAND === */}
      <group position={[0, 0, 0]}>
        {/* Base plate */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[1.2, 0.1, 1.2]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Vertical rod */}
        <mesh position={[0.4, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 5, 12]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Clamp arm */}
        <mesh position={[0.2, 4.2, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.5, 12]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Burette clamp */}
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[0.25, 0.08, 0.08]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* === BURETTE === */}
      <group position={[0, 3.2, 0]}>
        {/* Main burette tube */}
        <mesh ref={buretteRef} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 2.8, 24, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>

        {/* Titrant liquid in burette */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 2.2, 24, 1, true]} />
          <meshStandardMaterial
            color="#e0e0ff"
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Graduation marks */}
        {Array.from({ length: 11 }).map((_, i) => (
          <group key={`mark-${i}`}>
            <mesh position={[0.125, -0.9 + i * 0.18, 0]}>
              <boxGeometry args={[0.015, i % 5 === 0 ? 0.06 : 0.035, 0.015]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
          </group>
        ))}

        {/* Volume numbers at major marks */}
        {[0, 5, 10].map((vol) => (
          <mesh key={`num-${vol}`} position={[0.16, -0.9 + vol * 0.18, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Stopcock (tap) assembly */}
        <mesh position={[0, -1.45, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Tap handle */}
        <mesh ref={tapRef} position={[0.08, -1.45, 0]} castShadow rotation={[0, 0, isDripping ? 0.1 : 0]}>
          <boxGeometry args={[0.2, 0.04, 0.06]} />
          <meshStandardMaterial color="#1a1a4a" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Delivery tip */}
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[0.025, 0.015, 0.2, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* === ERLENMEYER FLASK === */}
      <group position={[0, 0.2, 0]}>
        {/* Flask body - conical */}
        <mesh ref={flaskRef} position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.7, 1.1, 32, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            metalness={0.05}
            roughness={0.05}
          />
        </mesh>

        {/* Flask bottom - rounded */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.7, 32, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Flask neck */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.5, 20, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Flask rim */}
        <mesh position={[0, 1.3, 0]}>
          <torusGeometry args={[0.13, 0.015, 8, 24]} />
          <meshStandardMaterial color="#dddddd" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Liquid in flask - color changes with pH */}
        <mesh ref={liquidRef} position={[0, 0.3 + liquidHeight / 2, 0]}>
          <cylinderGeometry args={[0.32, 0.65, liquidHeight, 32, 12]} />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.8}
            emissive={liquidColor}
            emissiveIntensity={data.isNearEquivalence ? 0.5 : 0.25}
          />
        </mesh>

        {/* Meniscus effect */}
        <mesh position={[0, 0.3 + liquidHeight, 0]}>
          <torusGeometry args={[0.3, 0.02, 8, 24]} />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.6}
            emissive={liquidColor}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Equivalence glow */}
        {data.isNearEquivalence && (
          <>
            <pointLight
              position={[0, 0.5, 0.5]}
              color={liquidColor}
              intensity={2.5}
              distance={2}
            />
            <pointLight
              position={[0, 0.5, -0.5]}
              color={liquidColor}
              intensity={1.5}
              distance={1.5}
            />
          </>
        )}
      </group>

      {/* === FALLING DROPS === */}
      <group>
        {activeDrops.map((drop, i) => (
          <mesh key={`drop-${drop.time}-${i}`} position={[0, drop.y, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial
              color="#e0e0ff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* === pH CURVE GRAPH === */}
      <group position={[-1.8, 1.5, 0]}>
        {/* Graph background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.8, 2.4]} />
          <meshStandardMaterial color="#0a0a18" transparent opacity={0.92} />
        </mesh>

        {/* Grid lines */}
        {[1, 7, 13].map((ph, i) => (
          <mesh key={`grid-h-${ph}`} position={[0, ((ph - 7) / 7) * 1.05, 0]}>
            <boxGeometry args={[2.7, 0.015, 0.01]} />
            <meshStandardMaterial
              color={ph === 7 ? "#22c55e" : "#333344"}
              transparent
              opacity={ph === 7 ? 0.5 : 0.3}
            />
          </mesh>
        ))}

        {/* Equivalence point line */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.015, 2.3, 0.01]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* pH curve */}
        <Line
          points={curvePoints}
          color="#8b5cf6"
          lineWidth={2.5}
        />

        {/* Traveled curve (highlighted) */}
        <Line
          points={curvePoints.slice(0, Math.max(2, Math.floor((data.volumeAdded / (equivalencePointVolume * 1.5)) * curvePoints.length)))}
          color="#06d6a0"
          lineWidth={3}
        />

        {/* Current position marker */}
        <mesh position={[currentPoint.x, currentPoint.y, 0.05]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e"}
            emissive={data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e"}
            emissiveIntensity={1}
          />
        </mesh>

        {/* Equivalence point marker */}
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.08, 0.1, 24]} />
          <meshBasicMaterial
            color="#f59e0b"
            side={THREE.DoubleSide}
            transparent
            opacity={data.isNearEquivalence ? 1 : 0.6}
          />
        </mesh>

        {/* pH scale markers */}
        {[0, 1, 7, 13, 14].map((ph, i) => {
          const y = ((ph - 7) / 7) * 1.05;
          if (y < -1.1 || y > 1.1) return null;
          return (
            <mesh key={`ph-${ph}`} position={[-1.35, y, 0.02]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color={ph === 7 ? "#22c55e" : ph === 0 ? "#ef4444" : ph === 14 ? "#3b82f6" : "#888"} />
            </mesh>
          );
        })}
      </group>

      {/* === pH DISPLAY === */}
      <group position={[1.8, 2, 0]}>
        {/* Display housing */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.4, 0.08]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Screen */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial color="#0a0a1e" />
        </mesh>

        {/* pH indicator light */}
        <mesh position={[0, 0, 0.07]}>
          <circleGeometry args={[0.1, 24]} />
          <meshStandardMaterial
            color={data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e"}
            emissive={data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e"}
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>

      {/* === INDICATOR COLOR REFERENCE === */}
      <group position={[1.8, 1.2, 0]}>
        {indicatorType === "universal" && (
          <>
            {/* Universal indicator color bar */}
            <group position={[-0.15, 0, 0]}>
              {[
                { ph: 1, color: "#e53e3e" },
                { ph: 4, color: "#f97316" },
                { ph: 5.5, color: "#facc15" },
                { ph: 7, color: "#22c55e" },
                { ph: 9, color: "#3b82f6" },
                { ph: 12, color: "#9333ea" },
              ].map((item, i) => (
                <mesh key={i} position={[i * 0.06, 0, 0]}>
                  <sphereGeometry args={[0.025, 12, 12]} />
                  <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.3} />
                </mesh>
              ))}
            </group>
          </>
        )}
      </group>

      {/* Equivalence alert ring */}
      {data.isNearEquivalence && (
        <group position={[0, 1, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.85, 0.92, 48]} />
            <meshBasicMaterial
              color="#f59e0b"
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>
          <pointLight position={[0, 0.5, 0]} color="#f59e0b" intensity={3} distance={4} />
        </group>
      )}

      {/* Floor grid */}
      <gridHelper args={[10, 20, "#1a1a3e", "#12122a"]} position={[0, -0.2, 0]} />
    </>
  );
}

export default TitrationSceneComponent;
