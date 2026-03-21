"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function TrigonometryScene() {
  const circleRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<THREE.Group>(null);

  const { angle, showSin, showCos, showTan, radius, animationSpeed } = useControls("Trigonometry", {
    angle: { value: Math.PI / 4, min: 0, max: Math.PI * 2, step: 0.01, label: "Angle (rad)" },
    showSin: { value: true, label: "Show Sine" },
    showCos: { value: true, label: "Show Cosine" },
    showTan: { value: true, label: "Show Tangent" },
    radius: { value: 1.5, min: 0.5, max: 2.5, step: 0.1, label: "Circle Radius" },
    animationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Animation Speed" },
  });

  useFrame((_, delta) => {
    if (!circleRef.current || !angleRef.current) return;
    circleRef.current.rotation.z += delta * animationSpeed * 0.2;
  });

  // Calculate trigonometric values
  const sinValue = Math.sin(angle);
  const cosValue = Math.cos(angle);
  const tanValue = Math.tan(angle);

  // Point on unit circle
  const pointX = cosValue * radius;
  const pointY = sinValue * radius;

  // Wave visualizations
  const sineWavePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let x = 0; x <= Math.PI * 2; x += 0.1) {
      points.push([x + 2.5, Math.sin(x) * radius, 0]);
    }
    return points;
  }, [radius]);

  const cosineWavePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let x = 0; x <= Math.PI * 2; x += 0.1) {
      points.push([x + 2.5, Math.cos(x) * radius, 0]);
    }
    return points;
  }, [radius]);

  return (
    <>
      {/* Unit circle */}
      <mesh ref={circleRef} position={[0, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Circle background */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial
          color="#1a1a3e"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Axes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[radius * 2.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.02, radius * 2.5, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Angle arc */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, angle / 2]}>
        <ringGeometry args={[0.3, 0.35, 32, 1, 0, angle]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>

      {/* Point on circle */}
      <mesh position={[pointX, pointY, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Sine line (vertical) */}
      {showSin && (
        <>
          <mesh position={[pointX, sinValue * radius / 2, 0]}>
            <boxGeometry args={[0.04, Math.abs(sinValue * radius), 0.04]} />
            <meshStandardMaterial color="#4f8fff" />
          </mesh>
          {/* Sine label */}
          <mesh position={[pointX + 0.2, sinValue * radius / 2, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#4f8fff" />
          </mesh>
        </>
      )}

      {/* Cosine line (horizontal) */}
      {showCos && (
        <>
          <mesh position={[cosValue * radius / 2, 0, 0]}>
            <boxGeometry args={[Math.abs(cosValue * radius), 0.04, 0.04]} />
            <meshStandardMaterial color="#06d6a0" />
          </mesh>
          {/* Cosine label */}
          <mesh position={[cosValue * radius / 2, -0.2, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#06d6a0" />
          </mesh>
        </>
      )}

      {/* Tangent line */}
      {showTan && Math.abs(tanValue) < 5 && (
        <>
          <mesh position={[radius, tanValue * radius / 2, 0]}>
            <boxGeometry args={[0.04, Math.abs(tanValue * radius), 0.04]} />
            <meshStandardMaterial color="#ffcc00" />
          </mesh>
          {/* Tangent connection */}
          <mesh position={[radius + 0.1, tanValue * radius, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
        </>
      )}

      {/* Hypotenuse (radius line) */}
      <mesh position={[pointX / 2, pointY / 2, 0]} rotation={[0, 0, Math.atan2(pointY, pointX)]}>
        <boxGeometry args={[0.02, radius, 0.02]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} />
      </mesh>

      {/* Sine wave visualization */}
      <group position={[5, 0, 0]}>
        {/* Wave axis */}
        <mesh position={[Math.PI, 0, 0]}>
          <boxGeometry args={[Math.PI * 2, 0.02, 0.02]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Sine wave */}
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(sineWavePoints.map(p => new THREE.Vector3(...p))), 64, 0.05, 8, false]} />
          <meshStandardMaterial
            color="#4f8fff"
            emissive="#4f8fff"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Current position indicator */}
        <mesh position={[angle + 2.5, Math.sin(angle) * radius, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#4f8fff"
            emissive="#4f8fff"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Value displays */}
      <mesh position={[3.5, 2.5, 0]}>
        <sphereGeometry args={[0.08 + Math.abs(sinValue) * 0.1, 16, 16]} />
        <meshStandardMaterial
          color="#4f8fff"
          emissive="#4f8fff"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[3.5, 2, 0]}>
        <sphereGeometry args={[0.08 + Math.abs(cosValue) * 0.1, 16, 16]} />
        <meshStandardMaterial
          color="#06d6a0"
          emissive="#06d6a0"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[3.5, 1.5, 0]}>
        <sphereGeometry args={[0.08 + Math.abs(tanValue) * 0.05, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-3.5, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-3.5, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>

      <gridHelper args={[14, 28, "#1a1a3e", "#1a1a3e"]} position={[2, -2.5, 0]} />
    </>
  );
}
