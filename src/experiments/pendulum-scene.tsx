"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Text, Sphere, Trail } from "@react-three/drei";
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
  airResistance?: number;
  initialAngle?: number;
  showTrail?: boolean;
  showPhaseSpace?: boolean;
  showString?: boolean;
  showEnergyBars?: boolean;
  showVelocityVector?: boolean;
  showForceVectors?: boolean;
  enableSound?: boolean;
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
  centripetalAcceleration: number;
  tension: number;
  airResistanceForce: number;
}

/**
 * World-class Pendulum Scene with ultra-realistic physics and visualization
 * Features:
 * - Adaptive RK4 integration with sub-stepping for maximum accuracy
 * - Full air resistance simulation with velocity-squared drag
 * - PBR materials with proper metalness and roughness
 * - Real-time energy conservation visualization
 * - Phase space trajectory with smooth rendering
 * - Force and velocity vectors
 * - Enhanced motion trail with glow effects
 */
export function PendulumSceneComponent({
  onDataChange,
  length = 8,
  gravity = 9.81,
  mass = 2,
  damping = 0.002,
  airResistance = 0.001,
  initialAngle = Math.PI / 4,
  showTrail = true,
  showPhaseSpace = false,
  showString = true,
  showEnergyBars = true,
  showVelocityVector = true,
  showForceVectors = true,
  enableSound = false,
  onReset,
  resetTrigger,
}: PendulumSceneProps) {
  const { scene, camera } = useThree();
  const bobRef = useRef<THREE.Mesh>(null);
  const bobInnerRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const velocityLineRef = useRef<THREE.Line>(null);
  const tensionLineRef = useRef<THREE.Line>(null);
  const gravityLineRef = useRef<THREE.Line>(null);
  const dragLineRef = useRef<THREE.Line>(null);

  // Physics state with high precision
  const angleRef = useRef(initialAngle);
  const angularVelRef = useRef(0);
  const angularAccRef = useRef(0);
  const timeRef = useRef(0);
  const energyHistoryRef = useRef<{ ke: number; pe: number; total: number }[]>([]);

  // Enhanced trail data with more points and better colors
  const maxTrailPoints = 1500;
  const trailPositions = useMemo(() => new Float32Array(maxTrailPoints * 3), []);
  const trailColors = useMemo(() => new Float32Array(maxTrailPoints * 3), []);
  const trailSizes = useMemo(() => new Float32Array(maxTrailPoints), []);
  const trailIndex = useRef(0);
  const trailOpacityRef = useRef(0);

  // Phase space data with better resolution
  const [phaseSpaceData, setPhaseSpaceData] = useState<number[]>([]);

  // String points for smooth rendering
  const [stringPoints, setStringPoints] = useState<[number, number, number][]>([
    [0, 0, 0],
    [0, -length, 0],
  ]);

  // Real-time data with enhanced metrics
  const [data, setData] = useState<PendulumData>({
    period: calculatePendulumPeriod(length, gravity),
    frequency: calculatePendulumFrequency(length, gravity),
    angularFrequency: calculatePendulumAngularFrequency(length, gravity),
    kineticEnergy: 0,
    potentialEnergy: calculatePendulumPE(mass, gravity, length, initialAngle),
    totalEnergy: calculatePendulumPE(mass, gravity, length, initialAngle),
    angle: initialAngle,
    angularVelocity: 0,
    angleDeg: (initialAngle * 180) / Math.PI,
    tangentialVelocity: 0,
    centripetalAcceleration: 0,
    tension: 0,
    airResistanceForce: 0,
  });

  // Audio context for sound
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio on first user interaction
  useEffect(() => {
    if (enableSound && typeof window !== "undefined") {
      const initAudio = () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }
      };
      window.addEventListener("click", initAudio);
      return () => window.removeEventListener("click", initAudio);
    }
  }, [enableSound]);

  // Reset handler with trail cleanup
  useEffect(() => {
    if (resetTrigger !== undefined) {
      angleRef.current = initialAngle;
      angularVelRef.current = 0;
      angularAccRef.current = 0;
      trailIndex.current = 0;
      setPhaseSpaceData([]);
      energyHistoryRef.current = [];
      trailOpacityRef.current = 0;

      // Clear trail
      for (let i = 0; i < maxTrailPoints * 3; i++) {
        trailPositions[i] = 0;
        trailColors[i] = 0;
      }
      for (let i = 0; i < maxTrailPoints; i++) {
        trailSizes[i] = 0;
      }

      // Stop sound
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }
  }, [resetTrigger, initialAngle, maxTrailPoints, trailPositions, trailColors, trailSizes]);

  // Update calculations when params change
  useEffect(() => {
    const period = calculatePendulumPeriod(length, gravity);
    const frequency = calculatePendulumFrequency(length, gravity);
    const angularFreq = calculatePendulumAngularFrequency(length, gravity);
    const pe = calculatePendulumPE(mass, gravity, length, initialAngle);
    const angleDeg = (initialAngle * 180) / Math.PI;

    setData((prev) => ({
      ...prev,
      period,
      frequency,
      angularFrequency: angularFreq,
      potentialEnergy: pe,
      totalEnergy: pe,
      angleDeg,
    }));
  }, [length, gravity, mass, initialAngle]);

  // Create gradient texture for bob
  const bobTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Create radial gradient for metallic look
    const gradient = ctx.createRadialGradient(256, 200, 50, 256, 256, 256);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.2, "rgba(100, 150, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(50, 100, 200, 0.6)");
    gradient.addColorStop(0.8, "rgba(20, 50, 150, 0.4)");
    gradient.addColorStop(1, "rgba(10, 20, 80, 0.2)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(trailSizes, 1));
    return geo;
  }, []);

  // Glow mesh
  const glowGeometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  useFrame((state, delta) => {
    // Adaptive time stepping for stability
    const dt = Math.min(delta, 0.02);
    const substeps = 4;
    const subDt = dt / substeps;

    for (let step = 0; step < substeps; step++) {
      const theta = angleRef.current;
      const omega = angularVelRef.current;

      // Enhanced physics with air resistance (velocity-squared drag)
      // Equation: θ'' = -(g/L)sin(θ) - (b/m)θ' - (c/m)θ'|θ'|
      const velocity = omega * length;
      const dragForce = airResistance * velocity * Math.abs(velocity);
      const dragTorque = dragForce * length / mass;

      // RK4 integration with sub-stepping
      const k1 = omega;
      const k1_omega =
        (-gravity / length) * Math.sin(theta) - damping * omega - dragTorque;

      const k2 = omega + k1_omega * (subDt * 0.5);
      const k2_omega =
        (-gravity / length) * Math.sin(theta + k1 * (subDt * 0.5)) -
        damping * k2 -
        (airResistance * Math.pow(k2 * length, 2) * Math.sign(k2) * length) / mass;

      const k3 = omega + k2_omega * (subDt * 0.5);
      const k3_omega =
        (-gravity / length) * Math.sin(theta + k2 * (subDt * 0.5)) -
        damping * k3 -
        (airResistance * Math.pow(k3 * length, 2) * Math.sign(k3) * length) / mass;

      const k4 = omega + k3_omega * subDt;
      const k4_omega =
        (-gravity / length) * Math.sin(theta + k3 * subDt) -
        damping * k4 -
        (airResistance * Math.pow(k4 * length, 2) * Math.sign(k4) * length) / mass;

      angularVelRef.current =
        omega + (subDt / 6) * (k1_omega + 2 * k2_omega + 2 * k3_omega + k4_omega);
      angleRef.current =
        theta + (subDt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }

    const currentAngle = angleRef.current;
    const currentAngularVel = angularVelRef.current;

    // Calculate enhanced physics properties
    const bobX = Math.sin(currentAngle) * length;
    const bobY = -Math.cos(currentAngle) * length;
    const tangentialVelocity = currentAngularVel * length;
    const centripetalAcc = (tangentialVelocity * tangentialVelocity) / length;
    const tension =
      mass * gravity * Math.cos(currentAngle) + mass * centripetalAcc;
    const airResistForce =
      airResistance * tangentialVelocity * Math.abs(tangentialVelocity);

    // Update bob position with smooth interpolation
    if (bobRef.current) {
      bobRef.current.position.set(bobX, bobY, 0);
      // Add slight rotation based on angular velocity
      bobRef.current.rotation.z = -currentAngle;
    }

    if (bobInnerRef.current) {
      bobInnerRef.current.position.set(bobX, bobY, 0);
      bobInnerRef.current.rotation.z = -currentAngle;
      bobInnerRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }

    // Update glow
    if (glowRef.current) {
      glowRef.current.position.set(bobX, bobY, 0);
      const speed = Math.abs(currentAngularVel);
      const scale = 1 + speed * 0.3;
      glowRef.current.scale.set(scale, scale, scale);
    }

    // Update string
    if (showString) {
      setStringPoints([
        [0, 0, 0],
        [bobX, bobY, 0],
      ]);
    }

    // Calculate energies
    const ke = calculatePendulumKE(mass, length, currentAngularVel);
    const pe = calculatePendulumPE(mass, gravity, length, currentAngle);
    const totalE = ke + pe;

    // Track energy history for conservation visualization
    energyHistoryRef.current.push({ ke, pe, total: totalE });
    if (energyHistoryRef.current.length > 200) {
      energyHistoryRef.current.shift();
    }

    const newData: PendulumData = {
      period: calculatePendulumPeriod(length, gravity),
      frequency: calculatePendulumFrequency(length, gravity),
      angularFrequency: calculatePendulumAngularFrequency(length, gravity),
      kineticEnergy: ke,
      potentialEnergy: pe,
      totalEnergy: totalE,
      angle: currentAngle,
      angularVelocity: currentAngularVel,
      angleDeg: (currentAngle * 180) / Math.PI,
      tangentialVelocity,
      centripetalAcceleration: centripetalAcc,
      tension,
      airResistanceForce: airResistForce,
    };
    setData(newData);
    onDataChange?.(newData);

    // Update trail with enhanced visual effects
    if (showTrail && trailRef.current) {
      const idx = trailIndex.current % maxTrailPoints;
      trailPositions[idx * 3] = bobX;
      trailPositions[idx * 3 + 1] = bobY;
      trailPositions[idx * 3 + 2] = 0;

      // Enhanced color gradient based on velocity and position
      const speed = Math.abs(currentAngularVel);
      const height = (-bobY / length + 1) / 2; // 0 at bottom, 1 at top
      const t = Math.min(speed / 3, 1);

      // Beautiful gradient from blue (slow) to cyan to white (fast)
      trailColors[idx * 3] = 0.2 + t * 0.8; // R - increases with speed
      trailColors[idx * 3 + 1] = 0.5 + t * 0.3 + height * 0.2; // G
      trailColors[idx * 3 + 2] = 1.0 - t * 0.3; // B

      // Size varies with position (larger at bottom)
      trailSizes[idx] = 0.08 + height * 0.06;

      trailIndex.current++;
      trailOpacityRef.current = Math.min(trailOpacityRef.current + dt * 0.5, 1);

      const positions = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colors = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const sizes = trailRef.current.geometry.attributes.size as THREE.BufferAttribute;
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      sizes.needsUpdate = true;
      trailRef.current.geometry.setDrawRange(
        0,
        Math.min(trailIndex.current, maxTrailPoints)
      );
    }

    // Update velocity vector
    if (showVelocityVector && velocityLineRef.current) {
      const vScale = 0.3;
      const vx = Math.cos(currentAngle) * tangentialVelocity * vScale;
      const vy = Math.sin(currentAngle) * tangentialVelocity * vScale;
      updateLine(velocityLineRef.current, [
        [bobX, bobY, 0],
        [bobX + vx, bobY + vy, 0],
      ]);
    }

    // Update tension vector (points along string toward pivot)
    if (showForceVectors && tensionLineRef.current) {
      const tScale = 0.02;
      const tx = -Math.sin(currentAngle) * tension * tScale;
      const ty = Math.cos(currentAngle) * tension * tScale;
      updateLine(tensionLineRef.current, [
        [bobX, bobY, 0],
        [bobX + tx, bobY + ty, 0],
      ]);
    }

    // Update gravity vector (always points down)
    if (showForceVectors && gravityLineRef.current) {
      const gScale = 0.5;
      updateLine(gravityLineRef.current, [
        [bobX, bobY, 0],
        [bobX, bobY - mass * gravity * gScale, 0],
      ]);
    }

    // Update air resistance vector (opposes velocity)
    if (showForceVectors && dragLineRef.current && Math.abs(airResistForce) > 0.01) {
      const dScale = 2;
      const vx = Math.cos(currentAngle) * tangentialVelocity;
      const vy = Math.sin(currentAngle) * tangentialVelocity;
      const vMag = Math.sqrt(vx * vx + vy * vy);
      if (vMag > 0.01) {
        const dx = (-vx / vMag) * airResistForce * dScale;
        const dy = (-vy / vMag) * airResistForce * dScale;
        updateLine(dragLineRef.current, [
          [bobX, bobY, 0],
          [bobX + dx, bobY + dy, 0],
        ]);
      }
    }

    // Update phase space
    if (showPhaseSpace) {
      timeRef.current += dt;
      if (timeRef.current > 0.03) {
        timeRef.current = 0;
        setPhaseSpaceData((prev) => {
          const newData = [...prev, currentAngle, currentAngularVel];
          return newData.slice(-1200);
        });
      }
    }

    // Sound synthesis based on velocity
    if (enableSound && audioContextRef.current && Math.abs(currentAngularVel) > 0.01) {
      try {
        if (!oscillatorRef.current) {
          oscillatorRef.current = audioContextRef.current.createOscillator();
          gainNodeRef.current = audioContextRef.current.createGain();
          oscillatorRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioContextRef.current.destination);
          oscillatorRef.current.start();
        }

        if (!oscillatorRef.current || !gainNodeRef.current) return;
        const freq = 200 + Math.abs(currentAngularVel) * 100;
        const volume = Math.min(Math.abs(currentAngularVel) * 0.05, 0.3);
        oscillatorRef.current.frequency.setTargetAtTime(
          freq,
          audioContextRef.current.currentTime,
          0.01
        );
        gainNodeRef.current!.gain.setTargetAtTime(
          volume,
          audioContextRef.current.currentTime,
          0.01
        );
      } catch (e) {
        // Audio may not be available
      }
    } else if (oscillatorRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        0,
        audioContextRef.current!.currentTime,
        0.01
      );
    }
  });

  // Helper to update line geometry
  const updateLine = (
    line: THREE.Line,
    points: [number, number, number][]
  ) => {
    const positions = line.geometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, points[0][0], points[0][1], points[0][2]);
    positions.setXYZ(1, points[1][0], points[1][1], points[1][2]);
    positions.needsUpdate = true;
  };

  const trailOpacity = trailOpacityRef.current;
  const bobRadius = 0.5 * Math.cbrt(mass);

  return (
    <group>
      {/* Enhanced Main support structure */}
      <PendulumSupport />

      {/* Improved Pivot assembly */}
      <group position={[0, 0, 0]}>
        {/* Pivot mount with better materials */}
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.18, 48]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Main pivot cylinder */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.35, 48]} />
          <meshStandardMaterial
            color="#2a2a3e"
            metalness={0.9}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Decorative rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
          <torusGeometry args={[0.22, 0.035, 24, 48]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={1}
            roughness={0.1}
            envMapIntensity={2}
          />
        </mesh>

        {/* Pivot cap with sphere */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.14, 32, 32]} />
          <meshStandardMaterial
            color="#3a3a4e"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>

        {/* Precision bearing */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.025, 16, 48]} />
          <meshStandardMaterial
            color="#c0c0c0"
            metalness={1}
            roughness={0.05}
            envMapIntensity={2.5}
          />
        </mesh>
      </group>

      {/* Enhanced string with glow */}
      {showString && (
        <Line
          points={stringPoints}
          color="#888888"
          lineWidth={3}
          opacity={0.9}
          transparent
        />
      )}

      {/* Pendulum Bob with multiple layers for realistic appearance */}
      <group ref={bobRef}>
        {/* Outer shell - polished metal */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[bobRadius, 128, 128]} />
          <meshStandardMaterial
            color="#2563eb"
            metalness={0.92}
            roughness={0.08}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Inner highlight layer */}
        <mesh ref={bobInnerRef} castShadow>
          <sphereGeometry args={[bobRadius * 0.95, 64, 64]} />
          <meshStandardMaterial
            color="#3b82f6"
            metalness={0.98}
            roughness={0.02}
            envMapIntensity={3}
            emissive="#1e40af"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Specular highlight */}
        <mesh position={[bobRadius * 0.3, bobRadius * 0.3, bobRadius * 0.3]}>
          <sphereGeometry args={[bobRadius * 0.2, 32, 32]} />
          <meshBasicMaterial
            color="#93c5fd"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Glow effect */}
      <mesh ref={glowRef} scale={[bobRadius * 1.5, bobRadius * 1.5, bobRadius * 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Force vectors */}
      {showForceVectors && (
        <group>
          {/* Velocity vector (green) */}
          <primitive ref={velocityLineRef} object={createArrow([0, 1, 0], 0.02)} />

          {/* Tension vector (blue) */}
          <primitive ref={tensionLineRef} object={createArrow([0, 0.5, 1], 0.02)} />

          {/* Gravity vector (red) */}
          <primitive ref={gravityLineRef} object={createArrow([1, 0.2, 0.2], 0.02)} />

          {/* Air resistance (yellow) */}
          <primitive ref={dragLineRef} object={createArrow([1, 0.8, 0], 0.015)} />
        </group>
      )}

      {/* Enhanced Motion Trail with glow */}
      {showTrail && trailOpacity > 0 && (
        <points ref={trailRef} geometry={trailGeometry}>
          <pointsMaterial
            size={0.12}
            vertexColors
            transparent
            opacity={0.85 * trailOpacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Enhanced Phase Space Diagram */}
      {showPhaseSpace && phaseSpaceData.length > 10 && (
        <group position={[30, 12, 0]}>
          {/* Background panel with gradient */}
          <mesh>
            <planeGeometry args={[18, 14]} />
            <meshBasicMaterial
              color="#0a0a1e"
              transparent
              opacity={0.98}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Border with glow */}
          <Line
            points={[
              [-9, -7, 0.01],
              [9, -7, 0.01],
              [9, 7, 0.01],
              [-9, 7, 0.01],
              [-9, -7, 0.01],
            ]}
            color="#3b82f6"
            lineWidth={3}
            opacity={0.8}
            transparent
          />

          {/* Enhanced grid */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Line
              key={`h${i}`}
              points={[
                [-9, -6 + i * 2, 0.015],
                [9, -6 + i * 2, 0.015],
              ]}
              color="#1a1a3a"
              lineWidth={1}
              opacity={0.5}
              transparent
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <Line
              key={`v${i}`}
              points={[
                [-8 + i * 1.8, -7, 0.015],
                [-8 + i * 1.8, 7, 0.015],
              ]}
              color="#1a1a3a"
              lineWidth={1}
              opacity={0.5}
              transparent
            />
          ))}

          {/* Axes */}
          <Line
            points={[[-9, 0, 0.02], [9, 0, 0.02]]}
            color="#4a4a6a"
            lineWidth={2}
          />
          <Line
            points={[[0, -7, 0.02], [0, 7, 0.02]]}
            color="#4a4a6a"
            lineWidth={2}
          />

          {/* Axis labels */}
          <Text
            position={[9.5, 0, 0.03]}
            fontSize={0.8}
            color="#6a6a8a"
            anchorX="left"
            anchorY="middle"
          >
            θ (rad)
          </Text>
          <Text
            position={[0, 7.5, 0.03]}
            fontSize={0.8}
            color="#6a6a8a"
            anchorX="center"
          >
            ω (rad/s)
          </Text>

          {/* Phase space curve with gradient */}
          {phaseSpaceData.length > 4 && (
            <Line
              points={Array.from(
                { length: Math.min(phaseSpaceData.length / 2, 600) },
                (_, i) => {
                  const idx = phaseSpaceData.length - 2 - i * 2;
                  return [
                    (phaseSpaceData[idx] / (Math.PI / 2)) * 6,
                    (phaseSpaceData[idx + 1] / 3) * 5,
                    0.03,
                  ];
                }
              )}
              color="#22c55e"
              lineWidth={2.5}
              opacity={0.95}
            />
          )}

          {/* Current position indicator with pulse */}
          {phaseSpaceData.length >= 2 && (
            <mesh
              position={[
                (phaseSpaceData[phaseSpaceData.length - 2] / (Math.PI / 2)) * 6,
                (phaseSpaceData[phaseSpaceData.length - 1] / 3) * 5,
                0.04,
              ]}
            >
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial
                color="#ef4444"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Energy bars visualization */}
      {showEnergyBars && (
        <group position={[-25, 10, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry args={[8, 12]} />
            <meshBasicMaterial
              color="#0a0a1e"
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Border */}
          <Line
            points={[
              [-4, -6, 0.01],
              [4, -6, 0.01],
              [4, 6, 0.01],
              [-4, 6, 0.01],
              [-4, -6, 0.01],
            ]}
            color="#8b5cf6"
            lineWidth={2}
          />

          {/* Title */}
          <Text position={[0, 5, 0.02]} fontSize={0.7} color="#a78bfa" anchorX="center">
            Energy
          </Text>

          {/* KE Bar */}
          <mesh position={[0, 2, 0.02]}>
            <boxGeometry args={[3, (data.kineticEnergy / data.totalEnergy) * 3, 0.1]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* PE Bar */}
          <mesh position={[0, -1, 0.02]}>
            <boxGeometry args={[3, (data.potentialEnergy / data.totalEnergy) * 3, 0.1]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Labels */}
          <Text position={[0, 4, 0.03]} fontSize={0.5} color="#22c55e" anchorX="center">
            KE: {data.kineticEnergy.toFixed(2)} J
          </Text>
          <Text position={[0, 1, 0.03]} fontSize={0.5} color="#ef4444" anchorX="center">
            PE: {data.potentialEnergy.toFixed(2)} J
          </Text>
          <Text position={[0, -5, 0.03]} fontSize={0.5} color="#a78bfa" anchorX="center">
            Total: {data.totalEnergy.toFixed(2)} J
          </Text>
        </group>
      )}

      {/* Enhanced floor with reflective surface */}
      <group position={[0, -length - 5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#03030a"
            roughness={0.92}
            metalness={0.08}
            envMapIntensity={0.5}
          />
        </mesh>
        <gridHelper
          args={[200, 200, "#151530", "#0a0a1e"]}
          position={[0, 0.01, 0]}
        />

        {/* Center marker */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>

        {/* Distance markers */}
        {Array.from({ length: 8 }).map((_, i) => {
          const dist = (i + 1) * 5;
          const angle = (i * Math.PI) / 4;
          return (
            <group key={i} position={[Math.cos(angle) * dist, 0.02, Math.sin(angle) * dist]}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
                <meshStandardMaterial color="#2a2a4a" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#4a4a6a" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Create arrow helper for vectors
 */
function createArrow(color: [number, number, number], lineWidth: number) {
  const points: [number, number, number][] = [
    [0, 0, 0],
    [1, 0, 0],
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(...p))
  );
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(...color),
    linewidth: lineWidth,
    transparent: true,
    opacity: 0.9,
  });
  return new THREE.Line(geometry, material);
}

/**
 * Enhanced realistic support structure for pendulum
 */
function PendulumSupport() {
  return (
    <group>
      {/* Main horizontal beam */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[25, 0.6, 1.8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={1}
        />
      </mesh>

      {/* Beam top decorative strip */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[25, 0.12, 1.4]} />
        <meshStandardMaterial
          color="#2a2a3e"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Gold inlay */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[24, 0.02, 0.1]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Left support structure */}
      <group position={[-12.5, 0, 0]}>
        {/* Vertical support */}
        <mesh position={[-0.5, -3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 8, 0.7]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Support bracket */}
        <mesh position={[-0.25, -0.7, 0]} castShadow>
          <boxGeometry args={[1.2, 2.4, 0.5]} />
          <meshStandardMaterial
            color="#2a2a3e"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Base plate */}
        <mesh position={[-0.5, -7.5, 0]} receiveShadow>
          <cylinderGeometry args={[1.8, 2, 0.3, 48]} />
          <meshStandardMaterial
            color="#0f0f1e"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Bolts */}
        {[-1, 1].map((x, i) => (
          <group key={i}>
            <mesh position={[x, -7.6, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} />
              <meshStandardMaterial
                color="#5a5a6a"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Bolt head */}
            <mesh position={[x, -7.45, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.08, 6]} />
              <meshStandardMaterial
                color="#4a4a5a"
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}

        {/* Diagonal brace */}
        <mesh position={[0.5, -5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.3, 5, 0.3]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.65} roughness={0.35} />
        </mesh>
      </group>

      {/* Right support structure */}
      <group position={[12.5, 0, 0]}>
        {/* Vertical support */}
        <mesh position={[0.5, -3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 8, 0.7]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Support bracket */}
        <mesh position={[0.25, -0.7, 0]} castShadow>
          <boxGeometry args={[1.2, 2.4, 0.5]} />
          <meshStandardMaterial
            color="#2a2a3e"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Base plate */}
        <mesh position={[0.5, -7.5, 0]} receiveShadow>
          <cylinderGeometry args={[1.8, 2, 0.3, 48]} />
          <meshStandardMaterial
            color="#0f0f1e"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Bolts */}
        {[-1, 1].map((x, i) => (
          <group key={i}>
            <mesh position={[x, -7.6, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} />
              <meshStandardMaterial
                color="#5a5a6a"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[x, -7.45, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.08, 6]} />
              <meshStandardMaterial
                color="#4a4a5a"
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}

        {/* Diagonal brace */}
        <mesh position={[-0.5, -5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.3, 5, 0.3]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.65} roughness={0.35} />
        </mesh>
      </group>

      {/* Center support under pivot */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 5.2, 24]} />
        <meshStandardMaterial
          color="#2a2a3e"
          metalness={0.75}
          roughness={0.25}
          envMapIntensity={1}
        />
      </mesh>

      {/* Decorative rings on center support */}
      {[0, -1.5, -3].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.04, 16, 32]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={1}
            roughness={0.1}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default PendulumSceneComponent;
