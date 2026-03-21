"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface AnimatedBackgroundProps {
  color?: string;
  opacity?: number;
  speed?: number;
  particleCount?: number;
}

/**
 * Animated particle background
 * - Subtle floating particles
 * - No performance impact
 * - Customizable color and speed
 */
export function AnimatedBackground({
  color = "#8b5cf6",
  opacity = 0.3,
  speed = 0.1,
  particleCount = 200,
}: AnimatedBackgroundProps) {
  const meshRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Create particle data
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 100;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 50;

      // Color with slight variation
      const colorVariation = 0.8 + Math.random() * 0.4;
      colors[i * 3] = baseColor.r * colorVariation;
      colors[i * 3 + 1] = baseColor.g * colorVariation;
      colors[i * 3 + 2] = baseColor.b * colorVariation;

      // Random sizes
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    return [positions, colors, sizes];
  }, [color, particleCount]);

  // Geometry and material
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [opacity]);

  // Animate particles
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    timeRef.current += delta * speed;
    const time = timeRef.current;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Gentle floating motion
      positions[i3] += Math.sin(time + i) * 0.01;
      positions[i3 + 1] += Math.cos(time + i * 0.5) * 0.01;
      positions[i3 + 2] += Math.sin(time + i * 0.3) * 0.005;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Cleanup
  useMemo(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <points ref={meshRef} geometry={geometry} material={material}>
      <bufferGeometry />
    </points>
  );
}

/**
 * Gradient shader background
 * - Smooth gradient animation
 * - Very performant (single quad)
 */
export function GradientBackground({
  topColor = "#0a0a1a",
  bottomColor = "#1a1a3e",
}: {
  topColor?: string;
  bottomColor?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const material = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uTopColor: { value: new THREE.Color(topColor) },
      uBottomColor: { value: new THREE.Color(bottomColor) },
    };

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        varying vec2 vUv;

        void main() {
          // Create gradient with subtle animation
          float gradient = vUv.y;
          float wave = sin(vUv.x * 3.0 + uTime * 0.2) * 0.03;
          float wave2 = cos(vUv.y * 2.0 + uTime * 0.15) * 0.02;

          vec3 color = mix(uBottomColor, uTopColor, gradient + wave + wave2);

          // Add subtle vignette
          float dist = distance(vUv, vec2(0.5));
          float vignette = 1.0 - dist * 0.5;
          color *= vignette;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [topColor, bottomColor]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    material.uniforms.uTime.value = timeRef.current;
  });

  return (
    <mesh ref={meshRef} scale={[500, 500, 500]}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/**
 * Starfield background
 * - Distant stars
 * - Very subtle movement
 */
export function StarfieldBackground({
  count = 1000,
  speed = 0.05,
}: {
  count?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 300;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 1;
    }

    return [positions, sizes];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * speed * 0.1;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

export default AnimatedBackground;
