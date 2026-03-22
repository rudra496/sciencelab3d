"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface CrystalLatticeData {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  unitCells: number;
  atomsPerCell: number;
  coordinationNumber: number;
  packingEfficiency: number;
}

export interface CrystalLatticeSceneProps {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  showUnitCell: boolean;
  showBonds: boolean;
  isPlaying: boolean;
  onDataChange?: (data: CrystalLatticeData) => void;
}

/**
 * Crystal Lattice scene component
 * Visualizes 3D crystal structures: FCC, BCC, HCP, and diamond
 */
export function CrystalLatticeSceneComponent({
  latticeType,
  showUnitCell,
  showBonds,
  isPlaying,
  onDataChange
}: CrystalLatticeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Crystal structure properties
  const latticeData: Record<"FCC" | "BCC" | "HCP" | "diamond", {
    atomsPerCell: number;
    coordinationNumber: number;
    packingEfficiency: number;
  }> = {
    FCC: { atomsPerCell: 4, coordinationNumber: 12, packingEfficiency: 0.74 },
    BCC: { atomsPerCell: 2, coordinationNumber: 8, packingEfficiency: 0.68 },
    HCP: { atomsPerCell: 6, coordinationNumber: 12, packingEfficiency: 0.74 },
    diamond: { atomsPerCell: 8, coordinationNumber: 4, packingEfficiency: 0.34 },
  };

  // Report data changes
  useEffect(() => {
    onDataChange?.({
      latticeType,
      unitCells: 8,
      atomsPerCell: latticeData[latticeType].atomsPerCell,
      coordinationNumber: latticeData[latticeType].coordinationNumber,
      packingEfficiency: latticeData[latticeType].packingEfficiency,
    });
  }, [latticeType, onDataChange]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isPlaying) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(delta * 0.5) * 0.05;
    }
  });

  // Generate lattice positions
  const getLatticePositions = (): THREE.Vector3[] => {
    const positions: THREE.Vector3[] = [];
    const spacing = 2;
    const layers = 2;

    if (latticeType === "FCC") {
      // Face-Centered Cubic
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            // Corner atoms
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            // Face centers
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing, y * spacing + spacing/2, z * spacing + spacing/2));
          }
        }
      }
    } else if (latticeType === "BCC") {
      // Body-Centered Cubic
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            // Corner atoms
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            // Body center
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing + spacing/2));
          }
        }
      }
    } else if (latticeType === "HCP") {
      // Hexagonal Close-Packed (simplified)
      for (let layer = 0; layer < 3; layer++) {
        const offset = layer % 2 === 0 ? 0 : spacing/2;
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            positions.push(new THREE.Vector3(
              (x + offset) * spacing,
              layer * spacing * 0.8,
              z * spacing * 0.866
            ));
          }
        }
      }
    } else if (latticeType === "diamond") {
      // Diamond structure (two interpenetrating FCC lattices)
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            // First FCC lattice
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing, y * spacing + spacing/2, z * spacing + spacing/2));
            // Second FCC lattice (offset)
            positions.push(new THREE.Vector3(x * spacing + spacing/4, y * spacing + spacing/4, z * spacing + spacing/4));
            positions.push(new THREE.Vector3(x * spacing + spacing*0.75, y * spacing + spacing*0.75, z * spacing + spacing/4));
            positions.push(new THREE.Vector3(x * spacing + spacing*0.75, y * spacing + spacing/4, z * spacing + spacing*0.75));
            positions.push(new THREE.Vector3(x * spacing + spacing/4, y * spacing + spacing*0.75, z * spacing + spacing*0.75));
          }
        }
      }
    }

    return positions;
  };

  const atomPositions = useMemo(() => getLatticePositions(), [latticeType]);

  // Generate bonds
  const getBonds = (): [THREE.Vector3, THREE.Vector3][] => {
    const bonds: [THREE.Vector3, THREE.Vector3][] = [];
    const maxDistance = latticeType === "diamond" ? 1.8 : 1.5;

    for (let i = 0; i < atomPositions.length; i++) {
      for (let j = i + 1; j < atomPositions.length; j++) {
        const dist = atomPositions[i].distanceTo(atomPositions[j]);
        if (dist < maxDistance && dist > 0.1) {
          bonds.push([atomPositions[i], atomPositions[j]]);
        }
      }
    }

    return bonds;
  };

  const bonds = useMemo(() => getBonds(), [atomPositions, latticeType]);

  // Center the lattice
  const centerOffset = useMemo(() => {
    const center = new THREE.Vector3();
    atomPositions.forEach(pos => center.add(pos));
    center.divideScalar(atomPositions.length);
    return center.negate();
  }, [atomPositions]);

  return (
    <>
      <group ref={groupRef} position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        {/* Unit cell wireframe */}
        {showUnitCell && (
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  0, 0, 0,  2, 0, 0,  2, 0, 0,  2, 2, 0,  2, 2, 0,  0, 2, 0,  0, 2, 0,  0, 0, 0,
                  0, 0, 2,  2, 0, 2,  2, 0, 2,  2, 2, 2,  2, 2, 2,  0, 2, 2,  0, 2, 2,  0, 0, 2,
                  0, 0, 0,  0, 0, 2,  2, 0, 0,  2, 0, 2,  2, 2, 0,  2, 2, 2,  0, 2, 0,  0, 2, 2,
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#a855f7" transparent opacity={0.5} />
          </lineSegments>
        )}

        {/* Bonds */}
        {showBonds && bonds.map((bond, i) => (
          <mesh key={`bond-${i}`} position={[
            (bond[0].x + bond[1].x) / 2,
            (bond[0].y + bond[1].y) / 2,
            (bond[0].z + bond[1].z) / 2
          ]}>
            <cylinderGeometry args={[0.03, 0.03, bond[0].distanceTo(bond[1]), 4]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.2}
            />
            <group rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
              <primitive object={new THREE.Vector3(
                bond[1].x - bond[0].x,
                bond[1].y - bond[0].y,
                bond[1].z - bond[0].z
              ).normalize()} />
            </group>
          </mesh>
        ))}

        {/* Atoms */}
        {atomPositions.map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.3}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Corner highlights for unit cell */}
        {showUnitCell && [
          [0,0,0], [2,0,0], [2,2,0], [0,2,0],
          [0,0,2], [2,0,2], [2,2,2], [0,2,2],
        ].map((pos, i) => (
          <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
        ))}
      </group>

      {/* Legend */}
      <mesh position={[-3, 2.5, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      <mesh position={[-3, 2.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default CrystalLatticeSceneComponent;
