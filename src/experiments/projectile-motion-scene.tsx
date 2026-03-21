"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  calculateRange,
  calculateMaxHeight,
  calculateTimeOfFlight,
  calculateProjectilePosition,
} from "@/utils/physics";

interface ProjectileMotionSceneProps {
  onDataChange?: (data: ProjectileData) => void;
  velocity?: number;
  angle?: number;
  gravity?: number;
  mass?: number;
  airResistance?: boolean;
  dragCoefficient?: number;
  targetDistance?: number;
  showTrail?: boolean;
  showPrediction?: boolean;
  resetTrigger?: number;
  isPlaying?: boolean;
  simulationSpeed?: number;
}

export interface ProjectileData {
  currentX: number;
  currentY: number;
  currentZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  speed: number;
  flightTime: number;
  maxHeight: number;
  range: number;
  predictedRange: number;
  predictedMaxHeight: number;
  predictedTimeOfFlight: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

/**
 * World-class Projectile Motion Experiment
 */
export function ProjectileMotionSceneComponent({
  onDataChange,
  velocity = 20,
  angle = 45,
  gravity = 9.81,
  mass = 1,
  airResistance = false,
  dragCoefficient = 0.01,
  targetDistance = 30,
  showTrail = true,
  showPrediction = true,
  resetTrigger,
  isPlaying = true,
  simulationSpeed = 1,
}: ProjectileMotionSceneProps) {
  const projectileRef = useRef<THREE.Mesh>(null);
  const launcherGroupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  // Simulation state
  const launchedRef = useRef(false);
  const timeRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });  // Track velocity for proper physics
  const positionRef = useRef({ x: 0, y: 0 });  // Track position for proper integration
  const [isLaunched, setIsLaunched] = useState(false);

  // Trail data
  const trailPositions = useMemo(() => new Float32Array(1000 * 3), []);
  const trailColors = useMemo(() => new Float32Array(1000 * 3), []);
  const trailIndex = useRef(0);

  // Real-time data
  const [data, setData] = useState<ProjectileData>({
    currentX: 0,
    currentY: 0,
    currentZ: 0,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,
    speed: velocity,
    flightTime: 0,
    maxHeight: 0,
    range: 0,
    predictedRange: 0,
    predictedMaxHeight: 0,
    predictedTimeOfFlight: 0,
    kineticEnergy: 0.5 * mass * velocity * velocity,
    potentialEnergy: 0,
  });

  // Target hit state
  const [targetHit, setTargetHit] = useState(false);

  const angleRad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(angleRad);
  const vy = velocity * Math.sin(angleRad);

  // Calculate predictions
  useEffect(() => {
    const range = calculateRange(velocity, angleRad, gravity);
    const maxHeight = calculateMaxHeight(velocity, angleRad, gravity);
    const timeOfFlight = calculateTimeOfFlight(velocity, angleRad, gravity);

    setData((prev) => ({
      ...prev,
      predictedRange: range,
      predictedMaxHeight: maxHeight,
      predictedTimeOfFlight: timeOfFlight,
    }));
  }, [velocity, angle, gravity]);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      launchedRef.current = false;
      setIsLaunched(false);
      timeRef.current = 0;
      trailIndex.current = 0;
      setTargetHit(false);
      trailPositions.fill(0);
      trailColors.fill(0);
      velocityRef.current = { x: 0, y: 0 };
      positionRef.current = { x: 0, y: 0 };

      if (projectileRef.current) {
        projectileRef.current.position.set(0, 0.5, 0);
      }
    }
  }, [resetTrigger]);

  // Predicted trajectory points
  const predictedPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const totalTime = (2 * vy) / gravity;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalTime;
      const pos = calculateProjectilePosition(velocity, angleRad, t, gravity);
      points.push([pos.x, pos.y + 0.5, 0]);
    }
    return points;
  }, [velocity, angle, gravity]);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
    return geo;
  }, []);

  // Launch function
  const launch = () => {
    launchedRef.current = true;
    setIsLaunched(true);
    timeRef.current = 0;
    trailIndex.current = 0;
    setTargetHit(false);
    // Initialize velocity with launch values
    velocityRef.current = { x: vx, y: vy };
    positionRef.current = { x: 0, y: 0 };
  };

  // Auto-launch on resetTrigger change
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      launch();
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.016) * simulationSpeed;

    // Update launcher rotation
    if (launcherGroupRef.current) {
      launcherGroupRef.current.rotation.y = -angleRad;
    }

    if (launchedRef.current && isPlaying) {
      timeRef.current += dt;
      const t = timeRef.current;

      // Numerical integration with Euler method for proper physics
      if (airResistance) {
        const v = velocityRef.current;
        const p = positionRef.current;

        // Calculate speed (magnitude of velocity)
        const speed = Math.sqrt(v.x * v.x + v.y * v.y);

        // Air resistance force: F_drag = -½ρCdAv² * (v/|v|)
        // Simplified: a_drag = -(drag_coeff/m) * speed * v
        const dragFactor = (dragCoefficient / mass) * speed;

        // Acceleration due to gravity and drag
        const ax = -dragFactor * v.x;
        const ay = -gravity - dragFactor * v.y;

        // Update velocity: v = v + a * dt
        velocityRef.current.x = v.x + ax * dt;
        velocityRef.current.y = v.y + ay * dt;

        // Update position: p = p + v * dt
        positionRef.current.x = p.x + velocityRef.current.x * dt;
        positionRef.current.y = p.y + velocityRef.current.y * dt;
      } else {
        // No air resistance - use analytical solution for accuracy
        const pos = calculateProjectilePosition(velocity, angleRad, t, gravity);
        positionRef.current.x = pos.x;
        positionRef.current.y = pos.y;
        velocityRef.current.x = vx;
        velocityRef.current.y = vy - gravity * t;
      }

      const x = positionRef.current.x;
      const y = positionRef.current.y;
      const vxCurrent = velocityRef.current.x;
      const vyCurrent = velocityRef.current.y;
      const clampedY = Math.max(0, y);

      if (projectileRef.current) {
        projectileRef.current.position.set(x, clampedY + 0.5, 0);
      }

      // Update trail
      if (showTrail && trailRef.current) {
        const idx = trailIndex.current % 1000;
        trailPositions[idx * 3] = x;
        trailPositions[idx * 3 + 1] = clampedY + 0.5;
        trailPositions[idx * 3 + 2] = 0;

        // Color based on height
        const heightRatio = clampedY / (data.predictedMaxHeight || 1);
        trailColors[idx * 3] = 1 - heightRatio * 0.5;     // R
        trailColors[idx * 3 + 1] = heightRatio * 0.8;     // G
        trailColors[idx * 3 + 2] = 0.3 + heightRatio * 0.5; // B

        trailIndex.current++;

        const positions = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colors = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
        positions.needsUpdate = true;
        colors.needsUpdate = true;
        trailRef.current.geometry.setDrawRange(0, Math.min(trailIndex.current, 1000));
      }

      // Check target hit
      if (!targetHit && Math.abs(x - targetDistance) < 1.5 && clampedY < 2) {
        setTargetHit(true);
      }

      // Check if landed
      if (y <= 0 && t > 0.1) {
        launchedRef.current = false;
        setIsLaunched(false);
      }

      // Calculate energies
      const speed = Math.sqrt(vxCurrent * vxCurrent + vyCurrent * vyCurrent);
      const ke = 0.5 * mass * speed * speed;
      const pe = mass * gravity * clampedY;

      setData({
        currentX: x,
        currentY: clampedY,
        currentZ: 0,
        velocityX: vxCurrent,
        velocityY: vyCurrent,
        velocityZ: 0,
        speed,
        flightTime: t,
        maxHeight: Math.max(clampedY, data.maxHeight),
        range: x,
        predictedRange: data.predictedRange,
        predictedMaxHeight: data.predictedMaxHeight,
        predictedTimeOfFlight: data.predictedTimeOfFlight,
        kineticEnergy: ke,
        potentialEnergy: pe,
      });

      onDataChange?.(data);
    } else {
      if (projectileRef.current) {
        projectileRef.current.position.set(0, 0.5, 0);
      }
    }
  });

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 100]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.95} />
      </mesh>
      <gridHelper args={[200, 100, "#1a1a3e", "#0a0a1e"]} position={[50, 0.01, 0]} />

      {/* Launcher Assembly */}
      <LauncherAssembly />

      {/* Projectile */}
      <mesh ref={projectileRef} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          metalness={0.8}
          roughness={0.2}
          emissive="#ef4444"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Predicted Trajectory */}
      {showPrediction && !isLaunched && (
        <Line
          points={predictedPoints}
          color="#4ade80"
          lineWidth={2}
          dashed
          dashSize={0.5}
          gapSize={0.3}
          opacity={0.6}
        />
      )}

      {/* Motion Trail */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeometry}>
          <pointsMaterial
            size={0.08}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}

      {/* Target */}
      <TargetAssembly position={[targetDistance, 0, 0]} isHit={targetHit} />

      {/* Distance Markers */}
      {Array.from({ length: 10 }).map((_, i) => {
        const dist = (i + 1) * 10;
        return (
          <group key={i} position={[dist, 0.2, -5]}>
            <mesh>
              <boxGeometry args={[0.1, 0.4, 1]} />
              <meshStandardMaterial color="#2a2a4a" />
            </mesh>
            {dist % 20 === 0 && (
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#4a4a6a" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Height Markers (Y-axis) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const height = (i + 1) * 5;
        return (
          <group key={i} position={[-3, height, 0]}>
            <mesh>
              <boxGeometry args={[1.5, 0.08, 0.08]} />
              <meshStandardMaterial color="#2a2a4a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Realistic Launcher Assembly
 */
function LauncherAssembly() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.5, 0.2, 32]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Base Ring */}
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[1.8, 0.1, 8, 32]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Rotating Platform */}
      <group position={[0, 0.3, 0]}>
        {/* Elevation Mechanism */}
        <group rotation={[0, 0, 0]}>
          {/* Support Arm */}
          <mesh position={[0.5, 0.5, 0]} castShadow>
            <boxGeometry args={[1.5, 0.2, 0.6]} />
            <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Barrel */}
          <mesh position={[1.2, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 1.5, 16]} />
            <meshStandardMaterial
              color="#4a4a5a"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Barrel muzzle */}
          <mesh position={[2, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.3, 16]} />
            <meshStandardMaterial color="#5a5a6a" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Sight/Indicator */}
          <mesh position={[1.5, 0.95, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.08]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>

      {/* Control Box */}
      <mesh position={[-1.5, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.4]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Indicator Light */}
      <mesh position={[-1.5, 0.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

/**
 * Target Assembly
 */
function TargetAssembly({ position, isHit }: { position: [number, number, number]; isHit: boolean }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 2, 0.2, 32]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Support Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 5, 8]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Target Frame */}
      <group position={[0, 5, 0]}>
        {/* Outer Ring - 100 points */}
        <mesh>
          <ringGeometry args={[1.5, 1.6, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Scoring Rings */}
        {[1.2, 0.9, 0.6, 0.3].map((radius, i) => {
          const colors = ["#ffffff", "#000000", "#3b82f6", "#ef4444"];
          const scores = [25, 50, 75, 100];
          return (
            <mesh key={i}>
              <ringGeometry args={[radius - 0.15, radius, 32]} />
              <meshBasicMaterial color={colors[i]} />
            </mesh>
          );
        })}

        {/* Hit Indicator */}
        {isHit && (
          <mesh>
            <ringGeometry args={[0.1, 0.3, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        )}
      </group>
    </group>
  );
}

export default ProjectileMotionSceneComponent;
