"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface LinearAlgebraData {
  vectorMagnitude: number;
  dotProduct: number;
  angle: number;
}

export interface LinearAlgebraSceneProps {
  showBasis: boolean;
  showTransform: boolean;
  rotation: number;
  scale: number;
  isPlaying: boolean;
  onDataChange?: (data: LinearAlgebraData) => void;
}

/**
 * Linear Algebra scene component
 * Visualizes vectors, matrices, and transformations in 3D
 */
export function LinearAlgebraSceneComponent({
  showBasis,
  showTransform,
  rotation,
  scale,
  isPlaying,
  onDataChange
}: LinearAlgebraSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Basis vectors
  const basisVectors = useMemo(() => [
    { dir: [1, 0, 0] as [number, number, number], color: "#ef4444", label: "X" },
    { dir: [0, 1, 0] as [number, number, number], color: "#22c55e", label: "Y" },
    { dir: [0, 0, 1] as [number, number, number], color: "#3b82f6", label: "Z" },
  ], []);

  // Sample vector
  const sampleVector = useMemo(() => new THREE.Vector3(1, 1.5, 0.5).normalize(), []);

  // Calculate magnitude
  const magnitude = sampleVector.length() * scale;

  // Calculate dot product with X axis
  const xAxis = new THREE.Vector3(1, 0, 0);
  const dotProduct = sampleVector.dot(xAxis);

  // Calculate angle
  const angle = Math.acos(dotProduct) * (180 / Math.PI);

  useEffect(() => {
    onDataChange?.({
      vectorMagnitude: magnitude,
      dotProduct,
      angle,
    });
  }, [magnitude, dotProduct, angle, scale, rotation, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    if (groupRef.current && showTransform) {
      groupRef.current.rotation.y = timeRef.current * rotation * 0.2;
      groupRef.current.rotation.x = Math.sin(timeRef.current * 0.3) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* Basis vectors */}
        {showBasis && basisVectors.map((basis) => (
          <group key={basis.label}>
            <Line
              points={[[0, 0, 0], [basis.dir[0] * 3, basis.dir[1] * 3, basis.dir[2] * 3]]}
              color={basis.color}
              lineWidth={3}
            />
            <mesh position={[basis.dir[0] * 3.3, basis.dir[1] * 3.3, basis.dir[2] * 3.3]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshStandardMaterial color={basis.color} />
            </mesh>
          </group>
        ))}

        {/* Sample vector */}
        <group>
          <Line
            points={[[0, 0, 0], [sampleVector.x * 2, sampleVector.y * 2, sampleVector.z * 2]]}
            color="#fbbf24"
            lineWidth={4}
          />
          <mesh position={[sampleVector.x * 2.3, sampleVector.y * 2.3, sampleVector.z * 2.3]}>
            <coneGeometry args={[0.2, 0.4, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Matrix transformation visualization */}
        {showTransform && (
          <group position={[2, 0, 0]}>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = Math.cos(angle) * 0.8;
              const y = Math.sin(angle) * 0.8;
              return (
                <mesh key={i} position={[x, y, 0]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial
                    color={new THREE.Color().setHSL(i / 8, 0.7, 0.5)}
                    emissive={new THREE.Color().setHSL(i / 8, 0.7, 0.5)}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* Grid */}
      <gridHelper args={[15, 15, "#1a1a3e", "#1a1a3e"]} position={[0, -0.1, 0]} />

      {/* Coordinate axes */}
      <Line points={[[-8, 0, 0], [8, 0, 0]]} color="#333" lineWidth={1} />
      <Line points={[[0, -8, 0], [0, 8, 0]]} color="#333" lineWidth={1} />
    </>
  );
}

export default LinearAlgebraSceneComponent;
