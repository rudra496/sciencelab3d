"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface ElectromagneticSceneProps {
  onDataChange?: (data: EMFieldData) => void;
  charge1?: number;
  charge2?: number;
  showFieldLines?: boolean;
  showVectors?: boolean;
  showEquipotential?: boolean;
  testCharge?: number;
}

export interface EMFieldData {
  electricField: number;
  potential: number;
  force: number;
  distance: number;
  fieldX: number;
  fieldY: number;
  fieldZ: number;
}

/**
 * World-class Electromagnetic Field Simulation
 */
export function ElectromagneticSceneComponent({
  onDataChange,
  charge1 = 5,
  charge2 = -5,
  showFieldLines = true,
  showVectors = true,
  showEquipotential = true,
  testCharge = 1,
}: ElectromagneticSceneProps) {
  const testChargeRef = useRef<THREE.Mesh>(null);
  const k = 8.99; // Coulomb constant (scaled)

  const [data, setData] = useState<EMFieldData>({
    electricField: 0,
    potential: 0,
    force: 0,
    distance: 10,
    fieldX: 0,
    fieldY: 0,
    fieldZ: 0,
  });

  // Charge positions
  const charge1Pos = useMemo(() => new THREE.Vector3(-5, 0, 0), []);
  const charge2Pos = useMemo(() => new THREE.Vector3(5, 0, 0), []);

  // Calculate field at a point
  const calculateField = (point: THREE.Vector3) => {
    const r1 = point.clone().sub(charge1Pos);
    const r2 = point.clone().sub(charge2Pos);
    const dist1 = r1.length();
    const dist2 = r2.length();

    const E1 = r1.normalize().multiplyScalar((k * charge1) / (dist1 * dist1));
    const E2 = r2.normalize().multiplyScalar((k * charge2) / (dist2 * dist2));

    return E1.add(E2);
  };

  // Calculate potential at a point
  const calculatePotential = (point: THREE.Vector3) => {
    const r1 = point.distanceTo(charge1Pos);
    const r2 = point.distanceTo(charge2Pos);
    return (k * charge1) / r1 + (k * charge2) / r2;
  };

  useFrame(() => {
    if (!testChargeRef.current) return;

    const testPos = testChargeRef.current.position;
    const field = calculateField(testPos);
    const potential = calculatePotential(testPos);
    const force = field.length() * testCharge;
    const dist = testPos.distanceTo(charge1Pos);

    const newData: EMFieldData = {
      electricField: field.length(),
      potential,
      force,
      distance: dist,
      fieldX: field.x,
      fieldY: field.y,
      fieldZ: field.z,
    };

    setData(newData);
    onDataChange?.(newData);
  });

  // Field line starting points around charge 1
  const fieldLineStarts = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numLines = 24;
    for (let i = 0; i < numLines; i++) {
      const theta = (i / numLines) * Math.PI * 2;
      points.push(new THREE.Vector3(
        charge1Pos.x + Math.cos(theta) * 0.5,
        Math.sin(theta) * 0.5,
        0
      ));
    }
    return points;
  }, [charge1Pos]);

  // Generate field lines
  const fieldLines = useMemo(() => {
    return fieldLineStarts.map((start) => {
      const points: [number, number, number][] = [];
      let current = start.clone();
      const stepSize = 0.3;
      const maxSteps = 100;

      for (let i = 0; i < maxSteps; i++) {
        points.push([current.x, current.y, current.z]);

        const field = calculateField(current);
        if (field.length() === 0) break;

        const direction = field.normalize();
        current.add(direction.multiplyScalar(stepSize));

        // Stop if too close to either charge
        if (current.distanceTo(charge1Pos) < 0.5 || current.distanceTo(charge2Pos) < 0.5) {
          points.push([current.x, current.y, current.z]);
          break;
        }

        // Stop if too far
        if (current.length() > 20) break;
      }

      return points;
    });
  }, [charge1, charge2, fieldLineStarts]);

  // Generate equipotential lines (contours)
  const equipotentialLines = useMemo(() => {
    const contours: [number, number, number][][] = [];
    const numContours = 8;
    const pointsPerContour = 64;

    for (let c = 0; c < numContours; c++) {
      const targetPotential = -40 + (c / (numContours - 1)) * 80;
      const contourPoints: [number, number, number][] = [];

      for (let i = 0; i < pointsPerContour; i++) {
        const angle = (i / pointsPerContour) * Math.PI * 2;
        let radius = 3;

        // Binary search for equipotential point
        for (let j = 0; j < 10; j++) {
          const testPoint = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
          );
          const pot = calculatePotential(testPoint);
          if (Math.abs(pot - targetPotential) < 1) break;
          radius += (targetPotential - pot) > 0 ? 0.2 : -0.2;
          radius = Math.max(1, Math.min(15, radius));
        }

        contourPoints.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
      }

      if (contourPoints.length > 0) {
        contours.push(contourPoints);
      }
    }

    return contours;
  }, [charge1, charge2]);

  // Field vector grid
  const vectorGrid = useMemo(() => {
    const vectors: { position: THREE.Vector3; direction: THREE.Vector3; magnitude: number }[] = [];
    const gridSize = 10;
    const spacing = 2;

    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        const pos = new THREE.Vector3(x, y, 0);
        const field = calculateField(pos);
        const magnitude = field.length();

        if (magnitude > 0.1 && magnitude < 100) {
          vectors.push({
            position: pos,
            direction: field.normalize(),
            magnitude: Math.min(magnitude / 10, 1),
          });
        }
      }
    }

    return vectors;
  }, [charge1, charge2]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[50, 50, "#1a1a3e", "#0a0a1e"]} position={[0, -11.99, 0]} />

      {/* Charge 1 (positive) */}
      <group position={[charge1Pos.x, charge1Pos.y, charge1Pos.z]}>
        {/* Glow */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
        </mesh>
        {/* Charge */}
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Plus sign */}
        <mesh position={[0, 0, 0.81]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.81]}>
          <planeGeometry args={[0.2, 0.8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Charge 2 (negative) */}
      <group position={[charge2Pos.x, charge2Pos.y, charge2Pos.z]}>
        {/* Glow */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
        </mesh>
        {/* Charge */}
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={1}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Minus sign */}
        <mesh position={[0, 0, 0.81]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Field lines */}
      {showFieldLines && fieldLines.map((line, i) => (
        <Line key={i} points={line} color="#f59e0b" lineWidth={1} opacity={0.6} transparent />
      ))}

      {/* Equipotential lines */}
      {showEquipotential && equipotentialLines.map((contour, i) => (
        <Line key={`eq-${i}`} points={contour} color="#8b5cf6" lineWidth={1} opacity={0.3} transparent dashed />
      ))}

      {/* Field vector grid */}
      {showVectors && vectorGrid.map((vec, i) => (
        <group key={`vec-${i}`} position={[vec.position.x, vec.position.y, 0]}>
          <Line
            points={[[0, 0, 0], [vec.direction.x * vec.magnitude, vec.direction.y * vec.magnitude, 0]]}
            color="#22c55e"
            lineWidth={1}
            opacity={0.5}
            transparent
          />
        </group>
      ))}

      {/* Test charge (draggable) */}
      <mesh
        ref={testChargeRef}
        position={[0, 5, 0]}
        castShadow
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Force vector on test charge */}
      {showVectors && testChargeRef.current && (
        <group position={[testChargeRef.current.position.x, testChargeRef.current.position.y, 0]}>
          <Line
            points={[[0, 0, 0], [data.fieldX * 0.5, data.fieldY * 0.5, 0]]}
            color="#ec4899"
            lineWidth={3}
          />
          {/* Arrow head */}
          <mesh position={[data.fieldX * 0.5, data.fieldY * 0.5, 0]}>
            <coneGeometry args={[0.15, 0.3, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Distance markers */}
      {Array.from({ length: 5 }).map((_, i) => {
        const dist = 5 + i * 3;
        return (
          <group key={i}>
            <mesh position={[dist, -11.5, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#666" />
            </mesh>
            {i > 0 && (
              <mesh position={[-dist, -11.5, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default ElectromagneticSceneComponent;
