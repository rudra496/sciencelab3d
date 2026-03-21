"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function PhotosynthesisScene() {
  const chloroplastRef = useRef<THREE.Group>(null);

  const { lightIntensity, co2Level, waterLevel, cyclePhase, rotationSpeed } = useControls("Photosynthesis", {
    lightIntensity: { value: 5, min: 1, max: 10, step: 0.5, label: "Light Intensity" },
    co2Level: { value: 5, min: 1, max: 10, step: 0.5, label: "CO₂ Level" },
    waterLevel: { value: 5, min: 1, max: 10, step: 0.5, label: "H₂O Level" },
    cyclePhase: { value: 0, min: 0, max: 1, step: 0.01, label: "Cycle Phase" },
    rotationSpeed: { value: 0.15, min: 0, max: 0.5, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!chloroplastRef.current) return;
    chloroplastRef.current.rotation.y += delta * rotationSpeed;
  });

  // Calculate production rates
  const atpProduction = Math.min(lightIntensity / 2, 5);
  const glucoseProduction = Math.min(co2Level * waterLevel / 10, 5);

  return (
    <>
      <group ref={chloroplastRef}>
        {/* Chloroplast outer membrane */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[1.8, 3, 32, 16]} />
          <meshStandardMaterial
            color="#06d6a0"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Thylakoid membranes (grana stacks) */}
        {Array.from({ length: 5 }).map((_, stackIndex) => {
          const stackX = (stackIndex - 2) * 0.7;
          return (
            <group key={stackIndex} position={[stackX, 0, 0]}>
              {Array.from({ length: 4 }).map((_, i) => (
                <mesh key={i} position={[0, 0, (i - 1.5) * 0.15]}>
                  <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
                  <meshStandardMaterial
                    color="#228b22"
                    emissive="#228b22"
                    emissiveIntensity={0.2}
                  />
                </mesh>
              ))}
              {/* Stroma lamellae connecting stacks */}
              {stackIndex < 4 && (
                <mesh position={[0.35, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
                  <meshStandardMaterial color="#06d6a0" transparent opacity={0.3} />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Light reactions - ATP production visualization */}
        {lightIntensity > 0 && (
          <>
            {/* Light energy */}
            <mesh position={[0, 1.2, 0.5]}>
              <sphereGeometry args={[0.1 + lightIntensity * 0.03, 16, 16]} />
              <meshStandardMaterial
                color="#ffcc00"
                emissive="#ffcc00"
                emissiveIntensity={lightIntensity * 0.1}
              />
            </mesh>

            {/* ATP molecules */}
            {Array.from({ length: Math.floor(atpProduction) }).map((_, i) => (
              <mesh key={i} position={[
                (Math.random() - 0.5) * 2,
                0.8 + Math.random() * 0.5,
                0.5 + Math.random() * 0.3
              ]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                  color="#ff6b35"
                  emissive="#ff6b35"
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}

            {/* Electron transport chain */}
            <mesh position={[0, 0, 0.8]}>
              <torusGeometry args={[0.8, 0.03, 8, 32]} />
              <meshStandardMaterial
                color="#ff6347"
                emissive="#ff6347"
                emissiveIntensity={0.3}
              />
            </mesh>
          </>
        )}

        {/* Calvin Cycle - CO2 fixation */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial
            color="#4f8fff"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* CO2 molecules */}
        {Array.from({ length: Math.floor(co2Level) }).map((_, i) => {
          const angle = (i / co2Level) * Math.PI * 2 + cyclePhase * Math.PI * 2;
          return (
            <mesh key={i} position={[
              Math.cos(angle) * 0.8,
              -0.8,
              Math.sin(angle) * 0.8
            ]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        })}

        {/* Water molecules */}
        {Array.from({ length: Math.floor(waterLevel) }).map((_, i) => {
          const angle = (i / waterLevel) * Math.PI * 2 + cyclePhase * Math.PI * 2;
          return (
            <group key={i} position={[
              Math.cos(angle) * 1.2,
              -0.6 + Math.sin(angle) * 0.3,
              Math.sin(angle) * 1.2
            ]}>
              <mesh>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#4f8fff" />
              </mesh>
              <mesh position={[0.06, 0.06, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[-0.06, 0.06, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}

        {/* Glucose product */}
        {glucoseProduction > 2 && (
          <mesh position={[0, -1.5, 0]}>
            <sphereGeometry args={[0.15 + glucoseProduction * 0.02, 16, 16]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}

        {/* Oxygen byproduct */}
        {Array.from({ length: Math.floor(lightIntensity / 2) }).map((_, i) => (
          <mesh key={i} position={[
            1.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 1
          ]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Sun light rays */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3 + lightIntensity * 0.05, 32, 32]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={lightIntensity * 0.15}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[2.5, 1.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[2.5, 1, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[2.5, 0.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[2.5, -0.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
