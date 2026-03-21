"use client";

export { RefractionSceneComponent as default, RefractionSceneComponent } from "./refraction-scene";
export type { RefractionData } from "./refraction-scene";

// Legacy export - kept for backwards compatibility
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { DataDisplay } from "@/components/experiment-helpers";
import {
  calculateRefractionAngle,
  calculateCriticalAngle,
  calculateReflectance,
  degToRad,
  radToDeg,
} from "@/utils/physics";

export function RefractionReflectionScene() {
  const { angleOfIncidence, n1, n2, showNormal, showAllRays, showData, animateRay } = useControls("Optics", {
    angleOfIncidence: { value: 45, min: 0, max: 89, step: 1, label: "Incident Angle (°)" },
    n1: { value: 1.0, min: 1.0, max: 2.5, step: 0.01, label: "n₁ (Medium 1)" },
    n2: { value: 1.5, min: 1.0, max: 2.5, step: 0.01, label: "n₂ (Medium 2)" },
    showNormal: { value: true, label: "Show Normal" },
    showAllRays: { value: true, label: "Show All Rays" },
    showData: { value: true, label: "Show Data Panel" },
    animateRay: { value: false, label: "Animate Ray" },
  });

  const theta1 = degToRad(angleOfIncidence);

  // Calculate refraction angle using Snell's Law
  const theta2 = calculateRefractionAngle(n1, theta1, n2);

  // Check for total internal reflection
  const isTIR = theta2 === null;

  // Reflection angle equals incident angle
  const thetaReflect = theta1;

  // Calculate critical angle
  const criticalAngle = calculateCriticalAngle(n1, n2);

  // Calculate reflectance using Fresnel equations
  const reflectance = calculateReflectance(n1, n2, theta1);
  const transmittance = 1 - reflectance;

  // Animation state
  const [animationProgress, setAnimationProgress] = useState(1);

  useFrame((_, delta) => {
    if (animateRay) {
      setAnimationProgress((prev) => {
        const next = prev + delta * 0.5;
        return next > 1 ? 0 : next;
      });
    } else {
      setAnimationProgress(1);
    }
  });

  // Calculate ray points
  const rayLength = 5;
  const progress = animationProgress;

  const incidentRay: [number, number, number][] = [
    [-rayLength * Math.cos(theta1), rayLength * Math.sin(theta1), 0],
    [0, 0, 0],
  ];

  const reflectedRay: [number, number, number][] = [
    [0, 0, 0],
    [rayLength * Math.cos(theta1) * Math.min(progress * 2, 1), rayLength * Math.sin(theta1) * Math.min(progress * 2, 1), 0],
  ];

  const refractedRay: [number, number, number][] = isTIR
    ? [[0, 0, 0], [0, 0, 0]]
    : [
        [0, 0, 0],
        [
          rayLength * Math.cos(theta2 || 0) * Math.min(Math.max(progress - 0.3, 0) * 2, 1),
          -rayLength * Math.sin(theta2 || 0) * Math.min(Math.max(progress - 0.3, 0) * 2, 1),
          0,
        ],
      ];

  return (
    <>
      {/* Background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>

      {/* Medium 1 (top) */}
      <mesh position={[0, 2.5, -1]}>
        <boxGeometry args={[15, 5, 0.5]} />
        <meshStandardMaterial color={`rgba(79, 143, 255, ${0.1 * n1})`} transparent opacity={0.15} />
      </mesh>

      {/* Medium 2 (bottom) */}
      <mesh position={[0, -2.5, -1]}>
        <boxGeometry args={[15, 5, 0.5]} />
        <meshStandardMaterial color={`rgba(139, 92, 246, ${0.15 * n2})`} transparent opacity={0.2} />
      </mesh>

      {/* Medium labels */}
      <group position={[-6, 3.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#4f8fff" />
        </mesh>
      </group>
      <group position={[-6, -3.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </group>

      {/* Interface line */}
      <Line points={[[-7, 0, 0], [7, 0, 0]]} color="#ffffff" lineWidth={2} opacity={0.5} />

      {/* Normal line */}
      {showNormal && (
        <Line
          points={[[0, -5, 0], [0, 5, 0]]}
          color="#06d6a0"
          lineWidth={1}
          dashed
          dashSize={0.3}
          gapSize={0.2}
          opacity={0.5}
        />
      )}

      {/* Incident ray */}
      <Line points={incidentRay} color="#ffcc00" lineWidth={3} />

      {/* Reflected ray */}
      {showAllRays && (
        <Line
          points={reflectedRay}
          color="#ff6b35"
          lineWidth={2 * reflectance + 1}
          opacity={reflectance > 0.1 ? 1 : 0.3}
        />
      )}

      {/* Refracted ray */}
      {!isTIR && showAllRays && (
        <Line
          points={refractedRay}
          color="#4f8fff"
          lineWidth={2 * transmittance + 1}
          opacity={transmittance > 0.1 ? 1 : 0.3}
        />
      )}

      {/* Angle markers */}
      {showNormal && (
        <>
          {/* Incident angle arc */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.5, 0.02, 8, 32, theta1]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
          {/* Reflected angle arc */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[1.5, 0.02, 8, 32, theta1]} />
            <meshBasicMaterial color="#ff6b35" />
          </mesh>
          {/* Refracted angle arc */}
          {!isTIR && (
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[1.5, 0.02, 8, 32, theta2 || 0]} />
              <meshBasicMaterial color="#4f8fff" />
            </mesh>
          )}
        </>
      )}

      {/* Light source */}
      <mesh position={[-3, 3, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1} />
      </mesh>
      {/* Source glow */}
      <mesh position={[-3, 3, 0]} scale={2}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.2} />
      </mesh>

      {/* TIR indicator */}
      {isTIR && (
        <group position={[3, -2, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* Critical angle indicator */}
      {criticalAngle !== null && showData && (
        <group position={[-5, -2, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.5]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
      )}

      {/* Energy distribution bars */}
      {showAllRays && (
        <group position={[5, -2, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
          {/* Reflected energy bar */}
          <mesh position={[0, 0.4, 0.01]}>
            <boxGeometry args={[1.2, 0.15, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-0.6 + reflectance * 0.6, 0.4, 0.02]}>
            <boxGeometry args={[reflectance * 1.2, 0.12, 0.02]} />
            <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} />
          </mesh>
          {/* Transmitted energy bar */}
          <mesh position={[0, -0.4, 0.01]}>
            <boxGeometry args={[1.2, 0.15, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-0.6 + transmittance * 0.6, -0.4, 0.02]}>
            <boxGeometry args={[transmittance * 1.2, 0.12, 0.02]} />
            <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Grid */}
      <gridHelper args={[16, 32, "#1a1a3e", "#1a1a3e"]} position={[0, -5, 0]} />

      {/* Data Display Panel */}
      {showData && (
        <DataDisplay
          title="Optics Data"
          position={[-5, 4, 0]}
          data={{
            incidentAngle: { value: angleOfIncidence, unit: "°", color: "#ffcc00" },
            reflectAngle: { value: angleOfIncidence, unit: "°", color: "#ff6b35" },
            refractAngle: {
              value: isTIR ? 0 : radToDeg(theta2 || 0),
              unit: "°",
              color: isTIR ? "#666" : "#4f8fff",
              decimals: 1,
            },
            reflectance: { value: reflectance * 100, unit: "%", color: "#ff6b35", decimals: 1 },
            transmittance: { value: transmittance * 100, unit: "%", color: "#4f8fff", decimals: 1 },
            criticalAngle: {
              value: criticalAngle !== null ? radToDeg(criticalAngle) : 0,
              unit: "°",
              color: criticalAngle !== null ? "#f59e0b" : "#666",
              decimals: 1,
            },
          }}
        />
      )}

      {/* Snell's Law indicator */}
      {showData && !isTIR && (
        <group position={[5, 4, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.6]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </>
  );
}
