"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

export default function ThermochemistryScene() {
  const reactionRef = useRef<THREE.Group>(null);
  const energyDiagramRef = useRef<THREE.Group>(null);

  const { reactionType, activationEnergy, enthalpyChange } = useControls("Reaction", {
    reactionType: {
      value: "exothermic",
      options: ["exothermic", "endothermic"],
      label: "Reaction Type"
    },
    activationEnergy: { value: 50, min: 20, max: 100, step: 5, label: "Activation Energy (kJ/mol)" },
    enthalpyChange: { value: 40, min: 10, max: 80, step: 5, label: "Enthalpy Change (kJ/mol)" },
    startReaction: button(() => setAnimating(true)),
    reset: button(() => { setAnimating(false); setProgress(0); }),
  });

  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    if (!reactionRef.current) return;

    if (animating && progress < 1) {
      setProgress(p => Math.min(p + delta * 0.3, 1));
    }

    // Rotate molecules
    reactionRef.current.rotation.y += delta * 0.2;
  });

  // Calculate energy levels
  const reactantEnergy = reactionType === "exothermic" ? 80 : 20;
  const productEnergy = reactionType === "exothermic" ? reactantEnergy - enthalpyChange : reactantEnergy + enthalpyChange;
  const transitionStateEnergy = reactantEnergy + activationEnergy;

  // Energy diagram points
  const energyCurve = useMemo(() => {
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

  // Molecule visualization
  const getMoleculeScale = () => {
    if (progress < 0.3) return 1;
    if (progress < 0.5) return 1 + (progress - 0.3) * 2; // Expand at transition state
    if (progress < 0.7) return 1.4 - (progress - 0.5) * 2; // Contract to products
    return 1;
  };

  const moleculeScale = getMoleculeScale();

  return (
    <>
      {/* Energy diagram */}
      <group ref={energyDiagramRef} position={[0, -2, -2]}>
        {/* Axes */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[9, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.05, 2.5, 0.05]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Energy curve */}
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(energyCurve.map(p => new THREE.Vector3(...p))), 64, 0.05, 8, false]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Energy level indicators */}
        <mesh position={[-3.5, reactantEnergy / 40 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        <mesh position={[0, transitionStateEnergy / 40 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
        <mesh position={[3.5, productEnergy / 40 - 1, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>

        {/* Labels */}
        <mesh position={[-3.5, reactantEnergy / 40 - 0.6, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff6b35" />
        </mesh>
        <mesh position={[0, transitionStateEnergy / 40 + 0.4, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
        <mesh position={[3.5, productEnergy / 40 - 0.6, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>

        {/* Progress indicator on curve */}
        {animating && (
          <mesh position={[(progress - 0.5) * 8, energyCurve[Math.floor(progress * 50)]?.[1] || 0, 0.2]}>
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
            <mesh position={[-0.5, 0, 0]} scale={[moleculeScale, moleculeScale, moleculeScale]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.5, 0, 0]} scale={[moleculeScale, moleculeScale, moleculeScale]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Bond */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
              <meshStandardMaterial color="#b8860b" />
            </mesh>
          </>
        )}

        {/* Transition state (bonds breaking/forming) */}
        {progress >= 0.3 && progress < 0.7 && (
          <>
            <mesh position={[-0.5 - (progress - 0.3), 0, 0]} scale={[moleculeScale, moleculeScale, moleculeScale]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.5 + (progress - 0.3), 0, 0]} scale={[moleculeScale, moleculeScale, moleculeScale]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial
                color="#4f8fff"
                emissive="#4f8fff"
                emissiveIntensity={0.3}
              />
            </mesh>
          </>
        )}

        {/* Products */}
        {progress >= 0.5 && (
          <mesh position={[0, 0, 0]} scale={[2 - moleculeScale, 2 - moleculeScale, 2 - moleculeScale]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>

      {/* Heat indicator */}
      {reactionType === "exothermic" && progress > 0.7 && (
        <mesh position={[2, 1.5, 0]}>
          <sphereGeometry args={[0.2 + progress * 0.3, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.8}
            transparent
            opacity={1 - progress}
          />
        </mesh>
      )}

      {reactionType === "endothermic" && progress > 0.7 && (
        <mesh position={[2, 1.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#4f8fff"
            emissive="#4f8fff"
            emissiveIntensity={0.5}
            transparent
            opacity={progress}
          />
        </mesh>
      )}

      {/* Temperature change indicator */}
      <mesh position={[-2.5, 1.5, 0]}>
        <boxGeometry args={[0.1, 0.5 + (reactionType === "exothermic" ? 1 : -1) * progress * 0.5, 0.1]} />
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
