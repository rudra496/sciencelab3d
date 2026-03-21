"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

interface Electron {
  position: number;
  speed: number;
}

export default function OhmsLawScene() {
  const electronsRef = useRef<THREE.InstancedMesh>(null);

  const { voltage, resistance } = useControls("Circuit", {
    voltage: { value: 5, min: 1, max: 12, step: 0.5, label: "Voltage (V)" },
    resistance: { value: 10, min: 1, max: 50, step: 1, label: "Resistance (Ω)" },
  });

  // Ohm's Law: I = V / R
  const current = voltage / resistance;
  const power = voltage * current;

  const numElectrons = 50;
  const electrons = useMemo<Electron[]>(() => {
    const e: Electron[] = [];
    for (let i = 0; i < numElectrons; i++) {
      e.push({
        position: Math.random() * Math.PI * 2,
        speed: 0,
      });
    }
    return e;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!electronsRef.current) return;
    const dt = Math.min(delta, 0.02);

    for (let i = 0; i < numElectrons; i++) {
      const electron = electrons[i];

      // Speed proportional to current
      electron.speed = current * 2;
      electron.position += electron.speed * dt;

      if (electron.position > Math.PI * 2) {
        electron.position -= Math.PI * 2;
      }

      const angle = electron.position;
      const radius = 1.2;
      dummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
      dummy.scale.set(0.08, 0.08, 0.08);
      dummy.updateMatrix();
      electronsRef.current.setMatrixAt(i, dummy.matrix);
    }
    electronsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Circuit board base */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Circuit wire path */}
      <mesh position={[0, 0, -0.05]}>
        <torusGeometry args={[1.2, 0.15, 8, 64]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Battery */}
      <mesh position={[-1.2, 0, 0.1]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-1.2, 0.5, 0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} />
      </mesh>

      {/* Resistor */}
      <mesh position={[1.2, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[1.2, -0.2 + i * 0.13, 0.15]}>
          <boxGeometry args={[0.02, 0.08, 0.02]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      ))}

      {/* LED */}
      <mesh position={[0, 1.2, 0.1]} rotation={[0, 0, Math.PI]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={current * 0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Electrons */}
      <instancedMesh ref={electronsRef} args={[undefined, undefined, numElectrons]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.5}
        />
      </instancedMesh>

      {/* Current flow arrow */}
      <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color="#06d6a0"
          emissive="#06d6a0"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Voltage indicator */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[0.4, voltage * 0.15, 0.1]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Power indicator */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.1 + power * 0.02, 16, 16]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Component labels */}
      <mesh position={[-1.2, -0.7, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[1.2, -0.4, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[10, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />
    </>
  );
}
