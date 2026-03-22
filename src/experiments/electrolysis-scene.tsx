"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Bubble {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "H2" | "O2";
  active: boolean;
}

export interface ElectrolysisData {
  h2Produced: number;
  o2Produced: number;
  voltage: number;
  electrolyte: string;
  currentFlow: number;
  efficiency: number;
}

export interface ElectrolysisSceneProps {
  voltage: number;
  electrolyte: "water" | "copper-sulfate";
  isRunning: boolean;
  onDataChange?: (data: ElectrolysisData) => void;
}

/**
 * Electrolysis scene component
 * Visualizes electrolysis of water and copper sulfate solutions
 */
export function ElectrolysisSceneComponent({
  voltage,
  electrolyte,
  isRunning,
  onDataChange
}: ElectrolysisSceneProps) {
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const cathodeRef = useRef<THREE.Mesh>(null);
  const anodeRef = useRef<THREE.Mesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    bubbles: [] as Bubble[],
    frameCount: 0,
    h2Produced: 0,
    o2Produced: 0,
    lastBubbleTime: 0
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [data, setData] = useState<ElectrolysisData>({
    h2Produced: 0,
    o2Produced: 0,
    voltage,
    electrolyte,
    currentFlow: 0,
    efficiency: 0,
  });

  // Initialize bubbles pool
  useEffect(() => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 150; i++) {
      bubbles.push({
        position: new THREE.Vector3(0, -100, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        type: "H2",
        active: false,
      });
    }
    physicsRef.current.bubbles = bubbles;
  }, []);

  useFrame((state, delta) => {
    if (!bubblesRef.current) return;
    const dt = Math.min(delta, 0.02);
    const physics = physicsRef.current;
    const time = state.clock.elapsedTime;

    const maxBubbles = 150;
    const bubbleSpawnRate = voltage * 0.03;

    // Generate new bubbles based on voltage (only when running)
    if (isRunning && time - physics.lastBubbleTime > (1 / bubbleSpawnRate)) {
      // Find inactive bubble slots
      for (let i = 0; i < 2; i++) { // Try to spawn up to 2 bubbles
        const inactiveIndex = physics.bubbles.findIndex(b => !b.active);
        if (inactiveIndex === -1) break;

        const isH2 = Math.random() < 0.66; // 2:1 ratio of H2:O2 (theoretical)
        const bubble = physics.bubbles[inactiveIndex];

        bubble.position.set(
          isH2 ? -1.5 : 1.5,
          -1.5,
          (Math.random() - 0.5) * 0.5
        );
        bubble.velocity.set(
          (Math.random() - 0.5) * 0.1,
          0.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.1
        );
        bubble.type = isH2 ? "H2" : "O2";
        bubble.active = true;

        // Update production counts
        if (isH2) {
          physics.h2Produced++;
        } else {
          physics.o2Produced++;
        }
      }
      physics.lastBubbleTime = time;
    }

    // Update bubble positions
    for (let i = 0; i < maxBubbles; i++) {
      const bubble = physics.bubbles[i];

      if (bubble.active) {
        // Apply voltage-based speed
        const speed = voltage / 5;
        bubble.position.add(bubble.velocity.clone().multiplyScalar(dt * speed));

        // Add slight wobble for realism
        bubble.position.x += Math.sin(time * 3 + i) * 0.002;
        bubble.position.z += Math.cos(time * 2 + i) * 0.002;

        // Deactivate if above surface
        if (bubble.position.y > 2.5) {
          bubble.active = false;
          bubble.position.y = -100;
        }
      }

      // Update instance matrix
      if (bubble.active) {
        dummy.position.copy(bubble.position);
        const size = bubble.type === "H2" ? 0.06 : 0.1;
        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    bubblesRef.current.instanceMatrix.needsUpdate = true;

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const currentFlow = isRunning ? (voltage / 10) * 0.5 : 0;
      const efficiency = isRunning ? 85 + Math.random() * 10 : 0;

      const newData: ElectrolysisData = {
        h2Produced: physics.h2Produced,
        o2Produced: physics.o2Produced,
        voltage,
        electrolyte,
        currentFlow,
        efficiency,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  return (
    <>
      {/* Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 4, 2]} />
        <meshStandardMaterial
          color="#1a1a3e"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Electrolyte solution */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4.8, 3, 1.8]} />
        <meshStandardMaterial
          color={electrolyte === "water" ? "#4f8fff" : "#8b5cf6"}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Liquid surface waves */}
      <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 1.8, 16, 8]} />
        <meshStandardMaterial
          color={electrolyte === "water" ? "#4f8fff" : "#8b5cf6"}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cathode (negative electrode) */}
      <mesh ref={cathodeRef} position={[-1.5, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.9}
          roughness={0.1}
          emissive="#8b5cf6"
          emissiveIntensity={isRunning ? voltage * 0.08 : 0}
        />
      </mesh>

      {/* Anode (positive electrode) */}
      <mesh ref={anodeRef} position={[1.5, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
        <meshStandardMaterial
          color="#ff6b35"
          metalness={0.9}
          roughness={0.1}
          emissive="#ff6b35"
          emissiveIntensity={isRunning ? voltage * 0.08 : 0}
        />
      </mesh>

      {/* Battery/power source */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[1, 0.4, 0.3]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.3, 2.7, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[0.3, 2.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Power indicator light */}
      <mesh position={[0, 2.5, 0.16]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={isRunning ? "#22c55e" : "#666"}
          emissive={isRunning ? "#22c55e" : "#666"}
          emissiveIntensity={isRunning ? 1 : 0}
        />
      </mesh>

      {/* Wires */}
      <mesh position={[-1.5, 1.5, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 1.5, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bubbles */}
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, 150]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </instancedMesh>

      {/* Gas collection tubes with volume markings */}
      <group position={[-1.5, 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 16, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* H2 label */}
        <mesh position={[0, 0.8, 0.31]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        {/* Volume markings */}
        {[0.2, 0.4, 0.6].map((h, i) => (
          <mesh key={i} position={[0, -0.5 + h, 0.31]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshBasicMaterial color="#666" />
          </mesh>
        ))}
      </group>

      <group position={[1.5, 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 16, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* O2 label */}
        <mesh position={[0, 0.8, 0.31]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        {/* Volume markings */}
        {[0.2, 0.4, 0.6].map((h, i) => (
          <mesh key={i} position={[0, -0.5 + h, 0.31]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshBasicMaterial color="#666" />
          </mesh>
        ))}
      </group>

      {/* Electrode labels */}
      <group position={[-2.2, -1, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </group>
      <group position={[2.2, -1, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
      </group>

      {/* Chemical equation hint */}
      <group position={[0, -2.8, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.15, 0.02]} />
          <meshBasicMaterial color={electrolyte === "water" ? "#4f8fff" : "#8b5cf6"} />
        </mesh>
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}

export default ElectrolysisSceneComponent;
