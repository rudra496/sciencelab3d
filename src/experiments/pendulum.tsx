"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, folder } from "leva";
import * as THREE from "three";

export default function PendulumScene() {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  const { length, gravity, damping, mass, initialAngle } = useControls(
    "Pendulum",
    {
      length: { value: 3, min: 1, max: 6, step: 0.1, label: "Length (m)" },
      gravity: { value: 9.81, min: 1, max: 20, step: 0.1, label: "Gravity (m/s²)" },
      damping: { value: 0.01, min: 0, max: 0.5, step: 0.001, label: "Damping" },
      mass: { value: 1, min: 0.1, max: 5, step: 0.1, label: "Mass (kg)" },
      initialAngle: { value: Math.PI / 4, min: 0.1, max: Math.PI / 2, step: 0.01, label: "Initial Angle (rad)" },
    }
  );

  const angleRef = useRef(initialAngle);
  const angularVelRef = useRef(0);
  const trailPositions = useRef<Float32Array>(new Float32Array(300 * 3));
  const trailIndex = useRef(0);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPositions.current, 3)
    );
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Physics: simple pendulum ODE
    const theta = angleRef.current;
    const omega = angularVelRef.current;
    const dt = Math.min(delta, 0.02);

    // Angular acceleration: -g/L * sin(theta) - damping * omega
    const alpha = (-gravity / length) * Math.sin(theta) - damping * omega;

    // Verlet-like integration
    angularVelRef.current = omega + alpha * dt;
    angleRef.current = theta + angularVelRef.current * dt;

    const currentAngle = angleRef.current;

    // Position the pendulum
    const bobX = Math.sin(currentAngle) * length;
    const bobY = -Math.cos(currentAngle) * length;

    groupRef.current.position.set(bobX, bobY, 0);

    // Update trail
    const idx = trailIndex.current % 300;
    trailPositions.current[idx * 3] = bobX;
    trailPositions.current[idx * 3 + 1] = bobY;
    trailPositions.current[idx * 3 + 2] = 0;
    trailIndex.current++;

    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position;
      (positions as THREE.BufferAttribute).needsUpdate = true;
      trailRef.current.geometry.setDrawRange(0, Math.min(trailIndex.current, 300));
    }
  });

  const stringLength = Math.max(0.1, length - 0.3);

  return (
    <>
      {/* Pivot point */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Support beam */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* String */}
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, length, 8]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>

      {/* Pendulum group (bob) */}
      <group ref={groupRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.25 * Math.cbrt(mass), 32, 32]} />
          <meshStandardMaterial
            color="#4f8fff"
            metalness={0.7}
            roughness={0.2}
            emissive="#4f8fff"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Trail */}
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial
          size={0.04}
          color="#4f8fff"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Floor grid */}
      <gridHelper args={[20, 40, "#1a1a3e", "#1a1a3e"]} position={[0, -length - 1, 0]} />
    </>
  );
}
