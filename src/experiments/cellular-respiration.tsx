"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function CellularRespirationScene() {
  const mitochondriaRef = useRef<THREE.Group>(null);

  const { glucoseLevel, oxygenLevel, atpProduction, cycleStage, rotationSpeed } = useControls("Cellular Respiration", {
    glucoseLevel: { value: 5, min: 1, max: 10, step: 0.5, label: "Glucose Input" },
    oxygenLevel: { value: 5, min: 1, max: 10, step: 0.5, label: "O₂ Level" },
    atpProduction: { value: 5, min: 1, max: 10, step: 0.5, label: "ATP Production Rate" },
    cycleStage: { value: 0, min: 0, max: 3, step: 0.01, label: "Cycle Stage (0-3)" },
    rotationSpeed: { value: 0.2, min: 0, max: 0.5, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!mitochondriaRef.current) return;
    mitochondriaRef.current.rotation.y += delta * rotationSpeed;
  });

  // Calculate ATP based on inputs
  const atpCount = Math.floor((glucoseLevel * oxygenLevel * atpProduction) / 10);

  return (
    <>
      <group ref={mitochondriaRef}>
        {/* Mitochondria outer membrane */}
        <mesh>
          <capsuleGeometry args={[1.2, 2.5, 32, 16]} />
          <meshStandardMaterial
            color="#ff6347"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner membrane with cristae */}
        <mesh scale={0.85}>
          <capsuleGeometry args={[1.2, 2.5, 32, 16]} />
          <meshStandardMaterial
            color="#ff4500"
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* Cristae (folds in inner membrane) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.7,
                (Math.random() - 0.5) * 1.5,
                Math.sin(angle) * 0.7
              ]}
              rotation={[angle, 0, 0]}
            >
              <planeGeometry args={[0.4, 0.8]} />
              <meshStandardMaterial
                color="#ff6347"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

        {/* Matrix (inner space) */}
        <mesh position={[0, 0, 0]} scale={0.6}>
          <capsuleGeometry args={[1, 2, 32, 16]} />
          <meshStandardMaterial
            color="#ffd700"
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Glycolysis (stage 0) - occurring in cytoplasm */}
        {cycleStage < 1 && (
          <group position={[0, 2, 0]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Glucose molecules */}
            {Array.from({ length: Math.floor(glucoseLevel / 2) }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos(i * Math.PI / 2) * 0.5,
                  0.4,
                  Math.sin(i * Math.PI / 2) * 0.5
                ]}
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#8b5cf6" />
              </mesh>
            ))}
          </group>
        )}

        {/* Krebs Cycle (stage 1-2) - in matrix */}
        {cycleStage >= 1 && cycleStage < 2 && (
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.3, 0.05, 8, 32]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}

        {/* Electron Transport Chain (stage 2-3) - on inner membrane */}
        {cycleStage >= 2 && (
          <>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + cycleStage * 2;
              const r = 0.9;
              return (
                <mesh key={i} position={[
                  Math.cos(angle) * r,
                  Math.sin(angle) * 0.6,
                  Math.sin(angle) * r
                ]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial
                    color="#ff6b35"
                    emissive="#ff6b35"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              );
            })}

            {/* ATP Synthase enzymes */}
            <mesh position={[0.9, 0, 0]}>
              <coneGeometry args={[0.12, 0.3, 8]} />
              <meshStandardMaterial
                color="#ffcc00"
                emissive="#ffcc00"
                emissiveIntensity={0.5}
              />
            </mesh>
          </>
        )}

        {/* ATP molecules being produced */}
        {Array.from({ length: atpCount }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 1.5,
              0.5 + Math.random() * 1,
              (Math.random() - 0.5) * 1.5
            ]}
          >
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color="#ff6b35"
              emissive="#ff6b35"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

        {/* Oxygen molecules */}
        {Array.from({ length: Math.floor(oxygenLevel / 2) }).map((_, i) => {
          const angle = (i / (oxygenLevel / 2)) * Math.PI * 2 + performance.now() * 0.001;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 1.5,
                0.5 + Math.random() * 0.5,
                Math.sin(angle) * 1.5
              ]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        })}

        {/* CO2 byproduct */}
        {cycleStage >= 1 && Array.from({ length: 4 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              1.8 + Math.random() * 0.3,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 1
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#8b5cf6"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Stage indicator */}
      <mesh position={[2.5, 1.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={cycleStage < 1 ? "#4f8fff" : cycleStage < 2 ? "#06d6a0" : "#ff6b35"} />
      </mesh>

      {/* ATP counter */}
      <mesh position={[2.5, 1, 0]}>
        <sphereGeometry args={[0.1 + atpCount * 0.01, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Legend */}
      <mesh position={[-2.5, 2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[-2, 2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-1.5, 2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
