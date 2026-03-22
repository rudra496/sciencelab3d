'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export interface AcidBaseReactionsData {
  pH: number;
  temperature: number;
  reactionProgress: number;
  productsFormed: number;
  currentStep: number;
}

export interface AcidBaseReactionsSceneProps {
  acidConcentration: number;
  baseConcentration: number;
  acidType: 'HCl' | 'H2SO4' | 'HNO3';
  isPlaying: boolean;
  stepMode: boolean;
  currentStep: number;
  onDataChange?: (data: AcidBaseReactionsData) => void;
}

interface Molecule {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'H_plus' | 'OH_minus' | 'Na_plus' | 'Cl_minus' | 'H2O' | 'NaCl';
  active: boolean;
}

const PH_COLORS = [
  { ph: 1, color: new THREE.Color('#ff0000') },    // Red
  { ph: 3, color: new THREE.Color('#ff8800') },    // Orange
  { ph: 5, color: new THREE.Color('#ffff00') },    // Yellow
  { ph: 7, color: new THREE.Color('#00ff00') },    // Green
  { ph: 9, color: new THREE.Color('#00ffff') },    // Cyan
  { ph: 11, color: new THREE.Color('#0000ff') },   // Blue
  { ph: 14, color: new THREE.Color('#8000ff') },   // Purple
];

