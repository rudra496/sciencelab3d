"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

interface Molecule {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "acid" | "base" | "product" | "water";
}

export default function AcidBaseReactionsScene() {
  const moleculesRef = useRef<THREE.InstancedMesh>(null);

  const { acidStrength, baseStrength, temperature } = useControls("Reaction", {
    acidStrength: { value: 5, min: 1, max: 10, step: 0.5, label: "Acid Concentration" },
    baseStrength: { value: 5, min: 1, max: 10, step: 0.5, label: "Base Concentration" },
    temperature: { value: 298, min: 273, max: 373, step: 1, label: "Temperature (K)" },
  });

  const [molecules, setMolecules] = useState<Molecule[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize molecules
  useMemo(() => {
    const mols: Molecule[] = [];
    const totalMolecules = 60;
    const numAcid = Math.floor((acidStrength / 10) * totalMolecules * 0.5);
    const numBase = Math.floor((baseStrength / 10) * totalMolecules * 0.5);

    for (let i = 0; i < numAcid; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "acid",
      });
    }

    for (let i = 0; i < numBase; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "base",
      });
    }

    // Add water molecules
    const remaining = totalMolecules - numAcid - numBase;
    for (let i = 0; i < remaining; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        type: "water",
      });
    }

    setMolecules(mols);
  }, [acidStrength, baseStrength]);

  useFrame((_, delta) => {
    if (!moleculesRef.current) return;
    const dt = Math.min(delta, 0.02);
    const tempFactor = temperature / 298;

    setMolecules(prev => {
      const updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        const mol = updated[i];

        // Update position
        mol.position.add(mol.velocity.clone().multiplyScalar(dt * tempFactor));

        // Bounce off walls
        if (Math.abs(mol.position.x) > 3) mol.velocity.x *= -1;
        if (Math.abs(mol.position.y) > 1.5) mol.velocity.y *= -1;
        if (Math.abs(mol.position.z) > 1.5) mol.velocity.z *= -1;

        // Reaction: acid + base -> product
        if (mol.type === "acid" || mol.type === "base") {
          for (let j = 0; j < updated.length; j++) {
            if (i === j) continue;
            const other = updated[j];

            if ((mol.type === "acid" && other.type === "base") ||
                (mol.type === "base" && other.type === "acid")) {
              if (mol.position.distanceTo(other.position) < 0.3) {
                mol.type = "product";
                other.type = "product";
                mol.velocity.multiplyScalar(0.5);
                other.velocity.multiplyScalar(0.5);
              }
            }
          }
        }
      }

      return updated;
    });

    // Update instance matrices
    const maxMolecules = 100;
    const colors = new Float32Array(maxMolecules * 3);

    for (let i = 0; i < maxMolecules; i++) {
      if (i < molecules.length) {
        const mol = molecules[i];
        dummy.position.copy(mol.position);

        const size = mol.type === "water" ? 0.08 : mol.type === "product" ? 0.15 : 0.12;
        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        moleculesRef.current.setMatrixAt(i, dummy.matrix);

        // Set color based on type
        const color = mol.type === "acid" ? { r: 1, g: 0.4, b: 0.2 }
          : mol.type === "base" ? { r: 0.2, g: 0.8, b: 1 }
          : mol.type === "product" ? { r: 0.4, g: 1, b: 0.4 }
          : { r: 0.8, g: 0.8, b: 0.8 };

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        moleculesRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    moleculesRef.current.instanceMatrix.needsUpdate = true;

    const colorAttr = moleculesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }
  });

  // Calculate overall pH (simplified)
  const numAcid = molecules.filter(m => m.type === "acid").length;
  const numBase = molecules.filter(m => m.type === "base").length;
  const netBase = numBase - numAcid;
  const pH = 7 + netBase * 0.2;

  return (
    <>
      {/* Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 3.5, 3.5]} />
        <meshStandardMaterial
          color="#1a1a3e"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Reaction vessel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2, 3, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Molecules */}
      <instancedMesh ref={moleculesRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>

      {/* Temperature indicator */}
      <mesh position={[3.5, 1, 0]}>
        <sphereGeometry args={[0.1 + temperature * 0.001, 16, 16]} />
        <meshStandardMaterial
          color={temperature > 320 ? "#ff6b35" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
          emissive={temperature > 320 ? "#ff6b35" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* pH indicator */}
      <mesh position={[-3.5, 1, 0]}>
        <boxGeometry args={[0.5, Math.max(0.1, Math.abs(pH - 7) * 0.2), 0.5]} />
        <meshStandardMaterial
          color={pH > 7 ? "#4f8fff" : pH < 7 ? "#ff6b35" : "#06d6a0"}
          emissive={pH > 7 ? "#4f8fff" : pH < 7 ? "#ff6b35" : "#06d6a0"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-3.5, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      {/* Legend */}
      <mesh position={[-2, -2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-1.5, -2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-1, -2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />
    </>
  );
}
