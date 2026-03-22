"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface CalculusData {
  x: number;
  y: number;
  slope: number;
  area: number;
  derivativeValue: number;
}

export interface CalculusSceneProps {
  functionType: "quadratic" | "cubic" | "sine" | "exponential";
  showDerivative: boolean;
  showIntegral: boolean;
  showTangent: boolean;
  speed: number;
  showRiemann: boolean;
  riemannRects: number;
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
  showRiemann,
  riemannRects,
  isPlaying,
  onDataChange
}: CalculusSceneProps) {
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const tangentPointsRef = useRef<[number, number, number][]>([
    [0, 0, 0], [0, 0, 0]
  ]);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const currentSlopeRef = useRef(0);
  const currentAreaRef = useRef(0);

  // React state for UI updates (throttled)
  const [tangentPoints, setTangentPoints] = useState<[number, number, number][]>([
    [0, 0, 0], [0, 0, 0]
  ]);
  const [calculusData, setCalculusData] = useState<CalculusData>({
    x: 0, y: 0, slope: 0, area: 0, derivativeValue: 0,
  });

  // Function definitions and their derivatives
  const functions = useMemo(() => ({
    quadratic: {
      f: (x: number) => 0.1 * x * x - 2,
      df: (x: number) => 0.2 * x,
      color: "#3b82f6",
      integral: (x: number) => (0.1 / 3) * x * x * x - 2 * x,
    },
    cubic: {
      f: (x: number) => 0.05 * x * x * x - 0.3 * x,
      df: (x: number) => 0.15 * x * x - 0.3,
      color: "#22c55e",
      integral: (x: number) => (0.05 / 4) * x * x * x * x - (0.3 / 2) * x * x,
    },
    sine: {
      f: (x: number) => Math.sin(x) * 1.5,
      df: (x: number) => Math.cos(x) * 1.5,
      color: "#a855f7",
      integral: (x: number) => -Math.cos(x) * 1.5,
    },
    exponential: {
      f: (x: number) => Math.exp(x * 0.3) * 0.3 - 1,
      df: (x: number) => Math.exp(x * 0.3) * 0.09,
      color: "#f59e0b",
      integral: (x: number) => (Math.exp(x * 0.3) * 0.3 / 0.3) * x - x,
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

  // Calculate approximate integral (area under curve from 0 to x) using Riemann sum
  const calculateIntegral = useCallback((x: number) => {
    let sum = 0;
    const steps = showRiemann ? riemannRects : 100;
    const dx = Math.abs(x) / steps;
    const startX = x < 0 ? x : 0;

    for (let i = 0; i < steps; i++) {
      const xi = startX + i * dx + dx / 2;
      sum += Math.abs(currentFunc.f(xi)) * dx;
    }
    return sum;
  }, [currentFunc, showRiemann, riemannRects]);

  // Generate Riemann sum rectangles
  const riemannSumRects = useMemo(() => {
    if (!showRiemann) return [];

    const rects: { x: number; y: number; width: number; height: number }[] = [];
    const x = currentXRef.current;
    const steps = riemannRects;
    const dx = Math.abs(x) / steps;
    const startX = x < 0 ? x : 0;

    for (let i = 0; i < steps; i++) {
      const xi = startX + i * dx;
      const height = currentFunc.f(xi + dx / 2);
      if (height > -5) {
        rects.push({
          x: xi + dx / 2,
          y: height / 2,
          width: dx * 0.9,
          height: Math.max(0.1, Math.abs(height)),
        });
      }
    }
    return rects;
  }, [showRiemann, riemannRects, currentFunc, currentXRef.current]);

  // Axis lines
  const xAxisPoints = useMemo(() => [[-10, 0, 0], [10, 0, 0]] as [number, number, number][], []);
  const yAxisPoints = useMemo(() => [[0, -5, 0], [0, 5, 0]] as [number, number, number][], []);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * speed;

    const x = Math.sin(timeRef.current * 0.5) * 3;
    const y = currentFunc.f(x);
    const slope = currentFunc.df(x);
    const area = calculateIntegral(Math.abs(x));

    // Update physics state
    currentXRef.current = x;
    currentYRef.current = y;
    currentSlopeRef.current = slope;
    currentAreaRef.current = area;

    // Update tangent line
    if (showTangent) {
      const tangentLength = 1.5;
      tangentPointsRef.current = [
        [x - tangentLength, y - slope * tangentLength, 0],
        [x + tangentLength, y + slope * tangentLength, 0]
      ];
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      setTangentPoints(tangentPointsRef.current);

      const newData: CalculusData = {
        x, y, slope, area,
        derivativeValue: slope,
      };
      setCalculusData(newData);
      onDataChange?.(newData);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#22c55e" />

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

      {/* Tangent point indicator */}
      {showTangent && (
        <mesh position={[currentXRef.current, currentYRef.current, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Riemann sum rectangles */}
      {showRiemann && riemannSumRects.map((rect, i) => (
        <mesh key={i} position={[rect.x, rect.y, -0.05]}>
          <boxGeometry args={[rect.width, rect.height, 0.1]} />
          <meshStandardMaterial
            color={currentFunc.color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Integral area visualization (shaded region) */}
      {showIntegral && !showRiemann && (
        <mesh position={[currentXRef.current / 2, -1, -0.1]}>
          <planeGeometry args={[Math.abs(currentXRef.current) * 2, 2]} />
          <meshStandardMaterial
            color={currentFunc.color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Area under curve curve */}
      {showIntegral && (
        <Line
          points={[
            [0, 0, 0.3],
            [currentXRef.current, 0, 0.3],
            [currentXRef.current, currentAreaRef.current * 0.3, 0.3],
            [0, currentAreaRef.current * 0.3, 0.3],
            [0, 0, 0.3],
          ]}
          color="#22c55e"
          lineWidth={2}
          opacity={0.7}
          transparent
        />
      )}

      {/* Axes */}
      <gridHelper args={[20, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
      <Line points={xAxisPoints} color="#666" lineWidth={1} />
      <Line points={yAxisPoints} color="#666" lineWidth={1} />

      {/* Labels */}
      <mesh position={[0, 4.5, 0]}>
        <planeGeometry args={[5, 0.5]} />
        <meshBasicMaterial color={currentFunc.color} transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export default CalculusSceneComponent;
