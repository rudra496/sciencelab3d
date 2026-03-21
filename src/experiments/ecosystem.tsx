"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

interface Organism {
  position: THREE.Vector3;
  type: "producer" | "herbivore" | "carnivore" | "decomposer";
  energy: number;
}

export default function EcosystemScene() {
  const organismsRef = useRef<THREE.InstancedMesh>(null);

  const { producerCount, herbivoreCount, carnivoreCount, simulationSpeed } = useControls("Ecosystem", {
    producerCount: { value: 20, min: 5, max: 50, step: 1, label: "Producers" },
    herbivoreCount: { value: 8, min: 2, max: 20, step: 1, label: "Herbivores" },
    carnivoreCount: { value: 3, min: 1, max: 10, step: 1, label: "Carnivores" },
    simulationSpeed: { value: 1, min: 0.1, max: 3, step: 0.1, label: "Sim Speed" },
    reset: button(() => initializeEcosystem()),
  });

  const [organisms, setOrganisms] = useState<Organism[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  function initializeEcosystem() {
    const orgs: Organism[] = [];

    // Producers (plants)
    for (let i = 0; i < producerCount; i++) {
      orgs.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          -1,
          (Math.random() - 0.5) * 8
        ),
        type: "producer",
        energy: 50 + Math.random() * 50,
      });
    }

    // Herbivores
    for (let i = 0; i < herbivoreCount; i++) {
      orgs.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          0,
          (Math.random() - 0.5) * 6
        ),
        type: "herbivore",
        energy: 80 + Math.random() * 40,
      });
    }

    // Carnivores
    for (let i = 0; i < carnivoreCount; i++) {
      orgs.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          0.5,
          (Math.random() - 0.5) * 4
        ),
        type: "carnivore",
        energy: 100 + Math.random() * 50,
      });
    }

    setOrganisms(orgs);
  }

  useMemo(() => {
    initializeEcosystem();
  }, [producerCount, herbivoreCount, carnivoreCount]);

  useFrame((_, delta) => {
    if (!organismsRef.current) return;
    const dt = Math.min(delta, 0.02) * simulationSpeed;

    setOrganisms(prev => {
      const updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        const org = updated[i];

        if (org.type === "producer") {
          // Plants grow
          org.energy += dt * 5;
        } else if (org.type === "herbivore") {
          // Move towards producers
          let nearestProducer: typeof org | undefined;
          let nearestDist = Infinity;

          updated.forEach(other => {
            if (other.type === "producer") {
              const dist = org.position.distanceTo(other.position);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestProducer = other;
              }
            }
          });

          if (nearestProducer && nearestDist < 2) {
            const direction = nearestProducer.position.clone().sub(org.position).normalize();
            org.position.add(direction.multiplyScalar(dt * 0.5));

            // Eat
            if (nearestDist < 0.3) {
              org.energy += nearestProducer.energy * 0.5;
              nearestProducer.energy = 0;
            }
          }

          org.energy -= dt * 2;
        } else if (org.type === "carnivore") {
          // Move towards herbivores
          let nearestPrey: typeof org | undefined;
          let nearestDist = Infinity;

          updated.forEach(other => {
            if (other.type === "herbivore") {
              const dist = org.position.distanceTo(other.position);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestPrey = other;
              }
            }
          });

          if (nearestPrey && nearestDist < 3) {
            const direction = nearestPrey.position.clone().sub(org.position).normalize();
            org.position.add(direction.multiplyScalar(dt * 0.6));

            // Eat
            if (nearestDist < 0.4) {
              org.energy += nearestPrey.energy * 0.7;
              nearestPrey.energy = 0;
            }
          }

          org.energy -= dt * 3;
        }
      }

      // Remove dead organisms and reproduce
      const survivors = updated.filter(org => org.energy > 0);

      // Reproduction
      const newOrgs: Organism[] = [];
      survivors.forEach(org => {
        if (org.energy > 150 && Math.random() < 0.01) {
          org.energy /= 2;
          newOrgs.push({
            position: org.position.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * 2,
              0,
              (Math.random() - 0.5) * 2
            )),
            type: org.type,
            energy: org.energy,
          });
        }
      });

      return [...survivors, ...newOrgs];
    });

    // Update instance matrices
    const maxOrganisms = 100;
    const colors = new Float32Array(maxOrganisms * 3);

    for (let i = 0; i < maxOrganisms; i++) {
      if (i < organisms.length) {
        const org = organisms[i];
        dummy.position.copy(org.position);

        const size = org.type === "producer" ? 0.2
          : org.type === "herbivore" ? 0.15
          : org.type === "carnivore" ? 0.2
          : 0.1;

        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        organismsRef.current.setMatrixAt(i, dummy.matrix);

        // Color based on type
        const color = org.type === "producer" ? { r: 0.02, g: 0.8, b: 0 }
          : org.type === "herbivore" ? { r: 0.1, g: 0.5, b: 0.9 }
          : org.type === "carnivore" ? { r: 0.9, g: 0.2, b: 0.2 }
          : { r: 0.5, g: 0.5, b: 0.5 };

        // Scale by energy
        const energyScale = Math.min(org.energy / 100, 1.5);
        colors[i * 3] = Math.min(1, color.r * energyScale);
        colors[i * 3 + 1] = Math.min(1, color.g * energyScale);
        colors[i * 3 + 2] = Math.min(1, color.b * energyScale);
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

  // Population counts
  const producerPop = organisms.filter(o => o.type === "producer").length;
  const herbivorePop = organisms.filter(o => o.type === "herbivore").length;
  const carnivorePop = organisms.filter(o => o.type === "carnivore").length;

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      {/* Organisms */}
      <instancedMesh ref={organismsRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>

      {/* Population indicators */}
      <mesh position={[-4, 2.5, 0]}>
        <boxGeometry args={[0.1, producerPop * 0.05, 0.1]} />
        <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-3.5, 2.5, 0]}>
        <boxGeometry args={[0.1, herbivorePop * 0.08, 0.1]} />
        <meshStandardMaterial color="#4f8fff" emissive="#4f8fff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-3, 2.5, 0]}>
        <boxGeometry args={[0.1, carnivorePop * 0.1, 0.1]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
      </mesh>

      {/* Energy flow indicator */}
      <mesh position={[4, 2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-4, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-3, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      {/* Sun */}
      <mesh position={[0, 5, -3]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={1}
        />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -1.11, 0]} />
    </>
  );
}
