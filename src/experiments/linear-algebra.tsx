"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function LinearAlgebraScene() {
  const groupRef = useRef<THREE.Group>(null);

  const { transformType, showGrid, showBasis, animationSpeed, matrixA, matrixB } = useControls("Linear Algebra", {
    transformType: {
      value: "rotation",
      options: ["rotation", "scaling", "shear", "reflection", "custom"],
      label: "Transformation"
    },
    showGrid: { value: true, label: "Show Grid" },
    showBasis: { value: true, label: "Show Basis Vectors" },
    animationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1, label: "Animation Speed" },
    matrixA: { value: 1, min: -2, max: 2, step: 0.1, label: "Matrix A" },
    matrixB: { value: 1, min: -2, max: 2, step: 0.1, label: "Matrix B" },
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const time = performance.now() * 0.001 * animationSpeed;

    switch (transformType) {
      case "rotation":
        groupRef.current.rotation.y = time * 0.5;
        break;
      case "scaling":
        const scale = 1 + Math.sin(time) * 0.3;
        groupRef.current.scale.set(scale, scale, scale);
        break;
      case "shear":
        groupRef.current.rotation.x = Math.sin(time) * 0.3;
        groupRef.current.position.x = Math.sin(time) * 0.5;
        break;
      case "reflection":
        groupRef.current.rotation.z = Math.sin(time * 0.5) * Math.PI;
        break;
      case "custom":
        groupRef.current.scale.set(matrixA, 1, matrixB);
        break;
    }
  });

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];

    for (let i = -5; i <= 5; i++) {
      lines.push({ start: [-5, i * 0.5, 0], end: [5, i * 0.5, 0] });
      lines.push({ start: [i * 0.5, -5, 0], end: [i * 0.5, 5, 0] });
    }

    return lines;
  }, []);

  // Basis vectors
  const basisVectors = useMemo(() => {
    return [
      { direction: [1, 0, 0] as [number, number, number], color: "#ff6b35" },
      { direction: [0, 1, 0] as [number, number, number], color: "#4f8fff" },
      { direction: [0, 0, 1] as [number, number, number], color: "#06d6a0" },
    ];
  }, []);

  return (
    <>
      <group ref={groupRef}>
        {/* Coordinate grid */}
        {showGrid && gridLines.map((line, i) => (
          <mesh key={i} position={[
            (line.start[0] + line.end[0]) / 2,
            (line.start[1] + line.end[1]) / 2,
            (line.start[2] + line.end[2]) / 2
          ]} rotation={[0, 0, line.start[0] === line.end[0] ? 0 : Math.PI / 2]}>
            <boxGeometry args={[
              Math.abs(line.end[0] - line.start[0]) || 0.01,
              Math.abs(line.end[1] - line.start[1]) || 0.01,
              0.01
            ]} />
            <meshStandardMaterial
              color="#1a1a3e"
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}

        {/* Basis vectors */}
        {showBasis && basisVectors.map((vec, i) => (
          <group key={i}>
            <mesh position={[vec.direction[0] * 1.5, vec.direction[1] * 1.5, vec.direction[2] * 1.5]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshStandardMaterial
                color={vec.color}
                emissive={vec.color}
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh
              position={[vec.direction[0] * 0.75, vec.direction[1] * 0.75, vec.direction[2] * 0.75]}
              rotation={[0, 0, Math.atan2(vec.direction[1], vec.direction[0])]}
            >
              <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
              <meshStandardMaterial color={vec.color} />
            </mesh>
          </group>
        ))}

        {/* Unit square */}
        <mesh position={[0.5, 0.5, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Example vector being transformed */}
        <mesh position={[1.5, 1, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0.75, 0.5, 0]} rotation={[0, 0, Math.atan2(1, 1.5)]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>

        {/* Additional vectors showing transformation */}
        <mesh position={[0, 1.2, 0.2]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Matrix representation visualization */}
      <mesh position={[3.5, 2, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#1a1a3e"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Matrix entries */}
      <mesh position={[3.3, 2.2, 0.06]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[3.7, 2.2, 0.06]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[3.3, 1.8, 0.06]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[3.7, 1.8, 0.06]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      {/* Labels */}
      <mesh position={[-3.5, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-3.5, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-3.5, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
