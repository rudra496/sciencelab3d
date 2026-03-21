"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

interface Organism {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  traits: { speed: number; size: number; color: string };
  fitness: number;
  generation: number;
}

export default function NaturalSelectionScene() {
  const organismsRef = useRef<THREE.InstancedMesh>(null);

  const { populationSize, mutationRate, selectionPressure, generation } = useControls("Evolution", {
    populationSize: { value: 30, min: 10, max: 50, step: 1, label: "Population Size" },
    mutationRate: { value: 0.1, min: 0, max: 0.5, step: 0.01, label: "Mutation Rate" },
    selectionPressure: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Selection Pressure" },
    generation: { value: 0, min: 0, max: 50, step: 1, label: "Generation" },
    reset: button(() => initializePopulation()),
    nextGen: button(() => evolveGeneration()),
  });

  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  function initializePopulation() {
    const orgs: Organism[] = [];
    for (let i = 0; i < populationSize; i++) {
      orgs.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        traits: {
          speed: 0.5 + Math.random() * 0.5,
          size: 0.5 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? "#06d6a0" : "#ff6b35",
        },
        fitness: 0,
        generation: 0,
      });
    }
    setOrganisms(orgs);
    setCurrentGeneration(0);
  }

  function evolveGeneration() {
    setOrganisms(prev => {
      // Sort by fitness
      const sorted = [...prev].sort((a, b) => b.fitness - a.fitness);
      const survivors = sorted.slice(0, Math.floor(populationSize * (1 - selectionPressure)));

      const nextGen: Organism[] = [];

      // Elitism - keep best performers
      survivors.slice(0, Math.floor(survivors.length / 2)).forEach(org => {
        nextGen.push({ ...org, position: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4) });
      });

      // Reproduce with mutations
      while (nextGen.length < populationSize) {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];
        const mutated = {
          ...parent,
          position: new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
          traits: {
            speed: Math.max(0.1, Math.min(1, parent.traits.speed + (Math.random() - 0.5) * mutationRate)),
            size: Math.max(0.2, Math.min(1, parent.traits.size + (Math.random() - 0.5) * mutationRate)),
            color: Math.random() < mutationRate * 0.5 ? (Math.random() > 0.5 ? "#06d6a0" : "#ff6b35") : parent.traits.color,
          },
          fitness: 0,
          generation: currentGeneration + 1,
        };
        nextGen.push(mutated);
      }

      setCurrentGeneration(g => g + 1);
      return nextGen;
    });
  }

  useMemo(() => {
    initializePopulation();
  }, [populationSize]);

  useFrame((_, delta) => {
    if (!organismsRef.current) return;
    const dt = Math.min(delta, 0.02);

    setOrganisms(prev => {
      const updated = prev.map(org => {
        // Move organisms
        org.position.add(org.velocity.clone().multiplyScalar(dt * org.traits.speed));

        // Bounce off boundaries
        if (Math.abs(org.position.x) > 5) org.velocity.x *= -1;
        if (Math.abs(org.position.y) > 2.5) org.velocity.y *= -1;
        if (Math.abs(org.position.z) > 2.5) org.velocity.z *= -1;

        // Random direction changes
        if (Math.random() < 0.02) {
          org.velocity.x += (Math.random() - 0.5) * 0.1;
          org.velocity.y += (Math.random() - 0.5) * 0.1;
          org.velocity.z += (Math.random() - 0.5) * 0.1;
        }

        // Calculate fitness based on traits and environment
        const environmentalFitness = org.traits.color === "#06d6a0" ? 0.7 : 0.3;
        org.fitness = org.traits.speed * 0.4 + org.traits.size * 0.3 + environmentalFitness;

        return org;
      });

      return updated;
    });

    // Update instance matrices
    const maxOrganisms = 60;
    const colors = new Float32Array(maxOrganisms * 3);

    for (let i = 0; i < maxOrganisms; i++) {
      if (i < organisms.length) {
        const org = organisms[i];
        dummy.position.copy(org.position);
        dummy.scale.set(org.traits.size * 0.3, org.traits.size * 0.3, org.traits.size * 0.3);
        dummy.updateMatrix();
        organismsRef.current.setMatrixAt(i, dummy.matrix);

        // Color based on organism
        const color = new THREE.Color(org.traits.color);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        organismsRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    organismsRef.current.instanceMatrix.needsUpdate = true;

    const colorAttr = organismsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }
  });

  // Calculate average traits
  const avgSpeed = organisms.reduce((sum, org) => sum + org.traits.speed, 0) / organisms.length;
  const avgSize = organisms.reduce((sum, org) => sum + org.traits.size, 0) / organisms.length;
  const greenCount = organisms.filter(org => org.traits.color === "#06d6a0").length;

  return (
    <>
      {/* Environment */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 5, 5]} />
        <meshStandardMaterial
          color="#06d6a0"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Food sources */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos((i / 5) * Math.PI * 2) * 3,
          (Math.random() - 0.5) * 2,
          Math.sin((i / 5) * Math.PI * 2) * 3
        ]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Organisms */}
      <instancedMesh ref={organismsRef} args={[undefined, undefined, 60]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>

      {/* Stats display */}
      <mesh position={[4, 2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={avgSpeed > 0.7 ? "#06d6a0" : avgSpeed < 0.4 ? "#ff6b35" : "#ffcc00"}
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[4, 1.5, 0]}>
        <boxGeometry args={[avgSpeed * 0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#4f8fff" />
      </mesh>

      <mesh position={[4, 1, 0]}>
        <boxGeometry args={[avgSize * 0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      <mesh position={[4, 0.5, 0]}>
        <sphereGeometry args={[0.05 + greenCount * 0.01, 16, 16]} />
        <meshStandardMaterial color="#06d6a0" />
      </mesh>

      {/* Labels */}
      <mesh position={[-4, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-4, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-4, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
