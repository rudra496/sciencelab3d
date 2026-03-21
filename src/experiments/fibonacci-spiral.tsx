"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function FibonacciSpiralScene() {
  const spiralRef = useRef<THREE.Group>(null);

  const { numPoints, goldenAngle, pointSize, showConnections, animationSpeed } = useControls("Fibonacci", {
    numPoints: { value: 200, min: 50, max: 500, step: 10, label: "Number of Points" },
    goldenAngle: { value: 137.5, min: 130, max: 145, step: 0.1, label: "Golden Angle (°)" },
    pointSize: { value: 0.1, min: 0.05, max: 0.3, step: 0.01, label: "Point Size" },
    showConnections: { value: true, label: "Show Connections" },
    animationSpeed: { value: 0.2, min: 0, max: 1, step: 0.05, label: "Animation Speed" },
  });

  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618

  useFrame((_, delta) => {
    if (!spiralRef.current) return;
    spiralRef.current.rotation.z += delta * animationSpeed * 0.5;
  });

  // Generate spiral points
  const spiralPoints = useMemo(() => {
    const points: { x: number; y: number; z: number; index: number }[] = [];
    const angleRad = (goldenAngle * Math.PI) / 180;

    for (let i = 0; i < numPoints; i++) {
      const r = Math.sqrt(i) * 0.3;
      const theta = i * angleRad * (Math.PI / 180);

      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        z: (i / numPoints) * 0.5,
        index: i,
      });
    }

    return points;
  }, [numPoints, goldenAngle]);

  // Fibonacci sequence numbers
  const fibonacciSequence = useMemo(() => {
    const seq: number[] = [1, 1];
    while (seq[seq.length - 1] < 1000) {
      seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
    }
    return seq.slice(0, 10);
  }, []);

  return (
    <>
      <group ref={spiralRef}>
        {/* Spiral points */}
        {spiralPoints.map((point, i) => {
          const hue = (i / numPoints) * 360;
          const size = pointSize * (0.5 + (i / numPoints) * 0.5);

          return (
            <mesh key={i} position={[point.x, point.y, point.z]}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshStandardMaterial
                color={`hsl(${hue}, 70%, 50%)`}
                emissive={`hsl(${hue}, 70%, 50%)`}
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        })}

        {/* Connections to show spiral pattern */}
        {showConnections && spiralPoints.filter((_, i) => i % 20 === 0).map((point, i) => {
          const nextPoint = spiralPoints[Math.min(i + 20, spiralPoints.length - 1)];
          if (!nextPoint) return null;

          const midX = (point.x + nextPoint.x) / 2;
          const midY = (point.y + nextPoint.y) / 2;
          const midZ = (point.z + nextPoint.z) / 2;
          const length = Math.sqrt(
            (nextPoint.x - point.x) ** 2 +
            (nextPoint.y - point.y) ** 2
          );
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);

          return (
            <mesh key={`conn-${i}`} position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.01, 0.01, length, 8]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Golden ratio visualization */}
      <mesh position={[-4, 2, 0]}>
        <boxGeometry args={[1, 1.618, 0.1]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[-4, 2.809, 0]}>
        <boxGeometry args={[0.618, 1, 0.1]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Fibonacci sequence display */}
      <mesh position={[-4, -1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-3.7, -1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.4} />
      </mesh>
      {fibonacciSequence.slice(2, 6).map((num, i) => (
        <mesh key={i} position={[-3.4 + i * 0.3, -1, 0]}>
          <sphereGeometry args={[0.05 + num * 0.005, 16, 16]} />
          <meshStandardMaterial
            color={`hsl(${i * 40}, 70%, 50%)`}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Phi value */}
      <mesh position={[4, 3, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-4, 3.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
