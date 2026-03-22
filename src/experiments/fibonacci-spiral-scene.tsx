"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface FibonacciSpiralData {
  currentAngle: number;
  pointsCount: number;
  goldenRatio: number;
}

export interface FibonacciSpiralSceneProps {
  pointsCount: number;
  scale: number;
  showSpheres: boolean;
  showLines: boolean;
  rotationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: FibonacciSpiralData) => void;
}

/**
 * Fibonacci Spiral scene component
 * Visualizes the golden spiral from the Fibonacci sequence in 3D
 */
export function FibonacciSpiralSceneComponent({
  pointsCount,
  scale,
  showSpheres,
  showLines,
  rotationSpeed,
  isPlaying,
  onDataChange
}: FibonacciSpiralSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // Generate Fibonacci spiral points
  const spiralPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const phi = i * 137.508 * (Math.PI / 180); // Golden angle
      const r = scale * Math.sqrt(i) * 0.5;

      points.push(new THREE.Vector3(
        r * Math.cos(phi),
        (i * 0.05) - (pointsCount * 0.025),
        r * Math.sin(phi)
      ));
    }
    return points;
  }, [pointsCount, scale]);

  // Generate connecting line segments
  const connectingLines = useMemo(() => {
    const lines: { points: [number, number, number][]; color: string; index: number }[] = [];
    for (let i = 1; i < spiralPoints.length; i++) {
      const prevPoint = spiralPoints[i - 1];
      const point = spiralPoints[i];
      const progress = i / spiralPoints.length;
      const color = new THREE.Color().setHSL(progress * 0.3, 0.8, 0.5).getStyle();

      lines.push({
        points: [
          [prevPoint.x, prevPoint.y, prevPoint.z] as [number, number, number],
          [point.x, point.y, point.z] as [number, number, number]
        ],
        color,
        index: i
      });
    }
    return lines;
  }, [spiralPoints]);

  // Generate Fibonacci numbers
  const fibonacciNumbers = useMemo(() => {
    const fibs = [0, 1];
    for (let i = 2; i < 15; i++) {
      fibs.push(fibs[i - 1] + fibs[i - 2]);
    }
    return fibs;
  }, []);

  // Report data changes
  useEffect(() => {
    onDataChange?.({
      currentAngle: timeRef.current * rotationSpeed,
      pointsCount,
      goldenRatio,
    });
  }, [pointsCount, scale, rotationSpeed, onDataChange, goldenRatio]);

  useFrame((_, delta) => {
    if (!isPlaying || !groupRef.current) return;

    timeRef.current += delta;
    groupRef.current.rotation.y += delta * rotationSpeed * 0.2;
  });

  return (
    <>
      {/* Grid for reference */}
      <gridHelper args={[30, 30, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      <group ref={groupRef}>
        {/* Fibonacci spiral spheres */}
        {showSpheres && spiralPoints.map((point, index) => {
          const size = 0.08 + (index / pointsCount) * 0.15;
          const color = new THREE.Color().setHSL((index * 0.02) % 1, 0.7, 0.6);
          return (
            <mesh key={index} position={point}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          );
        })}

        {/* Connecting lines showing the spiral */}
        {showLines && connectingLines.map(({ points, color, index }) => (
          <Line key={`line-${index}`} points={points} color={color} lineWidth={1} opacity={0.5} transparent />
        ))}

        {/* Golden rectangle visualization */}
        <group position={[5, 2, 0]}>
          {Array.from({ length: 6 }, (_, i) => {
            const fibNum = fibonacciNumbers[i] || 1;
            const size = fibNum * 0.3;
            const offset = i * 1.2;
            return (
              <mesh key={i} position={[offset, 0, 0]}>
                <boxGeometry args={[size, size, 0.1]} />
                <meshStandardMaterial
                  color={new THREE.Color().setHSL(i * 0.15, 0.6, 0.4)}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Label for golden ratio */}
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[6, 0.8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
      </mesh>

      {/* Nautilus shell approximation */}
      <group position={[-5, -1, 0]}>
        {Array.from({ length: 50 }, (_, i) => {
          const angle = i * 0.5;
          const radius = 0.1 + i * 0.08;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const size = 0.05 + i * 0.01;
          const color = new THREE.Color().setHSL((i * 0.02 + 0.1) % 1, 0.7, 0.5);

          return (
            <mesh key={i} position={[x, y, 0]}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export default FibonacciSpiralSceneComponent;
