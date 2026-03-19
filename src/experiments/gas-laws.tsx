"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export default function GasLawsScene() {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const pistonRef = useRef<THREE.Mesh>(null);

  const { temperature, volume, numParticles } = useControls("Gas Laws", {
    temperature: { value: 300, min: 100, max: 800, step: 10, label: "Temperature (K)" },
    volume: { value: 4, min: 1, max: 8, step: 0.1, label: "Volume (L)" },
    numParticles: { value: 80, min: 20, max: 200, step: 10, label: "Particles" },
  });

  const particleCount = numParticles;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      p.push({
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
    return p;
  }, []);

  const speedFactor = Math.sqrt(temperature / 300);
  const boxSize = volume;

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const dt = Math.min(delta, 0.02) * speedFactor;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];

      p.position.add(p.velocity.clone().multiplyScalar(dt * 5));

      // Bounce off walls
      const half = boxSize / 2;
      if (p.position.x > half) { p.position.x = half; p.velocity.x *= -1; }
      if (p.position.x < -half) { p.position.x = -half; p.velocity.x *= -1; }
      if (p.position.y > half) { p.position.y = half; p.velocity.y *= -1; }
      if (p.position.y < -half) { p.position.y = -half; p.velocity.y *= -1; }
      if (p.position.z > half) { p.position.z = half; p.velocity.z *= -1; }
      if (p.position.z < -half) { p.position.z = -half; p.velocity.z *= -1; }

      dummy.position.copy(p.position);
      const scale = 0.12;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;

    // Update piston position
    if (pistonRef.current) {
      pistonRef.current.position.y = boxSize / 2 + 0.15;
      pistonRef.current.scale.y = boxSize;
    }
  });

  return (
    <>
      {/* Container walls */}
      {/* Bottom */}
      <mesh position={[0, -boxSize / 2 - 0.1, 0]}>
        <boxGeometry args={[boxSize + 0.2, 0.2, boxSize + 0.2]} />
        <meshStandardMaterial color="#1a1a3e" transparent opacity={0.5} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0, -boxSize / 2 - 0.1]}>
        <boxGeometry args={[boxSize + 0.2, boxSize + 0.2, 0.2]} />
        <meshStandardMaterial color="#1a1a3e" transparent opacity={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-boxSize / 2 - 0.1, 0, 0]}>
        <boxGeometry args={[0.2, boxSize + 0.2, boxSize + 0.2]} />
        <meshStandardMaterial color="#1a1a3e" transparent opacity={0.3} />
      </mesh>
      {/* Right */}
      <mesh position={[boxSize / 2 + 0.1, 0, 0]}>
        <boxGeometry args={[0.2, boxSize + 0.2, boxSize + 0.2]} />
        <meshStandardMaterial color="#1a1a3e" transparent opacity={0.3} />
      </mesh>

      {/* Piston (top, movable) */}
      <mesh ref={pistonRef} position={[0, boxSize / 2 + 0.15, 0]}>
        <boxGeometry args={[boxSize + 0.1, 0.2, boxSize + 0.1]} />
        <meshStandardMaterial color="#4f8fff" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
      </mesh>

      {/* Piston handle */}
      <mesh position={[0, boxSize / 2 + 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, 200]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
      </instancedMesh>

      {/* Pressure indicator (arrow) */}
      <mesh position={[boxSize / 2 + 0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}
