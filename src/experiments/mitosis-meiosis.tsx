"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function MitosisMeiosisScene() {
  const cellRef = useRef<THREE.Group>(null);
  const chromosomesRef = useRef<THREE.Group>(null);

  const { divisionType, stage, animationSpeed, showSpindle } = useControls("Cell Division", {
    divisionType: {
      value: "mitosis",
      options: ["mitosis", "meiosis"],
      label: "Division Type"
    },
    stage: { value: 0, min: 0, max: 4, step: 0.01, label: "Stage (0-4)" },
    animationSpeed: { value: 0.3, min: 0.1, max: 1, step: 0.05, label: "Animation Speed" },
    showSpindle: { value: true, label: "Show Spindle Fibers" },
  });

  useFrame((_, delta) => {
    if (!cellRef.current || !chromosomesRef.current) return;
    cellRef.current.rotation.y += delta * animationSpeed * 0.2;
  });

  // Stages: 0=Interphase, 1=Prophase, 2=Metaphase, 3=Anaphase, 4=Telophase
  const getChromosomePositions = () => {
    const positions: Array<{ x: number; y: number; z: number; rotated: boolean }> = [];

    if (stage < 1) {
      // Interphase - chromatin diffuse
      for (let i = 0; i < 8; i++) {
        positions.push({
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5,
          rotated: false,
        });
      }
    } else if (stage < 2) {
      // Prophase - chromosomes condense
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        positions.push({
          x: Math.cos(angle) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: Math.sin(angle) * 0.3,
          rotated: true,
        });
      }
    } else if (stage < 3) {
      // Metaphase - align at equator
      for (let i = 0; i < 4; i++) {
        positions.push({
          x: (i - 1.5) * 0.2,
          y: 0,
          z: 0,
          rotated: true,
        });
      }
    } else {
      // Anaphase/Telophase - separate
      const separation = (stage - 3) * 2;
      for (let i = 0; i < 4; i++) {
        positions.push({
          x: (i - 1.5) * 0.2,
          y: separation,
          z: 0,
          rotated: true,
        });
        positions.push({
          x: (i - 1.5) * 0.2,
          y: -separation,
          z: 0,
          rotated: true,
        });
      }
    }

    return positions;
  };

  const chromosomePositions = getChromosomePositions();
  const daughterCellSeparation = Math.max(0, (stage - 3.5) * 3);

  return (
    <>
      <group ref={cellRef}>
        {/* Mother cell or dividing cells */}
        {stage < 4 ? (
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial
              color="#ff69b4"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        ) : (
          <>
            <mesh position={[0, daughterCellSeparation, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshStandardMaterial
                color="#ff69b4"
                transparent
                opacity={0.2}
              />
            </mesh>
            <mesh position={[0, -daughterCellSeparation, 0]}>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshStandardMaterial
                color="#ff69b4"
                transparent
                opacity={0.2}
              />
            </mesh>
          </>
        )}

        {/* Nucleus (visible until prophase) */}
        {stage < 1 && (
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial
              color="#9370db"
              transparent
              opacity={0.3}
            />
          </mesh>
        )}

        {/* Spindle fibers */}
        {showSpindle && stage >= 1 && stage < 4 && (
          <>
            <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            <mesh position={[1.2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            <mesh position={[-1.2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
          </>
        )}

        {/* Centrosomes */}
        {stage >= 1 && (
          <>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, -1.2, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.4} />
            </mesh>
          </>
        )}

        {/* Chromosomes */}
        <group ref={chromosomesRef}>
          {chromosomePositions.map((pos, i) => {
            const isMeiosis = divisionType === "meiosis";
            const chromosomeColor = isMeiosis ? "#8b5cf6" : "#ff6b35";

            return (
              <group key={i} position={[pos.x, pos.y, pos.z]}>
                {/* Chromosome (X shape when condensed) */}
                {pos.rotated ? (
                  <>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                      <cylinderGeometry args={[0.04, 0.25, 8]} />
                      <meshStandardMaterial color={chromosomeColor} />
                    </mesh>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
                      <cylinderGeometry args={[0.04, 0.25, 8]} />
                      <meshStandardMaterial color={chromosomeColor} />
                    </mesh>
                    {/* Centromere */}
                    <mesh>
                      <sphereGeometry args={[0.05, 8, 8]} />
                      <meshStandardMaterial color="#ffffff" />
                    </mesh>
                  </>
                ) : (
                  /* Uncondensed chromatin */
                  <mesh>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#9370db" transparent opacity={0.5} />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>

        {/* Cleavage furrow (late telophase) */}
        {stage > 3.5 && (
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.5, 0.05, 8, 32]} />
            <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.3} />
          </mesh>
        )}
      </group>

      {/* Stage indicator */}
      <mesh position={[2.5, 2, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={stage < 1 ? "#9370db" : stage < 2 ? "#4f8fff" : stage < 3 ? "#ffcc00" : stage < 4 ? "#ff6b35" : "#06d6a0"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Division type label */}
      <mesh position={[2.5, 1.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={divisionType === "mitosis" ? "#ff6b35" : "#8b5cf6"} />
      </mesh>

      {/* Labels */}
      <mesh position={[2.5, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#9370db" />
      </mesh>
      <mesh position={[2.5, -0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
