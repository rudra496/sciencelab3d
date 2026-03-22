"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface TopologyData {
  surfaceType: string;
  genus: number;
  eulerCharacteristic: number;
}

export interface TopologySceneProps {
  surfaceType: "mobius" | "klein" | "torus";
  resolution: number;
  rotationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: TopologyData) => void;
}

/**
 * Topology Surfaces scene component
 * Visualizes Mobius strip, Klein bottle, and torus in 3D
 */
export function TopologySceneComponent({
  surfaceType,
  resolution,
  rotationSpeed,
  isPlaying,
  onDataChange
}: TopologySceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Topology data
  const topologyData = useMemo(() => {
    const data = {
      mobius: { genus: 1, eulerCharacteristic: 0 },
      klein: { genus: 2, eulerCharacteristic: 0 },
      torus: { genus: 1, eulerCharacteristic: 0 },
    };
    return data[surfaceType];
  }, [surfaceType]);

  useEffect(() => {
    onDataChange?.({
      surfaceType,
      genus: topologyData.genus,
      eulerCharacteristic: topologyData.eulerCharacteristic,
    });
  }, [surfaceType, topologyData, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed * 0.3;
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.2;
    }
  });

  // Generate geometry based on surface type
  const geometry = useMemo(() => {
    let geom: THREE.BufferGeometry;

    if (surfaceType === "mobius") {
      // Mobius strip
      const vertices: number[] = [];
      const indices: number[] = [];
      const uSegs = resolution;
      const vSegs = Math.floor(resolution / 2);

      for (let i = 0; i <= uSegs; i++) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j++) {
          const v = (j / vSegs) * 2 - 1;
          const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
          const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
          const z = v * Math.sin(u / 2);
          vertices.push(x * 2, y * 2, z);
        }
      }

      for (let i = 0; i < uSegs; i++) {
        for (let j = 0; j < vSegs; j++) {
          const a = i * (vSegs + 1) + j;
          const b = a + vSegs + 1;
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }

      geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
    } else if (surfaceType === "torus") {
      geom = new THREE.TorusGeometry(2, 0.8, resolution * 4, resolution * 2);
    } else {
      // Klein bottle approximation (figure-8 torus)
      const vertices: number[] = [];
      const indices: number[] = [];
      const uSegs = resolution;
      const vSegs = Math.floor(resolution / 2);

      for (let i = 0; i <= uSegs; i++) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j++) {
          const v = (j / vSegs) * Math.PI * 2;
          const r = 2 + Math.cos(u / 2);
          const x = r * Math.cos(u);
          const y = r * Math.sin(u);
          const z = Math.sin(u / 2) * Math.cos(v) + Math.cos(u / 2) * Math.sin(v);
          vertices.push(x, y, z * 0.8);
        }
      }

      for (let i = 0; i < uSegs; i++) {
        for (let j = 0; j < vSegs; j++) {
          const a = i * (vSegs + 1) + j;
          const b = a + vSegs + 1;
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }

      geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
    }

    return geom;
  }, [surfaceType, resolution]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#ec4899" />

      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={surfaceType === "mobius" ? "#f97316" : surfaceType === "klein" ? "#ec4899" : "#8b5cf6"}
          metalness={0.4}
          roughness={0.3}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>

      <gridHelper args={[15, 15, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default TopologySceneComponent;
