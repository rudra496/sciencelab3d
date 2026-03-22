"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface Geometry3DData {
  vertices: number;
  edges: number;
  faces: number;
  eulerCharacteristic: number;
  currentRotation: number;
}

export interface Geometry3DSceneProps {
  shapeType: "tetrahedron" | "cube" | "octahedron" | "dodecahedron" | "icosahedron";
  rotationSpeed: number;
  wireframe: boolean;
  showVertices: boolean;
  showEdges: boolean;
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
  showVertices,
  showEdges,
  isPlaying,
  onDataChange
}: Geometry3DSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const rotationRef = useRef({ x: 0, y: 0 });

  // React state for UI updates (throttled)
  const [currentRotation, setCurrentRotation] = useState(0);

  // Geometry data for Platonic solids
  const geometryData = useMemo(() => {
    const shapes = {
      tetrahedron: { vertices: 4, edges: 6, faces: 4, name: "Tetrahedron" },
      cube: { vertices: 8, edges: 12, faces: 6, name: "Cube (Hexahedron)" },
      octahedron: { vertices: 6, edges: 12, faces: 8, name: "Octahedron" },
      dodecahedron: { vertices: 20, edges: 30, faces: 12, name: "Dodecahedron" },
      icosahedron: { vertices: 12, edges: 30, faces: 20, name: "Icosahedron" },
    };
    return shapes[shapeType];
  }, [shapeType]);

  // Get geometry for the shape
  const geometry = useMemo(() => {
    switch (shapeType) {
      case "tetrahedron": return new THREE.TetrahedronGeometry(2);
      case "cube": return new THREE.BoxGeometry(2.5, 2.5, 2.5);
      case "octahedron": return new THREE.OctahedronGeometry(2);
      case "dodecahedron": return new THREE.DodecahedronGeometry(2);
      case "icosahedron": return new THREE.IcosahedronGeometry(2);
      default: return new THREE.BoxGeometry(2, 2, 2);
    }
  }, [shapeType]);

  // Get vertex positions
  const vertexPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const posAttribute = geometry.getAttribute("position");
    const vertexSet = new Set<string>();

    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      const z = posAttribute.getZ(i);
      const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;

      if (!vertexSet.has(key)) {
        vertexSet.add(key);
        positions.push(new THREE.Vector3(x, y, z));
      }
    }
    return positions;
  }, [geometry]);

  // Generate edge lines
  const edgeLines = useMemo(() => {
    if (!showEdges) return [];

    const lines: [number, number, number][] = [];
    const posAttribute = geometry.getAttribute("position");
    const indexAttribute = geometry.getIndex();

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i += 3) {
        for (let j = 0; j < 3; j++) {
          const a = indexAttribute.getX(i + j);
          const b = indexAttribute.getX(i + ((j + 1) % 3));

          const ax = posAttribute.getX(a);
          const ay = posAttribute.getY(a);
          const az = posAttribute.getZ(a);
          const bx = posAttribute.getX(b);
          const by = posAttribute.getY(b);
          const bz = posAttribute.getZ(b);

          lines.push([ax, ay, az]);
          lines.push([bx, by, bz]);
        }
      }
    }
    return lines;
  }, [geometry, showEdges]);

  // Report data changes
  useEffect(() => {
    setCurrentRotation(rotationRef.current.y);
    onDataChange?.({
      ...geometryData,
      eulerCharacteristic: geometryData.vertices - geometryData.edges + geometryData.faces,
      currentRotation: rotationRef.current.y,
    });
  }, [geometryData, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    frameCountRef.current++;

    if (meshRef.current) {
      rotationRef.current.x += delta * rotationSpeed * 0.5;
      rotationRef.current.y += delta * rotationSpeed * 0.3;

      meshRef.current.rotation.x = rotationRef.current.x;
      meshRef.current.rotation.y = rotationRef.current.y;
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      setCurrentRotation(rotationRef.current.y);
      onDataChange?.({
        ...geometryData,
        eulerCharacteristic: geometryData.vertices - geometryData.edges + geometryData.faces,
        currentRotation: rotationRef.current.y,
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#22c55e" />

      {/* Edge lines */}
      {showEdges && edgeLines.length > 0 && (
        <Line points={edgeLines} color="#3b82f6" lineWidth={2} opacity={0.8} />
      )}

      {/* Main mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={wireframe ? "#1e3a5f" : "#3b82f6"}
          wireframe={wireframe}
          metalness={0.5}
          roughness={0.2}
          emissive={wireframe ? "#3b82f6" : "#000"}
          emissiveIntensity={wireframe ? 0.3 : 0}
          transparent
          opacity={wireframe ? 0.8 : 0.9}
        />
      </mesh>

      {/* Vertex highlighting */}
      {showVertices && !wireframe && vertexPositions.map((pos, i) => (
        <group key={i}>
          <mesh position={pos}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
          {/* Vertex glow */}
          <mesh position={pos}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ef4444"
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Shape label */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[6, 0.5]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
      </mesh>

      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      {/* Euler's formula visualization */}
      <group position={[-5, 0, 0]}>
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[3, 1.2]} />
          <meshBasicMaterial color="#1a1a3e" transparent opacity={0.9} />
        </mesh>
        {/* V - E + F = 2 */}
      </group>

      {/* Dual shape hint */}
      <group position={[5, 0, 0]}>
        <mesh>
          {shapeType === "cube" && <octahedronGeometry args={[0.8]} />}
          {shapeType === "octahedron" && <boxGeometry args={[1, 1, 1]} />}
          {shapeType === "dodecahedron" && <icosahedronGeometry args={[0.8]} />}
          {shapeType === "icosahedron" && <dodecahedronGeometry args={[0.8]} />}
          <meshStandardMaterial
            color="#22c55e"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </>
  );
}

export default Geometry3DSceneComponent;
