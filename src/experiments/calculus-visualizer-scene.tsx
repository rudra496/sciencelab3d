"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface CalculusData {
  x: number;
  y: number;
  slope: number;
  area: number;
}

export interface CalculusSceneProps {
  functionType: "quadratic" | "cubic" | "sine" | "exponential";
  showDerivative: boolean;
  showIntegral: boolean;
  showTangent: boolean;
  speed: number;
  isPlaying: boolean;
  onDataChange?: (data: CalculusData) => void;
}

/**
 * Calculus Visualizer scene component
 * Visualizes derivatives, integrals, and tangent lines
 */
export function CalculusSceneComponent({
  functionType,
  showDerivative,
  showIntegral,
  showTangent,
  speed,
  isPlaying,
  onDataChange
}: CalculusSceneProps) {
  const timeRef = useRef(0);
  const [tangentPoints, setTangentPoints] = useState<[number, number, number][]>([
    [0, 0, 0], [0, 0, 0]
  ]);

  // Function definitions and their derivatives
  const functions = useMemo(() => ({
    quadratic: {
      f: (x: number) => 0.1 * x * x - 2,
      df: (x: number) => 0.2 * x,
      color: "#3b82f6",
    },
    cubic: {
      f: (x: number) => 0.05 * x * x * x - 0.3 * x,
      df: (x: number) => 0.15 * x * x - 0.3,
      color: "#22c55e",
    },
    sine: {
      f: (x: number) => Math.sin(x) * 1.5,
      df: (x: number) => Math.cos(x) * 1.5,
      color: "#a855f7",
    },
    exponential: {
      f: (x: number) => Math.exp(x * 0.3) * 0.3 - 1,
      df: (x: number) => Math.exp(x * 0.3) * 0.09,
      color: "#f59e0b",
    },
  }), []);

  const currentFunc = functions[functionType];

  // Generate function curve points
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.05;
      const y = currentFunc.f(x);
      pts.push([x, y, 0]);
    }
    return pts;
  }, [currentFunc, functionType]);

  // Generate derivative curve points
  const derivativePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.05;
      const y = currentFunc.df(x);
      pts.push([x, y, 0.5]);
    }
    return pts;
  }, [currentFunc, functionType]);

  // Calculate approximate integral (area under curve from 0 to x)
  const calculateIntegral = (x: number) => {
    let sum = 0;
    const steps = 100;
    const dx = x / steps;
    for (let i = 0; i < steps; i++) {
      sum += currentFunc.f(i * dx) * dx;
    }
    return sum;
  };

  // Axis lines
  const xAxisPoints = useMemo(() => [[-10, 0, 0], [10, 0, 0]] as [number, number, number][], []);
  const yAxisPoints = useMemo(() => [[0, -5, 0], [0, 5, 0]] as [number, number, number][], []);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta * speed;

    const x = Math.sin(timeRef.current * 0.5) * 3;
    const y = currentFunc.f(x);
    const slope = currentFunc.df(x);
    const area = calculateIntegral(Math.abs(x));

    onDataChange?.({ x, y, slope, area });

    // Update tangent line
    if (showTangent) {
      const tangentLength = 1.5;
      setTangentPoints([
        [x - tangentLength, y - slope * tangentLength, 0],
        [x + tangentLength, y + slope * tangentLength, 0]
      ]);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {/* Main function curve */}
      <Line points={curvePoints} color={currentFunc.color} lineWidth={3} />

      {/* Derivative curve */}
      {showDerivative && (
        <Line
          points={derivativePoints}
          color="#ef4444"
          lineWidth={2}
          opacity={0.6}
          transparent
        />
      )}

      {/* Tangent line */}
      {showTangent && (
        <Line
          points={tangentPoints}
          color="#fbbf24"
          lineWidth={2}
        />
      )}

      {/* Integral area visualization */}
      {showIntegral && (
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[6, 2, 0.1]} />
          <meshStandardMaterial
            color={currentFunc.color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Axes */}
      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
      <Line points={xAxisPoints} color="#666" lineWidth={1} />
      <Line points={yAxisPoints} color="#666" lineWidth={1} />
    </>
  );
}

export default CalculusSceneComponent;
