"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface ThermochemistryData {
  reactantEnergy: number;
  productEnergy: number;
  transitionStateEnergy: number;
  progress: number;
  isAnimating: boolean;
  temperatureChange: number;
}

export interface ThermochemistrySceneProps {
  reactionType: "exothermic" | "endothermic";
  activationEnergy: number;
  enthalpyChange: number;
  isAnimating: boolean;
  onProgressChange?: (progress: number) => void;
  onDataChange?: (data: ThermochemistryData) => void;
}

/**
 * Thermochemistry scene component - Performance optimized
 * Visualizes exothermic and endothermic reactions with energy diagrams
 */
export function ThermochemistrySceneComponent({
  reactionType,
  activationEnergy,
  enthalpyChange,
  isAnimating,
  onProgressChange,
  onDataChange
}: ThermochemistrySceneProps) {
  const reactionRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const progressRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<ThermochemistryData>({
    reactantEnergy: 80,
    productEnergy: 40,
    transitionStateEnergy: 130,
    progress: 0,
    isAnimating: false,
    temperatureChange: 0,
  });

  // Calculate energy levels
  const reactantEnergy = reactionType === "exothermic" ? 80 : 20;
  const productEnergy = reactionType === "exothermic" ? reactantEnergy - enthalpyChange : reactantEnergy + enthalpyChange;
  const transitionStateEnergy = reactantEnergy + activationEnergy;
  const temperatureChange = reactionType === "exothermic" ? enthalpyChange : -enthalpyChange;

  // Energy diagram points using useMemo
  const energyCurvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 50;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 8 - 4;
      let y: number;

      if (x < -1) {
        y = reactantEnergy;
      } else if (x > 1) {
        y = productEnergy;
      } else {
        // Smooth transition over the activation barrier
        const t = (x + 1) / 2;
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

  // Molecule scale calculation
  const getMoleculeScale = (progress: number) => {
    if (progress < 0.3) return 1;
    if (progress < 0.5) return 1 + (progress - 0.3) * 2;
    if (progress < 0.7) return 1.4 - (progress - 0.5) * 2;
    return 1;
  };

  useFrame((_, delta) => {
    if (!reactionRef.current) return;

    // Animate progress
    if (isAnimating && progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta * 0.3, 1);
    }

    // Rotate molecules
    reactionRef.current.rotation.y += delta * 0.2;

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      onProgressChange?.(progressRef.current);

      const newData: ThermochemistryData = {
        reactantEnergy,
        productEnergy,
        transitionStateEnergy,
        progress: progressRef.current,
        isAnimating,
        temperatureChange: temperatureChange * progressRef.current,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  const progress = progressRef.current;

  return (
    <>
      {/* Energy diagram */}
      <group position={[0, -2, -2]}>
        {/* Axes */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[9, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.05, 2.5, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Energy curve using Line from drei */}
        <Line
          points={energyCurvePoints}
          color="#ffffff"
          lineWidth={3}
          opacity={0.9}
        />

        {/* Energy level indicators */}
        <mesh position={[energyIndicators.reactant.x, energyIndicators.reactant.y, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        <mesh position={[energyIndicators.transition.x, energyIndicators.transition.y, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
        <mesh position={[energyIndicators.product.x, energyIndicators.product.y, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>

        {/* Progress indicator on curve */}
        {isAnimating && progress > 0 && (
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
      </group>

      {/* Molecular visualization */}
      <group ref={reactionRef} position={[0, 1.5, 0]}>
        {/* Reactants */}
        {progress < 0.5 && (
          <>
            <mesh position={[-0.5, 0, 0]} scale={[getMoleculeScale(progress), getMoleculeScale(progress), getMoleculeScale(progress)]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.5, 0, 0]} scale={[getMoleculeScale(progress), getMoleculeScale(progress), getMoleculeScale(progress)]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Bond using cylinder */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
              <meshStandardMaterial color="#b8860b" />
            </mesh>
          </>
        )}

        {/* Products */}
        {progress >= 0.5 && (
          <mesh position={[0, 0, 0]} scale={[2 - getMoleculeScale(progress), 2 - getMoleculeScale(progress), 2 - getMoleculeScale(progress)]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>

      {/* Heat indicator for exothermic */}
      {reactionType === "exothermic" && progress > 0.7 && (
        <mesh position={[2, 1.5, 0]}>
          <sphereGeometry args={[0.2 + progress * 0.3, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.8}
            transparent
            opacity={1 - progress * 0.3}
          />
        </mesh>
      )}

      {/* Cold indicator for endothermic */}
      {reactionType === "endothermic" && progress > 0.7 && (
        <mesh position={[2, 1.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#4f8fff"
            emissive="#4f8fff"
            emissiveIntensity={0.5}
            transparent
            opacity={progress * 0.8}
          />
        </mesh>
      )}

      {/* Temperature change indicator */}
      <mesh position={[-2.5, 1.5, 0]}>
        <boxGeometry args={[
          0.1,
          0.5 + (reactionType === "exothermic" ? 1 : -1) * progress * 0.5,
          0.1
        ]} />
        <meshStandardMaterial
          color={reactionType === "exothermic" ? "#ff6b35" : "#4f8fff"}
          emissive={reactionType === "exothermic" ? "#ff6b35" : "#4f8fff"}
          emissiveIntensity={0.3}
        />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}

export default ThermochemistrySceneComponent;
