"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function ProjectileMotionScene() {
  const projectileRef = useRef<THREE.Mesh>(null);
  const trailPointsRef = useRef<THREE.Points>(null);

  const { velocity, angle, gravity } = useControls("Projectile", {
    velocity: { value: 15, min: 1, max: 30, step: 0.5, label: "Velocity (m/s)" },
    angle: { value: 45, min: 5, max: 85, step: 1, label: "Angle (°)" },
    gravity: { value: 9.81, min: 1, max: 20, step: 0.1, label: "Gravity (m/s²)" },
    launch: button(() => launch()),
    clear: button(() => clearTrails()),
  });

  const timeRef = useRef(0);
  const launchedRef = useRef(false);
  const currentTrailRef = useRef<Float32Array>(new Float32Array(500 * 3));
  const trailIndexRef = useRef(0);

  const angleRad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(angleRad);
  const vy = velocity * Math.sin(angleRad);

  // Predicted trajectory points
  const predictedPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const totalTime = (2 * vy) / gravity;
    for (let t = 0; t <= totalTime; t += totalTime / 100) {
      points.push([vx * t, vy * t - 0.5 * gravity * t * t, 0]);
    }
    return points;
  }, [vx, vy, gravity]);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(currentTrailRef.current, 3)
    );
    return geo;
  }, []);

  const launch = useCallback(() => {
    timeRef.current = 0;
    launchedRef.current = true;
    currentTrailRef.current = new Float32Array(500 * 3);
    trailIndexRef.current = 0;
    if (trailPointsRef.current) {
      const attr = trailPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      attr.array = currentTrailRef.current;
      attr.needsUpdate = true;
    }
  }, []);

  const clearTrails = useCallback(() => {
    currentTrailRef.current = new Float32Array(500 * 3);
    trailIndexRef.current = 0;
    launchedRef.current = false;
    timeRef.current = 0;
    if (projectileRef.current) {
      projectileRef.current.position.set(0, 0, 0);
    }
  }, []);

  useFrame((_, delta) => {
    if (!projectileRef.current) return;
    const dt = Math.min(delta, 0.02);

    if (launchedRef.current) {
      timeRef.current += dt;
      const t = timeRef.current;
      const x = vx * t;
      const y = vy * t - 0.5 * gravity * t * t;

      projectileRef.current.position.set(x, Math.max(0, y), 0);

      const idx = trailIndexRef.current;
      if (idx < 500) {
        currentTrailRef.current[idx * 3] = x;
        currentTrailRef.current[idx * 3 + 1] = Math.max(0, y);
        currentTrailRef.current[idx * 3 + 2] = 0;
        trailIndexRef.current++;

        if (trailPointsRef.current) {
          const attr = trailPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
          attr.needsUpdate = true;
          trailPointsRef.current.geometry.setDrawRange(0, trailIndexRef.current);
        }
      }

      if (y < 0 && t > 0.1) {
        launchedRef.current = false;
      }
    } else {
      projectileRef.current.position.set(0, 0, 0);
    }
  });

  const totalTime = (2 * vy) / gravity;
  const maxRange = vx * totalTime;
  const maxHeight = (vy * vy) / (2 * gravity);

  return (
    <>
      {/* Launcher */}
      <group position={[-8, 0, 0]} rotation={[0, 0, angleRad]}>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <mesh position={[-8, -0.15, 0]}>
        <boxGeometry args={[1, 0.3, 0.3]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Projectile */}
      <mesh ref={projectileRef} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.4} />
      </mesh>

      {/* Predicted trajectory */}
      <Line
        points={predictedPoints}
        color="#ffffff"
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.2}
        opacity={0.2}
        transparent
      />

      {/* Trail */}
      <points ref={trailPointsRef} geometry={trailGeometry}>
        <pointsMaterial size={0.06} color="#ff6b35" transparent opacity={0.6} sizeAttenuation />
      </points>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>
      <gridHelper args={[40, 80, "#1a1a3e", "#111128"]} />

      {/* Distance scale */}
      {Array.from({ length: Math.ceil(maxRange / 5) + 1 }).map((_, i) => (
        <group key={i} position={[-8 + i * 5, 0.01, -2]}>
          <mesh>
            <boxGeometry args={[0.02, 0.3, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* Height scale */}
      {Array.from({ length: Math.ceil(maxHeight / 2) + 1 }).map((_, i) => (
        <group key={i} position={[-9, i * 2, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}
    </>
  );
}
