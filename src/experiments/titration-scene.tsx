"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export interface TitrationData {
  dropsAdded: number;
  currentPH: number;
  titrantConcentration: number;
  analyteVolume: number;
  indicatorType: string;
  equivalencePoint: number;
  isNearEquivalence: boolean;
}

export interface TitrationSceneProps {
  titrantConcentration: number;
  analyteVolume: number;
  indicatorType: "phenolphthalein" | "methyl-orange" | "bromothymol";
  dropsAdded: number;
  onDataChange?: (data: TitrationData) => void;
}

/**
 * Titration scene component
 * Visualizes acid-base titration with color-changing indicators
 */
export function TitrationSceneComponent({
  titrantConcentration,
  analyteVolume,
  indicatorType,
  dropsAdded,
  onDataChange
}: TitrationSceneProps) {
  const buretteRef = useRef<THREE.Mesh>(null);
  const flaskRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    drops: [] as { time: number; active: boolean }[],
    frameCount: 0,
    lastDropsCount: 0
  });

  const [data, setData] = useState<TitrationData>({
    dropsAdded,
    currentPH: 1,
    titrantConcentration,
    analyteVolume,
    indicatorType,
    equivalencePoint: 25,
    isNearEquivalence: false,
  });

  // Equivalence point calculation (simplified)
  const equivalencePoint = useMemo(() => {
    return Math.floor((analyteVolume * 0.1) / (titrantConcentration * 0.4));
  }, [analyteVolume, titrantConcentration]);

  // Calculate pH based on titration progress (strong acid - strong base)
  const calculatedPH = useMemo(() => {
    const progress = dropsAdded / equivalencePoint;
    if (progress < 0.9) {
      // Buffer region - gradual pH increase
      return 1 + progress * 2.5;
    } else if (progress < 1.1) {
      // Near equivalence - steep jump
      const t = (progress - 0.9) / 0.2;
      return 3.5 + t * 6.5;
    } else {
      // Post-equivalence
      return 10 + Math.min((progress - 1.1) * 2, 2);
    }
  }, [dropsAdded, equivalencePoint]);

  const isNearEquivalence = Math.abs(dropsAdded - equivalencePoint) <= 3;

  // Get indicator color based on pH and type
  const getIndicatorColor = (currentPH: number, indicator: string) => {
    if (indicator === "phenolphthalein") {
      // Colorless below 8.2, pink above 8.2
      if (currentPH < 8.2) {
        const alpha = Math.min((currentPH - 7.5) / 0.7, 0.3);
        return new THREE.Color(1, 1, 1 + alpha * 0.5);
      }
      return new THREE.Color(1, 0.4, 0.7);
    } else if (indicator === "methyl-orange") {
      // Red below 3.1, yellow above 4.4
      if (currentPH < 3.1) return new THREE.Color(1, 0.2, 0.1);
      if (currentPH > 4.4) return new THREE.Color(1, 0.9, 0.2);
      // Orange transition
      const t = (currentPH - 3.1) / 1.3;
      return new THREE.Color(1, 0.2 + t * 0.7, 0.1 + t * 0.1);
    } else {
      // Bromothymol blue - yellow below 6, blue above 7.6
      if (currentPH < 6) return new THREE.Color(1, 0.8, 0.2);
      if (currentPH > 7.6) return new THREE.Color(0.2, 0.4, 1);
      // Green transition
      const t = (currentPH - 6) / 1.6;
      return new THREE.Color(1 - t * 0.8, 0.8 - t * 0.4, 0.2 + t * 0.8);
    }
  };

  const liquidColor = getIndicatorColor(calculatedPH, indicatorType);
  const liquidHeight = 0.5 + (dropsAdded / 150) * 1.5;

  // pH curve points for visualization
  const curvePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let d = 0; d <= equivalencePoint * 1.5; d += 1) {
      let ph: number;
      const progress = d / equivalencePoint;

      if (progress < 0.9) {
        ph = 1 + progress * 2.5;
      } else if (progress < 1.1) {
        const t = (progress - 0.9) / 0.2;
        ph = 3.5 + t * 6.5;
      } else {
        ph = 10 + Math.min((progress - 1.1) * 2, 2);
      }

      points.push(new THREE.Vector3(
        (d / (equivalencePoint * 1.5)) * 2.5 - 1.25,
        (ph - 7) * 0.3,
        0
      ));
    }
    return points;
  }, [equivalencePoint]);

  // Current point on curve
  const currentCurvePoint = useMemo(() => {
    const progress = dropsAdded / (equivalencePoint * 1.5);
    return new THREE.Vector3(
      progress * 2.5 - 1.25,
      (calculatedPH - 7) * 0.3,
      0
    );
  }, [dropsAdded, equivalencePoint, calculatedPH]);

  // Handle drops being added
  useEffect(() => {
    const physics = physicsRef.current;
    if (dropsAdded > physics.lastDropsCount) {
      const newDrops = dropsAdded - physics.lastDropsCount;
      for (let i = 0; i < newDrops; i++) {
        const inactiveIndex = physics.drops.findIndex(d => !d.active);
        if (inactiveIndex === -1) break;
        physics.drops[inactiveIndex] = { time: performance.now() + i * 100, active: true };
      }
      physics.lastDropsCount = dropsAdded;
    }
  }, [dropsAdded]);

  useFrame((state, delta) => {
    if (!liquidRef.current) return;
    const dt = Math.min(delta, 0.02);
    const time = state.clock.elapsedTime;
    const physics = physicsRef.current;

    // Animate liquid surface with gentle waves
    const positions = liquidRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.array[i * 3];
      const y = positions.array[i * 3 + 1];
      const waveHeight = isNearEquivalence ? 0.05 : 0.02;
      positions.array[i * 3 + 2] = Math.sin(x * 2 + time * 2) * waveHeight + Math.cos(y * 2 + time * 1.5) * waveHeight;
    }
    positions.needsUpdate = true;

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const newData: TitrationData = {
        dropsAdded,
        currentPH: calculatedPH,
        titrantConcentration,
        analyteVolume,
        indicatorType,
        equivalencePoint,
        isNearEquivalence,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Generate falling drop elements
  const fallingDrops = useMemo(() => {
    const physics = physicsRef.current;
    return physics.drops
      .filter(d => d.active)
      .slice(-5)
      .map((dropData, i) => {
        const elapsed = (performance.now() - dropData.time) / 1000;
        const y = 1.7 - elapsed * 3;
        if (y < 0.5 || elapsed > 0.5) return null;
        return (
          <mesh key={`${dropData.time}-${i}`} position={[0, y, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
              transparent
              opacity={1 - elapsed * 2}
            />
          </mesh>
        );
      });
  }, [dropsAdded]); // Re-render when drops added changes

  return (
    <>
      {/* Burette stand */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Burette */}
      <mesh ref={buretteRef} position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 3, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Titrant liquid in burette */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 2.5, 16, 1, true]} />
        <meshStandardMaterial
          color="#a855f7"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Burette markings */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0.16, 2 + i * 0.25, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {[0, 5].map((i) => (
        <mesh key={`major${i}`} position={[0.16, 2 + i * 0.5, 0]}>
          <boxGeometry args={[0.04, 0.1, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Stopcock */}
      <mesh position={[0, 1.8, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.8, 0.15]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Erlenmeyer flask */}
      <mesh ref={flaskRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 1.5, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flask neck */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Liquid in flask with color based on pH */}
      <mesh ref={liquidRef} position={[0, liquidHeight / 2 - 0.3, 0]}>
        <cylinderGeometry args={[0.7, 1.1, liquidHeight, 32, 16]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={0.75}
          emissive={liquidColor}
          emissiveIntensity={isNearEquivalence ? 0.4 : 0.2}
        />
      </mesh>

      {/* Equivalence point glow effect */}
      {isNearEquivalence && (
        <pointLight
          position={[0, 0.5, 1]}
          color={liquidColor}
          intensity={2}
          distance={3}
        />
      )}

      {/* Falling drops */}
      <group>
        {fallingDrops}
      </group>

      {/* pH meter/display */}
      <group position={[2, 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.1, 0.06]}>
          <boxGeometry args={[0.6, 0.3, 0.02]} />
          <meshStandardMaterial color="#0a0a1e" />
        </mesh>
        {/* pH digits represented as colored segments */}
        <mesh position={[0, 0.1, 0.08]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"}
            emissive={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Indicator color legend */}
      <group position={[-2, 2.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={liquidColor}
            emissive={liquidColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      </group>

      {/* pH Curve visualization */}
      <group position={[-2, 0, 0]}>
        {/* Graph background */}
        <mesh position={[0, 0.5, -0.01]}>
          <planeGeometry args={[3, 2.5]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.95} />
        </mesh>
        {/* Axes */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[2.8, 0.03, 0.02]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-1.3, 0.5, 0]}>
          <boxGeometry args={[0.03, 2.2, 0.02]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        {/* Equivalence point line */}
        <mesh position={[0, -0.6, 0.01]}>
          <boxGeometry args={[0.02, 2.2, 0.02]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
        {/* pH curve using Line from drei */}
        <Line points={curvePoints} color="#8b5cf6" lineWidth={2} />
        {/* Current point indicator */}
        <mesh position={[currentCurvePoint.x, 0.5 + currentCurvePoint.y, 0.02]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"}
            emissive={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"}
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* pH scale labels */}
        {[1, 7, 13].map((ph, i) => (
          <mesh key={i} position={[-1.4, (ph - 7) * 0.3 + 0.5, 0.01]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={ph === 7 ? "#06d6a0" : "#666"} />
          </mesh>
        ))}
      </group>

      {/* Equivalence point indicator */}
      {isNearEquivalence && (
        <group position={[0, 2.5, 0]}>
          <pointLight color="#f59e0b" intensity={3} distance={5} />
          <mesh>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -1, 0]} />
    </>
  );
}

export default TitrationSceneComponent;
