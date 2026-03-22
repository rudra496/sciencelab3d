"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface TopologyData {
  surfaceType: string;
  genus: number;
  eulerCharacteristic: number;
  boundaryComponents: number;
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
  const dataRef = useRef({
    frameCount: 0,
    time: 0
  });
  const [, forceUpdate] = useState({});

  // Topology data
  const topologyData = useMemo(() => {
    const data = {
      mobius: { genus: 1, eulerCharacteristic: 0, boundaryComponents: 1 },
      klein: { genus: 2, eulerCharacteristic: 0, boundaryComponents: 0 },
      torus: { genus: 1, eulerCharacteristic: 0, boundaryComponents: 0 },
    };
    return data[surfaceType];
  }, [surfaceType]);

  const updateReactState = useCallback(() => {
    onDataChange?.({
      surfaceType,
      genus: topologyData.genus,
      eulerCharacteristic: topologyData.eulerCharacteristic,
      boundaryComponents: topologyData.boundaryComponents,
    });
    forceUpdate({});
  }, [surfaceType, topologyData, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed * 0.3;
      meshRef.current.rotation.x = Math.sin(data.time * 0.2) * 0.2;
    }

    // Update React state every 8 frames
    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

  // Generate geometry based on surface type
  const geometry = useMemo(() => {
    let geom: THREE.BufferGeometry;

    if (surfaceType === "mobius") {
      // Mobius strip with improved parameterization
      const vertices: number[] = [];
      const indices: number[] = [];
      const uSegs = resolution;
      const vSegs = Math.max(8, Math.floor(resolution / 2));

      for (let i = 0; i <= uSegs; i++) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j++) {
          const v = (j / vSegs) * 2 - 1;
          // Improved Mobius parameterization
          const radius = 2.5 + v * 0.8 * Math.cos(u / 2);
          const x = radius * Math.cos(u);
          const y = radius * Math.sin(u);
          const z = v * 0.8 * Math.sin(u / 2);
          vertices.push(x, y, z);
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
      // Standard torus with custom resolution
      const R = 2.2; // Major radius
      const r = 0.9; // Minor radius
      const uSegs = resolution * 2;
      const vSegs = resolution;

      const vertices: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= uSegs; i++) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j++) {
          const v = (j / vSegs) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          vertices.push(x, y, z);
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
    } else {
      // Klein bottle - "figure-8" tube parameterization
      const vertices: number[] = [];
      const indices: number[] = [];
      const uSegs = resolution;
      const vSegs = Math.max(8, Math.floor(resolution / 2));

      for (let i = 0; i <= uSegs; i++) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j++) {
          const v = (j / vSegs) * Math.PI * 2;
          // Figure-8 Klein bottle
          const r = 2.2 + 0.5 * Math.cos(u / 2);
          const x = r * Math.cos(u);
          const y = r * Math.sin(u);
          const tubeRadius = 0.6;
          const z = tubeRadius * Math.sin(u / 2) * Math.cos(v) + tubeRadius * Math.cos(u / 2) * Math.sin(v);
          vertices.push(x, y, z);
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

  // Surface colors and properties
  const surfaceConfig = useMemo(() => {
    const configs = {
      mobius: {
        color: "#f97316",
        emissive: "#ea580c",
        metalness: 0.5,
        roughness: 0.2,
        wireframeColor: "#fdba74"
      },
      klein: {
        color: "#ec4899",
        emissive: "#db2777",
        metalness: 0.5,
        roughness: 0.2,
        wireframeColor: "#f9a8d4"
      },
      torus: {
        color: "#8b5cf6",
        emissive: "#7c3aed",
        metalness: 0.5,
        roughness: 0.2,
        wireframeColor: "#c4b5fd"
      }
    };
    return configs[surfaceType];
  }, [surfaceType]);

  // Grid lines for wireframe effect
  const wireframeLines = useMemo(() => {
    const posAttr = geometry.attributes.position;
    const lines: [number, number, number][][] = [];
    const uSegs = surfaceType === "torus" ? resolution * 2 : resolution;
    const vSegs = surfaceType === "torus" ? resolution : Math.max(8, Math.floor(resolution / 2));

    // U-direction lines
    for (let j = 0; j <= vSegs; j += Math.max(1, Math.floor(vSegs / 12))) {
      const line: [number, number, number][] = [];
      for (let i = 0; i <= uSegs; i += Math.max(1, Math.floor(uSegs / 24))) {
        const idx = i * (vSegs + 1) + j;
        line.push([
          posAttr.getX(idx),
          posAttr.getY(idx),
          posAttr.getZ(idx)
        ]);
      }
      lines.push(line);
    }

    // V-direction lines
    for (let i = 0; i <= uSegs; i += Math.max(1, Math.floor(uSegs / 12))) {
      const line: [number, number, number][] = [];
      for (let j = 0; j <= vSegs; j += Math.max(1, Math.floor(vSegs / 24))) {
        const idx = i * (vSegs + 1) + j;
        line.push([
          posAttr.getX(idx),
          posAttr.getY(idx),
          posAttr.getZ(idx)
        ]);
      }
      lines.push(line);
    }

    return lines;
  }, [geometry, surfaceType, resolution]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color={surfaceConfig.emissive} />
      <pointLight position={[0, 10, -5]} intensity={0.3} color="#ffffff" />

      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={surfaceConfig.color}
          emissive={surfaceConfig.emissive}
          emissiveIntensity={0.15}
          metalness={surfaceConfig.metalness}
          roughness={surfaceConfig.roughness}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      {wireframeLines.map((line, i) => (
        <Line
          key={i}
          points={line}
          color={surfaceConfig.wireframeColor}
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}

      {/* Grid helper */}
      <gridHelper args={[15, 15, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      {/* Coordinate axes */}
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="#333" lineWidth={1} />
      <Line points={[[0, -6, 0], [0, 6, 0]]} color="#333" lineWidth={1} />
      <Line points={[[0, 0, -6], [0, 0, 6]]} color="#333" lineWidth={1} />
    </>
  );
}

export default TopologySceneComponent;
