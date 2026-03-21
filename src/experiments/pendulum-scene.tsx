"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  calculatePendulumPeriod,
  calculatePendulumFrequency,
  calculatePendulumAngularFrequency,
  calculatePendulumPE,
  calculatePendulumKE,
} from "@/utils/physics";

interface PendulumSceneProps {
  onDataChange?: (data: PendulumData) => void;
  length?: number;
  gravity?: number;
  mass?: number;
  damping?: number;
  initialAngle?: number;
  showTrail?: boolean;
  showString?: boolean;
  showVectors?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  onReset?: () => void;
  resetTrigger?: number;
}

export interface PendulumData {
  period: number;
  frequency: number;
  angularFrequency: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  angle: number;
  angularVelocity: number;
  angleDeg: number;
  tangentialVelocity: number;
  isPlaying: boolean;
  simulationSpeed: number;
}

/**
 * OPTIMIZED Pendulum Scene with Play/Pause and Speed Control
 * - Proper physics: θ'' = -(g/L)sin(θ) - damping·θ'
 * - RK4 integration for accuracy
 * - Memory efficient
 * - Play/pause support
 * - Speed control (0.1x to 3x)
 */
export function PendulumSceneComponent({
  onDataChange,
  length = 12,
  gravity = 9.81,
  mass = 2,
  damping = 0.005,
  initialAngle = Math.PI / 4,
  showTrail = true,
  showString = true,
  showVectors = true,
  isPlaying = true,
  simulationSpeed = 1,
  onReset,
  resetTrigger,
}: PendulumSceneProps) {
  const bobRef = useRef<THREE.Mesh>(null);
  const bobInnerRef = useRef<THREE.Mesh>(null);
  const stringLineRef = useRef<any>(null);
  const velocityLineRef = useRef<any>(null);
  const trailRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Physics state
  const angleRef = useRef(initialAngle);
  const angularVelRef = useRef(0);
  const timeRef = useRef(0);
  const dataUpdateTimer = useRef(0);
  const lastDataRef = useRef<PendulumData | null>(null);

  // Calculate physics constants (cached)
  const physicsConstants = useMemo(() => ({
    period: calculatePendulumPeriod(length, gravity),
    frequency: calculatePendulumFrequency(length, gravity),
    angularFrequency: calculatePendulumAngularFrequency(length, gravity),
    initialPE: calculatePendulumPE(mass, gravity, length, initialAngle),
  }), [length, gravity, mass, initialAngle]);

  // Trail data (reusable buffers)
  const maxTrailPoints = 800; // Reduced for performance
  const trailData = useRef({
    positions: new Float32Array(maxTrailPoints * 3),
    colors: new Float32Array(maxTrailPoints * 3),
    sizes: new Float32Array(maxTrailPoints),
    index: 0,
  });

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailData.current.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(trailData.current.colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(trailData.current.sizes, 1));
    return geo;
  }, []);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      angleRef.current = initialAngle;
      angularVelRef.current = 0;
      timeRef.current = 0;
      dataUpdateTimer.current = 0;

      // Clear trail
      trailData.current.index = 0;
      const positions = trailData.current.positions;
      const colors = trailData.current.colors;
      const sizes = trailData.current.sizes;
      for (let i = 0; i < maxTrailPoints * 3; i++) positions[i] = 0;
      for (let i = 0; i < maxTrailPoints * 3; i++) colors[i] = 0;
      for (let i = 0; i < maxTrailPoints; i++) sizes[i] = 0;
    }
  }, [resetTrigger, initialAngle, maxTrailPoints]);

  // Physics update with RK4
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.02) * simulationSpeed;

    // Only update physics if playing
    if (isPlaying) {
      timeRef.current += dt;

      // RK4 integration
      const theta = angleRef.current;
      const omega = angularVelRef.current;

      const k1 = omega;
      const k1_omega = -(gravity / length) * Math.sin(theta) - damping * omega;

      const k2 = omega + k1_omega * (dt * 0.5);
      const k2_omega = -(gravity / length) * Math.sin(theta + k1 * (dt * 0.5)) - damping * k2;

      const k3 = omega + k2_omega * (dt * 0.5);
      const k3_omega = -(gravity / length) * Math.sin(theta + k2 * (dt * 0.5)) - damping * k3;

      const k4 = omega + k3_omega * dt;
      const k4_omega = -(gravity / length) * Math.sin(theta + k3 * dt) - damping * k4;

      angularVelRef.current = omega + (dt / 6) * (k1_omega + 2 * k2_omega + 2 * k3_omega + k4_omega);
      angleRef.current = theta + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }

    const currentAngle = angleRef.current;
    const currentAngularVel = angularVelRef.current;

    // Calculate position
    const bobX = Math.sin(currentAngle) * length;
    const bobY = -Math.cos(currentAngle) * length;

    // Update bob
    if (bobRef.current) {
      bobRef.current.position.set(bobX, bobY, 0);
      bobRef.current.rotation.z = -currentAngle;
    }

    if (bobInnerRef.current) {
      bobInnerRef.current.position.set(bobX, bobY, 0);
      bobInnerRef.current.rotation.z = -currentAngle;
      bobInnerRef.current.rotation.y = timeRef.current * 0.5;
    }

    // Update glow
    if (glowRef.current) {
      glowRef.current.position.set(bobX, bobY, 0);
      const speed = Math.abs(currentAngularVel);
      const scale = 1 + speed * 0.2;
      glowRef.current.scale.set(scale, scale, scale);
    }

    // Update string
    if (showString && stringLineRef.current) {
      updateLine(stringLineRef.current, [[0, 0, 0], [bobX, bobY, 0]]);
    }

    // Update trail
    if (showTrail && isPlaying && trailRef.current) {
      const idx = trailData.current.index % maxTrailPoints;
      trailData.current.positions[idx * 3] = bobX;
      trailData.current.positions[idx * 3 + 1] = bobY;
      trailData.current.positions[idx * 3 + 2] = 0;

      // Color gradient based on velocity
      const speed = Math.abs(currentAngularVel);
      const t = Math.min(speed / 2, 1);
      trailData.current.colors[idx * 3] = 0.3 + t * 0.5;     // R
      trailData.current.colors[idx * 3 + 1] = 0.5 + t * 0.3; // G
      trailData.current.colors[idx * 3 + 2] = 1.0 - t * 0.3; // B

      trailData.current.sizes[idx] = 0.08;
      trailData.current.index++;

      const positions = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colors = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      trailRef.current.geometry.setDrawRange(0, Math.min(trailData.current.index, maxTrailPoints));
    }

    // Update velocity vector
    if (showVectors && velocityLineRef.current) {
      const tangentialVelocity = currentAngularVel * length;
      const vScale = 0.2;
      const vx = Math.cos(currentAngle) * tangentialVelocity * vScale;
      const vy = Math.sin(currentAngle) * tangentialVelocity * vScale;
      updateLine(velocityLineRef.current, [[bobX, bobY, 0], [bobX + vx, bobY + vy, 0]]);
    }

    // Calculate energies
    const ke = calculatePendulumKE(mass, length, currentAngularVel);
    const pe = calculatePendulumPE(mass, gravity, length, currentAngle);
    const totalE = ke + pe;

    // Throttled data update (10fps)
    dataUpdateTimer.current += delta;
    if (dataUpdateTimer.current >= 0.1) {
      dataUpdateTimer.current = 0;

      const newData: PendulumData = {
        period: physicsConstants.period,
        frequency: physicsConstants.frequency,
        angularFrequency: physicsConstants.angularFrequency,
        kineticEnergy: ke,
        potentialEnergy: pe,
        totalEnergy: totalE,
        angle: currentAngle,
        angularVelocity: currentAngularVel,
        angleDeg: (currentAngle * 180) / Math.PI,
        tangentialVelocity: currentAngularVel * length,
        isPlaying,
        simulationSpeed,
      };

      // Only call if data changed
      if (!lastDataRef.current ||
          Math.abs(lastDataRef.current.kineticEnergy - newData.kineticEnergy) > 0.01 ||
          lastDataRef.current.isPlaying !== newData.isPlaying) {
        lastDataRef.current = newData;
        onDataChange?.(newData);
      }
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      trailGeometry.dispose();
    };
  }, [trailGeometry]);

  // Helper function to update line positions
  const updateLine = (line: THREE.Line, points: [number, number, number][]) => {
    const positions = line.geometry.attributes.position as THREE.BufferAttribute;
    points.forEach((point, i) => {
      positions.setXYZ(i, point[0], point[1], point[2]);
    });
    positions.needsUpdate = true;
  };

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 15, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[5, 10, 5]} intensity={0.3} color="#ec4899" />

      {/* Pivot point */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* String */}
      {showString && (
        <Line
          ref={stringLineRef}
          points={[[0, 0, 0], [0, -length, 0]]}
          color="#666666"
          lineWidth={2}
        />
      )}

      {/* Trail */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeometry} position={[0, 0, 0]}>
          <pointsMaterial
            size={0.1}
            vertexColors
            transparent
            opacity={0.6}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Bob */}
      <group ref={bobRef} position={[0, -length, 0]}>
        {/* Outer shell */}
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Inner rotating sphere */}
        <mesh ref={bobInnerRef} castShadow>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshStandardMaterial
            color="#ec4899"
            metalness={0.8}
            roughness={0.2}
            emissive="#ec4899"
            emissiveIntensity={isPlaying ? 0.3 : 0.1}
          />
        </mesh>

        {/* Glow effect */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Velocity vector */}
      {showVectors && (
        <Line
          ref={velocityLineRef}
          points={[[0, -length, 0], [1, -length, 0]]}
          color="#22c55e"
          lineWidth={3}
        />
      )}
    </group>
  );
}

export default PendulumSceneComponent;
