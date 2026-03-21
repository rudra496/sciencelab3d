"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "A" | "B";
  originalSide: "left" | "right";
}

export default function DiffusionScene() {
  const particlesRef = useRef<THREE.InstancedMesh>(null);

  const { temperature, membranePermeability, particleCount, showMembrane } = useControls("Diffusion", {
    temperature: { value: 300, min: 100, max: 500, step: 10, label: "Temperature (K)" },
    membranePermeability: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Membrane Permeability" },
    particleCount: { value: 80, min: 20, max: 150, step: 10, label: "Particles" },
    showMembrane: { value: true, label: "Show Membrane" },
    reset: button(() => initializeParticles()),
  });

  const [particles, setParticles] = useState<Particle[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  function initializeParticles() {
    const p: Particle[] = [];
    const halfCount = particleCount / 2;

    // Type A particles (left side)
    for (let i = 0; i < halfCount; i++) {
      p.push({
        position: new THREE.Vector3(
          -3 + Math.random() * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "A",
        originalSide: "left",
      });
    }

    // Type B particles (right side)
    for (let i = 0; i < halfCount; i++) {
      p.push({
        position: new THREE.Vector3(
          1 + Math.random() * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "B",
        originalSide: "right",
      });
    }

    setParticles(p);
  }

  useMemo(() => {
    initializeParticles();
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const dt = Math.min(delta, 0.02);
    const tempFactor = temperature / 300;
    const permeability = membranePermeability;

    setParticles(prev => {
      const updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];

        // Brownian motion
        p.velocity.x += (Math.random() - 0.5) * 0.1 * tempFactor;
        p.velocity.y += (Math.random() - 0.5) * 0.1 * tempFactor;
        p.velocity.z += (Math.random() - 0.5) * 0.1 * tempFactor;

        // Damping
        p.velocity.multiplyScalar(0.98);

        // Update position
        p.position.add(p.velocity.clone().multiplyScalar(dt * tempFactor));

        // Container walls
        if (p.position.x < -5) { p.position.x = -5; p.velocity.x *= -1; }
        if (p.position.x > 5) { p.position.x = 5; p.velocity.x *= -1; }
        if (p.position.y < -2) { p.position.y = -2; p.velocity.y *= -1; }
        if (p.position.y > 2) { p.position.y = 2; p.velocity.y *= -1; }
        if (p.position.z < -1.5) { p.position.z = -1.5; p.velocity.z *= -1; }
        if (p.position.z > 1.5) { p.position.z = 1.5; p.velocity.z *= -1; }

        // Membrane interaction
        if (showMembrane && Math.abs(p.position.x) < 0.1) {
          if (Math.random() > permeability) {
            // Bounce off membrane
            p.velocity.x *= -1;
            if (p.position.x > 0) p.position.x = 0.1;
            else p.position.x = -0.1;
          }
        }
      }

      return updated;
    });

    // Update instance matrices
    const maxParticles = 200;
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      if (i < particles.length) {
        const p = particles[i];
        dummy.position.copy(p.position);
        dummy.scale.set(0.1, 0.1, 0.1);
        dummy.updateMatrix();
        particlesRef.current.setMatrixAt(i, dummy.matrix);

        // Color based on type
        const color = p.type === "A" ? { r: 1, g: 0.4, b: 0.2 } : { r: 0.2, g: 0.8, b: 1 };
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        particlesRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    particlesRef.current.instanceMatrix.needsUpdate = true;

    const colorAttr = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }
  });

  // Calculate mixing percentage
  const leftA = particles.filter(p => p.type === "A" && p.position.x < 0).length;
  const leftB = particles.filter(p => p.type === "B" && p.position.x < 0).length;
  const totalLeft = leftA + leftB;
  const mixingPercent = totalLeft > 0 ? Math.min(leftB / totalLeft, leftA / (particles.length / 2 - leftB)) * 100 : 0;

  return (
    <>
      {/* Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 4.5, 3.5]} />
        <meshStandardMaterial
          color="#1a1a3e"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Semipermeable membrane */}
      {showMembrane && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.05, 4, 3]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2 * membranePermeability}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Membrane pores */}
      {showMembrane && membranePermeability > 0.3 && Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, -1.5 + i * 0.75, (i % 2) * 0.5]}>
          <cylinderGeometry args={[0.1 * membranePermeability, 0.1 * membranePermeability, 0.1, 8]} />
          <meshStandardMaterial color="#000" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, 200]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>

      {/* Concentration gradient indicator */}
      <mesh position={[-4, 2.5, 0]}>
        <boxGeometry args={[0.1, 0.5 + particles.filter(p => p.type === "A" && p.position.x < 0).length * 0.01, 0.1]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[4, 2.5, 0]}>
        <boxGeometry args={[0.1, 0.5 + particles.filter(p => p.type === "B" && p.position.x > 0).length * 0.01, 0.1]} />
        <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.3} />
      </mesh>

      {/* Equilibrium indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.1 + mixingPercent * 0.002, 16, 16]} />
        <meshStandardMaterial
          color={mixingPercent > 80 ? "#06d6a0" : "#ffcc00"}
          emissive={mixingPercent > 80 ? "#06d6a0" : "#ffcc00"}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Legend */}
      <mesh position={[-3, -2.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-2.3, -2.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      <gridHelper args={[14, 28, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
