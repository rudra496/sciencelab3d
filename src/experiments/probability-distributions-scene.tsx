"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export interface ProbabilityData {
  mean: number;
  stdDev: number;
  sampleSize: number;
}

export interface ProbabilitySceneProps {
  distributionType: "normal" | "binomial" | "poisson";
  mean: number;
  stdDev: number;
  sampleSize: number;
  isPlaying: boolean;
  onDataChange?: (data: ProbabilityData) => void;
}

/**
 * Probability Distributions scene component
 * Visualizes normal, binomial, and Poisson distributions in 3D
 */
export function ProbabilitySceneComponent({
  distributionType,
  mean,
  stdDev,
  sampleSize,
  isPlaying,
  onDataChange
}: ProbabilitySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Calculate normal distribution PDF
  const normalPDF = (x: number, mu: number, sigma: number) => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  // Calculate binomial PMF
  const binomialPMF = (k: number, n: number, p: number) => {
    const logCoef = (n: number, k: number) => {
      if (k > n || k < 0) return -Infinity;
      if (k === 0 || k === n) return Math.log(1);
      let result = 0;
      for (let i = 0; i < k; i++) result += Math.log(n - i) - Math.log(i + 1);
      return result;
    };
    const logP = logCoef(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
    return Math.exp(logP);
  };

  // Calculate Poisson PMF
  const poissonPMF = (k: number, lambda: number) => {
    if (k < 0) return 0;
    const logKFact = (k: number) => {
      if (k <= 1) return 0;
      let result = 0;
      for (let i = 2; i <= k; i++) result += Math.log(i);
      return result;
    };
    return Math.exp(k * Math.log(lambda) - lambda - logKFact(k));
  };

  // Generate bars for the distribution
  const bars = useMemo(() => {
    const result: { x: number; height: number; color: string }[] = [];

    if (distributionType === "normal") {
      for (let i = -40; i <= 40; i++) {
        const x = i * 0.1;
        const height = normalPDF(x, 0, 1) * 3;
        const hue = 0.6 - Math.abs(x) / 8;
        result.push({ x, height, color: new THREE.Color().setHSL(Math.max(0, hue), 0.8, 0.5).getStyle() });
      }
    } else if (distributionType === "binomial") {
      const n = Math.min(20, Math.floor(sampleSize));
      const p = 0.5;
      for (let k = 0; k <= n; k++) {
        const height = binomialPMF(k, n, p) * 5;
        const x = (k - n / 2) * 0.4;
        const hue = (k / n) * 0.3;
        result.push({ x, height, color: new THREE.Color().setHSL(hue, 0.8, 0.5).getStyle() });
      }
    } else if (distributionType === "poisson") {
      const lambda = Math.max(1, mean);
      for (let k = 0; k <= 20; k++) {
        const height = poissonPMF(k, lambda) * 5;
        const x = (k - lambda) * 0.4;
        const hue = 0.3 + (k / 20) * 0.3;
        result.push({ x, height, color: new THREE.Color().setHSL(hue, 0.8, 0.5).getStyle() });
      }
    }

    return result;
  }, [distributionType, mean, sampleSize]);

  useEffect(() => {
    onDataChange?.({ mean, stdDev, sampleSize });
  }, [mean, stdDev, sampleSize, distributionType, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.3) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#06b6d4" />

      <group ref={groupRef}>
        {bars.map((bar, i) => (
          <mesh key={i} position={[bar.x, bar.height / 2, 0]}>
            <boxGeometry args={[0.08, bar.height, 0.08]} />
            <meshStandardMaterial
              color={bar.color}
              emissive={bar.color}
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Base plane */}
      <mesh position={[0, -0.05, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>

      {/* Axes */}
      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -0.1, 0]} />
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="#666" lineWidth={2} />
      <Line points={[[0, -0.5, 0], [0, 4, 0]]} color="#666" lineWidth={2} />

      {/* Label */}
      <mesh position={[0, 4.5, 0]}>
        <planeGeometry args={[6, 0.6]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default ProbabilitySceneComponent;
