"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function CalculusVisualizerScene() {
  const functionRef = useRef<THREE.Mesh>(null);
  const tangentRef = useRef<THREE.Group>(null);

  const { funcType, xPosition, showDerivative, showIntegral, showRiemann, numRects } = useControls("Calculus", {
    funcType: {
      value: "sine",
      options: ["sine", "quadratic", "cubic", "exponential"],
      label: "Function"
    },
    xPosition: { value: 0, min: -3, max: 3, step: 0.1, label: "X Position" },
    showDerivative: { value: true, label: "Show Derivative" },
    showIntegral: { value: true, label: "Show Integral" },
    showRiemann: { value: true, label: "Show Riemann Sums" },
    numRects: { value: 10, min: 5, max: 30, step: 1, label: "Riemann Rectangles" },
  });

  // Function definitions
  const functions = {
    sine: (x: number) => Math.sin(x),
    quadratic: (x: number) => 0.3 * x * x,
    cubic: (x: number) => 0.1 * x * x * x,
    exponential: (x: number) => Math.exp(x * 0.3) * 0.3 - 0.3,
  };

  // Derivative functions
  const derivatives = {
    sine: (x: number) => Math.cos(x),
    quadratic: (x: number) => 0.6 * x,
    cubic: (x: number) => 0.3 * x * x,
    exponential: (x: number) => Math.exp(x * 0.3) * 0.09,
  };

  const funcMap = functions as Record<string, (x: number) => number>;
  const derivMap = derivatives as Record<string, (x: number) => number>;
  const f = funcMap[funcType];
  const df = derivMap[funcType];

  useFrame(() => {
    if (!functionRef.current) return;

    // Update function curve
    const positions = functionRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 6 - 3;
      const y = f(x);
      positions.array[i * 3] = x;
      positions.array[i * 3 + 1] = y;
      positions.array[i * 3 + 2] = 0;
    }

    positions.needsUpdate = true;
  });

  // Function curve points
  const curvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 6 - 3;
      const y = f(x);
      points.push([x, y, 0]);
    }
    return points;
  }, [funcType, f]);

  // Tangent line at xPosition
  const tangentLine = useMemo(() => {
    const x = xPosition;
    const y = f(x);
    const slope = df(x);

    const dx = 1;
    const points: [number, number, number][] = [
      [x - dx, y - slope * dx, 0],
      [x + dx, y + slope * dx, 0],
    ];

    return points;
  }, [xPosition, f, df]);

  // Riemann sum rectangles
  const riemannRects = useMemo(() => {
    const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
    const startX = -3;
    const endX = 0;
    const width = (endX - startX) / numRects;

    for (let i = 0; i < numRects; i++) {
      const x = startX + i * width;
      const sampleX = x + width / 2; // Midpoint rule
      const height = Math.max(0, f(sampleX));

      rects.push({ x, y: 0, width, height });
    }

    return rects;
  }, [numRects, f]);

  // Calculate area (integral approximation)
  const integralArea = useMemo(() => {
    let area = 0;
    const startX = -3;
    const endX = 0;
    const width = (endX - startX) / numRects;

    for (let i = 0; i < numRects; i++) {
      const sampleX = startX + i * width + width / 2;
      area += Math.max(0, f(sampleX)) * width;
    }

    return area;
  }, [numRects, f]);

  return (
    <>
      {/* Axes */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[7, 0.02, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-3.5, 0, 0]}>
        <boxGeometry args={[0.02, 4, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Function curve */}
      <Line
        points={curvePoints}
        color="#ff6b35"
        lineWidth={3}
      />

      {/* Riemann sum rectangles */}
      {showRiemann && riemannRects.map((rect, i) => (
        <mesh key={i} position={[rect.x + rect.width / 2, rect.y + rect.height / 2, -0.1]}>
          <boxGeometry args={[rect.width, rect.height, 0.1]} />
          <meshStandardMaterial
            color="#4f8fff"
            transparent
            opacity={0.3}
            emissive="#4f8fff"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Tangent line */}
      {showDerivative && (
        <Line
          points={tangentLine}
          color="#06d6a0"
          lineWidth={2}
          dashed
          dashSize={0.2}
          gapSize={0.1}
        />
      )}

      {/* Point on curve */}
      <mesh position={[xPosition, f(xPosition), 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Normal vector */}
      {showDerivative && (
        <mesh
          position={[xPosition + df(xPosition) * 0.3, f(xPosition) + 0.3, 0]}
          rotation={[0, 0, Math.atan2(df(xPosition), 1) + Math.PI / 2]}
        >
          <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 0.3, "#ec4899"]} />
        </mesh>
      )}

      {/* Integral area indicator */}
      {showIntegral && (
        <mesh position={[-1.5, integralArea / 2 - 1, 0]}>
          <boxGeometry args={[0.1, Math.max(0.1, integralArea), 0.1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* Labels */}
      <mesh position={[3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[3.5, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[3.5, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[3.5, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      <gridHelper args={[10, 20, "#1a1a3e", "#1a1a3e"]} position={[0, -2.1, 0]} />
    </>
  );
}
