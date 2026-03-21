"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

export default function ProbabilityDistributionsScene() {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { distributionType, sampleSize, binCount } = useControls("Distributions", {
    distributionType: {
      value: "normal",
      options: ["normal", "binomial", "poisson", "uniform"],
      label: "Distribution"
    },
    sampleSize: { value: 500, min: 100, max: 2000, step: 50, label: "Sample Size" },
    binCount: { value: 20, min: 10, max: 50, step: 5, label: "Number of Bins" },
    generateSamples: button(() => generateNewSamples()),
  });

  const [samples, setSamples] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  function generateNewSamples() {
    setIsAnimating(true);
    const newSamples: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
      let value: number;

      switch (distributionType) {
        case "normal":
          // Box-Muller transform
          const u1 = Math.random();
          const u2 = Math.random();
          value = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          break;
        case "binomial":
          // Sum of Bernoulli trials
          let sum = 0;
          const trials = 20;
          const p = 0.5;
          for (let j = 0; j < trials; j++) {
            sum += Math.random() < p ? 1 : 0;
          }
          value = (sum - trials * p) / Math.sqrt(trials * p * (1 - p));
          break;
        case "poisson":
          const lambda = 5;
          let l = Math.exp(-lambda);
          let k = 0;
          let poissonP = 1;
          do {
            k++;
            poissonP *= Math.random();
          } while (poissonP > l);
          value = (k - lambda) / Math.sqrt(lambda);
          break;
        case "uniform":
          value = (Math.random() - 0.5) * 2;
          break;
        default:
          value = 0;
      }

      newSamples.push(value);
    }

    setSamples(newSamples);
    setTimeout(() => setIsAnimating(false), 500);
  }

  useMemo(() => {
    generateNewSamples();
  }, [distributionType, sampleSize, binCount]);

  useFrame((_, delta) => {
    if (!barsRef.current) return;
    const dt = Math.min(delta, 0.02);

    // Calculate histogram
    const minVal = -3;
    const maxVal = 3;
    const binWidth = (maxVal - minVal) / binCount;
    const histogram = new Array(binCount).fill(0);

    samples.forEach(sample => {
      if (sample >= minVal && sample < maxVal) {
        const binIndex = Math.floor((sample - minVal) / binWidth);
        if (binIndex >= 0 && binIndex < binCount) {
          histogram[binIndex]++;
        }
      }
    });

    const maxCount = Math.max(...histogram);

    // Update bars
    for (let i = 0; i < binCount; i++) {
      const height = (histogram[i] / maxCount) * 2.5;
      const x = (i / binCount) * 6 - 3 + binWidth / 2;

      dummy.position.set(x, height / 2, 0);
      dummy.scale.set(binWidth * 0.9, Math.max(0.01, height), 0.3);
      dummy.updateMatrix();
      barsRef.current.setMatrixAt(i, dummy.matrix);
    }

    barsRef.current.instanceMatrix.needsUpdate = true;

    // Animate sample points
    if (pointsRef.current && isAnimating) {
      const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const pointCount = Math.min(samples.length, 500);

      for (let i = 0; i < pointCount; i++) {
        const targetX = (samples[i] / 3) * 6;
        const targetY = -2.5 + (i % 3) * 0.3;

        positions.array[i * 3] += (targetX - positions.array[i * 3]) * dt * 5;
        positions.array[i * 3 + 1] += (targetY - positions.array[i * 3 + 1]) * dt * 5;
      }

      positions.needsUpdate = true;
    }
  });

  // Theoretical distribution curve
  const theoreticalCurve = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let x = -3; x <= 3; x += 0.1) {
      let y: number;

      switch (distributionType) {
        case "normal":
          y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) * 2.5;
          break;
        case "binomial":
        case "poisson":
          // Approximated as normal for visualization
          y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) * 2.5;
          break;
        case "uniform":
          y = x >= -1 && x <= 1 ? 0.5 * 2.5 : 0;
          break;
        default:
          y = 0;
      }

      points.push([x, Math.max(0, y), 0]);
    }

    return points;
  }, [distributionType]);

  // Sample point positions
  const pointPositions = useMemo(() => {
    const positions = new Float32Array(Math.min(samples.length, 500) * 3);

    for (let i = 0; i < Math.min(samples.length, 500); i++) {
      positions[i * 3] = (samples[i] / 3) * 6;
      positions[i * 3 + 1] = -2.5 + (i % 3) * 0.3;
      positions[i * 3 + 2] = 0.5;
    }

    return positions;
  }, [samples]);

  // Calculate statistics
  const mean = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const variance = samples.length > 0 ? samples.reduce((sum, val) => sum + (val - mean) ** 2, 0) / samples.length : 0;
  const stdDev = Math.sqrt(variance);

  return (
    <>
      {/* Histogram bars */}
      <instancedMesh ref={barsRef} args={[undefined, undefined, binCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.3}
        />
      </instancedMesh>

      {/* Theoretical distribution curve */}
      <mesh>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(theoreticalCurve.map(p => new THREE.Vector3(...p))), 64, 0.05, 8, false]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Sample points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#06d6a0" sizeAttenuation />
      </points>

      {/* Mean line */}
      <mesh position={[mean, 1.5, 0]}>
        <boxGeometry args={[0.05, 3, 0.05]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Standard deviation indicators */}
      <mesh position={[mean + stdDev, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[mean - stdDev, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Axes */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[7, 0.02, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-3.5, 0, 0]}>
        <boxGeometry args={[0.02, 3, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Labels */}
      <mesh position={[3.5, 2.5, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[3.5, 2, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[3.5, 1.5, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.5}
        />
      </mesh>

      <gridHelper args={[10, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -1.6, 0]} />
    </>
  );
}
