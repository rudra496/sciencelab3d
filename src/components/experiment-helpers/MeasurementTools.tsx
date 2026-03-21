"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * Ruler component for displaying distance scales in 3D
 */
export interface RulerProps {
  length: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  majorTicks?: number;
  minorTicks?: number;
  label?: string;
  color?: string;
}

export function Ruler({
  length,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  majorTicks = 5,
  minorTicks = 10,
  label,
  color = "#666",
}: RulerProps) {
  const tickSpacing = length / majorTicks;

  const tickLines: [number, number, number][][] = [];

  // Main line
  tickLines.push([
    [-length / 2, 0, 0],
    [length / 2, 0, 0],
  ]);

  // Major and minor ticks
  for (let i = -majorTicks; i <= majorTicks; i++) {
    const x = (i * length) / majorTicks;
    const isMajor = i !== 0;
    const tickHeight = isMajor ? 0.3 : 0.15;

    tickLines.push([
      [x, -tickHeight / 2, 0],
      [x, tickHeight / 2, 0],
    ]);
  }

  return (
    <group position={position} rotation={rotation}>
      {tickLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={color}
          lineWidth={i === 0 ? 2 : 1}
        />
      ))}
    </group>
  );
}

/**
 * Protractor component for measuring angles
 */
export interface ProtractorProps {
  radius: number;
  position?: [number, number, number];
  showArc?: boolean;
  showTicks?: boolean;
  color?: string;
}

export function Protractor({
  radius,
  position = [0, 0, 0],
  showArc = true,
  showTicks = true,
  color = "#666",
}: ProtractorProps) {
  const arcPoints: [number, number, number][] = [];
  const segments = 180;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI;
    arcPoints.push([
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0,
    ]);
  }

  return (
    <group position={position}>
      {showArc && <Line points={arcPoints} color={color} lineWidth={1} opacity={0.5} />}

      {showTicks &&
        [0, 30, 45, 60, 90].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <Line
              key={angle}
              points={[
                [Math.cos(rad) * (radius - 0.2), Math.sin(rad) * (radius - 0.2), 0],
                [Math.cos(rad) * radius, Math.sin(rad) * radius, 0],
              ]}
              color={color}
              lineWidth={1}
            />
          );
        })}
    </group>
  );
}

/**
 * Grid scale marker - shows distance markers on a grid
 */
export interface GridScaleProps {
  size: number;
  spacing: number;
  position?: [number, number, number];
  color?: string;
}

export function GridScale({
  size,
  spacing,
  position = [0, 0, 0],
  color = "#333",
}: GridScaleProps) {
  const markers: React.ReactNode[] = [];
  const count = Math.floor(size / spacing);

  for (let i = -count; i <= count; i++) {
    const pos = i * spacing;
    markers.push(
      <mesh key={i} position={[pos, 0.01, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  return <group position={position}>{markers}</group>;
}

/**
 * Vector arrow component for showing force, velocity, etc.
 */
export interface VectorArrowProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  label?: string;
  lineWidth?: number;
}

export function VectorArrow({
  start,
  end,
  color,
  label,
  lineWidth = 2,
}: VectorArrowProps) {
  const direction = end.clone().sub(start);
  const length = direction.length();
  direction.normalize();

  // Arrow shaft
  const shaftPoints: [number, number, number][] = [
    [start.x, start.y, start.z],
    [end.x, end.y, end.z],
  ];

  // Arrow head
  const headLength = Math.min(0.3, length * 0.2);
  const headBase = end.clone().sub(direction.clone().multiplyScalar(headLength));

  return (
    <group>
      <Line points={shaftPoints} color={color} lineWidth={lineWidth} />
      {/* Arrow head could be added as a cone mesh */}
    </group>
  );
}

/**
 * Live measurement component - updates in real-time
 */
export interface LiveMeasurementProps {
  value: number;
  unit: string;
  position: [number, number, number];
  color?: string;
  precision?: number;
}

export function LiveMeasurement({
  value,
  unit,
  position,
  color = "#4f8fff",
  precision = 2,
}: LiveMeasurementProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
