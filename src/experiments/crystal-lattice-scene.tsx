"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface CrystalLatticeData {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  unitCells: number;
  atomsPerCell: number;
  coordinationNumber: number;
  packingEfficiency: number;
  totalAtoms: number;
}

export interface CrystalLatticeSceneProps {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  showUnitCell: boolean;
  showBonds: boolean;
  isPlaying: boolean;
  onDataChange?: (data: CrystalLatticeData) => void;
}

/**
 * Crystal Lattice scene component - Performance optimized
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

  // Performance refs - physics state updated every frame
  const frameCountRef = useRef(0);
  const rotationRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<CrystalLatticeData>({
    latticeType: "FCC",
    unitCells: 8,
    atomsPerCell: 4,
    coordinationNumber: 12,
    packingEfficiency: 0.74,
    totalAtoms: 32,
  });

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

  // Generate lattice positions using useMemo for performance
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
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing + spacing/2));
          }
        }
      }
    } else if (latticeType === "HCP") {
      // Hexagonal Close-Packed
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
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing, y * spacing + spacing/2, z * spacing + spacing/2));
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

  // Generate bonds using Line from drei
  const bondLines = useMemo(() => {
    if (!showBonds) return [];

    const bonds: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const maxDistance = latticeType === "diamond" ? 1.8 : 1.5;

    for (let i = 0; i < atomPositions.length; i++) {
      for (let j = i + 1; j < atomPositions.length; j++) {
        const dist = atomPositions[i].distanceTo(atomPositions[j]);
        if (dist < maxDistance && dist > 0.1) {
          bonds.push({
            start: [atomPositions[i].x, atomPositions[i].y, atomPositions[i].z],
            end: [atomPositions[j].x, atomPositions[j].y, atomPositions[j].z],
          });
        }
      }
    }

    return bonds;
  }, [atomPositions, latticeType, showBonds]);

  // Unit cell wireframe using Line from drei
  const unitCellLines = useMemo(() => {
    if (!showUnitCell) return [];

    const lines: { points: [number, number, number][] }[] = [];
    const edges = [
      [[0,0,0], [2,0,0]], [[2,0,0], [2,2,0]], [[2,2,0], [0,2,0]], [[0,2,0], [0,0,0]],
      [[0,0,2], [2,0,2]], [[2,0,2], [2,2,2]], [[2,2,2], [0,2,2]], [[0,2,2], [0,0,2]],
      [[0,0,0], [0,0,2]], [[2,0,0], [2,0,2]], [[2,2,0], [2,2,2]], [[0,2,0], [0,2,2]],
    ];

    edges.forEach(edge => {
      lines.push({ points: [edge[0] as [number, number, number], edge[1] as [number, number, number]] });
    });

    return lines;
  }, [showUnitCell]);

  // Center the lattice
  const centerOffset = useMemo(() => {
    const center = new THREE.Vector3();
    atomPositions.forEach(pos => center.add(pos));
    center.divideScalar(atomPositions.length);
    return center.negate();
  }, [atomPositions]);

  // Throttled data updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isPlaying) {
      rotationRef.current += delta * 0.15;
      groupRef.current.rotation.y = rotationRef.current;
      groupRef.current.rotation.x = Math.sin(rotationRef.current * 0.3) * 0.05;
    }

    frameCountRef.current++;

    if (frameCountRef.current % 8 === 0) {
      const newData: CrystalLatticeData = {
        latticeType,
        unitCells: 8,
        atomsPerCell: latticeData[latticeType].atomsPerCell,
        coordinationNumber: latticeData[latticeType].coordinationNumber,
        packingEfficiency: latticeData[latticeType].packingEfficiency,
        totalAtoms: atomPositions.length,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Get atom color based on position
  const getAtomColor = (index: number) => {
    const colors = ["#a855f7", "#ec4899", "#8b5cf6", "#d946ef"];
    return colors[index % colors.length];
  };

  return (
    <>
      <group ref={groupRef} position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        {/* Unit cell wireframe using Line from drei */}
        {unitCellLines.map((line, i) => (
          <Line
            key={`unit-cell-${i}`}
            points={line.points}
            color="#a855f7"
            lineWidth={2}
            opacity={0.6}
            transparent
          />
        ))}

        {/* Corner highlights */}
        {showUnitCell && [
          [0,0,0], [2,0,0], [2,2,0], [0,2,0],
          [0,0,2], [2,0,2], [2,2,2], [0,2,2],
        ].map((pos, i) => (
          <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
          </mesh>
        ))}

        {/* Bonds using Line from drei */}
        {bondLines.map((bond, i) => (
          <Line
            key={`bond-${i}`}
            points={[bond.start, bond.end]}
            color="#a855f7"
            lineWidth={3}
            opacity={0.4}
            transparent
          />
        ))}

        {/* Atoms */}
        {atomPositions.map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color={getAtomColor(i)}
              emissive={getAtomColor(i)}
              emissiveIntensity={0.3}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default CrystalLatticeSceneComponent;
