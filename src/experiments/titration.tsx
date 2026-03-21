"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

export default function TitrationScene() {
  const buretteRef = useRef<THREE.Mesh>(null);
  const flaskRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const dropsRef = useRef<THREE.Group>(null);

  const { titrantConcentration, analyteVolume, indicatorType } = useControls("Titration", {
    titrantConcentration: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: "Titrant (M)" },
    analyteVolume: { value: 25, min: 10, max: 50, step: 1, label: "Analyte (mL)" },
    indicatorType: {
      value: "phenolphthalein",
      options: ["phenolphthalein", "methyl-orange", "bromothymol"],
      label: "Indicator"
    },
    addDrop: button(() => addTitrationDrop()),
    reset: button(() => resetTitration()),
  });

  const [dropsAdded, setDropsAdded] = useState(0);
  const [pH, setPH] = useState(1);
  const [currentDrops, setCurrentDrops] = useState<number[]>([]);

  const equivalencePoint = 25; // Drops to reach equivalence

  function addTitrationDrop() {
    setDropsAdded(prev => prev + 1);
    setCurrentDrops(prev => [...prev, Date.now()]);
  }

  function resetTitration() {
    setDropsAdded(0);
    setPH(1);
    setCurrentDrops([]);
  }

  // Calculate pH based on titration progress
  const titrationProgress = Math.min(dropsAdded / equivalencePoint, 1.5);
  const calculatedPH = titrationProgress < 1
    ? 1 + titrationProgress * 6
    : 7 + (titrationProgress - 1) * 7;

  const getIndicatorColor = (currentPH: number, indicator: string) => {
    if (indicator === "phenolphthalein") {
      return currentPH > 8.2 ? "#ff69b4" : "#ffffff";
    } else if (indicator === "methyl-orange") {
      return currentPH > 4.4 ? "#ffff00" : "#ff0000";
    } else {
      return currentPH > 7 ? "#0000ff" : "#ffff00";
    }
  };

  const liquidColor = getIndicatorColor(calculatedPH, indicatorType);

  useFrame((_, delta) => {
    if (!liquidRef.current) return;
    const time = performance.now() * 0.001;

    // Animate liquid surface
    const positions = liquidRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.array[i * 3];
      const y = positions.array[i * 3 + 1];
      positions.array[i * 3 + 2] = Math.sin(x * 2 + time) * 0.02 + Math.cos(y * 2 + time) * 0.02;
    }
    positions.needsUpdate = true;
  });

  const liquidHeight = 0.5 + (dropsAdded / 100);

  return (
    <>
      {/* Burette stand */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.8, 0]}>
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

      {/* Burette markings */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0.16, 2 + i * 0.25, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Stopcock */}
      <mesh position={[0, 1.8, 0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
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

      {/* Liquid in flask */}
      <mesh ref={liquidRef} position={[0, liquidHeight / 2 - 0.3, 0]}>
        <cylinderGeometry args={[0.7, 1.1, liquidHeight, 32, 16]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={0.7}
          emissive={liquidColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Falling drops */}
      <group ref={dropsRef}>
        {currentDrops.slice(-5).map((dropTime, i) => {
          const elapsed = (performance.now() - dropTime) / 1000;
          const y = 1.7 - elapsed * 3;
          if (y < 0.5) return null;
          return (
            <mesh key={dropTime} position={[0, y, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* pH meter/display */}
      <mesh position={[2, 2, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[2.1, 2.1, 0.06]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"} />
      </mesh>

      {/* Indicator legend */}
      <mesh position={[-2, 2.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={liquidColor} />
      </mesh>

      {/* Titration curve visualization (simplified) */}
      <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[1.5, 3]} />
        <meshBasicMaterial color="#1a1a3e" />
      </mesh>
      <mesh position={[-2, 0.5, 0.01]}>
        <boxGeometry args={[0.02, titrationProgress * 2, 0.02]} />
        <meshStandardMaterial
          color={calculatedPH > 7 ? "#4f8fff" : calculatedPH < 7 ? "#ff6b35" : "#06d6a0"}
        />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -1, 0]} />
    </>
  );
}
