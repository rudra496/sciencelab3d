"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function Geometry3DScene() {
  const shapeRef = useRef<THREE.Mesh>(null);

  const { shapeType, rotationSpeed, showWireframe, showFaces, opacity } = useControls("3D Geometry", {
    shapeType: {
      value: "icosahedron",
      options: ["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"],
      label: "Platonic Solid"
    },
    rotationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Rotation Speed" },
    showWireframe: { value: true, label: "Show Wireframe" },
    showFaces: { value: true, label: "Show Faces" },
    opacity: { value: 0.8, min: 0.1, max: 1, step: 0.05, label: "Opacity" },
  });

  useFrame((_, delta) => {
    if (!shapeRef.current) return;
    shapeRef.current.rotation.x += delta * rotationSpeed;
    shapeRef.current.rotation.y += delta * rotationSpeed * 0.7;
  });

  // Platonic solid properties
  const solidData = useMemo(() => {
    const data = {
      tetrahedron: { faces: 4, vertices: 4, edges: 6, geometry: new THREE.TetrahedronGeometry(1.5, 0) },
      cube: { faces: 6, vertices: 8, edges: 12, geometry: new THREE.BoxGeometry(1.8, 1.8, 1.8) },
      octahedron: { faces: 8, vertices: 6, edges: 12, geometry: new THREE.OctahedronGeometry(1.5, 0) },
      dodecahedron: { faces: 12, vertices: 20, edges: 30, geometry: new THREE.DodecahedronGeometry(1.5, 0) },
      icosahedron: { faces: 20, vertices: 12, edges: 30, geometry: new THREE.IcosahedronGeometry(1.5, 0) },
    };
    return data[shapeType as keyof typeof data];
  }, [shapeType]);

  // Vertex colors for visualization
  const vertexColors = useMemo(() => {
    const colors: string[] = [];
    const numColors = solidData.vertices;
    for (let i = 0; i < numColors; i++) {
      const hue = (i / numColors) * 360;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  }, [solidData.vertices]);

  return (
    <>
      <group>
        {/* Main solid */}
        {showFaces && (
          <mesh ref={shapeRef} geometry={solidData.geometry}>
            <meshStandardMaterial
              color="#4f8fff"
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        )}

        {/* Wireframe overlay */}
        {showWireframe && (
          <mesh ref={shapeRef} geometry={solidData.geometry}>
            <meshBasicMaterial
              color="#ffffff"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}

        {/* Vertices */}
        {vertexColors.map((color, i) => {
          const phi = Math.acos(1 - 2 * (i + 0.5) / solidData.vertices);
          const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
          const r = 1.6;
          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);

          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Euler's formula visualization: V - E + F = 2 */}
      <mesh position={[3.5, 2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Count displays */}
      <mesh position={[3.5, 1.2, 0]}>
        <sphereGeometry args={[0.06 + solidData.vertices * 0.005, 16, 16]} />
        <meshStandardMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[3.5, 0.6, 0]}>
        <sphereGeometry args={[0.06 + solidData.edges * 0.003, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[3.5, 0, 0]}>
        <sphereGeometry args={[0.06 + solidData.faces * 0.01, 16, 16]} />
        <meshStandardMaterial color="#06d6a0" />
      </mesh>

      {/* Labels */}
      <mesh position={[-3.5, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[-3.5, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-3.5, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      {/* Symmetry planes */}
      <mesh position={[0, 0, -2.5]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
