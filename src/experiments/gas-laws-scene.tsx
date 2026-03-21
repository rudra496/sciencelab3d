"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export function GasLawsSceneComponent({ onDataChange, temperature = 300, volume = 4, numParticles = 100 }: GasLawsSceneProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const pistonRef = useRef<THREE.Mesh>(null);
  
  const particles = useMemo<Particle[]>(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      p.push({
        position: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
      });
    }
    return p;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [data, setData] = useState<GasData>({
    pressure: 0,
    avgSpeed: 0,
    avgKE: 0,
    rmsSpeed: 0,
  });

  const speedFactor = Math.sqrt(temperature / 300);
  const boxSize = volume * 2;

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const dt = Math.min(delta, 0.02) * speedFactor;

    let totalSpeed = 0;
    const particleCount = numParticles;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.position.add(p.velocity.clone().multiplyScalar(dt * 5));

      const half = boxSize / 2;
      if (p.position.x > half) { p.position.x = half; p.velocity.x *= -1; }
      if (p.position.x < -half) { p.position.x = -half; p.velocity.x *= -1; }
      if (p.position.y > half) { p.position.y = half; p.velocity.y *= -1; }
      if (p.position.y < -half) { p.position.y = -half; p.velocity.y *= -1; }
      if (p.position.z > half) { p.position.z = half; p.velocity.z *= -1; }
      if (p.position.z < -half) { p.position.z = -half; p.velocity.z *= -1; }

      totalSpeed += p.velocity.length();

      dummy.position.copy(p.position);
      dummy.scale.set(0.15, 0.15, 0.15);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;

    if (pistonRef.current) {
      pistonRef.current.position.y = boxSize / 2 + 0.3;
    }

    const moles = particleCount / 1000;
    const pressure = calculateGasPressure(moles, 8.314, temperature, volume);
    const avgKE = calculateGasAverageKE(temperature);
    const rmsSpeed = calculateGasRMS(temperature, 0.029);

    const newData: GasData = {
      pressure,
      avgSpeed: totalSpeed / particleCount,
      avgKE,
      rmsSpeed,
    };
    setData(newData);
    onDataChange?.(newData);
  });

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
          opacity={0.2}
          metalness={0.1}
          roughness={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Container Frame - realistic metal structure */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (boxSize / 2 + 0.2), 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, boxSize + 0.4, boxSize + 0.4]} />
            <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Corner posts */}
          {[[-1, 1].map((z) => (
            <mesh key={z} position={[0, 0, z * (boxSize / 2 + 0.2)]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, boxSize + 0.6, 8]} />
              <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.2} />
            </mesh>
          ))]}
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
      {/* Handle grip */}
      <mesh position={[0, boxSize / 2 + 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Handle ball */}
      <mesh position={[0, boxSize / 2 + 2.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gas Particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, 200]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.7}
        />
      </instancedMesh>

      {/* Pressure Gauge */}
      <group position={[boxSize / 2 + 3, 3, 0]}>
        {/* Gauge body */}
        <mesh castShadow>
          <cylinderGeometry args={[2, 2, 0.5, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gauge face */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.1, 32]} />
          <meshStandardMaterial color="#f5f5f5" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Markings */}
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (i / 8) * Math.PI;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.3, 0.35, Math.sin(angle) * 1.3]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.4, 0.08, 0.02]} />
              <meshBasicMaterial color="#666" />
            </mesh>
          );
        })}
        {/* Needle */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2 + Math.min((data.pressure / 10000) * Math.PI, Math.PI - 0.1)]}>
          <boxGeometry args={[1.4, 0.06, 0.03]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        {/* Center cap */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Thermometer */}
      <group position={[-boxSize / 2 - 3, 0, 0]}>
        {/* Thermometer body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, boxSize + 4, 16]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Temperature fill */}
        <mesh position={[0, (temperature / 800) * (boxSize / 2) - boxSize / 2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, (temperature / 800) * (boxSize + 3), 16]} />
          <meshStandardMaterial
            color={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissive={temperature > 500 ? "#ef4444" : temperature > 300 ? "#f59e0b" : "#3b82f6"}
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* Bulb */}
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
        {/* Scale markings */}
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

      {/* Base plate */}
      <mesh position={[0, -boxSize / 2 - 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[boxSize / 2 + 1, boxSize / 2 + 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

export default GasLawsSceneComponent;
