"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface PeriodicTrendsData {
  selectedElement: string;
  atomicNumber: number;
  atomicMass: number;
  trendValue: number;
  trendName: string;
}

export interface PeriodicTrendsSceneProps {
  trendType: "atomicRadius" | "electronegativity" | "ionization";
  view3D: boolean;
  rotationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: PeriodicTrendsData) => void;
}

// Simplified periodic table data with more elements
const ELEMENTS = [
  { symbol: "H", number: 1, mass: 1.008, group: 1, period: 1, radius: 0.53, en: 2.20, ionization: 13.6 },
  { symbol: "He", number: 2, mass: 4.003, group: 18, period: 1, radius: 0.31, en: 0.00, ionization: 24.6 },
  { symbol: "Li", number: 3, mass: 6.941, group: 1, period: 2, radius: 1.67, en: 0.98, ionization: 5.39 },
  { symbol: "Be", number: 4, mass: 9.012, group: 2, period: 2, radius: 1.12, en: 1.57, ionization: 9.32 },
  { symbol: "B", number: 5, mass: 10.81, group: 13, period: 2, radius: 0.87, en: 2.04, ionization: 8.30 },
  { symbol: "C", number: 6, mass: 12.01, group: 14, period: 2, radius: 0.67, en: 2.55, ionization: 11.3 },
  { symbol: "N", number: 7, mass: 14.01, group: 15, period: 2, radius: 0.56, en: 3.04, ionization: 14.5 },
  { symbol: "O", number: 8, mass: 16.00, group: 16, period: 2, radius: 0.48, en: 3.44, ionization: 13.6 },
  { symbol: "F", number: 9, mass: 19.00, group: 17, period: 2, radius: 0.42, en: 3.98, ionization: 17.4 },
  { symbol: "Ne", number: 10, mass: 20.18, group: 18, period: 2, radius: 0.38, en: 0.00, ionization: 21.6 },
  { symbol: "Na", number: 11, mass: 22.99, group: 1, period: 3, radius: 1.90, en: 0.93, ionization: 5.14 },
  { symbol: "Mg", number: 12, mass: 24.31, group: 2, period: 3, radius: 1.45, en: 1.31, ionization: 7.65 },
  { symbol: "Al", number: 13, mass: 26.98, group: 13, period: 3, radius: 1.18, en: 1.61, ionization: 6.00 },
  { symbol: "Si", number: 14, mass: 28.09, group: 14, period: 3, radius: 1.11, en: 1.90, ionization: 8.15 },
  { symbol: "P", number: 15, mass: 30.97, group: 15, period: 3, radius: 0.98, en: 2.19, ionization: 10.5 },
  { symbol: "S", number: 16, mass: 32.07, group: 16, period: 3, radius: 0.88, en: 2.58, ionization: 10.4 },
  { symbol: "Cl", number: 17, mass: 35.45, group: 17, period: 3, radius: 0.79, en: 3.16, ionization: 12.9 },
  { symbol: "Ar", number: 18, mass: 39.95, group: 18, period: 3, radius: 0.71, en: 0.00, ionization: 15.8 },
  { symbol: "K", number: 19, mass: 39.10, group: 1, period: 4, radius: 2.43, en: 0.82, ionization: 4.34 },
  { symbol: "Ca", number: 20, mass: 40.08, group: 2, period: 4, radius: 1.94, en: 1.00, ionization: 6.11 },
];

/**
 * Periodic Trends scene component - Performance optimized
 * Interactive 3D periodic table with trend visualizations
 */
export function PeriodicTrendsSceneComponent({
  trendType,
  view3D,
  rotationSpeed,
  isPlaying,
  onDataChange
}: PeriodicTrendsSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const selectedElementRef = useRef(ELEMENTS[5]); // Carbon

  // React state - updated only every 8 frames
  const [data, setData] = useState<PeriodicTrendsData>({
    selectedElement: "C",
    atomicNumber: 6,
    atomicMass: 12.01,
    trendValue: 0.67,
    trendName: "atomicRadius",
  });

  // Get value based on trend type
  const getTrendValue = (element: typeof ELEMENTS[0]) => {
    switch (trendType) {
      case "atomicRadius": return element.radius;
      case "electronegativity": return element.en || 0;
      case "ionization": return element.ionization;
      default: return element.radius;
    }
  };

  // Get trend name for display
  const getTrendName = () => {
    switch (trendType) {
      case "atomicRadius": return "Atomic Radius (pm)";
      case "electronegativity": return "Electronegativity (Pauling)";
      case "ionization": return "Ionization Energy (eV)";
      default: return "Atomic Radius";
    }
  };

  // Get element color based on category
  const getElementColor = (element: typeof ELEMENTS[0]) => {
    if (element.group === 1) return "#f97316"; // Alkali metals
    if (element.group === 2) return "#fbbf24"; // Alkaline earth
    if (element.group >= 13 && element.group <= 17) return "#22c55e"; // Nonmetals
    if (element.group === 18) return "#8b5cf6"; // Noble gases
    return "#94a3b8"; // Other
  };

  // Generate vertical lines for 3D view using Line from drei
  const verticalLines = useMemo(() => {
    if (!view3D) return [];

    return ELEMENTS.map((element) => {
      const x = (element.group - 9) * 1.2;
      const y = (3.5 - element.period) * 1.2;
      const z = getTrendValue(element) * 0.3;
      const color = getElementColor(element);

      return (
        <Line
          key={`line-${element.symbol}`}
          points={[[x, y, z], [x, y, 0]]}
          color={color}
          lineWidth={1}
          opacity={0.4}
          transparent
        />
      );
    });
  }, [view3D, trendType]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    timeRef.current += delta;

    if (groupRef.current && view3D) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.2;
      groupRef.current.rotation.x = Math.sin(timeRef.current * 0.3) * 0.15;
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const element = selectedElementRef.current;
      const newData: PeriodicTrendsData = {
        selectedElement: element.symbol,
        atomicNumber: element.number,
        atomicMass: element.mass,
        trendValue: getTrendValue(element),
        trendName: getTrendName(),
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Update data when trend type changes
  useEffect(() => {
    const element = selectedElementRef.current;
    const newData: PeriodicTrendsData = {
      selectedElement: element.symbol,
      atomicNumber: element.number,
      atomicMass: element.mass,
      trendValue: getTrendValue(element),
      trendName: getTrendName(),
    };

    setData(newData);
    onDataChange?.(newData);
  }, [trendType, onDataChange]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#06b6d4" />

      <group ref={groupRef}>
        {ELEMENTS.map((element) => {
          const x = (element.group - 9) * 1.2;
          const y = (3.5 - element.period) * 1.2;
          const z = view3D ? getTrendValue(element) * 0.3 : 0;
          const baseSize = 0.25;
          const trendValue = getTrendValue(element);
          const size = baseSize + (trendValue / 5) * 0.15;
          const color = getElementColor(element);

          return (
            <group key={element.symbol} position={[x, y, z]}>
              {/* Element sphere */}
              <mesh>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                  metalness={0.5}
                  roughness={0.3}
                />
              </mesh>

              {/* Glow effect for selected element */}
              {element.symbol === selectedElementRef.current.symbol && (
                <mesh>
                  <sphereGeometry args={[size * 1.3, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                  />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Vertical lines for 3D view */}
        {verticalLines}
      </group>

      {/* Grid plane */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 15]} />
        <meshStandardMaterial color="#0a0a1a" transparent opacity={0.5} />
      </mesh>

      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, 0, -0.6]} />

      {/* Trend indicator */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </>
  );
}

export default PeriodicTrendsSceneComponent;
