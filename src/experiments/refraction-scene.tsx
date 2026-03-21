"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  calculateSnellsLaw,
  calculateCriticalAngle,
  calculateReflectance,
  calculateTransmittance,
} from "@/utils/physics";

interface RefractionSceneProps {
  onDataChange?: (data: RefractionData) => void;
  incidentAngle?: number;
  n1?: number; // Refractive index of medium 1
  n2?: number; // Refractive index of medium 2
  showNormal?: boolean;
  showAngles?: boolean;
  rayIntensity?: number;
}

export interface RefractionData {
  incidentAngle: number;
  refractedAngle: number;
  reflectedAngle: number;
  criticalAngle: number;
  reflectance: number;
  transmittance: number;
  isTIR: boolean;
  n1: number;
  n2: number;
}

/**
 * World-class Refraction & Reflection Simulation
 */
export function RefractionSceneComponent({
  onDataChange,
  incidentAngle = 45,
  n1 = 1.0,
  n2 = 1.5,
  showNormal = true,
  showAngles = true,
  rayIntensity = 1,
}: RefractionSceneProps) {
  const laserRef = useRef<THREE.Group>(null);
  const incidentRayRef = useRef<THREE.Line>(null);
  const refractedRayRef = useRef<THREE.Line>(null);
  const reflectedRayRef = useRef<THREE.Line>(null);

  const [data, setData] = useState<RefractionData>(() => {
    const thetaI = (incidentAngle * Math.PI) / 180;
    const thetaR = calculateSnellsLaw(thetaI, n1, n2);
    const criticalAngle = calculateCriticalAngle(n1, n2);
    const isTIR = thetaR === null || Number.isNaN(thetaR) || thetaR > Math.PI / 2;
    const reflectance = calculateReflectance(n1, n2, thetaI);
    const transmittance = calculateTransmittance(n1, n2, thetaI);

    return {
      incidentAngle,
      refractedAngle: thetaR === null || Number.isNaN(thetaR) ? 0 : (thetaR * 180) / Math.PI,
      reflectedAngle: incidentAngle,
      criticalAngle: criticalAngle === null || Number.isNaN(criticalAngle) ? 90 : (criticalAngle * 180) / Math.PI,
      reflectance,
      transmittance,
      isTIR,
      n1,
      n2,
    };
  });

  // Recalculate when parameters change
  useEffect(() => {
    const thetaI = (incidentAngle * Math.PI) / 180;
    const thetaRefracted = calculateSnellsLaw(thetaI, n1, n2);
    const criticalAngle = calculateCriticalAngle(n1, n2);
    const isTIR = thetaRefracted === null || Number.isNaN(thetaRefracted) || thetaRefracted > Math.PI / 2;
    const reflectance = calculateReflectance(n1, n2, thetaI);
    const transmittance = calculateTransmittance(n1, n2, thetaI);

    const newData: RefractionData = {
      incidentAngle,
      refractedAngle: thetaRefracted === null || Number.isNaN(thetaRefracted) ? 0 : (thetaRefracted * 180) / Math.PI,
      reflectedAngle: incidentAngle,
      criticalAngle: criticalAngle === null || Number.isNaN(criticalAngle) ? 90 : (criticalAngle * 180) / Math.PI,
      reflectance,
      transmittance,
      isTIR,
      n1,
      n2,
    };

    setData(newData);
    onDataChange?.(newData);
  }, [incidentAngle, n1, n2, onDataChange]);

  // Ray calculations
  const thetaI = (incidentAngle * Math.PI) / 180;
  const thetaRefracted = calculateSnellsLaw(thetaI, n1, n2);
  const isTIR = thetaRefracted === null || Number.isNaN(thetaRefracted) || thetaRefracted > Math.PI / 2;

  const rayLength = 10;
  const interfaceY = 0;

  // Incident ray (coming from top-left)
  const incidentStart = new THREE.Vector3(
    -Math.sin(thetaI) * rayLength,
    Math.cos(thetaI) * rayLength,
    0
  );
  const incidentEnd = new THREE.Vector3(0, interfaceY, 0);

  // Reflected ray
  const reflectedEnd = new THREE.Vector3(
    Math.sin(thetaI) * rayLength,
    Math.cos(thetaI) * rayLength,
    0
  );

  // Refracted ray (goes into bottom-right)
  const refractedEnd = isTIR
    ? new THREE.Vector3(0, 0, 0)
    : new THREE.Vector3(
        Math.sin(thetaRefracted || 0) * rayLength,
        -Math.cos(thetaRefracted || 0) * rayLength,
        0
      );

  return (
    <group>
      {/* Medium 1 (top - air/vacuum) */}
      <mesh position={[0, 8, -2]} receiveShadow>
        <boxGeometry args={[40, 16, 4]} />
        <meshStandardMaterial
          color="#e0f7fa"
          transparent
          opacity={0.1}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      {/* Medium 2 (bottom - glass/water) */}
      <mesh position={[0, -8, -2]} receiveShadow>
        <boxGeometry args={[40, 16, 4]} />
        <meshStandardMaterial
          color="#0277bd"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Interface surface */}
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <planeGeometry args={[40, 0.2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Normal line */}
      {showNormal && (
        <Line
          points={[[0, -10, 0.1], [0, 10, 0.1]]}
          color="#666"
          lineWidth={1}
          dashed
          dashSize={0.5}
          gapSize={0.3}
          opacity={0.5}
          transparent
        />
      )}

      {/* Incident ray */}
      <Line
        points={[[incidentStart.x, incidentStart.y, 0], [incidentEnd.x, incidentEnd.y, 0]]}
        color="#ff0000"
        lineWidth={3}
      />

      {/* Incident ray glow */}
      <Line
        points={[[incidentStart.x, incidentStart.y, 0], [incidentEnd.x, incidentEnd.y, 0]]}
        color="#ff0000"
        lineWidth={6}
        opacity={0.3}
        transparent
      />

      {/* Reflected ray */}
      <Line
        points={[[incidentEnd.x, incidentEnd.y, 0], [reflectedEnd.x, reflectedEnd.y, 0]]}
        color="#00ff00"
        lineWidth={2 * data.reflectance}
        opacity={data.reflectance}
      />

      {/* Refracted ray */}
      {!isTIR && (
        <>
          <Line
            points={[[incidentEnd.x, incidentEnd.y, 0], [refractedEnd.x, refractedEnd.y, 0]]}
            color="#0000ff"
            lineWidth={3 * data.transmittance}
            opacity={data.transmittance}
          />
          {/* Refracted ray glow */}
          <Line
            points={[[incidentEnd.x, incidentEnd.y, 0], [refractedEnd.x, refractedEnd.y, 0]]}
            color="#0000ff"
            lineWidth={6 * data.transmittance}
            opacity={0.3 * data.transmittance}
            transparent
          />
        </>
      )}

      {/* Angle arcs */}
      {showAngles && (
        <>
          {/* Incident angle arc */}
          <mesh rotation={[0, 0, -thetaI]}>
            <ringGeometry args={[2, 2.1, 32, 0, Math.PI / 2 - thetaI, Math.PI / 2]} />
            <meshBasicMaterial color="#ff0000" side={THREE.DoubleSide} />
          </mesh>
          {/* Reflected angle arc */}
          <mesh rotation={[0, 0, thetaI]}>
            <ringGeometry args={[2, 2.1, 32, 0, Math.PI / 2 - thetaI, Math.PI / 2]} />
            <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
          </mesh>
          {/* Refracted angle arc */}
          {!isTIR && (
            <mesh rotation={[0, 0, Math.PI + thetaRefracted]}>
              <ringGeometry args={[2, 2.1, 32, 0, Math.PI / 2 - (thetaRefracted || 0), Math.PI / 2]} />
              <meshBasicMaterial color="#0000ff" side={THREE.DoubleSide} />
            </mesh>
          )}
        </>
      )}

      {/* Interface line */}
      <Line
        points={[[-20, 0, 0.05], [20, 0, 0.05]]}
        color="#ffffff"
        lineWidth={2}
      />

      {/* Laser source */}
      <mesh position={[incidentStart.x, incidentStart.y, 0]} rotation={[0, 0, thetaI]}>
        <boxGeometry args={[1.5, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#333"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Laser aperture glow */}
      <mesh position={[incidentStart.x, incidentStart.y, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Medium labels */}
      <mesh position={[-15, 6, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial color="#0a0a1a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-15, 6, 0.01]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#e0f7fa" />
      </mesh>

      <mesh position={[-15, -6, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial color="#0a0a1a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-15, -6, 0.01]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#0277bd" />
      </mesh>

      {/* TIR indicator */}
      {isTIR && (
        <group position={[8, -6, 0]}>
          <mesh>
            <planeGeometry args={[8, 2]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          {/* Exclamation */}
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Angle indicators */}
      {showAngles && (
        <>
          <mesh position={[-4, 3, 0]}>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
        </>
      )}

      {/* Refractive index displays */}
      <group position={[15, 6, 0]}>
        <mesh>
          <planeGeometry args={[4, 1.5]} />
          <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>
      </group>
      <group position={[15, -6, 0]}>
        <mesh>
          <planeGeometry args={[4, 1.5]} />
          <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Grid/floor reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, -5]} receiveShadow>
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[50, 50, "#1a1a3e", "#0a0a1e"]} position={[0, -11.99, -5]} />
    </group>
  );
}

export default RefractionSceneComponent;