export function AcidBaseReactionsSceneComponent({
  acidConcentration,
  baseConcentration,
  acidType,
  isPlaying,
  stepMode,
  currentStep,
  onDataChange,
}: AcidBaseReactionsSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics refs - updated every frame
  const physicsRef = useRef({
    molecules: [] as Molecule[],
    pourProgress: 0,
    reactionProgress: 0,
    productsFormed: 0,
    temperature: 298,
    frameCount: 0,
    pH: 1,
  });

  const [data, setData] = useState<AcidBaseReactionsData>({
    pH: 1,
    temperature: 298,
    reactionProgress: 0,
    productsFormed: 0,
    currentStep: 1,
  });

  // Get pH color
  const getPHColor = (pH: number) => {
    for (let i = 0; i < PH_COLORS.length - 1; i++) {
      if (pH >= PH_COLORS[i].ph && pH <= PH_COLORS[i + 1].ph) {
        const t = (pH - PH_COLORS[i].ph) / (PH_COLORS[i + 1].ph - PH_COLORS[i].ph);
        return PH_COLORS[i].color.clone().lerp(PH_COLORS[i + 1].color, t);
      }
    }
    return new THREE.Color('#ff0000');
  };

  // Initialize molecules
  useEffect(() => {
    const mols: Molecule[] = [];
    const acidCount = Math.floor(acidConcentration * 20);
    const baseCount = Math.floor(baseConcentration * 20);

    // Acid beaker molecules (left side)
    for (let i = 0; i < acidCount; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5 - 1.5,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        type: 'H_plus',
        active: true,
      });
      if (acidType === 'HCl') {
        mols.push({
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 1.5 - 1.5,
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
          type: 'Cl_minus',
          active: true,
        });
      }
    }

    // Base beaker molecules (right side)
    for (let i = 0; i < baseCount; i++) {
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5 + 1.5,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        type: 'OH_minus',
        active: true,
      });
      mols.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5 + 1.5,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        type: 'Na_plus',
        active: true,
      });
    }

    physicsRef.current.molecules = mols;
    physicsRef.current.pourProgress = 0;
    physicsRef.current.reactionProgress = 0;
    physicsRef.current.productsFormed = 0;
    physicsRef.current.temperature = 298;
    physicsRef.current.pH = acidConcentration > baseConcentration ? 1 : 13;
  }, [acidConcentration, baseConcentration, acidType]);

  useFrame(() => {
    if (!groupRef.current || !isPlaying) return;

    const physics = physicsRef.current;

    // Step mode logic
    if (stepMode) {
      if (currentStep === 1) {
        // Show reactants only
      } else if (currentStep === 2) {
        // Pour animation
        physics.pourProgress = Math.min(physics.pourProgress + 0.02, 1);
      } else if (currentStep === 3) {
        // Reaction happens
        physics.pourProgress = 1;
      } else if (currentStep === 4) {
        // Products formed
        physics.pourProgress = 1;
        physics.reactionProgress = 1;
      } else if (currentStep === 5) {
        // Show balanced equation
        physics.pourProgress = 1;
        physics.reactionProgress = 1;
      }
    } else {
      // Auto mode
      if (physics.pourProgress < 1) {
        physics.pourProgress = Math.min(physics.pourProgress + 0.01, 1);
      } else if (physics.reactionProgress < 1) {
        physics.reactionProgress = Math.min(physics.reactionProgress + 0.005, 1);
      }
    }

    // Update molecule physics
    const mols = physics.molecules;
    let reactionsThisFrame = 0;

    for (const mol of mols) {
      if (!mol.active) continue;

      // Brownian motion
      mol.velocity.x += (Math.random() - 0.5) * 0.002;
      mol.velocity.y += (Math.random() - 0.5) * 0.002;
      mol.velocity.z += (Math.random() - 0.5) * 0.002;

      // Clamp velocity
      const maxSpeed = 0.03;
      if (mol.velocity.length() > maxSpeed) {
        mol.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Update position
      mol.position.add(mol.velocity);

      // Pour animation: move base molecules toward acid beaker
      if (physics.pourProgress < 1 && (mol.type === 'OH_minus' || mol.type === 'Na_plus')) {
        const targetX = -0.5;
        mol.position.x += (targetX - mol.position.x) * 0.05;
      }

      // Boundary collisions (confine to beaker area after mixing)
      if (physics.pourProgress >= 1) {
        if (Math.abs(mol.position.x + 0.5) > 1.2) mol.velocity.x *= -1;
        if (Math.abs(mol.position.y) > 1) mol.velocity.y *= -1;
        if (Math.abs(mol.position.z) > 1.2) mol.velocity.z *= -1;
      }

      // Reaction: H+ + OH- -> H2O
      if (physics.pourProgress >= 1 && physics.reactionProgress < 1) {
        if (mol.type === 'H_plus') {
          for (const other of mols) {
            if (!other.active || other === mol) continue;
            if (other.type === 'OH_minus') {
              const dist = mol.position.distanceTo(other.position);
              if (dist < 0.2) {
                mol.type = 'H2O';
                other.type = 'NaCl';
                mol.active = true;
                other.active = true;
                physics.productsFormed++;
                physics.temperature += 0.5;
                reactionsThisFrame++;
              }
            }
          }
        }
      }
    }

    // Calculate pH based on reaction progress
    const initialPH = acidConcentration > baseConcentration ? 1 : 13;
    const targetPH = 7;
    const currentPH = initialPH + (targetPH - initialPH) * physics.reactionProgress;
    physics.pH = currentPH;

    // Update state every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const newData: AcidBaseReactionsData = {
        pH: currentPH,
        temperature: physics.temperature,
        reactionProgress: physics.reactionProgress,
        productsFormed: physics.productsFormed,
        currentStep: stepMode ? currentStep : Math.floor(physics.reactionProgress * 5) + 1,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  const currentPHColor = getPHColor(physicsRef.current.pH);

  // Molecule positions for rendering
  const moleculePositions = useMemo(() => {
    return physicsRef.current.molecules.map((mol, i) => ({
      position: mol.position.clone(),
      type: mol.type,
      active: mol.active,
    }));
  }, [data]);

  // Pour stream line
  const pourStreamLine = useMemo(() => {
    if (physicsRef.current.pourProgress >= 1) return [];
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push([
        1.5 - t * 2 + (Math.random() - 0.5) * 0.2,
        1 + t * 2.5,
        (Math.random() - 0.5) * 0.2,
      ]);
    }
    return points;
  }, [data.pH]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6366f1" />

      <group ref={groupRef}>
        {/* Acid Beaker (left) */}
        <mesh position={[-1.5, 0, 0]}>
          <cylinderGeometry args={[1, 1, 2.5, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#ff4444"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-1.5, -1.25, 0]}>
          <cylinderGeometry args={[1, 1, 0.1, 32]} />
          <meshPhysicalMaterial
            color="#ff4444"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        {/* Acid liquid */}
        <mesh position={[-1.5, -0.3, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.6, 32, 1, true]} />
          <meshStandardMaterial
            color={currentPHColor}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Base Beaker (right) */}
        <mesh position={[1.5, 0, 0]}>
          <cylinderGeometry args={[1, 1, 2.5, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#4444ff"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[1.5, -1.25, 0]}>
          <cylinderGeometry args={[1, 1, 0.1, 32]} />
          <meshPhysicalMaterial
            color="#4444ff"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        {/* Base liquid */}
        <mesh position={[1.5, -0.3, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.6, 32, 1, true]} />
          <meshStandardMaterial
            color="#4444ff"
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Labels */}
        <mesh position={[-1.5, 1.8, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.05]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
        <mesh position={[1.5, 1.8, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.05]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>

        {/* Pour stream */}
        {physicsRef.current.pourProgress < 1 && (
          <Line
            points={pourStreamLine}
            color="#4444ff"
            lineWidth={3}
            opacity={0.6}
            transparent
          />
        )}

        {/* Molecules */}
        {moleculePositions.map((mol, i) => (
          mol.active && (
            <group key={i} position={mol.position}>
              <mesh>
                <sphereGeometry args={[
                  mol.type === 'H2O' || mol.type === 'NaCl' ? 0.08 : 0.06,
                  12, 12
                ]} />
                <meshStandardMaterial
                  color={
                    mol.type === 'H_plus' ? '#ff0000' :
                    mol.type === 'OH_minus' ? '#0000ff' :
                    mol.type === 'Na_plus' ? '#8888ff' :
                    mol.type === 'Cl_minus' ? '#ff8888' :
                    mol.type === 'H2O' ? '#00ff00' :
                    '#00aa00'
                  }
                  emissive={
                    mol.type === 'H_plus' ? '#ff0000' :
                    mol.type === 'OH_minus' ? '#0000ff' :
                    mol.type === 'H2O' ? '#00ff00' :
                    '#00aa00'
                  }
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          )
        ))}

        {/* pH Indicator Bar */}
        <group position={[3, 0, 0]}>
          {/* Background */}
          <mesh>
            <boxGeometry args={[0.4, 3, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          {/* pH gradient fill */}
          <mesh position={[0, (data.pH - 7) * 0.2, 0.06]}>
            <boxGeometry args={[0.3, data.pH * 0.2, 0.05]} />
            <meshStandardMaterial
              color={currentPHColor}
              emissive={currentPHColor}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Current pH marker */}
          <mesh position={[0, (data.pH - 7) * 0.2, 0.1]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
            />
          </mesh>
          {/* Scale markers */}
          {[0, 4, -4].map((y, i) => (
            <mesh key={i} position={[0.2, y * 0.2, 0.07]}>
              <boxGeometry args={[0.05, 0.03, 0.02]} />
              <meshBasicMaterial color="#666" />
            </mesh>
          ))}
        </group>

        {/* Thermometer */}
        <group position={[-3, 0, 0]}>
          {/* Thermometer body */}
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 3, 16]} />
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Temperature fill */}
          <mesh position={[0, ((data.temperature - 273) / 50) * 1.2 - 0.6, 0]}>
            <cylinderGeometry args={[0.06, 0.06, ((data.temperature - 273) / 50) * 2.4, 16]} />
            <meshStandardMaterial
              color={data.temperature > 320 ? '#ff0000' : data.temperature < 290 ? '#0000ff' : '#00ff00'}
              emissive={data.temperature > 320 ? '#ff0000' : data.temperature < 290 ? '#0000ff' : '#00ff00'}
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, -1.6, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={data.temperature > 320 ? '#ff0000' : data.temperature < 290 ? '#0000ff' : '#00ff00'}
              emissive={data.temperature > 320 ? '#ff0000' : data.temperature < 290 ? '#0000ff' : '#00ff00'}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* Reaction progress bar */}
        <group position={[0, 2.5, 0]}>
          <mesh>
            <boxGeometry args={[4, 0.2, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[-2 + data.reactionProgress * 4, 0, 0.06]}>
            <boxGeometry args={[data.reactionProgress * 4, 0.15, 0.05]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Balanced equation display */}
        {data.currentStep === 5 && (
          <group position={[0, -2, 2]}>
            <mesh>
              <boxGeometry args={[3, 0.4, 0.1]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
          </group>
        )}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}

export default AcidBaseReactionsSceneComponent;
