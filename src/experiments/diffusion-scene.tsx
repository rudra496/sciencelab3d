'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DiffusionData {
  leftConcentration: number;
  rightConcentration: number;
  temperature: number;
  timeElapsed: number;
  equilibrium: number;
}

interface DiffusionSceneProps {
  onDataChange?: (data: DiffusionData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  temperature?: number;
  poreSize?: number;
  particleCount?: number;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  side: 'left' | 'right';
}

export default function DiffusionSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  temperature = 1,
  poreSize = 1,
  particleCount = 1,
}: DiffusionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics refs - updated every frame
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const timeElapsedRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<DiffusionData>({
    leftConcentration: 50,
    rightConcentration: 10,
    temperature: 298,
    timeElapsed: 0,
    equilibrium: 0,
  });

  // Initialize particles on reset
  useEffect(() => {
    const leftCount = Math.floor(50 * particleCount);
    const rightCount = Math.floor(10 * particleCount);
    const newParticles: Particle[] = [];

    // Left side - high concentration (red particles)
    for (let i = 0; i < leftCount; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5 - 2.5,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
        side: 'left',
      });
    }

    // Right side - low concentration (blue particles)
    for (let i = 0; i < rightCount; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5 + 2.5,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
        side: 'right',
      });
    }

    particlesRef.current = newParticles;
    timeElapsedRef.current = 0;
  }, [resetTrigger, particleCount]);

  // Concentration graph points
  const concentrationGraphPoints = useMemo(() => {
    const leftCount = particlesRef.current.filter((p) => p.position.x < 0).length;
    const rightCount = particlesRef.current.filter((p) => p.position.x >= 0).length;
    const total = leftCount + rightCount;
    const maxCount = Math.max(leftCount, rightCount, 1);

    const points: [number, number, number][] = [
      [-1, 0, 3],      // Left bar bottom
      [-1, (leftCount / maxCount) * 2, 3],  // Left bar top
      [1, (rightCount / maxCount) * 2, 3],  // Right bar top
      [1, 0, 3],       // Right bar bottom
    ];

    return points;
  }, [data]);

  // Diffusion direction arrows
  const diffusionArrows = useMemo(() => {
    const leftCount = particlesRef.current.filter((p) => p.position.x < 0).length;
    const rightCount = particlesRef.current.filter((p) => p.position.x >= 0).length;

    // Arrows point from high to low concentration
    const arrows: [number, number, number][] = [];
    if (leftCount > rightCount) {
      // Left to right
      for (let i = 0; i < 3; i++) {
        const y = -1 + i * 1;
        arrows.push([-0.5, y, 2.6]);
        arrows.push([0.5, y, 2.6]);
      }
    }
    return arrows;
  }, [data]);

  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    const particles = particlesRef.current;
    const tempMult = temperature * 2;
    const permChance = poreSize * 0.15;

    // Update particle physics with Brownian motion
    for (const p of particles) {
      // Add random thermal motion (Brownian motion)
      p.velocity.x += (Math.random() - 0.5) * 0.008 * tempMult;
      p.velocity.y += (Math.random() - 0.5) * 0.008 * tempMult;
      p.velocity.z += (Math.random() - 0.5) * 0.008 * tempMult;

      // Clamp velocity
      const maxSpeed = 0.06 * temperature;
      const currentSpeed = p.velocity.length();
      if (currentSpeed > maxSpeed) {
        p.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      p.position.add(
        new THREE.Vector3(
          p.velocity.x * simulationSpeed,
          p.velocity.y * simulationSpeed,
          p.velocity.z * simulationSpeed
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

      // Membrane interaction at x = 0
      const nearMembrane = Math.abs(p.position.x) < 0.3;

      if (nearMembrane && Math.random() > permChance) {
        // Bounce off membrane
        p.velocity.x *= -1;
        p.position.x = p.position.x > 0 ? 0.3 : -0.3;
      } else if (p.position.x < -5 || p.position.x > 5) {
        // Side walls
        p.velocity.x *= -1;
        p.position.x = Math.sign(p.position.x) * 5;
      }
    }

    timeElapsedRef.current += delta * simulationSpeed;
    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const leftCount = particles.filter((p) => p.position.x < 0).length;
      const rightCount = particles.filter((p) => p.position.x >= 0).length;
      const total = particles.length;
      const idealEquilibrium = total / 2;
      const equilibrium = 1 - Math.abs(leftCount - idealEquilibrium) / idealEquilibrium;

      const newData: DiffusionData = {
        leftConcentration: leftCount,
        rightConcentration: rightCount,
        temperature: 273 + temperature * 25,
        timeElapsed: timeElapsedRef.current,
        equilibrium: Math.round(equilibrium * 100),
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Particle positions for rendering
  const particlePositions = useMemo(() => {
    return particlesRef.current.map((p, i) => ({
      position: p.position.clone(),
      side: p.position.x < 0 ? 'left' : 'right',
    }));
  }, [data]);

  // Membrane lines
  const membraneLines = useMemo(() => {
    const lines: [number, number, number][] = [];
    // Vertical lines
    for (let i = -2; i <= 2; i++) {
      lines.push([0, i, -2.5]);
      lines.push([0, i, 2.5]);
    }
    return lines;
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      <group ref={groupRef}>
        {/* Left chamber - High Concentration */}
        <mesh position={[-2.5, 0, 0]}>
          <boxGeometry args={[5, 5, 5]} />
          <meshPhysicalMaterial
            color="#ef4444"
            transparent
            opacity={0.08}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right chamber - Low Concentration */}
        <mesh position={[2.5, 0, 0]}>
          <boxGeometry args={[5, 5, 5]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            transparent
            opacity={0.08}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Semi-permeable membrane */}
        <Line
          points={membraneLines}
          color="#f59e0b"
          lineWidth={2}
          opacity={0.6}
          transparent
        />

        {/* Membrane pores */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -2 + i * 1, 0]}>
            <sphereGeometry args={[0.05 + poreSize * 0.03, 8, 8]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}

        {/* Particles */}
        {particlePositions.map((p, i) => (
          <group key={i} position={p.position}>
            <mesh>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial
                color={p.side === 'left' ? '#ef4444' : '#3b82f6'}
                emissive={p.side === 'left' ? '#ef4444' : '#3b82f6'}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        ))}

        {/* Labels */}
        {/* High Concentration Label */}
        <group position={[-2.5, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 0.3, 0.05]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Low Concentration Label */}
        <group position={[2.5, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[1.6, 0.3, 0.05]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>

        {/* Diffusion Direction Arrows */}
        {diffusionArrows.map((point, i) => (
          <group key={i}>
            <Line
              points={[diffusionArrows[i * 2], diffusionArrows[i * 2 + 1]]}
              color="#22c55e"
              lineWidth={2}
            />
            <mesh position={diffusionArrows[i * 2 + 1]}>
              <coneGeometry args={[0.08, 0.15, 8]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Concentration Graph */}
        <group position={[0, -1, 3.5]}>
          {/* Graph background */}
          <mesh>
            <boxGeometry args={[3, 2.5, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* Bars */}
          <mesh position={[-0.8, 0, 0.06]}>
            <boxGeometry args={[0.6, (data.leftConcentration / 60) * 2, 0.05]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0.8, 0, 0.06]}>
            <boxGeometry args={[0.6, (data.rightConcentration / 60) * 2, 0.05]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.4}
            />
          </mesh>
          {/* Connecting line */}
          <Line
            points={concentrationGraphPoints}
            color="#22c55e"
            lineWidth={2}
          />
          {/* Labels */}
          <mesh position={[-0.8, -1.5, 0.1]}>
            <boxGeometry args={[0.4, 0.15, 0.02]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.8, -1.5, 0.1]}>
            <boxGeometry args={[0.4, 0.15, 0.02]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>

        {/* Equilibrium indicator */}
        <group position={[0, -3.5, 0]}>
          <mesh>
            <boxGeometry args={[4, 0.2, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[-2 + (data.equilibrium / 100) * 4, 0, 0.06]}>
            <boxGeometry args={[(data.equilibrium / 100) * 4, 0.15, 0.05]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3.5, 0]} />
    </>
  );
}
