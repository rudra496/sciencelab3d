"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Bubble {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "H2" | "O2";
}

export interface ElectrolysisData {
  h2Produced: number;
  o2Produced: number;
  voltage: number;
  electrolyte: string;
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
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [h2Produced, setH2Produced] = useState(0);
  const [o2Produced, setO2Produced] = useState(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!bubblesRef.current) return;
    const dt = Math.min(delta, 0.02);

    // Generate new bubbles based on voltage (only when running)
    if (isRunning && Math.random() < voltage * 0.02) {
      const isH2 = Math.random() < 0.66; // 2:1 ratio of H2:O2
      const newBubble: Bubble = {
        position: new THREE.Vector3(
          isH2 ? -1.5 : 1.5,
          -1.5,
          (Math.random() - 0.5) * 0.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          0.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.1
        ),
        type: isH2 ? "H2" : "O2",
      };
      
      setBubbles(prev => {
        const updated = [...prev.slice(-100), newBubble];
        
        // Update production counts
        if (isH2) {
          setH2Produced(prev => prev + 1);
        } else {
          setO2Produced(prev => prev + 1);
        }
        
        return updated;
      });
    }

    // Update bubble positions
    setBubbles(prev => {
      const updated = prev
        .map(b => {
          b.position.add(b.velocity.clone().multiplyScalar(dt * (voltage / 5)));
          return b;
        })
        .filter(b => b.position.y < 2.5);
      return updated;
    });

    // Update instance matrices
    const maxBubbles = 100;
    for (let i = 0; i < maxBubbles; i++) {
      if (i < bubbles.length) {
        const bubble = bubbles[i];
        dummy.position.copy(bubble.position);
        const size = bubble.type === "H2" ? 0.06 : 0.1;
        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    bubblesRef.current.instanceMatrix.needsUpdate = true;
  });

  // Report data changes
  useEffect(() => {
    onDataChange?.({
      h2Produced,
      o2Produced,
      voltage,
      electrolyte
    });
  }, [h2Produced, o2Produced, voltage, electrolyte, onDataChange]);

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
          opacity={0.2}
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
          emissiveIntensity={voltage * 0.05}
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
          emissiveIntensity={voltage * 0.05}
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

      {/* Wires */}
      <mesh position={[-1.5, 1.5, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshStandardMaterial color="#b8860b" />
      </mesh>
      <mesh position={[1.5, 1.5, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshStandardMaterial color="#b8860b" />
      </mesh>

      {/* Bubbles */}
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
          metalness={0.1}
          roughness={0.1}
        />
      </instancedMesh>

      {/* Gas collection tubes */}
      <mesh position={[-1.5, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[1.5, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-1.5, 3, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[1.5, 3, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}

export default ElectrolysisSceneComponent;
