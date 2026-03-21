"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function MandelbrotScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { maxIterations, zoom, colorScheme, animationSpeed } = useControls("Mandelbrot", {
    maxIterations: { value: 100, min: 20, max: 500, step: 10, label: "Max Iterations" },
    zoom: { value: 1, min: 0.5, max: 5, step: 0.1, label: "Zoom Level" },
    colorScheme: {
      value: "classic",
      options: ["classic", "fire", "ocean", "rainbow"],
      label: "Color Scheme"
    },
    animationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1, label: "Animation Speed" },
  });

  // Generate Mandelbrot set texture
  const mandelbrotTexture = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);

    const centerX = -0.5;
    const centerY = 0;
    const scale = 3 / zoom;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const x0 = centerX + (px / size - 0.5) * scale;
        const y0 = centerY + (py / size - 0.5) * scale;

        let x = 0;
        let y = 0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < maxIterations) {
          const xTemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xTemp;
          iteration++;
        }

        // Color based on iteration count
        let r = 0, g = 0, b = 0;
        const idx = (py * size + px) * 4;

        if (iteration === maxIterations) {
          // Inside the set - black
          r = g = b = 0;
        } else {
          // Outside - color based on escape time
          const t = iteration / maxIterations;

          switch (colorScheme) {
            case "classic":
              r = Math.floor(256 * Math.sqrt(t));
              g = Math.floor(256 * t * t);
              b = Math.floor(256 * t * t * t);
              break;
            case "fire":
              r = Math.floor(256 * Math.min(1, t * 2));
              g = Math.floor(256 * Math.max(0, t * 2 - 1));
              b = Math.floor(256 * t * 0.5);
              break;
            case "ocean":
              r = Math.floor(256 * t * 0.3);
              g = Math.floor(256 * t * 0.7);
              b = Math.floor(256 * t);
              break;
            case "rainbow":
              const hue = t * 360;
              const hsl = hslToRgb(hue / 360, 0.8, 0.5);
              r = Math.floor(hsl[0] * 255);
              g = Math.floor(hsl[1] * 255);
              b = Math.floor(hsl[2] * 255);
              break;
          }
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }, [maxIterations, zoom, colorScheme]);

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
  }

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += delta * animationSpeed * 0.1;
  });

  return (
    <>
      {/* Mandelbrot plane */}
      <mesh ref={meshRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 6, 1, 1]} />
        <meshStandardMaterial
          map={mandelbrotTexture}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D extrusion effect */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[6, 6, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a3e"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Zoom indicator */}
      <mesh position={[3.5, 2.5, 0]}>
        <sphereGeometry args={[0.1 + zoom * 0.05, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Iteration count */}
      <mesh position={[3.5, 2, 0]}>
        <boxGeometry args={[0.1, maxIterations * 0.005, 0.1]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Interesting points markers */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh position={[-0.75, 0.1, 0.1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color="#06d6a0"
          emissive="#06d6a0"
          emissiveIntensity={0.6}
        />
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

      <gridHelper args={[10, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -3.5, 0]} />
    </>
  );
}
