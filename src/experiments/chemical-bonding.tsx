"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function ChemicalBondingScene() {
  const moleculeRef = useRef<THREE.Group>(null);

  const { bondType, bondLength, rotationSpeed } = useControls("Bonding", {
    bondType: {
      value: "covalent",
      options: ["covalent", "ionic", "metallic"],
      label: "Bond Type"
    },
    bondLength: { value: 2, min: 1, max: 4, step: 0.1, label: "Bond Length" },
    rotationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!moleculeRef.current) return;
    moleculeRef.current.rotation.y += delta * rotationSpeed;
  });

  const getAtomColor = (atom: string) => {
    const colors: Record<string, string> = {
      H: "#ffffff",
      O: "#ff6b35",
      Na: "#8b5cf6",
      Cl: "#06d6a0",
      C: "#4f8fff",
      Fe: "#ffcc00",
    };
    return colors[atom] || "#666";
  };

  const getAtomSize = (atom: string) => {
    const sizes: Record<string, number> = {
      H: 0.25,
      O: 0.4,
      Na: 0.5,
      Cl: 0.45,
      C: 0.35,
      Fe: 0.4,
    };
    return sizes[atom] || 0.3;
  };

  if (bondType === "covalent") {
    // Water molecule
    return (
      <>
        <group ref={moleculeRef}>
          {/* Oxygen */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[getAtomSize("O"), 32, 32]} />
            <meshStandardMaterial
              color={getAtomColor("O")}
              emissive={getAtomColor("O")}
              emissiveIntensity={0.3}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>

          {/* Hydrogens */}
          <mesh position={[
            Math.cos(Math.PI / 6) * bondLength * 0.5,
            Math.sin(Math.PI / 6) * bondLength * 0.5,
            0
          ]}>
            <sphereGeometry args={[getAtomSize("H"), 32, 32]} />
            <meshStandardMaterial
              color={getAtomColor("H")}
              emissive={getAtomColor("H")}
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[
            Math.cos(Math.PI / 6) * bondLength * 0.5,
            -Math.sin(Math.PI / 6) * bondLength * 0.5,
            0
          ]}>
            <sphereGeometry args={[getAtomSize("H"), 32, 32]} />
            <meshStandardMaterial
              color={getAtomColor("H")}
              emissive={getAtomColor("H")}
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>

          {/* Covalent bonds (shared electrons) */}
          <mesh position={[
            Math.cos(Math.PI / 6) * bondLength * 0.25,
            Math.sin(Math.PI / 6) * bondLength * 0.25,
            0
          ]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.08, 0.08, bondLength * 0.5, 8]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[
            Math.cos(Math.PI / 6) * bondLength * 0.25,
            -Math.sin(Math.PI / 6) * bondLength * 0.25,
            0
          ]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.08, 0.08, bondLength * 0.5, 8]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>

          {/* Electron clouds */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color="#4f8fff"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>
        </group>

        {/* Lone pairs indicator */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.5} />
        </mesh>

        <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
      </>
    );
  }

  if (bondType === "ionic") {
    // NaCl crystal lattice (simplified)
    return (
      <>
        <group ref={moleculeRef}>
          {/* Na+ ions */}
          {[
            [0, 0, 0], [bondLength, 0, 0], [0, bondLength, 0],
            [bondLength, bondLength, 0], [bondLength / 2, bondLength / 2, bondLength / 2]
          ].map((pos, i) => (
            <mesh key={`na-${i}`} position={pos as [number, number, number]}>
              <sphereGeometry args={[getAtomSize("Na"), 32, 32]} />
              <meshStandardMaterial
                color={getAtomColor("Na")}
                emissive={getAtomColor("Na")}
                emissiveIntensity={0.4}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
          ))}

          {/* Cl- ions */}
          {[
            [bondLength, bondLength, 0], [0, 0, bondLength],
            [bondLength, 0, bondLength], [0, bondLength, bondLength]
          ].map((pos, i) => (
            <mesh key={`cl-${i}`} position={pos as [number, number, number]}>
              <sphereGeometry args={[getAtomSize("Cl"), 32, 32]} />
              <meshStandardMaterial
                color={getAtomColor("Cl")}
                emissive={getAtomColor("Cl")}
                emissiveIntensity={0.4}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
          ))}

          {/* Electrostatic attraction lines */}
          <Line
            points={[[0, 0, 0], [bondLength, bondLength, 0]]}
            color="#ffcc00"
            lineWidth={1}
            opacity={0.3}
            transparent
            dashed
          />
        </group>

        {/* Charge indicators */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0.5, 1.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>

        <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
      </>
    );
  }

  // Metallic bonding (iron)
  return (
    <>
      <group ref={moleculeRef}>
        {/* Fe atoms in metallic lattice */}
        {[
          [0, 0, 0], [bondLength, 0, 0], [0, bondLength, 0],
          [bondLength, bondLength, 0], [bondLength / 2, bondLength / 2, bondLength / 2],
          [-bondLength / 2, -bondLength / 2, bondLength / 2]
        ].map((pos, i) => (
          <mesh key={`fe-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[getAtomSize("Fe"), 32, 32]} />
            <meshStandardMaterial
              color={getAtomColor("Fe")}
              emissive={getAtomColor("Fe")}
              emissiveIntensity={0.3}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* Delocalized electrons (electron sea) */}
        <mesh position={[bondLength / 2, bondLength / 2, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-bondLength / 4, bondLength / 4, bondLength / 4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[bondLength * 0.75, -bondLength * 0.25, bondLength * 0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
