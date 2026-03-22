"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface MandelbrotData {
  iterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
}

export interface MandelbrotSceneProps {
  maxIterations: number;
  zoom: number;
  colorScheme: "rainbow" | "fire" | "grayscale";
  rotationSpeed: number;
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
  isPlaying,
  onDataChange
}: MandelbrotSceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  // Calculate Mandelbrot iteration for a point
  const calculateMandelbrot = (cx: number, cy: number) => {
    let x = 0, y = 0;
    let iteration = 0;
    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const temp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = temp;
      iteration++;
    }
    return iteration;
  };

  // Generate fractal points
  const points = useMemo(() => {
    const pts: { x: number; z: number; height: number; color: THREE.Color }[] = [];
    const scale = 3 / zoom;
    const step = 0.15 / Math.sqrt(zoom);

    for (let x = -scale; x <= scale; x += step) {
      for (let z = -scale; z <= scale; z += step) {
        const cx = -0.5 + x * 0.5;
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
  }, [maxIterations, zoom, colorScheme]);

  useEffect(() => {
    onDataChange?.({
      iterations: maxIterations,
      zoom,
      centerX: -0.5,
      centerY: 0,
    });
  }, [maxIterations, zoom, colorScheme, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed * 0.1;
    }
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 15, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />

      <instancedMesh ref={meshRef} args={[new THREE.BoxGeometry(0.08, 1, 0.08), undefined, points.length]}>
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

      {/* Base plane */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>

      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -0.1, 0]} />

      {/* Labels */}
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[5, 0.6]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default MandelbrotSceneComponent;
