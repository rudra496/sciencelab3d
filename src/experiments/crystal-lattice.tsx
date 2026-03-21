"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function CrystalLatticeScene() {
  const latticeRef = useRef<THREE.Group>(null);

  const { latticeType, atomSize, showBonds, rotationSpeed } = useControls("Crystal", {
    latticeType: {
      value: "fcc",
      options: ["fcc", "bcc", "simple-cubic", "diamond"],
      label: "Lattice Type"
    },
    atomSize: { value: 0.15, min: 0.05, max: 0.3, step: 0.01, label: "Atom Size" },
    showBonds: { value: true, label: "Show Bonds" },
    rotationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!latticeRef.current) return;
    latticeRef.current.rotation.y += delta * rotationSpeed;
    latticeRef.current.rotation.x += delta * rotationSpeed * 0.5;
  });

  // Generate lattice positions
  const latticePositions = useMemo(() => {
    const positions: { pos: [number, number, number]; type: "corner" | "face" | "body" | "tetrahedral" }[] = [];
    const a = 1; // Lattice constant

    if (latticeType === "simple-cubic") {
      // Simple cubic: corners only
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            positions.push({ pos: [x * a, y * a, z * a], type: "corner" });
          }
        }
      }
    } else if (latticeType === "bcc") {
      // Body-centered cubic: corners + body center
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            positions.push({ pos: [x * a, y * a, z * a], type: "corner" });
            positions.push({ pos: [x * a + a/2, y * a + a/2, z * a + a/2], type: "body" });
          }
        }
      }
    } else if (latticeType === "fcc") {
      // Face-centered cubic: corners + face centers
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            positions.push({ pos: [x * a, y * a, z * a], type: "corner" });
            positions.push({ pos: [x * a + a/2, y * a + a/2, z * a], type: "face" });
            positions.push({ pos: [x * a + a/2, y * a, z * a + a/2], type: "face" });
            positions.push({ pos: [x * a, y * a + a/2, z * a + a/2], type: "face" });
          }
        }
      }
    } else if (latticeType === "diamond") {
      // Diamond cubic: FCC + tetrahedral sites
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            positions.push({ pos: [x * a, y * a, z * a], type: "corner" });
            positions.push({ pos: [x * a + a/4, y * a + a/4, z * a + a/4], type: "tetrahedral" });
            positions.push({ pos: [x * a + a/2, y * a + a/2, z * a], type: "face" });
            positions.push({ pos: [x * a + 3*a/4, y * a + 3*a/4, z * a + a/4], type: "tetrahedral" });
          }
        }
      }
    }

    return positions;
  }, [latticeType]);

  const getAtomColor = (type: string) => {
    const colors = {
      corner: "#4f8fff",
      face: "#8b5cf6",
      body: "#06d6a0",
      tetrahedral: "#ff6b35",
    };
    return colors[type as keyof typeof colors] || "#666";
  };

  // Generate bonds
  const bonds = useMemo(() => {
    if (!showBonds) return [];
    const b: [number, number, number][][] = [];
    const bondLength = 1;

    latticePositions.forEach((atom1, i) => {
      latticePositions.forEach((atom2, j) => {
        if (i >= j) return;
        const dist = Math.sqrt(
          (atom1.pos[0] - atom2.pos[0]) ** 2 +
          (atom1.pos[1] - atom2.pos[1]) ** 2 +
          (atom1.pos[2] - atom2.pos[2]) ** 2
        );
        if (dist <= bondLength * 1.1) {
          b.push([atom1.pos, atom2.pos]);
        }
      });
    });

    return b;
  }, [latticePositions, showBonds]);

  // Calculate coordination number and packing efficiency
  const coordinationNumbers = {
    "simple-cubic": 6,
    "bcc": 8,
    "fcc": 12,
    "diamond": 4,
  };

  const packingEfficiency = {
    "simple-cubic": 0.52,
    "bcc": 0.68,
    "fcc": 0.74,
    "diamond": 0.34,
  };

  return (
    <>
      <group ref={latticeRef}>
        {/* Bonds */}
        {showBonds && bonds.map((bond, i) => (
          <mesh key={i} position={[
            (bond[0][0] + bond[1][0]) / 2,
            (bond[0][1] + bond[1][1]) / 2,
            (bond[0][2] + bond[1][2]) / 2
          ]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshStandardMaterial color="#666" opacity={0.5} transparent />
          </mesh>
        ))}

        {/* Atoms */}
        {latticePositions.map((atom, i) => (
          <mesh key={i} position={atom.pos}>
            <sphereGeometry args={[atomSize, 32, 32]} />
            <meshStandardMaterial
              color={getAtomColor(atom.type)}
              emissive={getAtomColor(atom.type)}
              emissiveIntensity={0.3}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Unit cell outline */}
        <mesh position={[0.5, 0.5, 0.5]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>
      </group>

      {/* Info displays */}
      <mesh position={[-3, 2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-3, 1.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />
    </>
  );
}
