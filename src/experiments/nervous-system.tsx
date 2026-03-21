"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function NervousSystemScene() {
  const neuronRef = useRef<THREE.Group>(null);

  const { impulseSpeed, signalStrength, showMyelin, triggerImpulse } = useControls("Neuron", {
    impulseSpeed: { value: 5, min: 1, max: 10, step: 0.5, label: "Impulse Speed" },
    signalStrength: { value: 1, min: 0.1, max: 2, step: 0.1, label: "Signal Strength" },
    showMyelin: { value: true, label: "Show Myelin Sheath" },
    triggerImpulse: { value: false, label: "Trigger Impulse", render: (get) => get("triggerImpulse") },
  });

  const [impulsePosition, setImpulsePosition] = useState(-1);
  const [impulseActive, setImpulseActive] = useState(false);

  useFrame((_, delta) => {
    if (!neuronRef.current) return;

    // Trigger impulse
    if (triggerImpulse && !impulseActive) {
      setImpulseActive(true);
      setImpulsePosition(0);
    }

    // Move impulse
    if (impulseActive) {
      setImpulsePosition(p => {
        const newP = p + delta * impulseSpeed * 2;
        if (newP > 10) {
          setImpulseActive(false);
          return -1;
        }
        return newP;
      });
    }
  });

  // Neuron structure
  const neuronSegments = 50;
  const dendritePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      positions.push([
        Math.cos(angle) * 0.5,
        Math.sin(angle) * 0.5,
        -3
      ]);
    }
    return positions;
  }, []);

  return (
    <>
      <group ref={neuronRef}>
        {/* Cell body (soma) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#ff69b4"
            emissive="#ff69b4"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Nucleus */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color="#9370db"
            emissive="#9370db"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Dendrites */}
        {dendritePositions.map((pos, i) => (
          <group key={i}>
            <mesh position={pos}>
              <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
              <meshStandardMaterial color="#ff69b4" />
            </mesh>
            {/* Dendrite branches */}
            <mesh position={[pos[0], pos[1] - 1.5, pos[2]]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#ff69b4" />
            </mesh>
            <mesh position={[pos[0], pos[1] - 1.5, pos[2]]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#ff69b4" />
            </mesh>
          </group>
        ))}

        {/* Axon */}
        {Array.from({ length: neuronSegments }).map((_, i) => {
          const x = (i / neuronSegments) * 8 - 4;
          const progress = i / neuronSegments;

          // Check if impulse is at this segment
          const isImpulseHere = impulseActive && Math.abs(impulsePosition - i) < 1;

          return (
            <group key={i}>
              <mesh position={[x, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
                <meshStandardMaterial
                  color={isImpulseHere ? "#ffcc00" : "#ff69b4"}
                  emissive={isImpulseHere ? "#ffcc00" : "#ff69b4"}
                  emissiveIntensity={isImpulseHere ? signalStrength : 0.1}
                />
              </mesh>

              {/* Myelin sheath */}
              {showMyelin && i % 5 === 0 && i < neuronSegments - 5 && (
                <mesh position={[x, 0, 0]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
                  <meshStandardMaterial
                    color="#f0f8ff"
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Axon terminals (synaptic endings) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <group key={i} position={[4, Math.cos(angle) * 0.3, Math.sin(angle) * 0.3]}>
              {/* Terminal button */}
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                  color="#ff69b4"
                  emissive="#ff69b4"
                  emissiveIntensity={impulseActive && impulsePosition > 45 ? signalStrength * 0.5 : 0.1}
                />
              </mesh>

              {/* Synaptic vesicles */}
              {Array.from({ length: 3 }).map((_, j) => (
                <mesh
                  key={j}
                  position={[
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                  ]}
                >
                  <sphereGeometry args={[0.03, 8, 8]} />
                  <meshStandardMaterial
                    color="#4f8fff"
                    emissive="#4f8fff"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              ))}
            </group>
          );
        })}

        {/* Neurotransmitters being released */}
        {impulseActive && impulsePosition > 48 && Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const progress = (impulsePosition - 48) / 2;
          return (
            <mesh
              key={i}
              position={[
                4.3 + progress * 0.5,
                Math.cos(angle) * (0.3 + progress * 0.3),
                Math.sin(angle) * (0.3 + progress * 0.3)
              ]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color="#06d6a0"
                emissive="#06d6a0"
                emissiveIntensity={0.6}
              />
            </mesh>
          );
        })}

        {/* Target neuron (partial) */}
        <mesh position={[5.5, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Resting potential indicator */}
      <mesh position={[-3, 2, 0]}>
        <boxGeometry args={[0.1, -70 + signalStrength * 20, 0.1]} />
        <meshStandardMaterial
          color={signalStrength > 1 ? "#ff6b35" : "#4f8fff"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Action potential graph visualization */}
      <mesh position={[-3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color="#1a1a3e" />
      </mesh>

      {/* Action potential curve */}
      {impulseActive && (
        <mesh position={[-2, 0.5, 0.01]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.5, 0.05, 8, 32, Math.PI]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Labels */}
      <mesh position={[3, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[3, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#f0f8ff" />
      </mesh>
      <mesh position={[3, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[3, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
