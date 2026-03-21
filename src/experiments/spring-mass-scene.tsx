"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  calculateSpringPeriod,
  calculateSpringAngularFrequency,
  calculateSpringPE,
  calculateKineticEnergy,
} from "@/utils/physics";

interface SpringMassSceneProps {
  onDataChange?: (data: SpringData) => void;
  mass?: number;
  stiffness?: number;
  damping?: number;
  initialDisplacement?: number;
  showEnergyBar?: boolean;
  resetTrigger?: number;
}

export interface SpringData {
  period: number;
  frequency: number;
  angularFrequency: number;
  displacement: number;
  velocity: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
}

/**
 * World-class Spring-Mass System
 */
export function SpringMassSceneComponent({
  onDataChange,
  mass = 2,
  stiffness = 50,
  damping = 0.3,
  initialDisplacement = 2,
  showEnergyBar = true,
  resetTrigger,
}: SpringMassSceneProps) {
  const massRef = useRef<THREE.Mesh>(null);
  const springRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const positionRef = useRef(initialDisplacement);
  const velocityRef = useRef(0);
  const trailPositions = useMemo(() => new Float32Array(400 * 3), []);
  const trailColors = useMemo(() => new Float32Array(400 * 3), []);
  const trailIndex = useRef(0);

  const [data, setData] = useState<SpringData>({
    period: calculateSpringPeriod(mass, stiffness),
    frequency: 1 / calculateSpringPeriod(mass, stiffness),
    angularFrequency: calculateSpringAngularFrequency(mass, stiffness),
    displacement: initialDisplacement,
    velocity: 0,
    kineticEnergy: 0,
    potentialEnergy: calculateSpringPE(stiffness, initialDisplacement),
    totalEnergy: calculateSpringPE(stiffness, initialDisplacement),
  });

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      positionRef.current = initialDisplacement;
      velocityRef.current = 0;
      trailIndex.current = 0;
    }
  }, [resetTrigger, initialDisplacement]);

  // Helical spring geometry
  const springGeometry = useMemo(() => {
    const coils = 16;
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: coils * 20 + 1 }, (_, i) => {
        const t = i / (coils * 20);
        const angle = t * coils * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, t * 3);
      })
    );
    return new THREE.TubeGeometry(curve, coils * 20, 0.08, 8, false);
  }, []);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!massRef.current || !springRef.current) return;
    const dt = Math.min(delta, 0.016);

    const x = positionRef.current;
    const v = velocityRef.current;

    // Spring-mass ODE: ma = -kx - cv
    const a = (-stiffness * x - damping * v) / mass;
    velocityRef.current = v + a * dt;
    positionRef.current = x + velocityRef.current * dt;

    const currentX = positionRef.current;
    const currentV = velocityRef.current;

    massRef.current.position.x = 3 + currentX;

    // Update spring
    const restLength = 3;
    const currentLength = restLength + currentX;
    springRef.current.scale.x = currentLength / restLength;
    springRef.current.position.x = (3 - restLength) / 2 + currentX / 2;

    // Calculate energies
    const ke = calculateKineticEnergy(mass, currentV);
    const pe = calculateSpringPE(stiffness, currentX);
    const totalE = ke + pe;

    setData({
      period: calculateSpringPeriod(mass, stiffness),
      frequency: 1 / calculateSpringPeriod(mass, stiffness),
      angularFrequency: calculateSpringAngularFrequency(mass, stiffness),
      displacement: currentX,
      velocity: currentV,
      kineticEnergy: ke,
      potentialEnergy: pe,
      totalEnergy: totalE,
    });

    onDataChange?.(data);

    // Update trail
    const idx = trailIndex.current % 400;
    trailPositions[idx * 3] = massRef.current.position.x;
    trailPositions[idx * 3 + 1] = massRef.current.position.y;
    trailPositions[idx * 3 + 2] = massRef.current.position.z;

    const speed = Math.abs(currentV);
    const t = Math.min(speed / 3, 1);
    trailColors[idx * 3] = 0.2 + t * 0.8;
    trailColors[idx * 3 + 1] = 0.5 - t * 0.3;
    trailColors[idx * 3 + 2] = 1 - t * 0.8;
    trailIndex.current++;

    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colors = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      trailRef.current.geometry.setDrawRange(0, Math.min(trailIndex.current, 400));
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -1.5, 0]} receiveShadow>
        <planeGeometry args={[25, 15]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.95} />
      </mesh>
      <gridHelper args={[25, 50, "#1a1a3e", "#0a0a1e"]} position={[3, -1.49, 0]} />

      {/* Wall/support */}
      <mesh position={[-0.8, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Spring */}
      <mesh ref={springRef} geometry={springGeometry} position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Mass block */}
      <mesh ref={massRef} position={[3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#4f8fff"
          metalness={0.7}
          roughness={0.2}
          emissive="#4f8fff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Equilibrium marker */}
      <mesh position={[3, -0.5, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>

      {/* Trail */}
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>

      {/* Force indicator */}
      <group position={[3 + data.displacement, 1, 0]}>
        <Line
          points={[[0, 0, 0], [-data.displacement * stiffness * 0.02, 0, 0]]}
          color="#ec4899"
          lineWidth={3}
        />
      </group>

      {/* Position markers */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i} position={[-1 + i * 1, -0.5, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.3, 0.02]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default SpringMassSceneComponent;
