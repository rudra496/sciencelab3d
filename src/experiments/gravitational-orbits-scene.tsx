"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  calculateEscapeVelocity,
  calculateGravitationalForce,
  calculateOrbitalEnergy,
  calculateAngularMomentum,
} from "@/utils/physics";

interface GravitationalOrbitsSceneProps {
  onDataChange?: (data: OrbitData) => void;
  starMass?: number;
  planetMass?: number;
  initialDistance?: number;
  initialVelocity?: number;
  showTrail?: boolean;
  showVectors?: boolean;
  showMultiplePlanets?: boolean;
  resetTrigger?: number;
}

export interface OrbitData {
  period: number;
  velocity: number;
  escapeVelocity: number;
  gravitationalForce: number;
  totalEnergy: number;
  angularMomentum: number;
  distance: number;
  altitude: number;
  eccentricity: number;
  semiMajorAxis: number;
}

/**
 * World-class Gravitational Orbits Simulation
 */
export function GravitationalOrbitsSceneComponent({
  onDataChange,
  starMass = 1000,
  planetMass = 1,
  initialDistance = 15,
  initialVelocity = 6,
  showTrail = true,
  showVectors = true,
  showMultiplePlanets = false,
  resetTrigger,
}: GravitationalOrbitsSceneProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const velocityArrowRef = useRef<THREE.Group>(null);
  const forceArrowRef = useRef<THREE.Group>(null);

  const G = 1; // Normalized gravitational constant for simulation

  // Physics state
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(initialDistance, 0, 0));
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, initialVelocity));
  const trailPoints = useRef<THREE.Vector3[]>([]);
  const [trailPointsState, setTrailPointsState] = useState<[number, number, number][]>([]);

  const [data, setData] = useState<OrbitData>(() => {
    const r = initialDistance;
    const v = initialVelocity;
    return {
      period: calculateOrbitalPeriod(r, starMass, G),
      velocity: v,
      escapeVelocity: calculateEscapeVelocity(r, starMass, G),
      gravitationalForce: calculateGravitationalForce(starMass, planetMass, r, G),
      totalEnergy: calculateOrbitalEnergy(v, r, starMass, G),
      angularMomentum: calculateAngularMomentum({ x: r, y: 0, z: 0 }, { x: 0, y: 0, z: v }),
      distance: r,
      altitude: r - 3,
      eccentricity: 0,
      semiMajorAxis: r,
    };
  });

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      positionRef.current.set(initialDistance, 0, 0);
      velocityRef.current.set(0, 0, initialVelocity);
      trailPoints.current = [];
      setTrailPointsState([]);
    }
  }, [resetTrigger, initialDistance, initialVelocity]);

  useFrame((_, delta) => {
    if (!planetRef.current) return;
    const dt = Math.min(delta, 0.016);

    const pos = positionRef.current;
    const vel = velocityRef.current;

    // Calculate gravitational force
    const r = pos.length();
    const forceMag = (G * starMass * planetMass) / (r * r);
    const forceDir = pos.clone().normalize().negate();
    const force = forceDir.multiplyScalar(forceMag);

    // Update velocity (F = ma -> a = F/m)
    const acceleration = force.clone().divideScalar(planetMass);
    vel.add(acceleration.multiplyScalar(dt));

    // Update position
    pos.add(vel.clone().multiplyScalar(dt));

    // Update planet position
    planetRef.current.position.copy(pos);

    // Update trail
    if (showTrail) {
      trailPoints.current.push(pos.clone());
      if (trailPoints.current.length > 500) {
        trailPoints.current.shift();
      }

      // Update state for Line component (limited updates for performance)
      if (trailPoints.current.length % 3 === 0) {
        setTrailPointsState(trailPoints.current.map(p => [p.x, p.y, p.z] as [number, number, number]));
      }
    }

    // Calculate orbital parameters
    const v = vel.length();
    const r_vec = pos;
    const r_mag = r;
    const v_mag = v;

    // Specific orbital energy: ε = v²/2 - μ/r
    const mu = G * starMass;
    const specificEnergy = (v_mag * v_mag) / 2 - mu / r_mag;

    // Semi-major axis: a = -μ/(2ε)
    const semiMajorAxis = specificEnergy !== 0 ? -mu / (2 * specificEnergy) : Infinity;

    // Eccentricity: e = sqrt(1 + 2εh²/μ²) where h is specific angular momentum
    const hVec = new THREE.Vector3().crossVectors(r_vec, vel);
    const h = hVec.length();
    const eccentricity = specificEnergy < 0 ? Math.sqrt(1 + (2 * specificEnergy * h * h) / (mu * mu)) : 1;

    const newData: OrbitData = {
      period: semiMajorAxis > 0 ? calculateOrbitalPeriod(semiMajorAxis, starMass, G) : Infinity,
      velocity: v_mag,
      escapeVelocity: calculateEscapeVelocity(r_mag, starMass, G),
      gravitationalForce: forceMag,
      totalEnergy: calculateOrbitalEnergy(v_mag, r_mag, starMass, G),
      angularMomentum: calculateAngularMomentum(
        { x: r_vec.x, y: r_vec.y, z: r_vec.z },
        { x: vel.x, y: vel.y, z: vel.z }
      ),
      distance: r_mag,
      altitude: r_mag - 3,
      eccentricity,
      semiMajorAxis: semiMajorAxis || 0,
    };

    setData(newData);
    onDataChange?.(newData);

    // Update velocity vector arrow
    if (showVectors && velocityArrowRef.current) {
      const velNorm = vel.clone().normalize();
      velocityArrowRef.current.position.copy(pos);
      velocityArrowRef.current.scale.set(1, 1, v_mag * 0.5);
      velocityArrowRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        velNorm
      );
    }

    // Update force vector arrow
    if (showVectors && forceArrowRef.current) {
      const forceNorm = forceDir.clone().normalize();
      forceArrowRef.current.position.copy(pos);
      forceArrowRef.current.scale.set(1, 1, forceMag * 2);
      forceArrowRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        forceNorm
      );
    }
  });

  return (
    <group>
      {/* Star */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={2}
          metalness={0}
          roughness={1}
        />
      </mesh>
      {/* Star glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={5} color="#ffcc00" castShadow />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ff8800" distance={100} />

      {/* Orbital path (reference circle) */}
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return [Math.cos(angle) * initialDistance, 0, Math.sin(angle) * initialDistance] as [number, number, number];
        })}
        color="#333"
        lineWidth={1}
        opacity={0.5}
        transparent
        dashed
      />

      {/* Planet */}
      <mesh ref={planetRef} position={[initialDistance, 0, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#4a90d9"
          metalness={0.3}
          roughness={0.8}
          emissive="#4a90d9"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Planet trail */}
      {showTrail && trailPointsState.length > 1 && (
        <Line
          points={trailPointsState}
          color="#4a90d9"
          lineWidth={2}
          opacity={0.6}
          transparent
        />
      )}

      {/* Velocity vector */}
      {showVectors && (
        <group ref={velocityArrowRef}>
          <mesh position={[0, 1, 0]}>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Force vector */}
      {showVectors && (
        <group ref={forceArrowRef}>
          <mesh position={[0, 1, 0]}>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[200, 100, "#1a1a3e", "#0a0a1e"]} position={[0, -14.99, 0]} />

      {/* Distance markers */}
      {Array.from({ length: 6 }).map((_, i) => {
        const dist = 5 + i * 5;
        return (
          <group key={i}>
            <mesh position={[dist, -14.5, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#666" />
            </mesh>
            {i > 0 && (
              <mesh position={[-dist, -14.5, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Additional planets (if enabled) */}
      {showMultiplePlanets && (
        <>
          {/* Inner planet */}
          <mesh position={[10, 0, 0]} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color="#ff6b6b"
              metalness={0.3}
              roughness={0.8}
            />
          </mesh>
          {/* Outer planet */}
          <mesh position={[25, 0, 0]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#9b59b6"
              metalness={0.3}
              roughness={0.8}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

export default GravitationalOrbitsSceneComponent;
