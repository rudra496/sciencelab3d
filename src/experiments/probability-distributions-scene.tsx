"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface ProbabilityData {
  mean: number;
  stdDev: number;
  sampleSize: number;
  uniform?: { min: number; max: number };
}

export interface ProbabilitySceneProps {
  distributionType: "normal" | "binomial" | "poisson" | "uniform";
  mean: number;
  stdDev: number;
  sampleSize: number;
  isPlaying: boolean;
  onDataChange?: (data: ProbabilityData) => void;
}

// Box-Muller transform for normal distribution
function randomNormal(mean = 0, stdDev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

// Binomial random
function randomBinomial(n: number, p: number) {
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) successes++;
  }
  return successes;
}

// Poisson random
function randomPoisson(lambda: number) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// Uniform random
function randomUniform(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Probability Distributions scene component
 * Visualizes distributions with animated random data generation
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
  const dataRef = useRef({
    samples: [] as number[],
    histogram: [] as { x: number; count: number; maxCount: number }[],
    frameCount: 0,
    targetSamples: 100
  });
  const [, forceUpdate] = useState({});

  const updateReactState = useCallback(() => {
    forceUpdate({});
    onDataChange?.({
      mean,
      stdDev,
      sampleSize,
      uniform: distributionType === "uniform" ? { min: -3, max: 3 } : undefined,
    });
  }, [mean, stdDev, sampleSize, distributionType, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.frameCount++;

    // Add new samples every frame
    for (let i = 0; i < 3; i++) {
      let sample: number;
      switch (distributionType) {
        case "normal":
          sample = randomNormal(mean, stdDev);
          break;
        case "binomial":
          sample = randomBinomial(Math.min(20, Math.floor(sampleSize / 10)), 0.5);
          break;
        case "poisson":
          sample = randomPoisson(Math.max(1, mean + 3));
          break;
        case "uniform":
          sample = randomUniform(-3, 3);
          break;
        default:
          sample = 0;
      }
      data.samples.push(sample);
    }

    // Keep sample size manageable
    const maxSamples = Math.min(sampleSize * 5, 2000);
    if (data.samples.length > maxSamples) {
      data.samples = data.samples.slice(-maxSamples);
    }

    // Update histogram every frame
    const bins = 50;
    let minVal = -4, maxVal = 4;

    if (distributionType === "binomial") {
      minVal = -1;
      maxVal = 21;
    } else if (distributionType === "poisson") {
      minVal = -1;
      maxVal = Math.max(20, (mean + 3) * 2);
    }

    const histogram = new Array(bins).fill(0);
    const binWidth = (maxVal - minVal) / bins;

    for (const s of data.samples) {
      const bin = Math.floor((s - minVal) / binWidth);
      if (bin >= 0 && bin < bins) {
        histogram[bin]++;
      }
    }

    const maxCount = Math.max(...histogram, 1);
    data.histogram = histogram.map((count, i) => ({
      x: minVal + (i + 0.5) * binWidth,
      count,
      maxCount
    }));

    // Update React state every 8 frames
    if (data.frameCount % 8 === 0) {
      updateReactState();
    }

    // Gentle rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(data.frameCount * 0.005) * 0.1;
    }
  });

  // Generate theoretical curve points
  const curvePoints = useRef<{ points: [number, number, number][]; color: string }[]>([]);

  useEffect(() => {
    const points: [number, number, number][] = [];
    const steps = 100;
    let minVal = -4, maxVal = 4;
    let color = "#06b6d4";

    if (distributionType === "binomial") {
      minVal = -1;
      maxVal = 21;
      color = "#0891b2";
    } else if (distributionType === "poisson") {
      minVal = -1;
      maxVal = Math.max(20, (mean + 3) * 2);
      color = "#0e7490";
    } else if (distributionType === "uniform") {
      minVal = -3;
      maxVal = 3;
      color = "#a855f7";
    }

    for (let i = 0; i <= steps; i++) {
      const x = minVal + (i / steps) * (maxVal - minVal);
      let y = 0;

      if (distributionType === "normal") {
        const pdf = (x: number, mu: number, sigma: number) => {
          return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        };
        y = pdf(x, mean, stdDev) * 3;
      } else if (distributionType === "binomial") {
        const n = Math.min(20, Math.floor(sampleSize / 10));
        const p = 0.5;
        const logCoef = (n: number, k: number) => {
          if (k > n || k < 0) return -Infinity;
          if (k === 0 || k === n) return 0;
          let result = 0;
          for (let j = 0; j < k; j++) result += Math.log(n - j) - Math.log(j + 1);
          return result;
        };
        const k = Math.round(x);
        if (k >= 0 && k <= n) {
          const logP = logCoef(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
          y = Math.exp(logP) * 5;
        }
      } else if (distributionType === "poisson") {
        const lambda = Math.max(1, mean + 3);
        const k = Math.round(x);
        if (k >= 0) {
          const logKFact = (k: number) => {
            if (k <= 1) return 0;
            let result = 0;
            for (let j = 2; j <= k; j++) result += Math.log(j);
            return result;
          };
          y = Math.exp(k * Math.log(lambda) - lambda - logKFact(k)) * 5;
        }
      } else if (distributionType === "uniform") {
        if (x >= -3 && x <= 3) {
          y = 1 / 6 * 5;
        }
      }

      points.push([x, y, 0.5]);
    }

    curvePoints.current = [{ points, color }];
  }, [distributionType, mean, stdDev, sampleSize]);

  const data = dataRef.current;

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#06b6d4" />

      <group ref={groupRef}>
        {/* Histogram bars */}
        {data.histogram.map((bin, i) => {
          const barWidth = 0.12;
          const maxHeight = 3.5;
          const height = (bin.count / bin.maxCount) * maxHeight;
          const hue = distributionType === "uniform"
            ? 0.75 + (bin.x + 3) / 12 * 0.15
            : distributionType === "binomial"
            ? (i / data.histogram.length) * 0.35
            : distributionType === "poisson"
            ? 0.35 + (i / data.histogram.length) * 0.25
            : 0.5 - Math.abs(bin.x) / 8 * 0.1;
          const color = new THREE.Color().setHSL(Math.max(0, Math.min(1, hue)), 0.8, 0.55);

          return (
            <mesh key={i} position={[bin.x, height / 2, 0]}>
              <boxGeometry args={[barWidth, height, barWidth]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          );
        })}

        {/* Theoretical curve */}
        {curvePoints.current.map((curve, i) => (
          <Line
            key={i}
            points={curve.points}
            color={curve.color}
            lineWidth={3}
            opacity={0.8}
            transparent
          />
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

      {/* Distribution label */}
      <mesh position={[0, 4.5, 0]}>
        <planeGeometry args={[6, 0.6]} />
        <meshBasicMaterial
          color={distributionType === "uniform" ? "#a855f7" : "#06b6d4"}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}

export default ProbabilitySceneComponent;
