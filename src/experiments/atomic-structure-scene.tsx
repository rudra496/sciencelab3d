"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

// Element data for Z=1 to 20 (Hydrogen to Calcium)
const ELEMENTS: Record<number, { name: string; symbol: string; massNumber: number }> = {
  1: { name: "Hydrogen", symbol: "H", massNumber: 1 },
  2: { name: "Helium", symbol: "He", massNumber: 4 },
  3: { name: "Lithium", symbol: "Li", massNumber: 7 },
  4: { name: "Beryllium", symbol: "Be", massNumber: 9 },
  5: { name: "Boron", symbol: "B", massNumber: 11 },
  6: { name: "Carbon", symbol: "C", massNumber: 12 },
  7: { name: "Nitrogen", symbol: "N", massNumber: 14 },
  8: { name: "Oxygen", symbol: "O", massNumber: 16 },
  9: { name: "Fluorine", symbol: "F", massNumber: 19 },
  10: { name: "Neon", symbol: "Ne", massNumber: 20 },
  11: { name: "Sodium", symbol: "Na", massNumber: 23 },
  12: { name: "Magnesium", symbol: "Mg", massNumber: 24 },
  13: { name: "Aluminum", symbol: "Al", massNumber: 27 },
  14: { name: "Silicon", symbol: "Si", massNumber: 28 },
  15: { name: "Phosphorus", symbol: "P", massNumber: 31 },
  16: { name: "Sulfur", symbol: "S", massNumber: 32 },
  17: { name: "Chlorine", symbol: "Cl", massNumber: 35 },
  18: { name: "Argon", symbol: "Ar", massNumber: 40 },
  19: { name: "Potassium", symbol: "K", massNumber: 39 },
  20: { name: "Calcium", symbol: "Ca", massNumber: 40 },
};

// Bohr radii in Angstroms (scaled for visualization)
const BOHR_RADII = [0.53, 2.12, 4.77, 8.47]; // n=1,2,3,4
const SCALE_FACTOR = 0.8; // Scale for better visualization

// Shell capacities for n=1,2,3,4
const SHELL_CAPACITIES = [2, 8, 8, 2]; // 2,8,8,2 rule for first 20 elements

interface Electron {
  angle: number;
  speed: number;
  shell: number;
  trail: THREE.Vector3[];
}

interface ShellElectrons {
  shell: number;
  count: number;
}

export interface AtomicStructureData {
  elementName: string;
  symbol: string;
  atomicNumber: number;
  massNumber: number;
  electronConfig: string;
  shellElectrons: ShellElectrons[];
}

export interface AtomicStructureSceneProps {
  atomicNumber: number;
  showElectronShells: boolean;
  animationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: AtomicStructureData) => void;
}

/**
 * Atomic Structure scene component
 * Visualizes Bohr model with nucleus and electron shells
 */
