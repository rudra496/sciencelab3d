"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface GravitationalOrbitsSceneProps {
  onDataChange?: (data: OrbitData) => void;
  starMass?: number;
  planetMass?: number;
  secondPlanetMass?: number;
  initialDistance?: number;
  initialVelocity?: number;
  showTrail?: boolean;
  showVectors?: boolean;
  showSecondPlanet?: boolean;
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
  eccentricity: number;
  semiMajorAxis: number;
  orbitType: "Circular" | "Elliptical" | "Parabolic" | "Hyperbolic";
  secondPlanetData?: {
    distance: number;
    velocity: number;
    orbitType: string;
  };
}

/**
 * Gravitational Orbits Simulation with Velocity Verlet Integration
 */
export function GravitationalOrbitsSceneComponent({
  onDataChange,
  starMass = 1000,
  planetMass = 1,
  secondPlanetMass = 0.5,
  initialDistance = 15,
  initialVelocity = 6,
  showTrail = true,
  showVectors = true,
  showSecondPlanet = false,
  resetTrigger,
}: GravitationalOrbitsSceneProps) {
  const G = 1; // Normalized gravitational constant

  // Refs for all physics state (no re-renders)
  const planetRef = useRef<THREE.Mesh>(null);
  const planet2Ref = useRef<THREE.Mesh>(null);
  const velocityArrowRef = useRef<THREE.Group>(null);
  const forceArrowRef = useRef<THREE.Group>(null);
  const velocityArrow2Ref = useRef<THREE.Group>(null);
  const forceArrow2Ref = useRef<THREE.Group>(null);

  // Physics state using refs (prevents re-renders)
  const physicsStateRef = useRef({
    // Planet 1
    position: new THREE.Vector3(initialDistance, 0, 0),
    velocity: new THREE.Vector3(0, 0, initialVelocity),
    acceleration: new THREE.Vector3(),
    trail: [] as THREE.Vector3[],
    // Planet 2
    position2: new THREE.Vector3(initialDistance * 1.5, 0, 0),
    velocity2: new THREE.Vector3(0, 0, initialVelocity * 0.8),
    acceleration2: new THREE.Vector3(),
    trail2: [] as THREE.Vector3[],
  });

  // React state (updated infrequently)
  const [trailPoints, setTrailPoints] = useState<[number, number, number][]>([]);
  const [trailPoints2, setTrailPoints2] = useState<[number, number, number][]>([]);
  const [data, setData] = useState<OrbitData>({
    period: 0,
    velocity: 0,
    escapeVelocity: 0,
    gravitationalForce: 0,
    totalEnergy: 0,
    angularMomentum: 0,
    distance: 0,
    eccentricity: 0,
    semiMajorAxis: 0,
    orbitType: "Circular",
  });

  // Throttling
  const frameCountRef = useRef(0);
  const DATA_UPDATE_INTERVAL = 8; // Update data every 8 frames
  const TRAIL_UPDATE_INTERVAL = 3; // Update trail every 3 frames

  // Calculate gravitational acceleration at position
  const calculateAcceleration = (position: THREE.Vector3): THREE.Vector3 => {
    const r = position.length();
    const forceMag = (G * starMass) / (r * r);
    const forceDir = position.clone().normalize().negate();
    return forceDir.multiplyScalar(forceMag);
  };

  // Determine orbit type from eccentricity
  const getOrbitType = (eccentricity: number): "Circular" | "Elliptical" | "Parabolic" | "Hyperbolic" => {
    if (eccentricity < 0.01) return "Circular";
    if (eccentricity < 1) return "Elliptical";
    if (Math.abs(eccentricity - 1) < 0.01) return "Parabolic";
    return "Hyperbolic";
  };

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      const state = physicsStateRef.current;
      state.position.set(initialDistance, 0, 0);
      state.velocity.set(0, 0, initialVelocity);
      state.acceleration.set(0, 0, 0);
      state.trail = [];
      state.position2.set(initialDistance * 1.5, 0, 0);
      state.velocity2.set(0, 0, initialVelocity * 0.8);
      state.acceleration2.set(0, 0, 0);
      state.trail2 = [];
      setTrailPoints([]);
      setTrailPoints2([]);
    }
  }, [resetTrigger, initialDistance, initialVelocity]);

  // Velocity Verlet Integration
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.016); // Cap delta for stability
    const state = physicsStateRef.current;

    // === PLANET 1 ===
    // Half-step velocity update
    if (state.acceleration.length() === 0) {
      state.acceleration.copy(calculateAcceleration(state.position));
    }
    const halfVel1 = state.velocity.clone().add(state.acceleration.clone().multiplyScalar(dt * 0.5));

    // Full-step position update
    state.position.add(halfVel1.clone().multiplyScalar(dt));

    // Recalculate acceleration at new position
    const newAccel1 = calculateAcceleration(state.position);

    // Complete velocity update
    state.velocity.add(state.acceleration.clone().add(newAccel1).multiplyScalar(dt * 0.5));
    state.acceleration.copy(newAccel1);

    // Update mesh position
    if (planetRef.current) {
      planetRef.current.position.copy(state.position);
    }

    // Update trail
    if (showTrail) {
      state.trail.push(state.position.clone());
      if (state.trail.length > 800) state.trail.shift();

      if (frameCountRef.current % TRAIL_UPDATE_INTERVAL === 0) {
        setTrailPoints(state.trail.map(p => [p.x, p.y, p.z] as [number, number, number]));
      }
    }

    // === PLANET 2 (optional) ===
    if (showSecondPlanet) {
      if (state.acceleration2.length() === 0) {
        state.acceleration2.copy(calculateAcceleration(state.position2));
      }
      const halfVel2 = state.velocity2.clone().add(state.acceleration2.clone().multiplyScalar(dt * 0.5));
      state.position2.add(halfVel2.clone().multiplyScalar(dt));
      const newAccel2 = calculateAcceleration(state.position2);
      state.velocity2.add(state.acceleration2.clone().add(newAccel2).multiplyScalar(dt * 0.5));
      state.acceleration2.copy(newAccel2);

      if (planet2Ref.current) {
        planet2Ref.current.position.copy(state.position2);
      }

      if (showTrail) {
        state.trail2.push(state.position2.clone());
        if (state.trail2.length > 800) state.trail2.shift();

        if (frameCountRef.current % TRAIL_UPDATE_INTERVAL === 0) {
          setTrailPoints2(state.trail2.map(p => [p.x, p.y, p.z] as [number, number, number]));
        }
      }
    }

    // === CALCULATE ORBITAL PARAMETERS ===
    const r1 = state.position.length();
    const v1 = state.velocity.length();
    const mu = G * starMass;
    const specificEnergy = (v1 * v1) / 2 - mu / r1;
    const semiMajorAxis = specificEnergy !== 0 ? -mu / (2 * specificEnergy) : Infinity;

    // Eccentricity calculation
    const hVec = new THREE.Vector3().crossVectors(state.position, state.velocity);
    const h = hVec.length();
    const eccentricity = specificEnergy < 0
      ? Math.sqrt(1 + (2 * specificEnergy * h * h) / (mu * mu))
      : 1;

    const forceMag = (G * starMass * planetMass) / (r1 * r1);
    const totalEnergy = specificEnergy * planetMass;
    const angularMomentum = h * planetMass;

    // Calculate orbit type
    const orbitType = getOrbitType(eccentricity);
    const period = semiMajorAxis > 0 ? 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / mu) : Infinity;
    const escapeVel = Math.sqrt((2 * mu) / r1);

    // Calculate second planet data if needed
    let secondPlanetData: OrbitData["secondPlanetData"];
    if (showSecondPlanet) {
      const r2 = state.position2.length();
      const v2 = state.velocity2.length();
      const e2 = (v2 * v2) / 2 - mu / r2;
      const h2Vec = new THREE.Vector3().crossVectors(state.position2, state.velocity2);
      const h2 = h2Vec.length();
      const ecc2 = e2 < 0 ? Math.sqrt(1 + (2 * e2 * h2 * h2) / (mu * mu)) : 1;
      secondPlanetData = {
        distance: r2,
        velocity: v2,
        orbitType: getOrbitType(ecc2),
      };
    }

    // Update data (throttled)
    frameCountRef.current++;
    if (frameCountRef.current % DATA_UPDATE_INTERVAL === 0) {
      const newData: OrbitData = {
        period,
        velocity: v1,
        escapeVelocity: escapeVel,
        gravitationalForce: forceMag,
        totalEnergy,
        angularMomentum,
        distance: r1,
        eccentricity,
        semiMajorAxis: semiMajorAxis || 0,
        orbitType,
        secondPlanetData,
      };
      setData(newData);
      onDataChange?.(newData);
    }

    // === UPDATE VECTORS ===
    // Velocity vector (green)
    if (showVectors && velocityArrowRef.current) {
      const velNorm = state.velocity.clone().normalize();
      velocityArrowRef.current.position.copy(state.position);
      velocityArrowRef.current.scale.set(1, 1, v1 * 0.5);
      velocityArrowRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), velNorm);
    }

    // Force vector (red)
    if (showVectors && forceArrowRef.current) {
      const forceDir = state.position.clone().normalize().negate();
      forceArrowRef.current.position.copy(state.position);
      forceArrowRef.current.scale.set(1, 1, forceMag * 2);
      forceArrowRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forceDir);
    }

    // Second planet vectors
    if (showSecondPlanet && showVectors) {
      if (velocityArrow2Ref.current) {
        const velNorm2 = state.velocity2.clone().normalize();
        velocityArrow2Ref.current.position.copy(state.position2);
        velocityArrow2Ref.current.scale.set(1, 1, state.velocity2.length() * 0.5);
        velocityArrow2Ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), velNorm2);
      }
      if (forceArrow2Ref.current) {
        const forceDir2 = state.position2.clone().normalize().negate();
        forceArrow2Ref.current.position.copy(state.position2);
        const forceMag2 = (G * starMass * secondPlanetMass) / (state.position2.length() ** 2);
        forceArrow2Ref.current.scale.set(1, 1, forceMag2 * 2);
        forceArrow2Ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forceDir2);
      }
    }
  });

  // Reference circular orbit
  const referenceOrbit = useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2;
      return [Math.cos(angle) * initialDistance, 0, Math.sin(angle) * initialDistance] as [number, number, number];
    });
  }, [initialDistance]);

  return (
    <group>
      {/* Central Star with glow effect */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff6600"
          emissiveIntensity={2.5}
          metalness={0}
          roughness={1}
        />
      </mesh>

      {/* Outer glow layers */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.3, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.2} />
      </mesh>

      {/* Point lights for star */}
      <pointLight position={[0, 0, 0]} intensity={8} color="#ffcc00" castShadow />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ff8800" distance={150} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ff6600" distance={200} />

      {/* Reference circular orbit */}
      <Line
        points={referenceOrbit}
        color="#334455"
        lineWidth={1}
        opacity={0.4}
        transparent
        dashed
      />

      {/* Planet 1 */}
      <mesh ref={planetRef} position={[initialDistance, 0, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#4a90d9"
          metalness={0.3}
          roughness={0.7}
          emissive="#4a90d9"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Planet 1 trail */}
      {showTrail && trailPoints.length > 1 && (
        <Line
          points={trailPoints}
          color="#4a90d9"
          lineWidth={2}
          opacity={0.7}
          transparent
        />
      )}

      {/* Planet 1 vectors */}
      {showVectors && (
        <>
          <group ref={velocityArrowRef}>
            <mesh position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.15, 0.4, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
            </mesh>
          </group>
          <group ref={forceArrowRef}>
            <mesh position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.15, 0.4, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </>
      )}

      {/* Planet 2 (optional) */}
      {showSecondPlanet && (
        <>
          <mesh ref={planet2Ref} position={[initialDistance * 1.5, 0, 0]} castShadow>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial
              color="#ff6b9d"
              metalness={0.3}
              roughness={0.7}
              emissive="#ff6b9d"
              emissiveIntensity={0.2}
            />
          </mesh>

          {showTrail && trailPoints2.length > 1 && (
            <Line
              points={trailPoints2}
              color="#ff6b9d"
              lineWidth={2}
              opacity={0.7}
              transparent
            />
          )}

          {showVectors && (
            <>
              <group ref={velocityArrow2Ref}>
                <mesh position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.12, 0.3, 8]} />
                  <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1]} />
                  <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
                </mesh>
              </group>
              <group ref={forceArrow2Ref}>
                <mesh position={[0, 1, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.12, 0.3, 8]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                </mesh>
              </group>
            </>
          )}
        </>
      )}

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#030308" roughness={0.98} />
      </mesh>
      <gridHelper args={[200, 100, "#1a1a3e", "#0a0a1e"]} position={[0, -19.99, 0]} />

      {/* Distance markers */}
      {Array.from({ length: 6 }, (_, i) => {
        const dist = 5 + i * 5;
        return (
          <group key={i}>
            <mesh position={[dist, -19.5, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            {i > 0 && (
              <mesh position={[-dist, -19.5, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color="#555" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default GravitationalOrbitsSceneComponent;
