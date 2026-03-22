'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export interface ThermochemistryData {
  reactantEnergy: number;
  activationEnergy: number;
  productEnergy: number;
  netEnergyChange: number;
  temperatureChange: number;
  progress: number;
  currentStep: number;
}

export interface ThermochemistrySceneProps {
  reactionType: 'exothermic' | 'endothermic';
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
  energy: number;
  reacting: boolean;
}

export function ThermochemistrySceneComponent({
  reactionType,
  activationEnergy,
  energyReleased,
  isPlaying,
  stepMode,
  currentStep,
  onProgressChange,
  onDataChange,
}: ThermochemistrySceneProps) {
  const reactionRef = useRef<THREE.Group>(null);
  const heatWavesRef = useRef<THREE.Group>(null);

  // Physics refs
  const physicsRef = useRef({
    progress: 0,
    frameCount: 0,
    molecules: [] as Molecule[],
    temperature: 298,
    heatWavePhase: 0,
  });

  const [data, setData] = useState<ThermochemistryData>({
    reactantEnergy: 80,
    activationEnergy: 50,
    productEnergy: 40,
    netEnergyChange: -40,
    temperatureChange: 0,
    progress: 0,
    currentStep: 1,
  });

  // Initialize molecules
  useEffect(() => {
    const mols: Molecule[] = [];
    for (let i = 0; i < 10; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        energy: reactionType === 'exothermic' ? 1 : 0.3,
        reacting: false,
      });
    }
    physicsRef.current.molecules = mols;
    physicsRef.current.temperature = 298;
  }, [reactionType, activationEnergy, energyReleased]);

  // Calculate energy levels
  const reactantEnergy = reactionType === 'exothermic' ? 80 : 40;
  const productEnergy = reactionType === 'exothermic' ? reactantEnergy - energyReleased : reactantEnergy + energyReleased;
  const transitionStateEnergy = reactantEnergy + activationEnergy;
  const netEnergyChange = productEnergy - reactantEnergy;
  const temperatureChange = reactionType === 'exothermic' ? energyReleased * 0.5 : -energyReleased * 0.3;

  // Energy diagram points
  const energyCurvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 50;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 8 - 4;
      let y: number;

      if (x < -2) {
        y = reactantEnergy;
      } else if (x > 2) {
        y = productEnergy;
      } else {
        // Smooth transition over the activation barrier
        const t = (x + 2) / 4;
        const base = reactantEnergy + (productEnergy - reactantEnergy) * t;
        const barrier = Math.sin(t * Math.PI) * activationEnergy;
        y = base + barrier;
      }

      points.push([x, y / 40 - 1, 0]);
    }

    return points;
  }, [reactantEnergy, productEnergy, activationEnergy]);

  // Energy level indicator positions
  const energyIndicators = useMemo(() => ({
    reactant: { x: -3.5, y: reactantEnergy / 40 - 1 },
    transition: { x: 0, y: transitionStateEnergy / 40 - 1 },
    product: { x: 3.5, y: productEnergy / 40 - 1 },
  }), [reactantEnergy, transitionStateEnergy, productEnergy]);

  useFrame((_, delta) => {
    if (!reactionRef.current || !isPlaying) return;

    const physics = physicsRef.current;

    // Step mode logic
    if (stepMode) {
      switch (currentStep) {
        case 1: // Reactants
          physics.progress = 0;
          break;
        case 2: // Activation energy
          physics.progress = 0.25;
          break;
        case 3: // Transition state
          physics.progress = 0.5;
          break;
        case 4: // Products
          physics.progress = 0.75;
          break;
        case 5: // Energy released/absorbed
          physics.progress = 1;
          break;
      }
    } else {
      // Auto mode
      if (physics.progress < 1) {
        physics.progress = Math.min(physics.progress + delta * 0.2, 1);
      }
    }

    // Update molecule physics
    const mols = physics.molecules;
    const energyMultiplier = reactionType === 'exothermic'
      ? 1 + (1 - physics.progress) * 2  // High to low energy
      : 0.3 + physics.progress * 1.5;   // Low to high energy

    for (const mol of mols) {
      // Thermal motion based on energy
      const speed = 0.02 * energyMultiplier;
      mol.velocity.x += (Math.random() - 0.5) * speed;
      mol.velocity.y += (Math.random() - 0.5) * speed;
      mol.velocity.z += (Math.random() - 0.5) * speed;

      // Clamp velocity
      const maxSpeed = 0.05 * energyMultiplier;
      if (mol.velocity.length() > maxSpeed) {
        mol.velocity.normalize().multiplyScalar(maxSpeed);
      }

      mol.position.add(mol.velocity.clone().multiplyScalar(delta * 60));

      // Boundary collisions
      if (Math.abs(mol.position.x) > 2) mol.velocity.x *= -1;
      if (Math.abs(mol.position.y) > 1.5) mol.velocity.y *= -1;
      if (Math.abs(mol.position.z) > 1.5) mol.velocity.z *= -1;
    }

    // Update temperature
    physics.temperature = 298 + temperatureChange * physics.progress;
    physics.heatWavePhase += delta * 3;

    // Update state every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      onProgressChange?.(physics.progress);

      const newData: ThermochemistryData = {
        reactantEnergy,
        activationEnergy,
        productEnergy,
        netEnergyChange,
        temperatureChange: temperatureChange * physics.progress,
        progress: physics.progress,
        currentStep: stepMode ? currentStep : Math.floor(physics.progress * 5) + 1,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  const progress = physicsRef.current.progress;

  // Heat waves for exothermic
  const heatWaves = useMemo(() => {
    if (reactionType !== 'exothermic' || progress < 0.5) return [];
    const waves: [number, number, number][] = [];
    const phase = physicsRef.current.heatWavePhase;
    for (let i = 0; i < 5; i++) {
      const radius = 1 + (i + phase % 1) * 0.5;
      waves.push([Math.cos(radius) * 2, Math.sin(radius) * 2, 0]);
    }
    return waves;
  }, [data, reactionType]);

  // Cold waves for endothermic
  const coldWaves = useMemo(() => {
    if (reactionType !== 'endothermic' || progress < 0.5) return [];
    const waves: [number, number, number][] = [];
    const phase = physicsRef.current.heatWavePhase;
    for (let i = 0; i < 3; i++) {
      const t = (i + phase % 1) * 0.3;
      waves.push([-2 + t, 0, 0]);
      waves.push([-2 + t + 0.2, 0, 0]);
    }
    return waves;
  }, [data, reactionType]);

  // Get molecule color based on reaction type and progress
  const getMoleculeColor = () => {
    if (reactionType === 'exothermic') {
      // Glowing high energy -> lower energy
      return progress < 0.5 ? '#ff6b35' : '#06d6a0';
    } else {
      // Low energy -> higher energy
      return progress < 0.5 ? '#3b82f6' : '#ff6b35';
    }
  };

  const moleculeColor = getMoleculeColor();

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      {/* Energy diagram */}
      <group position={[0, -1.5, -3]}>
        {/* Axes */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[9, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.05, 2.5, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Energy curve */}
        <Line
          points={energyCurvePoints}
          color="#ffffff"
          lineWidth={3}
          opacity={0.9}
        />

        {/* Energy level indicators */}
        <mesh position={[energyIndicators.reactant.x, energyIndicators.reactant.y, 0.1]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        <mesh position={[energyIndicators.transition.x, energyIndicators.transition.y, 0.1]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[energyIndicators.product.x, energyIndicators.product.y, 0.1]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>

        {/* Progress indicator on curve */}
        {progress > 0 && (
          <mesh
            position={[
              (progress - 0.5) * 8,
              energyCurvePoints[Math.floor(progress * 50)]?.[1] || 0,
              0.2
            ]}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#ec4899"
              emissiveIntensity={0.8}
            />
          </mesh>
        )}

        {/* Labels */}
        <mesh position={[-3.5, -0.8, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.02]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        <mesh position={[3.5, -0.8, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.02]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>
      </group>

      {/* Molecular visualization */}
      <group ref={reactionRef} position={[0, 2, 0]}>
        {/* Reactant molecules (A and B) */}
        {progress < 0.6 && (
          <>
            {/* Molecule A */}
            <mesh
              position={[-0.4 - progress * 0.5, 0, 0]}
              scale={[1 + progress * 0.5, 1 + progress * 0.5, 1 + progress * 0.5]}
            >
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={reactionType === 'exothermic' ? 0.6 : 0.2}
              />
            </mesh>
            {/* Molecule B */}
            <mesh
              position={[0.4 + progress * 0.5, 0, 0]}
              scale={[1 + progress * 0.5, 1 + progress * 0.5, 1 + progress * 0.5]}
            >
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={reactionType === 'exothermic' ? 0.6 : 0.2}
              />
            </mesh>
          </>
        )}

        {/* Product molecule (AB) */}
        {progress >= 0.4 && (
          <mesh
            position={[0, 0, 0]}
            scale={[progress * 1.5, progress * 1.5, progress * 1.5]}
          >
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
              color={moleculeColor}
              emissive={moleculeColor}
              emissiveIntensity={reactionType === 'exothermic' ? 0.3 - progress * 0.2 : progress * 0.5}
            />
          </mesh>
        )}
      </group>

      {/* Heat waves for exothermic */}
      {reactionType === 'exothermic' && progress > 0.5 && (
        <group>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh
              key={i}
              position={[2 + (progress - 0.5) * 2, 0, 0]}
              scale={[(progress - 0.5) * 3 + i * 0.5, (progress - 0.5) * 3 + i * 0.5, 1]}
            >
              <ringGeometry args={[0.3 + i * 0.2, 0.35 + i * 0.2, 32]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.5}
                transparent
                opacity={1 - (progress - 0.5) * 2}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Cold waves for endothermic */}
      {reactionType === 'endothermic' && progress > 0.3 && (
        <group>
          {Array.from({ length: 4 }).map((_, i) => {
            const waveProgress = (progress - 0.3 + i * 0.2) % 1;
            return (
              <mesh
                key={i}
                position={[-2 + waveProgress * 4, 0, 0]}
                scale={[waveProgress * 2, waveProgress * 2, 1]}
              >
                <ringGeometry args={[0.2, 0.25, 32]} />
                <meshStandardMaterial
                  color="#4f8fff"
                  emissive="#4f8fff"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={1 - waveProgress}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Temperature indicator */}
      <group position={[-3, 2, 0]}>
        {/* Thermometer body */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 16]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Temperature fill */}
        <mesh position={[0, ((data.temperatureChange || 0) / 50) * 1 - 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, Math.abs((data.temperatureChange || 0) / 50) * 2, 16]} />
          <meshStandardMaterial
            color={data.temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissive={data.temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* Bulb */}
        <mesh position={[0, -1.4, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={data.temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissive={data.temperatureChange > 0 ? '#ef4444' : '#3b82f6'}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Progress bar */}
      <group position={[0, 3.5, 0]}>
        <mesh>
          <boxGeometry args={[4, 0.2, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-2 + progress * 4, 0, 0.06]}>
          <boxGeometry args={[progress * 4, 0.15, 0.05]} />
          <meshStandardMaterial
            color={reactionType === 'exothermic' ? '#ef4444' : '#3b82f6'}
            emissive={reactionType === 'exothermic' ? '#ef4444' : '#3b82f6'}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}

export default ThermochemistrySceneComponent;