export function AtomicStructureSceneComponent({
  atomicNumber,
  showElectronShells,
  animationSpeed,
  isPlaying,
  onDataChange,
}: AtomicStructureSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.InstancedMesh>(null);
  const nucleusGroupRef = useRef<THREE.Group>(null);

  // Physics refs (no React state for physics)
  const electronsRef_physics = useRef<Electron[]>([]);
  const frameCountRef = useRef(0);
  const dataUpdateTimerRef = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Calculate electron configuration using 2,8,8,2 rule
  const getElectronConfiguration = (z: number): number[] => {
    const config: number[] = [];
    let remaining = z;

    for (let i = 0; i < SHELL_CAPACITIES.length && remaining > 0; i++) {
      const inShell = Math.min(remaining, SHELL_CAPACITIES[i]);
      config.push(inShell);
      remaining -= inShell;
    }

    return config;
  };

  // Initialize electrons when atomic number changes
  useEffect(() => {
    const config = getElectronConfiguration(atomicNumber);
    const els: Electron[] = [];

    config.forEach((count: number, shellIdx: number) => {
      const n = shellIdx + 1; // Principal quantum number
      // Electron speed is inversely proportional to n (Bohr model: v ∝ 1/n)
      const baseSpeed = 2.0 / n;

      for (let i = 0; i < count; i++) {
        // Distribute electrons around the shell
        const angleOffset = (i / count) * Math.PI * 2;
        // Add some orbital inclination variation for 3D effect
        const inclination = ((i % 3) - 1) * 0.3; // -0.3, 0, or 0.3

        els.push({
          angle: angleOffset,
          speed: baseSpeed,
          shell: n,
          trail: [],
        });
      }
    });

    electronsRef_physics.current = els;
  }, [atomicNumber]);

  // Calculate nucleons
  const protons = atomicNumber;
  const elementData = ELEMENTS[atomicNumber] || { name: "Unknown", symbol: "?", massNumber: atomicNumber * 2 };
  const neutrons = elementData.massNumber - protons;
  const electronConfig = getElectronConfiguration(atomicNumber);

  // Generate nucleus particles (protons and neutrons clustered)
  const nucleusParticles = useMemo(() => {
    const particles: { pos: [number, number, number]; type: 'proton' | 'neutron' }[] = [];
    const totalNucleons = protons + neutrons;

    for (let i = 0; i < totalNucleons; i++) {
      // Use Fibonacci sphere for even distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / totalNucleons);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 0.35 + Math.random() * 0.15; // Slight radius variation

      particles.push({
        pos: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ] as [number, number, number],
        type: i < protons ? 'proton' : 'neutron',
      });
    }

    return particles;
  }, [protons, neutrons]);

  // Shell radii (scaled Bohr radii)
  const shellRadii = useMemo(() => {
    return BOHR_RADII.map((r, i) => r * SCALE_FACTOR);
  }, []);

  // Generate orbit rings for shells that have electrons
  const activeShells = electronConfig.map((count, idx) => ({
    n: idx + 1,
    radius: shellRadii[idx],
    count,
  }));

  useFrame((_, delta) => {
    if (!groupRef.current || !electronsRef.current) return;

    frameCountRef.current++;
    dataUpdateTimerRef.current += delta;

    // Slowly rotate the entire atom
    groupRef.current.rotation.y += delta * 0.05;

    // Update electron positions using refs only
    const electrons = electronsRef_physics.current;
    const maxElectrons = 50; // Max electrons for instanced mesh

    for (let i = 0; i < maxElectrons; i++) {
      if (i < electrons.length) {
        const e = electrons[i];
        const shellRadius = shellRadii[e.shell - 1];

        // Update angle if playing
        if (isPlaying) {
          e.angle += e.speed * delta * animationSpeed;
        }

        // Calculate 3D position with slight inclination
        const inclination = ((i % 3) - 1) * 0.3;
        const x = Math.cos(e.angle) * shellRadius;
        const y = Math.sin(e.angle) * shellRadius * Math.sin(inclination);
        const z = Math.sin(e.angle) * shellRadius * Math.cos(inclination);

        dummy.position.set(x, y, z);
        dummy.scale.set(0.1, 0.1, 0.1);
        dummy.updateMatrix();
        electronsRef.current!.setMatrixAt(i, dummy.matrix);

        // Update trail
        if (isPlaying) {
          e.trail.push(new THREE.Vector3(x, y, z));
          if (e.trail.length > 20) {
            e.trail.shift();
          }
        }
      } else {
        // Hide unused electrons
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        electronsRef.current!.setMatrixAt(i, dummy.matrix);
      }
    }

    electronsRef.current.instanceMatrix.needsUpdate = true;

    // Pulse nucleus glow
    if (nucleusGroupRef.current) {
      const pulseIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.1;
      nucleusGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = pulseIntensity;
          }
        }
      });
    }

    // Update React state every 5-10 frames (approx every 100-200ms)
    if (frameCountRef.current % 8 === 0 && onDataChange) {
      const shellElectronsData = electronConfig.map((count, idx) => ({
        shell: idx + 1,
        count,
      }));

      const configStrings = electronConfig.map((count, idx) => {
        if (count === 0) return null;
        return `${idx + 1}s${count}`; // Simplified notation
      }).filter(Boolean) as string[];

      onDataChange({
        elementName: elementData.name,
        symbol: elementData.symbol,
        atomicNumber: protons,
        massNumber: elementData.massNumber,
        electronConfig: configStrings.join(" "),
        shellElectrons: shellElectronsData,
      });
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Nucleus */}
        <group ref={nucleusGroupRef}>
          {/* Glow sphere */}
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshBasicMaterial
              color="#ff6b6b"
              transparent
              opacity={0.15}
            />
          </mesh>
          {/* Nucleons */}
          {nucleusParticles.map((particle, i) => (
            <mesh key={i} position={particle.pos} castShadow>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color={particle.type === 'proton' ? '#ef4444' : '#9ca3af'}
                emissive={particle.type === 'proton' ? '#dc2626' : '#6b7280'}
                emissiveIntensity={0.3}
                metalness={0.2}
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>

        {/* Electron shells (orbit rings) */}
        {showElectronShells && activeShells.map((shell) => (
          <group key={shell.n}>
            {/* Orbital ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[shell.radius - 0.015, shell.radius + 0.015, 64]} />
              <meshStandardMaterial
                color="#06b6d4"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
                emissive="#06b6d4"
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Translucent shell plane */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0, shell.radius, 32]} />
              <meshStandardMaterial
                color="#06b6d4"
                transparent
                opacity={0.03}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

        {/* Electrons with trails */}
        <instancedMesh ref={electronsRef} args={[undefined, undefined, 50]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
          />
        </instancedMesh>

        {/* Electron trails */}
        {electronsRef_physics.current.map((electron, i) => (
          electron.trail.length > 1 && (
            <Line
              key={`trail-${i}`}
              points={electron.trail}
              color="#22d3ee"
              opacity={0.4}
              transparent
              lineWidth={1}
            />
          )
        ))}
      </group>

      {/* Element label */}
      <mesh position={[0, shellRadii[electronConfig.length - 1] + 1.5, 0]}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial
          color="#0a0a1a"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Ambient light */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />

      <gridHelper args={[15, 30, "#1a1a3e", "#0f0f2e"]} position={[0, -6, 0]} />
    </>
  );
}

export default AtomicStructureSceneComponent;
