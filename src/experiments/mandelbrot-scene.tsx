"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface MandelbrotData {
  iterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  pointsRendered: number;
}

export interface MandelbrotSceneProps {
  maxIterations: number;
  zoom: number;
  colorScheme: "rainbow" | "fire" | "grayscale";
  rotationSpeed: number;
  resolution: number;
  isPlaying: boolean;
  onDataChange?: (data: MandelbrotData) => void;
}

/**
 * Mandelbrot fractal scene component
 * Visualizes the Mandelbrot set in 3D with height-based rendering
 */
export function MandelbrotSceneComponent({
  maxIterations,
  zoom,
  colorScheme,
  rotationSpeed,
  resolution,
  isPlaying,
  onDataChange
}: MandelbrotSceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frameCountRef = useRef(0);
  const timeRef = useRef(0);

  // Physics state in refs
  const rotationRef = useRef(0);

  // React state for UI updates (throttled)
  const [pointsRendered, setPointsRendered] = useState(0);

  // Calculate Mandelbrot iteration for a point
  const calculateMandelbrot = useCallback((cx: number, cy: number) => {
    let x = 0, y = 0;
    let iteration = 0;
    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const temp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = temp;
      iteration++;
    }
    return iteration;
  }, [maxIterations]);

  // Generate fractal points
  const points = useMemo(() => {
    const pts: { x: number; z: number; height: number; color: THREE.Color }[] = [];
    const scale = 3 / zoom;
    const step = 0.2 / Math.sqrt(zoom);
    const effectiveResolution = Math.min(resolution, 100);

    for (let xi = 0; xi < effectiveResolution; xi++) {
      for (let zi = 0; zi < effectiveResolution; zi++) {
        const x = (xi / effectiveResolution - 0.5) * 2 * scale;
        const z = (zi / effectiveResolution - 0.5) * 2 * scale;

        // Center on interesting Mandelbrot region
        const cx = -0.75 + x * 0.5;
        const cy = z * 0.5;
        const iterations = calculateMandelbrot(cx, cy);

        if (iterations < maxIterations) {
          const height = (iterations / maxIterations) * 3;
          let color: THREE.Color;

          if (colorScheme === "rainbow") {
            color = new THREE.Color().setHSL((iterations / maxIterations) * 0.8, 0.8, 0.5);
          } else if (colorScheme === "fire") {
            color = new THREE.Color().setHSL(0.05 - (iterations / maxIterations) * 0.05, 1, 0.3 + (iterations / maxIterations) * 0.4);
          } else {
            const gray = iterations / maxIterations;
            color = new THREE.Color(gray, gray, gray);
          }

          pts.push({ x, z, height, color });
        }
      }
    }
    return pts;
  }, [maxIterations, zoom, colorScheme, calculateMandelbrot, resolution]);

  // Report data changes
  useEffect(() => {
    setPointsRendered(points.length);
    onDataChange?.({
      iterations: maxIterations,
      zoom,
      centerX: -0.75,
      centerY: 0,
      pointsRendered: points.length,
    });
  }, [maxIterations, zoom, colorScheme, points.length, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta;
    rotationRef.current += delta * rotationSpeed * 0.1;

    if (meshRef.current) {
      meshRef.current.rotation.y = rotationRef.current;
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      onDataChange?.({
        iterations: maxIterations,
        zoom,
        centerX: -0.75,
        centerY: 0,
        pointsRendered: points.length,
      });
    }
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, -5, 0]} intensity={0.2} color="#8b5cf6" />

      {/* Instanced mesh for performance */}
      <instancedMesh ref={meshRef} args={[new THREE.BoxGeometry(0.06, 1, 0.06), undefined, points.length]}>
        <meshStandardMaterial metalness={0.3} roughness={0.4} />
        {points.map((pt, i) => {
          dummy.position.set(pt.x, pt.height / 2, pt.z);
          dummy.scale.set(1, pt.height, 1);
          dummy.updateMatrix();
          return (
            <primitive key={i} object={dummy} matrix={dummy.matrix.clone()} attach="instance-matrix" />
          );
        })}
      </instancedMesh>

      {/* Base plane with grid */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.95} />
      </mesh>

      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -0.1, 0]} />

      {/* Coordinate axes */}
      <Line
        points={[[-3, 0, 0], [3, 0, 0]]}
        color="#ef4444"
        lineWidth={1}
      />
      <Line
        points={[[0, 0, -3], [0, 0, 3]]}
        color="#22c55e"
        lineWidth={1}
      />
      <Line
        points={[[0, 0, 0], [0, 3, 0]]}
        color="#3b82f6"
        lineWidth={1}
      />

      {/* Boundary circle showing escape radius */}
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return [Math.cos(angle) * 2, 0, Math.sin(angle) * 2] as [number, number, number];
        })}
        color="#8b5cf6"
        lineWidth={1}
        opacity={0.3}
        transparent
      />

      {/* Julia set hint (small separate visualization) */}
      <group position={[5, 1, 0]}>
        {Array.from({ length: 50 }, (_, i) => {
          const angle = (i / 50) * Math.PI * 2;
          const r = 0.5 + Math.sin(angle * 3) * 0.2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          const color = new THREE.Color().setHSL(i / 50, 0.7, 0.5);
          return (
            <mesh key={i} position={[x, y, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Info labels */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[5, 0.5]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default MandelbrotSceneComponent;
