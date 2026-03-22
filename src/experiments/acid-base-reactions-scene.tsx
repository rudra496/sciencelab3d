"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Molecule {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "acid" | "base" | "product" | "water";
  active: boolean;
}

export interface AcidBaseReactionsData {
  pH: number;
  numAcid: number;
  numBase: number;
  numProduct: number;
  temperature: number;
  reactionRate: number;
  neutralizationProgress: number;
}

export interface AcidBaseReactionsSceneProps {
  acidStrength: number;
  baseStrength: number;
  temperature: number;
  onDataChange?: (data: AcidBaseReactionsData) => void;
}

/**
 * Acid-Base Reactions scene component
 * Visualizes acid-base neutralization reactions with molecular simulation
 */
export function AcidBaseReactionsSceneComponent({
  acidStrength,
  baseStrength,
  temperature,
  onDataChange
}: AcidBaseReactionsSceneProps) {
  const moleculesRef = useRef<THREE.InstancedMesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    molecules: [] as Molecule[],
    frameCount: 0,
    currentPH: 7,
    reactionCount: 0
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [data, setData] = useState<AcidBaseReactionsData>({
    pH: 7,
    numAcid: 0,
    numBase: 0,
    numProduct: 0,
    temperature,
    reactionRate: 0,
    neutralizationProgress: 0,
  });

  // Initialize molecules
  useEffect(() => {
    const mols: Molecule[] = [];
    const totalMolecules = 80;
    const numAcid = Math.floor((acidStrength / 10) * totalMolecules * 0.45);
    const numBase = Math.floor((baseStrength / 10) * totalMolecules * 0.45);

    // Create acid molecules (red)
    for (let i = 0; i < numAcid; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3 - 1,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "acid",
        active: true,
      });
    }

    // Create base molecules (blue)
    for (let i = 0; i < numBase; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3 + 1,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        type: "base",
        active: true,
      });
    }

    // Add water molecules (gray)
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
        active: true,
      });
    }

    physicsRef.current.molecules = mols;
    physicsRef.current.reactionCount = 0;
  }, [acidStrength, baseStrength]); // Re-init when strengths change

  useFrame((state, delta) => {
    if (!moleculesRef.current) return;
    const dt = Math.min(delta, 0.02);
    const physics = physicsRef.current;
    const time = state.clock.elapsedTime;

    const tempFactor = Math.sqrt(temperature / 298);
    const maxMolecules = 100;
    const colors = new Float32Array(maxMolecules * 3);

    let numAcid = 0;
    let numBase = 0;
    let numProduct = 0;
    let reactionsThisFrame = 0;

    for (let i = 0; i < maxMolecules; i++) {
      const mol = physics.molecules[i];

      if (!mol || !mol.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        moleculesRef.current.setMatrixAt(i, dummy.matrix);
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0;
        continue;
      }

      // Count molecule types
      if (mol.type === "acid") numAcid++;
      else if (mol.type === "base") numBase++;
      else if (mol.type === "product") numProduct++;

      // Update position with temperature scaling
      mol.position.add(mol.velocity.clone().multiplyScalar(dt * tempFactor));

      // Bounce off walls
      if (Math.abs(mol.position.x) > 3) mol.velocity.x *= -1;
      if (Math.abs(mol.position.y) > 1.5) mol.velocity.y *= -1;
      if (Math.abs(mol.position.z) > 1.5) mol.velocity.z *= -1;

      // Reaction: acid + base -> product (neutralization)
      if (mol.type === "acid" || mol.type === "base") {
        for (let j = 0; j < maxMolecules; j++) {
          if (i === j) continue;
          const other = physics.molecules[j];
          if (!other || !other.active) continue;

          if ((mol.type === "acid" && other.type === "base") ||
              (mol.type === "base" && other.type === "acid")) {
            if (mol.position.distanceTo(other.position) < 0.35) {
              // Reaction occurs!
              mol.type = "product";
              other.type = "product";

              // Energy release causes faster movement
              mol.velocity.multiplyScalar(1.2);
              other.velocity.multiplyScalar(1.2);

              reactionsThisFrame++;
              physics.reactionCount++;
            }
          }
        }
      }

      // Update instance matrix
      dummy.position.copy(mol.position);

      const size = mol.type === "water" ? 0.08 : mol.type === "product" ? 0.15 : 0.12;
      dummy.scale.set(size, size, size);
      dummy.updateMatrix();
      moleculesRef.current.setMatrixAt(i, dummy.matrix);

      // Set color based on type
      let color: { r: number; g: number; b: number };
      if (mol.type === "acid") {
        // Red - varies slightly by position
        color = { r: 1, g: 0.3 + Math.sin(time + mol.position.x) * 0.1, b: 0.2 };
      } else if (mol.type === "base") {
        // Blue
        color = { r: 0.2, g: 0.7, b: 1 };
      } else if (mol.type === "product") {
        // Green (salt/water product)
        color = { r: 0.3, g: 1, b: 0.4 };
      } else {
        // Gray (water)
        color = { r: 0.7, g: 0.7, b: 0.7 };
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    moleculesRef.current.instanceMatrix.needsUpdate = true;

    // Update vertex colors
    const colorAttr = moleculesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }

    // Calculate overall pH
    const netBase = numBase - numAcid;
    const pH = Math.max(1, Math.min(13, 7 + netBase * 0.25));
    physics.currentPH = pH;

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const totalReactions = numAcid + numBase + numProduct;
      const initialAcidBase = Math.floor(((acidStrength + baseStrength) / 10) * 80 * 0.45);
      const neutralizationProgress = initialAcidBase > 0 ? numProduct / initialAcidBase : 0;

      const newData: AcidBaseReactionsData = {
        pH,
        numAcid,
        numBase,
        numProduct,
        temperature,
        reactionRate: reactionsThisFrame * 10,
        neutralizationProgress: Math.min(1, neutralizationProgress),
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

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

      {/* Liquid fill in vessel */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.95, 1.95, 2.2, 32, 1, true]} />
        <meshStandardMaterial
          color={data.pH > 7 ? "#4f8fff" : data.pH < 7 ? "#ff6b35" : "#06d6a0"}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Molecules with vertex colors */}
      <instancedMesh ref={moleculesRef} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors metalness={0.3} roughness={0.7} />
      </instancedMesh>

      {/* Beaker labels */}
      <group position={[-2.5, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.6} />
        </mesh>
        {/* Acid H+ label */}
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      </group>

      <group position={[2.5, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
        </mesh>
        {/* Base OH- label */}
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      </group>

      <group position={[0, 1.5, 2.3]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.6} />
        </mesh>
        {/* Product label */}
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      </group>

      {/* pH indicator bar */}
      <group position={[3.5, 0, 0]}>
        {/* Background */}
        <mesh>
          <boxGeometry args={[0.3, 3, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        {/* pH gradient */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.25, 2.8, 0.05]} />
          <meshStandardMaterial
            color={data.pH > 7 ? "#4f8fff" : data.pH < 7 ? "#ff6b35" : "#06d6a0"}
            emissive={data.pH > 7 ? "#4f8fff" : data.pH < 7 ? "#ff6b35" : "#06d6a0"}
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* Current pH level marker */}
        <mesh position={[0, (data.pH - 7) * 0.35, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* Scale markers */}
        {[0, 3.5, -3.5].map((y, i) => (
          <mesh key={i} position={[0.18, y * 0.35, 0.07]}>
            <boxGeometry args={[0.08, 0.05, 0.02]} />
            <meshBasicMaterial color="#666" />
          </mesh>
        ))}
      </group>

      {/* Temperature indicator */}
      <group position={[-3.5, 0, 0]}>
        {/* Thermometer body */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Temperature fill */}
        <mesh position={[0, ((temperature - 273) / 100) * 1.2 - 0.8, 0]}>
          <cylinderGeometry args={[0.1, 0.1, ((temperature - 273) / 100) * 2.4, 16]} />
          <meshStandardMaterial
            color={temperature > 320 ? "#ef4444" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
            emissive={temperature > 320 ? "#ef4444" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* Bulb */}
        <mesh position={[0, -1.7, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={temperature > 320 ? "#ef4444" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
            emissive={temperature > 320 ? "#ef4444" : temperature < 280 ? "#4f8fff" : "#06d6a0"}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Neutralization progress bar */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <boxGeometry args={[3, 0.2, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-1.5 + data.neutralizationProgress * 3, 0, 0.06]}>
          <boxGeometry args={[data.neutralizationProgress * 3, 0.15, 0.05]} />
          <meshStandardMaterial
            color="#06d6a0"
            emissive="#06d6a0"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Progress indicator */}
        {data.neutralizationProgress >= 1 && (
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={1}
            />
          </mesh>
        )}
      </group>

      {/* Reaction glow when active */}
      {data.reactionRate > 0 && (
        <pointLight
          position={[0, 0, 1]}
          color="#06d6a0"
          intensity={data.reactionRate * 0.1}
          distance={4}
        />
      )}

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />
    </>
  );
}

export default AcidBaseReactionsSceneComponent;
