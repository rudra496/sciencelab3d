'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DiffusionData {
  leftConcentration: number;
  rightConcentration: number;
  temperature: number;
  timeElapsed: number;
  equilibrium: number;
  gradientIndex: number;
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

// Safe clamp helper - ensures no negative or zero values for geometry
const safeGeom = (value: number, min: number = 0.001): number => Math.max(min, Math.abs(value));

const MAX_PARTICLES = 400;
const DUMMY = new THREE.Object3D();

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
  const particlesMeshRef = useRef<THREE.InstancedMesh>(null);

  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const timeElapsedRef = useRef(0);
  const colorsRef = useRef<Float32Array | null>(null);
  const colorAttributeRef = useRef<THREE.BufferAttribute | null>(null);

  const [data, setData] = useState<DiffusionData>({
    leftConcentration: 60,
    rightConcentration: 15,
    temperature: 298,
    timeElapsed: 0,
    equilibrium: 0,
    gradientIndex: 100,
  });

  // Initialize particles on reset
  useEffect(() => {
    const leftCount = Math.min(Math.floor(70 * particleCount), MAX_PARTICLES * 0.7);
    const rightCount = Math.min(Math.floor(20 * particleCount), MAX_PARTICLES * 0.3);
    const newParticles: Particle[] = [];

    const colors = new Float32Array(MAX_PARTICLES * 3);
    colorsRef.current = colors;

    // Left side particles (red - high concentration)
    for (let i = 0; i < leftCount; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4 - 2,
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

    // Right side particles (blue - low concentration)
    for (let i = 0; i < rightCount; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4 + 2,
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

  const updateParticleColors = useCallback(() => {
    if (!particlesMeshRef.current || !colorsRef.current) return;

    const particles = particlesRef.current;
    const colors = colorsRef.current;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const particle = particles[i];
      if (!particle) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0;
        continue;
      }

      const normalizedX = safeGeom((particle.position.x + 5) / 10);

      const redIntensity = Math.max(0, 1 - normalizedX * 1.5);
      const blueIntensity = Math.max(0, normalizedX * 1.5 - 0.5);
      const tempBoost = Math.max(0, (temperature - 1) * 0.3);

      colors[i * 3] = Math.min(1, redIntensity * 0.9 + tempBoost);
      colors[i * 3 + 1] = Math.min(1, tempBoost * 0.5 + 0.1);
      colors[i * 3 + 2] = Math.min(1, blueIntensity * 0.9);
    }

    // Reuse existing color attribute instead of creating new one
    let colorAttr = colorAttributeRef.current;
    if (!colorAttr) {
      colorAttr = new THREE.BufferAttribute(colors, 3);
      colorAttributeRef.current = colorAttr;
      particlesMeshRef.current.geometry.setAttribute('color', colorAttr);
    } else {
      colorAttr.needsUpdate = true;
    }
  }, [temperature]);

  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    const particles = particlesRef.current;
    const tempMult = Math.max(0.1, temperature * 2.5);
    const permChance = Math.min(0.9, Math.max(0.01, poreSize * 0.2));

    for (const p of particles) {
      p.velocity.x += (Math.random() - 0.5) * 0.01 * tempMult;
      p.velocity.y += (Math.random() - 0.5) * 0.01 * tempMult;
      p.velocity.z += (Math.random() - 0.5) * 0.01 * tempMult;

      const maxSpeed = Math.max(0.01, 0.08 * temperature);
      const currentSpeed = p.velocity.length();
      if (currentSpeed > maxSpeed) {
        p.velocity.normalize().multiplyScalar(maxSpeed);
      }

      p.position.add(
        new THREE.Vector3(
          p.velocity.x * simulationSpeed,
          p.velocity.y * simulationSpeed,
          p.velocity.z * simulationSpeed
        )
      );

      if (Math.abs(p.position.y) > 2.5) {
        p.velocity.y *= -1;
        p.position.y = Math.sign(p.position.y) * 2.5;
      }
      if (Math.abs(p.position.z) > 2.5) {
        p.velocity.z *= -1;
        p.position.z = Math.sign(p.position.z) * 2.5;
      }

      const nearMembrane = Math.abs(p.position.x) < 0.3;

      if (nearMembrane) {
        if (Math.random() > permChance) {
          p.velocity.x *= -1;
          p.position.x = p.position.x > 0 ? 0.3 : -0.3;
        }
      } else if (p.position.x < -5 || p.position.x > 5) {
        p.velocity.x *= -1;
        p.position.x = Math.sign(p.position.x) * 5;
      }
    }

    timeElapsedRef.current += delta * simulationSpeed;
    frameCountRef.current++;

    if (particlesMeshRef.current) {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const particle = particles[i];
        if (particle) {
          DUMMY.position.copy(particle.position);
          const scale = Math.max(0.01, 0.08 + (temperature - 1) * 0.02);
          DUMMY.scale.set(scale, scale, scale);
          DUMMY.updateMatrix();
          particlesMeshRef.current.setMatrixAt(i, DUMMY.matrix);
        } else {
          DUMMY.position.set(0, -100, 0);
          DUMMY.scale.set(0.001, 0.001, 0.001);
          DUMMY.updateMatrix();
          particlesMeshRef.current.setMatrixAt(i, DUMMY.matrix);
        }
      }
      particlesMeshRef.current.instanceMatrix.needsUpdate = true;
      updateParticleColors();
    }

    if (frameCountRef.current % 8 === 0) {
      const leftCount = particles.filter((p) => p.position.x < 0).length;
      const rightCount = particles.filter((p) => p.position.x >= 0).length;
      const total = particles.length;
      const idealEquilibrium = total / 2;
      const equilibrium = Math.max(0, 1 - Math.abs(leftCount - idealEquilibrium) / idealEquilibrium);

      const gradientIndex = Math.round(
        100 * Math.max(0, 1 - Math.abs(leftCount - rightCount) / Math.max(leftCount + rightCount, 1))
      );

      const newData: DiffusionData = {
        leftConcentration: leftCount,
        rightConcentration: rightCount,
        temperature: Math.round(273 + temperature * 25),
        timeElapsed: timeElapsedRef.current,
        equilibrium: Math.round(equilibrium * 100),
        gradientIndex,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  const concentrationGraphPoints = useMemo(() => {
    const leftCount = data.leftConcentration;
    const rightCount = data.rightConcentration;
    // Add extra safety to prevent zero or negative values
    const maxCount = Math.max(leftCount, rightCount, 10);
    const leftH = safeGeom(Math.max(0.1, (leftCount / maxCount) * 2));
    const rightH = safeGeom(Math.max(0.1, (rightCount / maxCount) * 2));

    return [
      [-1, -1.2, 3] as [number, number, number],
      [-1, -1.2 + leftH, 3] as [number, number, number],
      [1, -1.2 + rightH, 3] as [number, number, number],
      [1, -1.2, 3] as [number, number, number],
    ];
  }, [data]);

  const diffusionArrows = useMemo(() => {
    const leftCount = data.leftConcentration;
    const rightCount = data.rightConcentration;
    const arrows: [number, number, number][] = [];

    if (Math.abs(leftCount - rightCount) > 5) {
      const direction = leftCount > rightCount ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        const y = -1 + i * 0.8;
        arrows.push([direction * -0.6, y, 2.6]);
        arrows.push([direction * 0.6, y, 2.6]);
      }
    }
    return arrows;
  }, [data]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#6366f1" />

      <group ref={groupRef}>
        {/* Left chamber */}
        <mesh position={[-2.5, 0, 0]}>
          <boxGeometry args={[safeGeom(5), safeGeom(5), safeGeom(5)]} />
          <meshPhysicalMaterial
            color="#ef4444"
            transparent
            opacity={0.06}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right chamber */}
        <mesh position={[2.5, 0, 0]}>
          <boxGeometry args={[safeGeom(5), safeGeom(5), safeGeom(5)]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            transparent
            opacity={0.06}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Semi-permeable membrane */}
        <group position={[0, 0, 0]}>
          <mesh>
            <planeGeometry args={[safeGeom(0.15), safeGeom(5), 8, 16]} />
            <meshStandardMaterial
              color="#f59e0b"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[safeGeom(0.1), safeGeom(5.2), safeGeom(5.2)]} />
            <meshStandardMaterial
              color="#d97706"
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>

          {/* Membrane pores - safely sized */}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = -2 + (i * 4) / 7;
            const poreRadius = safeGeom(poreSize * 0.08, 0.03);
            return (
              <group key={i} position={[0.06, y, 0]}>
                <mesh>
                  <circleGeometry args={[poreRadius, 16]} />
                  <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.6}
                  />
                </mesh>
                <mesh>
                  <ringGeometry args={[poreRadius, safeGeom(poreRadius + 0.015), 16]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#f59e0b"
                    emissiveIntensity={0.4}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Particles using instanced mesh */}
        <instancedMesh ref={particlesMeshRef} args={[undefined, undefined, MAX_PARTICLES]}>
          <sphereGeometry args={[safeGeom(1), 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            vertexColors
            transparent
            opacity={0.85}
            metalness={0.1}
            roughness={0.2}
          />
        </instancedMesh>

        {/* Labels */}
        <group position={[-2.5, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[safeGeom(1.8), safeGeom(0.3), safeGeom(0.05)]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        <group position={[2.5, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[safeGeom(1.6), safeGeom(0.3), safeGeom(0.05)]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>

        {/* Diffusion arrows - iterate over pairs, not individual points */}
        {Array.from({ length: diffusionArrows.length / 2 }).map((_, i) => (
          <group key={`arrow-${i}`}>
            <Line
              points={[diffusionArrows[i * 2], diffusionArrows[i * 2 + 1]]}
              color="#22c55e"
              lineWidth={2}
            />
            <mesh position={diffusionArrows[i * 2 + 1]}>
              <coneGeometry args={[safeGeom(0.08), safeGeom(0.15), 8]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Concentration graph */}
        <group position={[0, -1, 3.5]}>
          <mesh>
            <boxGeometry args={[safeGeom(3), safeGeom(2.5), safeGeom(0.1)]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[-0.8, 0, 0.06]}>
            <boxGeometry args={[safeGeom(0.6), safeGeom((data.leftConcentration / 100) * 2, 0.01), safeGeom(0.05)]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0.8, 0, 0.06]}>
            <boxGeometry args={[safeGeom(0.6), safeGeom((data.rightConcentration / 100) * 2, 0.01), safeGeom(0.05)]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.4}
            />
          </mesh>
          <Line
            points={concentrationGraphPoints}
            color="#22c55e"
            lineWidth={2}
          />
          <mesh position={[-0.8, -1.5, 0.1]}>
            <boxGeometry args={[safeGeom(0.4), safeGeom(0.15), safeGeom(0.02)]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.8, -1.5, 0.1]}>
            <boxGeometry args={[safeGeom(0.4), safeGeom(0.15), safeGeom(0.02)]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>

        {/* Equilibrium indicator */}
        <group position={[0, -3.5, 0]}>
          <mesh>
            <boxGeometry args={[safeGeom(5), safeGeom(0.25), safeGeom(0.1)]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[-2 + (data.equilibrium / 100) * 4, 0, 0.06]}>
            <boxGeometry args={[safeGeom((data.equilibrium / 100) * 4, 0.01), safeGeom(0.18), safeGeom(0.05)]} />
            <meshStandardMaterial
              color={data.equilibrium >= 95 ? '#4ade80' : data.equilibrium >= 80 ? '#facc15' : '#fb923c'}
              emissive={data.equilibrium >= 95 ? '#4ade80' : data.equilibrium >= 80 ? '#facc15' : '#fb923c'}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[-2, 0.2, 0]}>
            <sphereGeometry args={[safeGeom(0.05), 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[safeGeom(0.05), 8, 8]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <mesh position={[2, 0.2, 0]}>
            <sphereGeometry args={[safeGeom(0.05), 8, 8]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>

        {/* Temperature visualization */}
        <group position={[-4, 2, 0]}>
          <mesh>
            <boxGeometry args={[safeGeom(0.8), safeGeom(0.8), safeGeom(0.1)]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[0, (temperature - 1) * 0.3, 0.06]}>
            <boxGeometry args={[safeGeom(0.6), safeGeom(temperature * 0.5, 0.01), safeGeom(0.05)]} />
            <meshStandardMaterial
              color={temperature > 2 ? '#ef4444' : temperature > 1.3 ? '#f59e0b' : '#3b82f6'}
              emissive={temperature > 2 ? '#ef4444' : temperature > 1.3 ? '#f59e0b' : '#3b82f6'}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* Equilibrium status */}
        {data.equilibrium >= 95 && (
          <group position={[0, 2, 0]}>
            <mesh>
              <planeGeometry args={[safeGeom(3), safeGeom(0.5)]} />
              <meshStandardMaterial
                color="#0a0a1a"
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[safeGeom(0.08), 16, 16]} />
              <meshBasicMaterial color="#4ade80" />
            </mesh>
          </group>
        )}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3.5, 0]} />
    </>
  );
}
