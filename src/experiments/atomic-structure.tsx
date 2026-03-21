"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

interface ElectronData {
  angle: number;
  speed: number;
  radius: number;
  inclination: number;
}

export default function AtomicStructureScene() {
  const nucleusRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.InstancedMesh>(null);

  const { protons, neutrons, electronSpeed } = useControls("Atom", {
    protons: { value: 6, min: 1, max: 18, step: 1, label: "Protons" },
    neutrons: { value: 6, min: 0, max: 20, step: 1, label: "Neutrons" },
    electronSpeed: { value: 1, min: 0.2, max: 3, step: 0.1, label: "Electron Speed" },
  });

  const electrons = protons;

  // Electron configuration by shell
  const getElectronConfiguration = (numElectrons: number) => {
    const shells: number[] = [];
    let remaining = numElectrons;
    const capacities = [2, 8, 18, 32];

    for (const capacity of capacities) {
      if (remaining <= 0) break;
      const inShell = Math.min(remaining, capacity);
      shells.push(inShell);
      remaining -= inShell;
    }
    return shells;
  };

  const shellConfig = getElectronConfiguration(electrons);

  const electronData = useMemo<ElectronData[]>(() => {
    const data: ElectronData[] = [];
    let shellIndex = 0;
    let electronsInShell = 0;

    for (let i = 0; i < electrons; i++) {
      const shellCapacity = shellConfig[shellIndex] || 2;
      const radius = 1.5 + shellIndex * 0.8;

      if (electronsInShell >= shellCapacity) {
        shellIndex++;
        electronsInShell = 0;
      }

      const angle = (electronsInShell / (shellConfig[shellIndex] || 1)) * Math.PI * 2;
      const inclination = (i % 3) * (Math.PI / 3);

      data.push({
        angle,
        speed: 1 / radius,
        radius,
        inclination,
      });

      electronsInShell++;
    }
    return data;
  }, [electrons, shellConfig]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!electronsRef.current || !nucleusRef.current) return;
    const dt = Math.min(delta, 0.02);

    // Rotate nucleus
    nucleusRef.current.rotation.y += dt * 0.2;

    // Update electrons
    for (let i = 0; i < electrons; i++) {
      const electron = electronData[i];
      electron.angle += electron.speed * electronSpeed * dt;

      const x = Math.cos(electron.angle) * electron.radius;
      const y = Math.sin(electron.angle) * electron.radius * Math.sin(electron.inclination);
      const z = Math.sin(electron.angle) * electron.radius * Math.cos(electron.inclination);

      dummy.position.set(x, y, z);
      dummy.scale.set(0.1, 0.1, 0.1);
      dummy.updateMatrix();
      electronsRef.current.setMatrixAt(i, dummy.matrix);
    }
    electronsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Electron shells */}
      {shellConfig.map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5 + i * 0.8, 0.01, 8, 64]} />
          <meshBasicMaterial color="#4f8fff" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Nucleus */}
      <group ref={nucleusRef}>
        {/* Protons */}
        {Array.from({ length: protons }).map((_, i) => {
          const phi = Math.acos(1 - 2 * (i + 0.5) / (protons + neutrons));
          const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
          const r = 0.3;
          return (
            <mesh key={`p-${i}`} position={[
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi)
            ]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
            </mesh>
          );
        })}
        {/* Neutrons */}
        {Array.from({ length: neutrons }).map((_, i) => {
          const phi = Math.acos(1 - 2 * (i + 0.5 + protons) / (protons + neutrons));
          const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5 + protons);
          const r = 0.3;
          return (
            <mesh key={`n-${i}`} position={[
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi)
            ]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Electrons */}
      <instancedMesh ref={electronsRef} args={[undefined, undefined, electrons]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Legend */}
      <mesh position={[-4, 3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-4, 2.5, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[-4, 2, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
