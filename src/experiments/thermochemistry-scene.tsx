'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

export interface ThermochemistryData {
  exothermicTemp: number;
  endothermicTemp: number;
  exothermicEnergy: number;
  endothermicEnergy: number;
  progress: number;
  currentStep: number;
}

export interface ThermochemistrySceneProps {
  activationEnergy: number;
  energyReleased: number;
  isPlaying: boolean;
  stepMode: boolean;
  currentStep: number;
  onProgressChange?: (progress: number) => void;
  onDataChange?: (data: ThermochemistryData) => void;
}

interface Molecule {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export function ThermochemistrySceneComponent({
  activationEnergy,
  energyReleased,
  isPlaying,
  stepMode,
  currentStep,
  onProgressChange,
  onDataChange,
}: ThermochemistrySceneProps) {
  const exothermicGroupRef = useRef<THREE.Group>(null);
  const endothermicGroupRef = useRef<THREE.Group>(null);
  const exothermicParticlesRef = useRef<THREE.InstancedMesh>(null);
  const endothermicParticlesRef = useRef<THREE.InstancedMesh>(null);

  // Physics refs
  const physicsRef = useRef({
    progress: 0,
    frameCount: 0,
    exothermicMolecules: [] as Molecule[],
    endothermicMolecules: [] as Molecule[],
    exothermicTemp: 298,
    endothermicTemp: 298,
    heatWavePhase: 0,
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [data, setData] = useState<ThermochemistryData>({
    exothermicTemp: 298,
    endothermicTemp: 298,
    exothermicEnergy: 80,
    endothermicEnergy: 80,
    progress: 0,
    currentStep: 1,
  });

  // Initialize molecules
  useEffect(() => {
    const exoMols: Molecule[] = [];
    const endoMols: Molecule[] = [];
    for (let i = 0; i < 20; i++) {
      exoMols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
      });
      endoMols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
      });
    }
    physicsRef.current.exothermicMolecules = exoMols;
    physicsRef.current.endothermicMolecules = endoMols;
    physicsRef.current.exothermicTemp = 298;
    physicsRef.current.endothermicTemp = 298;
  }, []);

  // Energy diagram points (shared)
  const energyCurvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 40;

    const reactantEnergy = 80;
    const exoProductEnergy = 80 - energyReleased;
    const endoProductEnergy = 80 + energyReleased;
    const transitionEnergy = 80 + activationEnergy;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * 6;

      let y: number;
      if (t < 0.3) {
        y = reactantEnergy;
      } else if (t > 0.7) {
        // Show both products as separate lines
        y = (exoProductEnergy + endoProductEnergy) / 2;
      } else {
        // Transition state
        const localT = (t - 0.3) / 0.4;
        y = reactantEnergy + Math.sin(localT * Math.PI) * activationEnergy;
      }

      points.push([x, y / 50 - 0.5, 0]);
    }

    return points;
  }, [activationEnergy, energyReleased]);

  useFrame((_, delta) => {
    if (!exothermicGroupRef.current || !endothermicGroupRef.current || !isPlaying) return;

    const physics = physicsRef.current;

    // Step mode logic
    if (stepMode) {
      switch (currentStep) {
        case 1: physics.progress = 0; break;
        case 2: physics.progress = 0.25; break;
        case 3: physics.progress = 0.5; break;
        case 4: physics.progress = 0.75; break;
        case 5: physics.progress = 1; break;
      }
    } else {
      if (physics.progress < 1) {
        physics.progress = Math.min(physics.progress + delta * 0.15, 1);
      }
    }

    // Update exothermic molecules (get faster/hotter as reaction progresses)
    const exoSpeed = 0.01 + physics.progress * 0.04;
    for (const mol of physics.exothermicMolecules) {
      mol.velocity.x += (Math.random() - 0.5) * exoSpeed;
      mol.velocity.y += (Math.random() - 0.5) * exoSpeed;
      mol.velocity.z += (Math.random() - 0.5) * exoSpeed;

      const maxSpeed = 0.03 + physics.progress * 0.08;
      if (mol.velocity.length() > maxSpeed) {
        mol.velocity.normalize().multiplyScalar(maxSpeed);
      }

      mol.position.add(mol.velocity.clone().multiplyScalar(delta * 60));

      if (Math.abs(mol.position.x) > 0.8) mol.velocity.x *= -1;
      if (Math.abs(mol.position.y) > 0.8) mol.velocity.y *= -1;
      if (Math.abs(mol.position.z) > 0.8) mol.velocity.z *= -1;
    }

    // Update endothermic molecules (get slower/colder as reaction progresses)
    const endoSpeed = 0.02 - physics.progress * 0.015;
    for (const mol of physics.endothermicMolecules) {
      mol.velocity.x += (Math.random() - 0.5) * endoSpeed;
      mol.velocity.y += (Math.random() - 0.5) * endoSpeed;
      mol.velocity.z += (Math.random() - 0.5) * endoSpeed;

      const maxSpeed = Math.max(0.005, 0.04 - physics.progress * 0.03);
      if (mol.velocity.length() > maxSpeed) {
        mol.velocity.normalize().multiplyScalar(maxSpeed);
      }

      mol.position.add(mol.velocity.clone().multiplyScalar(delta * 60));

      if (Math.abs(mol.position.x) > 0.8) mol.velocity.x *= -1;
      if (Math.abs(mol.position.y) > 0.8) mol.velocity.y *= -1;
      if (Math.abs(mol.position.z) > 0.8) mol.velocity.z *= -1;
    }

    // Update temperatures
    physics.exothermicTemp = 298 + energyReleased * 0.8 * physics.progress;
    physics.endothermicTemp = 298 - energyReleased * 0.4 * physics.progress;
    physics.heatWavePhase += delta * 2;

    // Update instanced meshes
    if (exothermicParticlesRef.current) {
      for (let i = 0; i < 20; i++) {
        const mol = physics.exothermicMolecules[i];
        if (mol) {
          dummy.position.copy(mol.position);
          const scale = 0.08 + physics.progress * 0.03;
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          exothermicParticlesRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      exothermicParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (endothermicParticlesRef.current) {
      for (let i = 0; i < 20; i++) {
        const mol = physics.endothermicMolecules[i];
        if (mol) {
          dummy.position.copy(mol.position);
          const scale = 0.1 - physics.progress * 0.02;
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          endothermicParticlesRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      endothermicParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update state every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      onProgressChange?.(physics.progress);

      const newData: ThermochemistryData = {
        exothermicTemp: physics.exothermicTemp,
        endothermicTemp: physics.endothermicTemp,
        exothermicEnergy: 80 - energyReleased * physics.progress,
        endothermicEnergy: 80 + energyReleased * physics.progress,
        progress: physics.progress,
        currentStep: stepMode ? currentStep : Math.floor(physics.progress * 5) + 1,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  const progress = physicsRef.current.progress;

  // Get color based on temperature
  const getTempColor = (temp: number, baseTemp: number) => {
    const diff = temp - baseTemp;
    if (diff > 30) return { color: '#ef4444', emissive: '#ef4444' }; // Hot
    if (diff > 10) return { color: '#f97316', emissive: '#f97316' }; // Warm
    if (diff < -20) return { color: '#3b82f6', emissive: '#3b82f6' }; // Cold
    if (diff < -5) return { color: '#06b6d4', emissive: '#06b6d4' }; // Cool
    return { color: '#22c55e', emissive: '#22c55e' }; // Neutral
  };

  const exoTempColor = getTempColor(data.exothermicTemp, 298);
  const endoTempColor = getTempColor(data.endothermicTemp, 298);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      {/* === EXOTHERMIC REACTION (Left) === */}
      <group ref={exothermicGroupRef} position={[-3, 1, 0]}>
        {/* Beaker */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1, 1.5, 32, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Liquid - gets more red/orange as it heats up */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 1, 32]} />
          <meshStandardMaterial
            color={exoTempColor.color}
            transparent
            opacity={0.6 + progress * 0.2}
            emissive={exoTempColor.color}
            emissiveIntensity={progress * 0.4}
          />
        </mesh>

        {/* Molecules - move faster as reaction progresses */}
        <instancedMesh ref={exothermicParticlesRef} args={[undefined, undefined, 20]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.3 + progress * 0.5}
          />
        </instancedMesh>

        {/* Energy flow arrows - pointing OUT */}
        {progress > 0.3 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <group
                key={i}
                position={[
                  Math.cos((i / 4) * Math.PI * 2) * (1.2 + progress * 0.5),
                  0.5,
                  Math.sin((i / 4) * Math.PI * 2) * (1.2 + progress * 0.5)
                ]}
                rotation={[0, (i / 4) * Math.PI * 2, 0]}
              >
                <mesh position={[0.3, 0, 0]}>
                  <coneGeometry args={[0.1, 0.2, 8]} />
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#f97316"
                    emissiveIntensity={0.7}
                    transparent
                    opacity={1 - progress * 0.3}
                  />
                </mesh>
                <mesh>
                  <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#f97316"
                    emissiveIntensity={0.7}
                    transparent
                    opacity={1 - progress * 0.3}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Label */}
        <Text position={[0, 1.2, 0]} fontSize={0.15} color="#ef4444" anchorX="center">
          EXOTHERMIC
        </Text>
        <Text position={[0, 1.0, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
          Releases Energy
        </Text>

        {/* Temperature display */}
        <group position={[0, -1.2, 0]}>
          <mesh>
            <planeGeometry args={[1, 0.25]} />
            <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0.05, 0.01]} fontSize={0.1} color="#ef4444" anchorX="center">
            {data.exothermicTemp.toFixed(0)} K
          </Text>
        </group>
      </group>

      {/* === ENDOTHERMIC REACTION (Right) === */}
      <group ref={endothermicGroupRef} position={[3, 1, 0]}>
        {/* Beaker */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1, 1.5, 32, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Liquid - gets more blue as it cools down */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 1, 32]} />
          <meshStandardMaterial
            color={endoTempColor.color}
            transparent
            opacity={0.7 - progress * 0.1}
            emissive={endoTempColor.color}
            emissiveIntensity={0.2 - progress * 0.1}
          />
        </mesh>

        {/* Molecules - move slower as reaction progresses */}
        <instancedMesh ref={endothermicParticlesRef} args={[undefined, undefined, 20]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={Math.max(0.1, 0.3 - progress * 0.2)}
          />
        </instancedMesh>

        {/* Energy flow arrows - pointing IN */}
        {progress > 0.3 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <group
                key={i}
                position={[
                  Math.cos((i / 4) * Math.PI * 2 + Math.PI / 4) * (1.2 + progress * 0.5),
                  0.5,
                  Math.sin((i / 4) * Math.PI * 2 + Math.PI / 4) * (1.2 + progress * 0.5)
                ]}
                rotation={[0, (i / 4) * Math.PI * 2 + Math.PI / 4 + Math.PI, 0]}
              >
                <mesh position={[0.3, 0, 0]}>
                  <coneGeometry args={[0.1, 0.2, 8]} />
                  <meshStandardMaterial
                    color="#3b82f6"
                    emissive="#3b82f6"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={1 - progress * 0.2}
                  />
                </mesh>
                <mesh>
                  <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                  <meshStandardMaterial
                    color="#3b82f6"
                    emissive="#3b82f6"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={1 - progress * 0.2}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Label */}
        <Text position={[0, 1.2, 0]} fontSize={0.15} color="#3b82f6" anchorX="center">
          ENDOTHERMIC
        </Text>
        <Text position={[0, 1.0, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
          Absorbs Energy
        </Text>

        {/* Temperature display */}
        <group position={[0, -1.2, 0]}>
          <mesh>
            <planeGeometry args={[1, 0.25]} />
            <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0.05, 0.01]} fontSize={0.1} color="#3b82f6" anchorX="center">
            {data.endothermicTemp.toFixed(0)} K
          </Text>
        </group>
      </group>

      {/* === ENERGY DIAGRAM (Center, Behind) === */}
      <group position={[0, -1, -2]}>
        {/* Background */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[7, 2.5]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>

        {/* Axes */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[7, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-3.2, 0, 0]}>
          <boxGeometry args={[0.05, 2, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Energy curve */}
        <Line
          points={energyCurvePoints}
          color="#ffffff"
          lineWidth={2}
          opacity={0.8}
        />

        {/* Exothermic product level (lower) */}
        <mesh position={[2.5, (80 - energyReleased) / 50 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Endothermic product level (higher) */}
        <mesh position={[2.5, (80 + energyReleased) / 50 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>

        {/* Reactant level */}
        <mesh position={[-2.5, 80 / 50 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>

        {/* Transition state */}
        <mesh position={[0, (80 + activationEnergy) / 50 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* === COMPARISON INFO PANEL (Bottom) === */}
      <group position={[0, -2.5, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[6, 0.8]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.85} />
        </mesh>

        {/* Comparison bars */}
        <group position={[-1.5, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[2.5, 0.15, 0.05]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh
            position={[
              -1.1 + (data.exothermicTemp / 500) * 2.2,
              0,
              0.03
            ]}
          >
            <boxGeometry args={[(data.exothermicTemp / 500) * 2.2, 0.1, 0.03]} />
            <meshStandardMaterial
              color={exoTempColor.color}
              emissive={exoTempColor.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        <group position={[1.5, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[2.5, 0.15, 0.05]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh
            position={[
              -1.1 + (data.endothermicTemp / 500) * 2.2,
              0,
              0.03
            ]}
          >
            <boxGeometry args={[(data.endothermicTemp / 500) * 2.2, 0.1, 0.03]} />
            <meshStandardMaterial
              color={endoTempColor.color}
              emissive={endoTempColor.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Labels */}
        <Text position={[-1.5, -0.2, 0.01]} fontSize={0.08} color="#ef4444" anchorX="center">
          Exothermic: ΔH = -{energyReleased} kJ/mol
        </Text>
        <Text position={[1.5, -0.2, 0.01]} fontSize={0.08} color="#3b82f6" anchorX="center">
          Endothermic: ΔH = +{energyReleased} kJ/mol
        </Text>
      </group>

      {/* Progress bar */}
      <group position={[0, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[4, 0.15, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-2 + progress * 4, 0, 0.03]}>
          <boxGeometry args={[progress * 4, 0.1, 0.03]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <gridHelper args={[14, 28, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default ThermochemistrySceneComponent;
