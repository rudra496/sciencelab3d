"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { calculateGasPressure, calculateGasAverageKE, calculateGasRMS } from "@/utils/physics";

interface GasLawsSceneProps {
  onDataChange?: (data: GasData) => void;
  temperature?: number;
  volume?: number;
  numParticles?: number;
}

export interface GasData {
  pressure: number;
  avgSpeed: number;
  avgKE: number;
  rmsSpeed: number;
  pvValue: number;
  nrtValue: number;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export function GasLawsSceneComponent({
  onDataChange,
  temperature = 300,
  volume = 4,
  numParticles = 100
}: GasLawsSceneProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const pistonRef = useRef<THREE.Mesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    particles: [] as Particle[],
    frameCount: 0,
    totalSpeed: 0,
    pressure: 0,
    avgSpeed: 0,
    avgKE: 0,
    rmsSpeed: 0
  });

  // Initialize particles in ref
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
      });
    }
    physicsRef.current.particles = particles;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [data, setData] = useState<GasData>({
    pressure: 0,
    avgSpeed: 0,
    avgKE: 0,
    rmsSpeed: 0,
    pvValue: 0,
    nrtValue: 0,
  });

  const speedFactor = Math.sqrt(temperature / 300);
  const boxSize = volume * 2;

  // Speed to color mapping (blue=slow -> red=fast)
  const getSpeedColor = (speed: number, maxSpeed: number) => {
    const t = Math.min(speed / (maxSpeed * 1.5), 1);
    return new THREE.Color().lerpColors(
      new THREE.Color(0.2, 0.4, 1), // Blue (slow)
      new THREE.Color(1, 0.3, 0.2), // Red (fast)
      t
    );
  };

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const dt = Math.min(delta, 0.02) * speedFactor;
    const physics = physicsRef.current;

    let totalSpeed = 0;
    let maxSpeed = 0;
    const particleCount = numParticles;

    // Pre-calculate max expected speed for color scaling
    const expectedMaxSpeed = 3 * speedFactor;

    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const p = physics.particles[i];
      p.position.add(p.velocity.clone().multiplyScalar(dt * 5));

      const half = boxSize / 2;
      if (p.position.x > half) { p.position.x = half; p.velocity.x *= -1; }
      if (p.position.x < -half) { p.position.x = -half; p.velocity.x *= -1; }
      if (p.position.y > half) { p.position.y = half; p.velocity.y *= -1; }
      if (p.position.y < -half) { p.position.y = -half; p.velocity.y *= -1; }
      if (p.position.z > half) { p.position.z = half; p.velocity.z *= -1; }
      if (p.position.z < -half) { p.position.z = -half; p.velocity.z *= -1; }

      const speed = p.velocity.length();
      totalSpeed += speed;
      maxSpeed = Math.max(maxSpeed, speed);

      dummy.position.copy(p.position);
      dummy.scale.set(0.15, 0.15, 0.15);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);

      // Set particle color based on speed
      const color = getSpeedColor(speed, expectedMaxSpeed);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Hide unused particles
    for (let i = particleCount; i < 200; i++) {
      dummy.position.set(0, -100, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }

    particlesRef.current.instanceMatrix.needsUpdate = true;

    // Update vertex colors
    const colorAttr = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }

    if (pistonRef.current) {
      pistonRef.current.position.y = boxSize / 2 + 0.3;
    }

    // Calculate physics values
    const moles = particleCount / 1000;
    const pressure = calculateGasPressure(moles, 8.314, temperature, volume);
    const avgKE = calculateGasAverageKE(temperature);
    const rmsSpeed = calculateGasRMS(temperature, 0.029);
    const avgSpeed = totalSpeed / particleCount;

    physics.totalSpeed = totalSpeed;
    physics.pressure = pressure;
    physics.avgSpeed = avgSpeed;
    physics.avgKE = avgKE;
    physics.rmsSpeed = rmsSpeed;

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const newData: GasData = {
        pressure,
        avgSpeed,
        avgKE,
        rmsSpeed,
        pvValue: pressure * volume,
        nrtValue: moles * 8.314 * temperature,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  // PV=nRT curve visualization points
  const curvePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const R = 8.314;
    const n = numParticles / 1000;
    for (let v = 1; v <= 10; v += 0.5) {
      const p = (n * R * temperature) / v;
      points.push(new THREE.Vector3(v * 0.3 - 1.5, (p / 5000) * 2 - 1, 0));
    }
    return points;
  }, [temperature, numParticles]);

  // Current operating point on curve
  const currentPoint = useMemo(() => {
    const R = 8.314;
    const n = numParticles / 1000;
    const p = (n * R * temperature) / volume;
    return new THREE.Vector3(volume * 0.3 - 1.5, (p / 5000) * 2 - 1, 0);
  }, [temperature, volume, numParticles]);

  return (
    <group>
      {/* Large floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -boxSize / 2 - 0.3, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.95} />
      </mesh>
      <gridHelper args={[50, 50, "#1a1a3e", "#0a0a1e"]} position={[0, -boxSize / 2 - 0.29, 0]} />

      {/* Glass Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[boxSize + 0.4, boxSize + 0.4, boxSize + 0.4]} />
        <meshStandardMaterial
          color="#4a90d9"
          transparent
          opacity={0.15}
          metalness={0.1}
          roughness={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Container Frame */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (boxSize / 2 + 0.2), 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, boxSize + 0.4, boxSize + 0.4]} />
            <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={`z${side}`} position={[0, 0, side * (boxSize / 2 + 0.2)]}>
          <mesh castShadow>
            <boxGeometry args={[boxSize + 0.4, boxSize + 0.4, 0.4]} />
            <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Piston */}
      <mesh ref={pistonRef} position={[0, boxSize / 2 + 0.2, 0]} castShadow>
        <boxGeometry args={[boxSize - 0.2, 0.5, boxSize - 0.2]} />
        <meshStandardMaterial
          color="#5a6a7a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Piston rings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, boxSize / 2 + 0.5 + i * 0.1, 0]} castShadow>
          <torusGeometry args={[boxSize / 2 - 0.1, 0.02, 8, 32]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Piston Handle */}
      <mesh position={[0, boxSize / 2 + 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, boxSize / 2 + 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, boxSize / 2 + 2.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gas Particles with vertex colors for speed-based coloring */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, 200]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          vertexColors
          metalness={0.3}
          roughness={0.7}
        />
      </instancedMesh>

      {/* Pressure Gauge */}
      <group position={[boxSize / 2 + 3, 3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2, 2, 0.5, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.1, 32]} />
          <meshStandardMaterial color="#f5f5f5" metalness={0.1} roughness={0.5} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (i / 8) * Math.PI;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.3, 0.35, Math.sin(angle) * 1.3]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.4, 0.08, 0.02]} />
              <meshBasicMaterial color="#666" />
            </mesh>
          );
        })}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2 + Math.min((data.pressure / 10000) * Math.PI, Math.PI - 0.1)]}>
          <boxGeometry args={[1.4, 0.06, 0.03]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Thermometer */}
      <group position={[-boxSize / 2 - 3, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, boxSize + 4, 16]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, (temperature / 800) * (boxSize / 2) - boxSize / 2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, (temperature / 800) * (boxSize + 3), 16]} />
          <meshStandardMaterial
            color={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissive={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, -boxSize / 2 - 0.6, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissive={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissiveIntensity={0.6}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const temp = 100 + i * 120;
          const y = ((temp / 800) * (boxSize / 2)) - boxSize / 2;
          return (
            <mesh key={i} position={[0.3, y, 0]}>
              <boxGeometry args={[0.3, 0.08, 0.08]} />
              <meshBasicMaterial color="#666" />
            </mesh>
          );
        })}
      </group>

      {/* PV=nRT Graph */}
      <group position={[0, -boxSize / 2 - 2, boxSize / 2 + 2]}>
        {/* Graph background */}
        <mesh position={[0, 1, 0]}>
          <planeGeometry args={[4, 2.5]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>
        {/* Axes */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[3.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-1.8, 0, 0.01]}>
          <boxGeometry args={[0.02, 2, 0.02]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        {/* PV curve */}
        <Line points={curvePoints} color="#06d6a0" lineWidth={2} />
        {/* Current operating point */}
        <mesh position={[currentPoint.x, currentPoint.y, 0.02]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
        </mesh>
        {/* Labels */}
        <mesh position={[1.5, -0.3, 0.01]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>
      </group>

      {/* Base plate */}
      <mesh position={[0, -boxSize / 2 - 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[boxSize / 2 + 1, boxSize / 2 + 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

export default GasLawsSceneComponent;
