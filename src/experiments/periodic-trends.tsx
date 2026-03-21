"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: string;
  atomicRadius: number;
  electronegativity: number;
  ionizationEnergy: number;
}

const elementsData: ElementData[] = [
  { number: 1, symbol: "H", name: "Hydrogen", atomicMass: 1.008, category: "nonmetal", atomicRadius: 0.53, electronegativity: 2.20, ionizationEnergy: 13.6 },
  { number: 2, symbol: "He", name: "Helium", atomicMass: 4.003, category: "noble", atomicRadius: 0.31, electronegativity: 0, ionizationEnergy: 24.6 },
  { number: 3, symbol: "Li", name: "Lithium", atomicMass: 6.941, category: "alkali", atomicRadius: 1.67, electronegativity: 0.98, ionizationEnergy: 5.4 },
  { number: 4, symbol: "Be", name: "Beryllium", atomicMass: 9.012, category: "alkaline", atomicRadius: 1.12, electronegativity: 1.57, ionizationEnergy: 9.3 },
  { number: 5, symbol: "B", name: "Boron", atomicMass: 10.81, category: "metalloid", atomicRadius: 0.87, electronegativity: 2.04, ionizationEnergy: 8.3 },
  { number: 6, symbol: "C", name: "Carbon", atomicMass: 12.01, category: "nonmetal", atomicRadius: 0.67, electronegativity: 2.55, ionizationEnergy: 11.3 },
  { number: 7, symbol: "N", name: "Nitrogen", atomicMass: 14.01, category: "nonmetal", atomicRadius: 0.56, electronegativity: 3.04, ionizationEnergy: 14.5 },
  { number: 8, symbol: "O", name: "Oxygen", atomicMass: 16.00, category: "nonmetal", atomicRadius: 0.48, electronegativity: 3.44, ionizationEnergy: 13.6 },
  { number: 9, symbol: "F", name: "Fluorine", atomicMass: 19.00, category: "halogen", atomicRadius: 0.42, electronegativity: 3.98, ionizationEnergy: 17.4 },
  { number: 10, symbol: "Ne", name: "Neon", atomicMass: 20.18, category: "noble", atomicRadius: 0.38, electronegativity: 0, ionizationEnergy: 21.6 },
  { number: 11, symbol: "Na", name: "Sodium", atomicMass: 22.99, category: "alkali", atomicRadius: 1.90, electronegativity: 0.93, ionizationEnergy: 5.1 },
  { number: 12, symbol: "Mg", name: "Magnesium", atomicMass: 24.31, category: "alkaline", atomicRadius: 1.45, electronegativity: 1.31, ionizationEnergy: 7.6 },
  { number: 13, symbol: "Al", name: "Aluminum", atomicMass: 26.98, category: "metal", atomicRadius: 1.18, electronegativity: 1.61, ionizationEnergy: 6.0 },
  { number: 14, symbol: "Si", name: "Silicon", atomicMass: 28.09, category: "metalloid", atomicRadius: 1.11, electronegativity: 1.90, ionizationEnergy: 8.2 },
  { number: 15, symbol: "P", name: "Phosphorus", atomicMass: 30.97, category: "nonmetal", atomicRadius: 0.98, electronegativity: 2.19, ionizationEnergy: 10.5 },
  { number: 16, symbol: "S", name: "Sulfur", atomicMass: 32.07, category: "nonmetal", atomicRadius: 0.88, electronegativity: 2.58, ionizationEnergy: 10.4 },
  { number: 17, symbol: "Cl", name: "Chlorine", atomicMass: 35.45, category: "halogen", atomicRadius: 0.79, electronegativity: 3.16, ionizationEnergy: 12.9 },
  { number: 18, symbol: "Ar", name: "Argon", atomicMass: 39.95, category: "noble", atomicRadius: 0.71, electronegativity: 0, ionizationEnergy: 15.8 },
];

export default function PeriodicTrendsScene() {
  const groupRef = useRef<THREE.Group>(null);

  const { trendMode, selectedElement, viewMode } = useControls("Periodic Trends", {
    trendMode: {
      value: "atomicRadius",
      options: ["atomicRadius", "electronegativity", "ionizationEnergy"],
      label: "Trend"
    },
    selectedElement: { value: 6, min: 1, max: 18, step: 1, label: "Element #" },
    viewMode: {
      value: "3d",
      options: ["3d", "blocks"],
      label: "View"
    },
  });

  const element = elementsData.find(e => e.number === selectedElement) || elementsData[5];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.1;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      alkali: "#ff6b35",
      alkaline: "#ffcc00",
      metal: "#8b5cf6",
      metalloid: "#06d6a0",
      nonmetal: "#4f8fff",
      halogen: "#ec4899",
      noble: "#ffffff",
    };
    return colors[category as keyof typeof colors] || "#666";
  };

  const getTrendValue = (element: ElementData) => {
    switch (trendMode) {
      case "atomicRadius": return element.atomicRadius;
      case "electronegativity": return element.electronegativity || 0;
      case "ionizationEnergy": return element.ionizationEnergy;
      default: return 0;
    }
  };

  return (
    <>
      <group ref={groupRef}>
        {/* Periodic table as 3D blocks */}
        {elementsData.map((elem) => {
          const row = Math.ceil(elem.number / 18);
          const col = elem.number <= 2 ? elem.number : elem.number <= 10 ? elem.number - 2 : elem.number - 10;
          const x = (col - 9) * 0.7;
          const y = (3 - row) * 0.7;
          const trendValue = getTrendValue(elem);
          const normalizedValue = trendMode === "electronegativity"
            ? trendValue / 4
            : trendMode === "ionizationEnergy"
            ? trendValue / 25
            : trendValue / 2;
          const z = normalizedValue * 2 - 1;

          return (
            <group key={elem.number} position={[x, y, z]}>
              {/* Element block */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.2 + normalizedValue * 0.3]} />
                <meshStandardMaterial
                  color={getCategoryColor(elem.category)}
                  emissive={getCategoryColor(elem.category)}
                  emissiveIntensity={elem.number === selectedElement ? 0.5 : 0.15}
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>

              {/* Highlight selected element */}
              {elem.number === selectedElement && (
                <mesh position={[0, 0, 0.3]}>
                  <boxGeometry args={[0.7, 0.7, 0.1]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.3}
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* Selected element detail */}
      <group position={[4, 2, 0]}>
        {/* Element sphere */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={getCategoryColor(element.category)}
            emissive={getCategoryColor(element.category)}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Trend indicator */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.1, 0.1, getTrendValue(element) * 0.1, 8]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Trend visualization graph */}
      <mesh position={[-4, 0, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshBasicMaterial color="#1a1a3e" transparent opacity={0.5} />
      </mesh>

      {/* Trend line */}
      {elementsData.filter(e => e.number <= 18).map((elem, i) => {
        const row = Math.ceil(elem.number / 18);
        const col = elem.number <= 2 ? elem.number : elem.number <= 10 ? elem.number - 2 : elem.number - 10;
        const x = -4 + (col / 18) * 2;
        const y = -2 + (row / 3) * 1 + getTrendValue(elem) * 0.05;

        return (
          <mesh key={elem.number} position={[x, y, 0.01]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={getCategoryColor(elem.category)}
              emissive={getCategoryColor(elem.category)}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}

      {/* Labels */}
      <mesh position={[0, -2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[1, -2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[2, -2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      <gridHelper args={[16, 32, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
