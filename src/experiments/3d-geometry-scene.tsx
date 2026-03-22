"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface Geometry3DData {
  vertices: number;
  edges: number;
  faces: number;
  eulerCharacteristic: number;
}

export interface Geometry3DSceneProps {
  shapeType: "tetrahedron" | "cube" | "octahedron" | "dodecahedron" | "icosahedron";
  rotationSpeed: number;
  wireframe: boolean;
  isPlaying: boolean;
  onDataChange?: (data: Geometry3DData) => void;
}

/**
 * 3D Geometry scene component
 * Visualizes Platonic solids with vertices, edges, and faces
 */
export function Geometry3DSceneComponent({
  shapeType,
  rotationSpeed,
  wireframe,
  isPlaying,
  onDataChange
}: Geometry3DSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Geometry data for Platonic solids
  const geometryData = useMemo(() => {
    const shapes = {
      tetrahedron: { vertices: 4, edges: 6, faces: 4 },
      cube: { vertices: 8, edges: 12, faces: 6 },
      octahedron: { vertices: 6, edges: 12, faces: 8 },
      dodecahedron: { vertices: 20, edges: 30, faces: 12 },
      icosahedron: { vertices: 12, edges: 30, faces: 20 },
    };
    return shapes[shapeType];
  }, [shapeType]);

  // Report data changes
  useEffect(() => {
    onDataChange?.({
      ...geometryData,
      eulerCharacteristic: geometryData.vertices - geometryData.edges + geometryData.faces,
    });
  }, [geometryData, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying || !meshRef.current) return;
    meshRef.current.rotation.x += delta * rotationSpeed * 0.5;
    meshRef.current.rotation.y += delta * rotationSpeed * 0.3;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      <mesh ref={meshRef}>
        {shapeType === "tetrahedron" && <tetrahedronGeometry args={[2]} />}
        {shapeType === "cube" && <boxGeometry args={[2.5, 2.5, 2.5]} />}
        {shapeType === "octahedron" && <octahedronGeometry args={[2]} />}
        {shapeType === "dodecahedron" && <dodecahedronGeometry args={[2]} />}
        {shapeType === "icosahedron" && <icosahedronGeometry args={[2]} />}
        <meshStandardMaterial
          color={wireframe ? "#1e3a5f" : "#3b82f6"}
          wireframe={wireframe}
          metalness={0.5}
          roughness={0.2}
          emissive={wireframe ? "#3b82f6" : "#000"}
          emissiveIntensity={wireframe ? 0.3 : 0}
        />
      </mesh>

      {/* Vertices highlighting */}
      {!wireframe && (
        <>
          <mesh position={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-1.5, 1.5, 1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[1.5, -1.5, 1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-1.5, -1.5, 1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default Geometry3DSceneComponent;
