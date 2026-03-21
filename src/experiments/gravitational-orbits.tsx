"use client";

export { GravitationalOrbitsSceneComponent as default, GravitationalOrbitsSceneComponent } from "./gravitational-orbits-scene";
export type { OrbitData } from "./gravitational-orbits-scene";

// Legacy export - kept for backwards compatibility
import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { DataDisplay } from "@/components/experiment-helpers";
import {
  calculateOrbitalEnergy,
  calculateEscapeVelocity,
  calculateOrbitalVelocity,
  calculateSemiMajorAxis,
  calculateEccentricity,
  calculateAngularMomentum,
} from "@/utils/physics";

export function GravitationalOrbitsScene() {
  const planetRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const { G, starMass, planetDistance, planetVelocity, showTrail, showData, multiPlanet } = useControls(
    "Orbits",
    {
      G: { value: 10, min: 1, max: 50, step: 1, label: "G (gravitational constant)" },
      starMass: { value: 100, min: 20, max: 200, step: 5, label: "Star Mass" },
      planetDistance: { value: 4, min: 2, max: 7, step: 0.1, label: "Initial Distance" },
      planetVelocity: { value: 4, min: 1, max: 8, step: 0.1, label: "Initial Velocity" },
      showTrail: { value: true, label: "Show Orbit Trail" },
      showData: { value: true, label: "Show Data Panel" },
      multiPlanet: { value: false, label: "Multiple Planets" },
      reset: button(() => reset()),
    }
  );

  const positionRef = useRef(new THREE.Vector3(planetDistance, 0, 0));
  const velocityRef = useRef(new THREE.Vector3(0, 0, planetVelocity));
  const trailPositions = useRef<Float32Array>(new Float32Array(500 * 3));
  const trailIndex = useRef(0);

  // Secondary planet for multi-planet mode
  const [planet2Pos, setPlanet2Pos] = useState(new THREE.Vector3(-5, 0, 0));
  const [planet2Vel, setPlanet2Vel] = useState(new THREE.Vector3(0, 0, -3));
  const planet2Ref = useRef<THREE.Mesh>(null);
  const trail2Positions = useRef<Float32Array>(new Float32Array(500 * 3));
  const trail2Index = useRef(0);

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions.current, 3));
    return geo;
  }, []);

  const trail2Geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trail2Positions.current, 3));
    return geo;
  }, []);

  // Real-time orbital data
  const [orbitalData, setOrbitalData] = useState({
    distance: planetDistance,
    speed: planetVelocity,
    specificEnergy: 0,
    isBound: false,
    eccentricity: 0,
    semiMajorAxis: 0,
    escapeVelocity: 0,
    circularOrbitVelocity: 0,
  });

  function reset() {
    positionRef.current.set(planetDistance, 0, 0);
    velocityRef.current.set(0, 0, planetVelocity);
    trailPositions.current = new Float32Array(500 * 3);
    trailIndex.current = 0;

    if (multiPlanet) {
      setPlanet2Pos(new THREE.Vector3(-5, 0, 0));
      setPlanet2Vel(new THREE.Vector3(0, 0, -3));
      trail2Positions.current = new Float32Array(500 * 3);
      trail2Index.current = 0;
    }
  }

  useEffect(() => {
    reset();
  }, [planetDistance, planetVelocity, multiPlanet]);

  // FIXED: Properly calculate angular momentum
  const calculateCurrentAngularMomentum = (pos: THREE.Vector3, vel: THREE.Vector3): number => {
    return calculateAngularMomentum(
      { x: pos.x, y: pos.y, z: pos.z },
      { x: vel.x, y: vel.y, z: vel.z }
    );
  };

  useFrame((_, delta) => {
    if (!planetRef.current) return;
    const dt = Math.min(delta, 0.02) * 0.5;

    // Planet 1
    const pos = positionRef.current;
    const vel = velocityRef.current;

    // Gravitational force: F = G * M * m / r^2
    const r = pos.length();
    const forceMagnitude = (G * starMass) / (r * r);
    const force = pos.clone().normalize().multiplyScalar(-forceMagnitude);

    // Update velocity and position
    vel.add(force.multiplyScalar(dt));
    pos.add(vel.clone().multiplyScalar(dt));

    planetRef.current.position.copy(pos);

    // Calculate orbital parameters
    const speed = vel.length();
    const specificEnergy = calculateOrbitalEnergy(speed, r, starMass, G);
    const angularMomentum = calculateCurrentAngularMomentum(pos, vel);
    const eccentricity = calculateEccentricity(specificEnergy, angularMomentum, starMass, G);
    const escapeVel = calculateEscapeVelocity(starMass, r, G);
    const circularVel = calculateOrbitalVelocity(starMass, r, G);

    setOrbitalData({
      distance: r,
      speed,
      specificEnergy,
      isBound: specificEnergy < 0,
      eccentricity,
      semiMajorAxis: specificEnergy < 0 ? calculateSemiMajorAxis(specificEnergy, starMass, G) : 0,
      escapeVelocity: escapeVel,
      circularOrbitVelocity: circularVel,
    });

    // Update trail
    if (showTrail) {
      const idx = trailIndex.current % 500;
      trailPositions.current[idx * 3] = pos.x;
      trailPositions.current[idx * 3 + 1] = pos.y;
      trailPositions.current[idx * 3 + 2] = pos.z;
      trailIndex.current++;

      if (trailRef.current) {
        const attr = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
        attr.needsUpdate = true;
        trailRef.current.geometry.setDrawRange(0, Math.min(trailIndex.current, 500));
      }
    }

    // Planet 2 (if multi-planet mode)
    if (multiPlanet && planet2Ref.current) {
      const pos2 = planet2Pos;
      const vel2 = planet2Vel.clone();

      const r2 = pos2.length();
      const force2 = pos2.clone().normalize().multiplyScalar(-((G * starMass) / (r2 * r2)));

      vel2.add(force2.multiplyScalar(dt));
      pos2.add(vel2.multiplyScalar(dt));

      setPlanet2Pos(pos2.clone());
      setPlanet2Vel(vel2.clone());

      planet2Ref.current.position.copy(pos2);

      const idx2 = trail2Index.current % 500;
      trail2Positions.current[idx2 * 3] = pos2.x;
      trail2Positions.current[idx2 * 3 + 1] = pos2.y;
      trail2Positions.current[idx2 * 3 + 2] = pos2.z;
      trail2Index.current++;
    }
  });

  return (
    <>
      {/* Star */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.8} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Star glow */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.15} />
      </mesh>

      {/* Planet 1 */}
      <mesh ref={planetRef} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color="#4f8fff"
          metalness={0.6}
          roughness={0.4}
          emissive="#4f8fff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Planet 2 (multi-planet mode) */}
      {multiPlanet && (
        <>
          <mesh ref={planet2Ref} position={[planet2Pos.x, planet2Pos.y, planet2Pos.z]} castShadow>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial
              color="#ef4444"
              metalness={0.6}
              roughness={0.4}
              emissive="#ef4444"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Trail for planet 2 */}
          {showTrail && (
            <points geometry={trail2Geometry}>
              <pointsMaterial size={0.03} color="#ef4444" transparent opacity={0.6} sizeAttenuation />
            </points>
          )}
        </>
      )}

      {/* Trail */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeometry}>
          <pointsMaterial size={0.03} color="#4f8fff" transparent opacity={0.6} sizeAttenuation />
        </points>
      )}

      {/* Reference circles for circular orbits */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => [
          Math.cos((i / 64) * Math.PI * 2) * 3,
          0,
          Math.sin((i / 64) * Math.PI * 2) * 3,
        ])}
        color="#333"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
      <Line
        points={Array.from({ length: 65 }, (_, i) => [
          Math.cos((i / 64) * Math.PI * 2) * 5,
          0,
          Math.sin((i / 64) * Math.PI * 2) * 5,
        ])}
        color="#333"
        lineWidth={1}
        opacity={0.3}
        transparent
      />

      {/* Velocity vector */}
      <group position={[positionRef.current.x, positionRef.current.y, positionRef.current.z]}>
        <Line
          points={[
            [0, 0, 0],
            [
              (velocityRef.current.x / orbitalData.speed) * 0.8,
              (velocityRef.current.y / orbitalData.speed) * 0.8,
              (velocityRef.current.z / orbitalData.speed) * 0.8,
            ],
          ]}
          color="#06d6a0"
          lineWidth={2}
        />
        <mesh
          position={[
            (velocityRef.current.x / orbitalData.speed) * 0.8,
            (velocityRef.current.y / orbitalData.speed) * 0.8,
            (velocityRef.current.z / orbitalData.speed) * 0.8,
          ]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Grid */}
      <gridHelper args={[20, 40, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />

      {/* Orbit shape indicator */}
      {orbitalData.isBound && (
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry
            args={[
              Math.max(0.1, orbitalData.semiMajorAxis * (1 - orbitalData.eccentricity)),
              orbitalData.semiMajorAxis * (1 + orbitalData.eccentricity),
              64,
            ]}
          />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Data Display Panel */}
      {showData && (
        <DataDisplay
          title="Orbital Data"
          position={[5, 4, 0]}
          data={{
            distance: { value: orbitalData.distance, unit: "units", color: "#4f8fff", decimals: 2 },
            speed: { value: orbitalData.speed, unit: "units/s", color: "#06d6a0", decimals: 2 },
            eccentricity: { value: orbitalData.eccentricity, unit: "", color: "#f59e0b", decimals: 3 },
            energy: { value: orbitalData.specificEnergy, unit: "units²/s²", color: "#a855f7", decimals: 2 },
            escapeVel: { value: orbitalData.escapeVelocity, unit: "units/s", color: "#ef4444", decimals: 2 },
            circularVel: { value: orbitalData.circularOrbitVelocity, unit: "units/s", color: "#22c55e", decimals: 2 },
          }}
        />
      )}

      {/* Orbit type indicator */}
      {showData && (
        <group position={[5, -2, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial
              color={orbitalData.isBound ? "#0a0a1a" : "#ef4444"}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Indicator dot */}
          <mesh position={[-0.7, 0, 0.01]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={
                !orbitalData.isBound
                  ? "#ef4444"
                  : orbitalData.eccentricity < 0.1
                    ? "#22c55e"
                    : orbitalData.eccentricity < 0.5
                      ? "#f59e0b"
                      : "#a855f7"
              }
              emissive={
                !orbitalData.isBound
                  ? "#ef4444"
                  : orbitalData.eccentricity < 0.1
                    ? "#22c55e"
                    : orbitalData.eccentricity < 0.5
                      ? "#f59e0b"
                      : "#a855f7"
              }
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
    </>
  );
}
