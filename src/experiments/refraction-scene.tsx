"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface RefractionSceneProps {
  onDataChange?: (data: RefractionData) => void;
  incidentAngle?: number; // degrees
  n2?: number; // refractive index of medium 2 (medium 1 is always air = 1.0)
  showNormal?: boolean;
  showAngles?: boolean;
  resetTrigger?: number;
}

export interface RefractionData {
  incidentAngle: number;
  reflectedAngle: number;
  refractedAngle: number;
  n1: number;
  n2: number;
  criticalAngle: number;
  isTIR: boolean;
}

/**
 * World-class Refraction & Reflection Simulation
 *
 * Physics: Uses refs for all state, updates React state only every 8 frames.
 * Shows Snell's law: n1*sin(theta1) = n2*sin(theta2)
 * Medium 1 (top) is always air (n1 = 1.0)
 * Medium 2 (bottom) has adjustable refractive index (n2)
 */
export function RefractionSceneComponent({
  onDataChange,
  incidentAngle = 45,
  n2 = 1.5,
  showNormal = true,
  showAngles = true,
  resetTrigger,
}: RefractionSceneProps) {
  // === REFS FOR ALL PHYSICS STATE ===
  const frameCountRef = useRef(0);
  const incidentAngleRef = useRef(incidentAngle);
  const n2Ref = useRef(n2);
  const n1 = 1.0; // Medium 1 is always air

  // Sync refs with props
  useEffect(() => {
    incidentAngleRef.current = incidentAngle;
  }, [incidentAngle]);

  useEffect(() => {
    n2Ref.current = n2;
  }, [n2]);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      frameCountRef.current = 0;
    }
  }, [resetTrigger]);

  // React state for display (updated only every 8 frames)
  const [data, setData] = useState<RefractionData>({
    incidentAngle,
    reflectedAngle: incidentAngle,
    refractedAngle: 0,
    n1,
    n2,
    criticalAngle: 0,
    isTIR: false,
  });

  useFrame(() => {
    frameCountRef.current++;

    // === UPDATE REACT STATE EVERY 8 FRAMES ===
    if (frameCountRef.current % 8 === 0) {
      const thetaI = (incidentAngleRef.current * Math.PI) / 180;
      const n1_val = n1;
      const n2_val = n2Ref.current;

      // Snell's Law: n1 * sin(theta1) = n2 * sin(theta2)
      // sin(theta2) = (n1 / n2) * sin(theta1)
      const sinTheta2 = (n1_val / n2_val) * Math.sin(thetaI);

      let theta2: number | null = null;
      let isTIR = false;

      if (Math.abs(sinTheta2) > 1) {
        // Total internal reflection
        isTIR = true;
        theta2 = null;
      } else {
        theta2 = Math.asin(sinTheta2);
      }

      // Critical angle: sin(theta_c) = n2 / n1 (when n1 > n2)
      let criticalAngle: number | null = null;
      if (n1_val > n2_val) {
        const sinCritical = n2_val / n1_val;
        criticalAngle = Math.asin(sinCritical);
      }

      const newData: RefractionData = {
        incidentAngle: incidentAngleRef.current,
        reflectedAngle: incidentAngleRef.current, // angle of reflection = angle of incidence
        refractedAngle: theta2 !== null ? (theta2 * 180) / Math.PI : 0,
        n1: n1_val,
        n2: n2_val,
        criticalAngle: criticalAngle !== null ? (criticalAngle * 180) / Math.PI : 90,
        isTIR,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // === RAY CALCULATIONS (use current ref values) ===
  const thetaI = (incidentAngleRef.current * Math.PI) / 180;
  const n2_val = n2Ref.current;

  // Snell's Law calculation
  const sinTheta2 = (n1 / n2_val) * Math.sin(thetaI);
  let theta2: number | null = null;
  let isTIR = false;

  if (Math.abs(sinTheta2) > 1) {
    isTIR = true;
    theta2 = null;
  } else {
    theta2 = Math.asin(sinTheta2);
  }

  // Critical angle calculation
  let criticalAngle: number | null = null;
  if (n1 > n2_val) {
    criticalAngle = Math.asin(n2_val / n1);
  }

  const rayLength = 12;
  const interfaceY = 0;

  // Incident ray (from top-left)
  const incidentStart = new THREE.Vector3(
    -Math.sin(thetaI) * rayLength,
    Math.cos(thetaI) * rayLength,
    0
  );
  const incidentEnd = new THREE.Vector3(0, interfaceY, 0);

  // Reflected ray (goes to top-right)
  const reflectedEnd = new THREE.Vector3(
    Math.sin(thetaI) * rayLength,
    Math.cos(thetaI) * rayLength,
    0
  );

  // Refracted ray (goes to bottom-right, unless TIR)
  const refractedEnd = isTIR
    ? new THREE.Vector3(0, 0, 0)
    : new THREE.Vector3(
        Math.sin(theta2 || 0) * rayLength,
        -Math.cos(theta2 || 0) * rayLength,
        0
      );

  // Get medium name based on refractive index
  const getMediumName = (n: number): string => {
    if (n <= 1.01) return "Air";
    if (n <= 1.35) return "Water";
    if (n <= 1.6) return "Glass";
    if (n <= 1.8) return "Oil";
    return "Diamond";
  };

  const medium1Name = "Air";
  const medium2Name = getMediumName(n2_val);

  return (
    <group>
      {/* === BACKGROUND === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, -2]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[60, 60, "#1a1a3e", "#0a0a1e"]} position={[0, -14.99, -2]} />

      {/* === MEDIUM 1 (top) - AIR === */}
      <mesh position={[0, 8, -1]} receiveShadow>
        <boxGeometry args={[50, 16, 2]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      {/* === MEDIUM 2 (bottom) - GLASS/WATER/DIAMOND === */}
      <mesh position={[0, -8, -1]} receiveShadow>
        <boxGeometry args={[50, 16, 2]} />
        <meshStandardMaterial
          color={n2_val < 1.4 ? "#0369a1" : n2_val < 1.7 ? "#1e40af" : "#5b21b6"}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* === INTERFACE LINE (horizontal) === */}
      <Line
        points={[[-25, 0, 0.1], [25, 0, 0.1]]}
        color="#ffffff"
        lineWidth={2}
      />

      {/* === NORMAL LINE (vertical, dashed) === */}
      {showNormal && (
        <Line
          points={[[0, -12, 0.1], [0, 12, 0.1]]}
          color="#888888"
          lineWidth={1}
          dashed
          dashSize={0.5}
          gapSize={0.3}
          opacity={0.6}
          transparent
        />
      )}

      {/* === INCIDENT RAY (white) === */}
      <Line
        points={[
          [incidentStart.x, incidentStart.y, 0.2],
          [incidentEnd.x, incidentEnd.y, 0.2]
        ]}
        color="#ffffff"
        lineWidth={4}
      />
      {/* Incident ray glow */}
      <Line
        points={[
          [incidentStart.x, incidentStart.y, 0.2],
          [incidentEnd.x, incidentEnd.y, 0.2]
        ]}
        color="#ffffff"
        lineWidth={8}
        opacity={0.3}
        transparent
      />

      {/* === REFLECTED RAY (yellow) === */}
      <Line
        points={[
          [incidentEnd.x, incidentEnd.y, 0.2],
          [reflectedEnd.x, reflectedEnd.y, 0.2]
        ]}
        color="#fbbf24"
        lineWidth={3}
      />
      {/* Reflected ray glow */}
      <Line
        points={[
          [incidentEnd.x, incidentEnd.y, 0.2],
          [reflectedEnd.x, reflectedEnd.y, 0.2]
        ]}
        color="#fbbf24"
        lineWidth={6}
        opacity={0.25}
        transparent
      />

      {/* === REFRACTED RAY (cyan) - only if no TIR === */}
      {!isTIR && (
        <>
          <Line
            points={[
              [incidentEnd.x, incidentEnd.y, 0.2],
              [refractedEnd.x, refractedEnd.y, 0.2]
            ]}
            color="#06b6d4"
            lineWidth={3}
          />
          {/* Refracted ray glow */}
          <Line
            points={[
              [incidentEnd.x, incidentEnd.y, 0.2],
              [refractedEnd.x, refractedEnd.y, 0.2]
            ]}
            color="#06b6d4"
            lineWidth={6}
            opacity={0.25}
            transparent
          />
        </>
      )}

      {/* === ANGLE ARCS === */}
      {showAngles && (
        <>
          {/* Incident angle arc (white) */}
          <group rotation={[0, 0, -thetaI]}>
            <mesh rotation={[0, 0, Math.PI / 2 - thetaI / 2]}>
              <ringGeometry args={[3, 3.15, 32, 1, 0, thetaI]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Reflected angle arc (yellow) */}
          <group rotation={[0, 0, thetaI]}>
            <mesh rotation={[0, 0, Math.PI / 2 - thetaI / 2]}>
              <ringGeometry args={[3, 3.15, 32, 1, 0, thetaI]} />
              <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Refracted angle arc (cyan) - only if no TIR */}
          {!isTIR && theta2 !== null && (
            <group rotation={[0, 0, Math.PI + theta2]}>
              <mesh rotation={[0, 0, Math.PI / 2 - theta2 / 2]}>
                <ringGeometry args={[3, 3.15, 32, 1, 0, theta2]} />
                <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </>
      )}

      {/* === MEDIUM LABELS === */}
      <Text
        position={[-18, 6, 1]}
        fontSize={1.2}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {medium1Name} (n₁ = {n1.toFixed(2)})
      </Text>

      <Text
        position={[-18, -6, 1]}
        fontSize={1.2}
        color={n2_val < 1.4 ? "#38bdf8" : n2_val < 1.7 ? "#818cf8" : "#c084fc"}
        anchorX="left"
        anchorY="middle"
      >
        {medium2Name} (n₂ = {n2_val.toFixed(2)})
      </Text>

      {/* === TIR INDICATOR === */}
      {isTIR && (
        <group position={[8, -6, 1]}>
          <mesh>
            <planeGeometry args={[10, 2.5]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.9}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            TOTAL INTERNAL REFLECTION
          </Text>
        </group>
      )}

      {/* === CRITICAL ANGLE INDICATOR (if applicable) === */}
      {criticalAngle !== null && !isTIR && (
        <Text
          position={[12, -6, 1]}
          fontSize={0.7}
          color="#fbbf24"
          anchorX="left"
          anchorY="middle"
        >
          Critical angle: {(criticalAngle * 180 / Math.PI).toFixed(1)}°
        </Text>
      )}

      {/* === LIGHT SOURCE === */}
      <mesh position={[incidentStart.x, incidentStart.y, 0]} rotation={[0, 0, thetaI]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Light source aperture glow */}
      <mesh position={[incidentStart.x, incidentStart.y, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* === ANGLE LABELS === */}
      {showAngles && (
        <>
          {/* Incident angle label */}
          <Text
            position={[-5, 4, 0.5]}
            fontSize={0.7}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            θᵢ = {incidentAngleRef.current.toFixed(1)}°
          </Text>

          {/* Reflected angle label */}
          <Text
            position={[5, 4, 0.5]}
            fontSize={0.7}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            θᵣ = {incidentAngleRef.current.toFixed(1)}°
          </Text>

          {/* Refracted angle label (only if no TIR) */}
          {!isTIR && theta2 !== null && (
            <Text
              position={[5, -4, 0.5]}
              fontSize={0.7}
              color="#06b6d4"
              anchorX="center"
              anchorY="middle"
            >
              θₜ = {(theta2 * 180 / Math.PI).toFixed(1)}°
            </Text>
          )}
        </>
      )}
    </group>
  );
}

export default RefractionSceneComponent;
