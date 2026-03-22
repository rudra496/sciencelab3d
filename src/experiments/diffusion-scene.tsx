'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DiffusionData {
  highConcentration: number;
  lowConcentration: number;
  equilibrium: number;
  averageSpeed: number;
}

interface DiffusionSceneProps {
  onDataChange?: (data: DiffusionData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  temperature?: number;
  permeability?: number;
  concentration?: number;
  speed?: number;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

/**
 * Diffusion scene component - Performance optimized
 * Visualizes particle diffusion through a semi-permeable membrane
 */
export default function DiffusionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  temperature = 1,
  permeability = 1,
  concentration = 1,
  speed = 1,
}: DiffusionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<DiffusionData>({
    highConcentration: 40,
    lowConcentration: 0,
    equilibrium: 0,
    averageSpeed: 0,
  });

  // Initialize particles on reset or concentration change
  useEffect(() => {
    const particleCount = Math.floor(40 * concentration);
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5 - 3,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
      });
    }

    particlesRef.current = newParticles;
  }, [resetTrigger, concentration]);

  // Throttled data updates (every 8 frames)
  useFrame(() => {
    if (!groupRef.current || !isPlaying) return;

    const particles = particlesRef.current;
    const tempMult = temperature * 2;
    const permChance = permeability * 0.1;

    // Update particle physics
    for (const p of particles) {
      // Add random thermal motion (Brownian motion)
      p.velocity.x += (Math.random() - 0.5) * 0.005 * tempMult;
      p.velocity.y += (Math.random() - 0.5) * 0.005 * tempMult;
      p.velocity.z += (Math.random() - 0.5) * 0.005 * tempMult;

      // Clamp velocity
      const maxSpeed = 0.05 * temperature * speed;
      const currentSpeed = p.velocity.length();
      if (currentSpeed > maxSpeed) {
        p.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      p.position.add(
        new THREE.Vector3(
          p.velocity.x * simulationSpeed * speed,
          p.velocity.y * simulationSpeed * speed,
          p.velocity.z * simulationSpeed * speed
        )
      );

      // Boundary collisions (top/bottom, front/back)
      if (Math.abs(p.position.y) > 2.5) {
        p.velocity.y *= -1;
        p.position.y = Math.sign(p.position.y) * 2.5;
      }
      if (Math.abs(p.position.z) > 2.5) {
        p.velocity.z *= -1;
        p.position.z = Math.sign(p.position.z) * 2.5;
      }

      // Membrane interaction
      const membraneX = 0;
      const nearMembrane = Math.abs(p.position.x - membraneX) < 0.3;

      if (nearMembrane && Math.random() > permChance) {
        // Bounce off membrane
        p.velocity.x *= -1;
        p.position.x = p.position.x > 0 ? 0.3 : -0.3;
      } else if (p.position.x < -6 || p.position.x > 6) {
        // Side walls
        p.velocity.x *= -1;
        p.position.x = Math.sign(p.position.x) * 6;
      }
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const leftCount = particles.filter((p) => p.position.x < 0).length;
      const rightCount = particles.filter((p) => p.position.x >= 0).length;
      const total = particles.length;
      const equilibrium = Math.abs(leftCount - rightCount) / total;

      // Calculate average speed
      let totalSpeed = 0;
      for (const p of particles) {
        totalSpeed += p.velocity.length();
      }
      const avgSpeed = totalSpeed / particles.length;

      const newData: DiffusionData = {
        highConcentration: leftCount,
        lowConcentration: rightCount,
        equilibrium: Math.round((1 - equilibrium) * 100),
        averageSpeed: avgSpeed * 1000,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Membrane lines using Line from drei
  const membraneLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    for (let i = -2; i <= 2; i++) {
      lines.push([0, i, -2.5]);
      lines.push([0, i, 2.5]);
    }
    return lines;
  }, []);

  // Particle positions for rendering
  const particlePositions = useMemo(() => {
    return particlesRef.current.map((p, i) => ({
      position: p.position,
      side: p.position.x < 0 ? 'left' : 'right',
    }));
  }, [data]); // Re-compute when data updates

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      <group ref={groupRef}>
        {/* Left chamber */}
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[6, 5, 5]} />
          <meshPhysicalMaterial
            color="#6366f1"
            transparent
            opacity={0.05}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right chamber */}
        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[6, 5, 5]} />
          <meshPhysicalMaterial
            color="#a855f7"
            transparent
            opacity={0.05}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Semi-permeable membrane using Line from drei */}
        <Line
          points={membraneLines}
          color="#f59e0b"
          lineWidth={2}
          opacity={0.6}
          transparent
        />

        {/* Membrane spheres */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -2 + i * 1, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Particles */}
        {particlePositions.map((p, i) => (
          <group key={i} position={p.position}>
            <mesh>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color={p.side === 'left' ? '#6366f1' : '#a855f7'}
                emissive={p.side === 'left' ? '#6366f1' : '#a855f7'}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
