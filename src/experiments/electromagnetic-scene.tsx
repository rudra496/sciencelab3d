"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface Charge {
  id: string;
  position: THREE.Vector3;
  magnitude: number; // Can be positive or negative
}

interface ElectromagneticSceneProps {
  onDataChange?: (data: EMFieldData) => void;
  charges: Charge[];
  showFieldLines?: boolean;
  showVectors?: boolean;
  showEquipotential?: boolean;
  showForceVectors?: boolean;
  cursorPosition?: THREE.Vector3;
}

export interface EMFieldData {
  electricField: number;
  potential: number;
  fieldX: number;
  fieldY: number;
  fieldZ: number;
  forcesBetweenCharges: { charge1: string; charge2: string; force: number; distance: number }[];
  numCharges: number;
}

/**
 * World-class Electromagnetic Field Simulation
 * Features:
 * - Dynamic point charges (add/remove/toggle)
 * - Electric field lines (tube geometry/thick lines)
 * - Equipotential surfaces (translucent rings)
 * - Force vectors between charges
 * - Real-time field calculation at cursor
 */
export function ElectromagneticSceneComponent({
  onDataChange,
  charges,
  showFieldLines = true,
  showVectors = true,
  showEquipotential = true,
  showForceVectors = true,
  cursorPosition,
}: ElectromagneticSceneProps) {
  const k = 8.99; // Coulomb constant (scaled)

  // Refs for physics state (prevent re-renders)
  const frameCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const dataRef = useRef<EMFieldData>({
    electricField: 0,
    potential: 0,
    fieldX: 0,
    fieldY: 0,
    fieldZ: 0,
    forcesBetweenCharges: [],
    numCharges: charges.length,
  });

  // React state (updated only every 8 frames)
  const [data, setData] = useState<EMFieldData>(dataRef.current);

  // Calculate electric field at a point from all charges
  const calculateField = (point: THREE.Vector3): THREE.Vector3 => {
    const totalField = new THREE.Vector3(0, 0, 0);

    for (const charge of charges) {
      if (charge.magnitude === 0) continue;

      const r = point.clone().sub(charge.position);
      const dist = r.length();

      if (dist < 0.5) continue; // Too close to charge

      // E = k * q / r^2
      const fieldMagnitude = (k * charge.magnitude) / (dist * dist);
      const fieldDirection = r.normalize();
      totalField.add(fieldDirection.multiplyScalar(fieldMagnitude));
    }

    return totalField;
  };

  // Calculate electric potential at a point from all charges
  const calculatePotential = (point: THREE.Vector3): number => {
    let totalPotential = 0;

    for (const charge of charges) {
      if (charge.magnitude === 0) continue;

      const dist = point.distanceTo(charge.position);
      if (dist < 0.5) continue;

      // V = k * q / r
      totalPotential += (k * charge.magnitude) / dist;
    }

    return totalPotential;
  };

  // Calculate force between two charges
  const calculateForceBetween = (charge1: Charge, charge2: Charge): { force: number; distance: number } => {
    const dist = charge1.position.distanceTo(charge2.position);
    if (dist < 0.1) return { force: 0, distance: dist };

    // F = k * |q1 * q2| / r^2
    const force = (k * Math.abs(charge1.magnitude * charge2.magnitude)) / (dist * dist);
    return { force, distance: dist };
  };

  // Throttled data updates (every 8 frames)
  useFrame(() => {
    frameCountRef.current++;

    if (frameCountRef.current % 8 !== 0) return;

    // Calculate field at cursor position
    const fieldPoint = cursorPosition || new THREE.Vector3(0, 5, 0);
    const field = calculateField(fieldPoint);
    const potential = calculatePotential(fieldPoint);

    // Calculate forces between all charge pairs
    const forces: { charge1: string; charge2: string; force: number; distance: number }[] = [];
    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const result = calculateForceBetween(charges[i], charges[j]);
        forces.push({
          charge1: `Q${i + 1}`,
          charge2: `Q${j + 1}`,
          force: result.force,
          distance: result.distance,
        });
      }
    }

    const newData: EMFieldData = {
      electricField: field.length(),
      potential,
      fieldX: field.x,
      fieldY: field.y,
      fieldZ: field.z,
      forcesBetweenCharges: forces,
      numCharges: charges.length,
    };

    dataRef.current = newData;
    setData(newData);
    onDataChange?.(newData);
  });

  // Generate field lines using tube geometry (thick lines)
  const fieldLines = useMemo(() => {
    if (!showFieldLines) return [];

    const lines: React.ReactElement[] = [];
    const positiveCharges = charges.filter(c => c.magnitude > 0);
    const negativeCharges = charges.filter(c => c.magnitude < 0);

    // Generate field lines from positive charges
    for (const charge of positiveCharges) {
      const numLines = 16;
      const stepSize = 0.3;
      const maxSteps = 80;

      for (let i = 0; i < numLines; i++) {
        const theta = (i / numLines) * Math.PI * 2;
        const phi = ((i % 4) / 4) * Math.PI;

        // Start point near the charge surface
        let current = new THREE.Vector3(
          charge.position.x + Math.cos(theta) * Math.sin(phi) * 1.2,
          charge.position.y + Math.sin(theta) * Math.sin(phi) * 1.2,
          charge.position.z + Math.cos(phi) * 1.2
        );

        const points: [number, number, number][] = [[current.x, current.y, current.z]];

        // Trace field line
        for (let step = 0; step < maxSteps; step++) {
          const field = calculateField(current);
          if (field.length() === 0) break;

          const direction = field.normalize();
          current.add(direction.multiplyScalar(stepSize));
          points.push([current.x, current.y, current.z]);

          // Stop if we hit a negative charge
          let hitNegative = false;
          for (const negCharge of negativeCharges) {
            if (current.distanceTo(negCharge.position) < 1.5) {
              hitNegative = true;
              break;
            }
          }
          if (hitNegative) break;

          // Stop if too far away
          if (current.length() > 25) break;
        }

        if (points.length > 2) {
          lines.push(
            <Line
              key={`field-${charge.id}-${i}`}
              points={points}
              color="#fbbf24"
              lineWidth={3}
              opacity={0.7}
              transparent
            />
          );
        }
      }
    }

    return lines;
  }, [charges, showFieldLines]);

  // Generate equipotential surfaces as translucent rings
  const equipotentialSurfaces = useMemo(() => {
    if (!showEquipotential || charges.length === 0) return [];

    const surfaces: React.ReactElement[] = [];
    const numPotentials = 6;
    const ringsPerPotential = 3;

    // Sample potential range
    const samplePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(10, 0, 0),
    ];

    const potentials = samplePoints.map(p => calculatePotential(p));
    const minPot = Math.min(...potentials);
    const maxPot = Math.max(...potentials);

    for (let p = 0; p < numPotentials; p++) {
      const targetPotential = minPot + (p / (numPotentials - 1)) * (maxPot - minPot);

      // Create rings at different distances
      for (let r = 0; r < ringsPerPotential; r++) {
        const baseRadius = 4 + r * 3;
        const segments = 48;
        const ringPoints: [number, number, number][] = [];

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          ringPoints.push([
            Math.cos(angle) * baseRadius,
            Math.sin(angle) * baseRadius,
            0,
          ]);
        }

        const hue = (p / numPotentials + r * 0.1) % 1;
        const color = new THREE.Color().setHSL(hue, 0.7, 0.6);

        surfaces.push(
          <group key={`equipotential-${p}-${r}`}>
            <Line
              points={ringPoints}
              color={color}
              lineWidth={2}
              opacity={0.4}
              transparent
            />
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[baseRadius - 0.05, baseRadius + 0.05, 48]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.15}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      }
    }

    return surfaces;
  }, [charges, showEquipotential]);

  // Force vectors between charges
  const forceVectors = useMemo(() => {
    if (!showForceVectors) return [];

    const vectors: React.ReactElement[] = [];

    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const c1 = charges[i];
        const c2 = charges[j];

        if (c1.magnitude === 0 || c2.magnitude === 0) continue;

        const { force } = calculateForceBetween(c1, c2);
        if (force < 0.1) continue;

        const direction = c2.position.clone().sub(c1.position).normalize();
        const isAttractive = (c1.magnitude > 0 && c2.magnitude < 0) || (c1.magnitude < 0 && c2.magnitude > 0);

        // Draw force vector (scaled for visibility)
        const vectorLength = Math.min(force * 0.5, 5);

        vectors.push(
          <group key={`force-${i}-${j}`}>
            {/* Force vector line */}
            <Line
              points={[
                [c1.position.x, c1.position.y, c1.position.z],
                [
                  c1.position.x + direction.x * vectorLength * (isAttractive ? 1 : -1),
                  c1.position.y + direction.y * vectorLength * (isAttractive ? 1 : -1),
                  c1.position.z + direction.z * vectorLength * (isAttractive ? 1 : -1),
                ],
              ]}
              color={isAttractive ? "#22c55e" : "#ef4444"}
              lineWidth={4}
            />
            {/* Arrow head */}
            <mesh
              position={
                new THREE.Vector3(
                  c1.position.x + direction.x * vectorLength * (isAttractive ? 1 : -1),
                  c1.position.y + direction.y * vectorLength * (isAttractive ? 1 : -1),
                  c1.position.z + direction.z * vectorLength * (isAttractive ? 1 : -1)
                )
              }
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().multiplyScalar(isAttractive ? 1 : -1)
              )}
            >
              <coneGeometry args={[0.2, 0.5, 8]} />
              <meshStandardMaterial
                color={isAttractive ? "#22c55e" : "#ef4444"}
                emissive={isAttractive ? "#22c55e" : "#ef4444"}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        );
      }
    }

    return vectors;
  }, [charges, showForceVectors]);

  // Small vector field grid
  const vectorGrid = useMemo(() => {
    if (!showVectors) return [];

    const vectors: React.ReactElement[] = [];
    const gridSize = 6;
    const spacing = 3;

    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        const pos = new THREE.Vector3(x, y, 0);
        const field = calculateField(pos);
        const magnitude = field.length();

        if (magnitude > 0.1 && magnitude < 50) {
          const dir = field.clone().normalize();
          const length = Math.min(magnitude * 0.3, 1.5);

          vectors.push(
            <group key={`grid-${x}-${y}`} position={[x, y, 0]}>
              <Line
                points={[[0, 0, 0], [dir.x * length, dir.y * length, dir.z * length]]}
                color="#06b6d4"
                lineWidth={1.5}
                opacity={0.5}
                transparent
              />
            </group>
          );
        }
      }
    }

    return vectors;
  }, [charges, showVectors]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#030312" roughness={0.98} />
      </mesh>
      <gridHelper args={[60, 30, "#1a1a3e", "#0a0a1e"]} position={[0, -14.99, 0]} />

      {/* Render all charges */}
      {charges.map((charge, index) => {
        const isPositive = charge.magnitude > 0;
        const color = isPositive ? "#ef4444" : "#3b82f6";
        const absMagnitude = Math.abs(charge.magnitude);

        return (
          <group key={charge.id} position={[charge.position.x, charge.position.y, charge.position.z]}>
            {/* Outer glow */}
            <mesh>
              <sphereGeometry args={[1.5 + absMagnitude * 0.1, 32, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>

            {/* Main charge sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.6 + absMagnitude * 0.05, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.2}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>

            {/* Sign indicator */}
            <group position={[0, 0, 0.7]}>
              {isPositive ? (
                <>
                  {/* Plus sign */}
                  <mesh>
                    <planeGeometry args={[0.6, 0.15]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                  <mesh>
                    <planeGeometry args={[0.15, 0.6]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </>
              ) : (
                <>
                  {/* Minus sign */}
                  <mesh>
                    <planeGeometry args={[0.6, 0.15]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </>
              )}
            </group>

            {/* Charge label */}
            <mesh position={[0, 1.5, 0]}>
              <planeGeometry args={[1.2, 0.4]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Electric field lines (yellow tubes/thick lines) */}
      {fieldLines}

      {/* Equipotential surfaces (translucent rings) */}
      {equipotentialSurfaces}

      {/* Force vectors between charges */}
      {forceVectors}

      {/* Vector field grid */}
      {vectorGrid}

      {/* Cursor indicator (where field is measured) */}
      {cursorPosition && (
        <group position={[cursorPosition.x, cursorPosition.y, cursorPosition.z]}>
          {/* Cursor ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
          </mesh>
          {/* Field vector at cursor */}
          {showVectors && (
            <Line
              points={[
                [0, 0, 0],
                [data.fieldX * 0.3, data.fieldY * 0.3, data.fieldZ * 0.3],
              ]}
              color="#f59e0b"
              lineWidth={4}
            />
          )}
        </group>
      )}

      {/* Distance markers */}
      {Array.from({ length: 5 }).map((_, i) => {
        const dist = 5 + i * 4;
        return (
          <group key={i}>
            <mesh position={[dist, -14.5, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#333366" />
            </mesh>
            {i > 0 && (
              <mesh position={[-dist, -14.5, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#333366" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default ElectromagneticSceneComponent;
