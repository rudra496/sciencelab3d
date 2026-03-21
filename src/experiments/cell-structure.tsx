"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function CellStructureScene() {
  const cellRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);

  const { transparency, organelleScale, rotationSpeed } = useControls("Cell", {
    transparency: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Cell Transparency" },
    organelleScale: { value: 1, min: 0.5, max: 1.5, step: 0.05, label: "Organelle Scale" },
    rotationSpeed: { value: 0.2, min: 0, max: 0.5, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!cellRef.current) return;
    cellRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <>
      <group ref={cellRef}>
        {/* Cell membrane */}
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color="#ff69b4"
            transparent
            opacity={0.15 + transparency * 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Cytoplasm */}
        <mesh scale={0.95}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#ffb6c1"
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Nucleus */}
        <mesh ref={nucleusRef} position={[0, 0, 0]} scale={organelleScale}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#9370db"
            emissive="#9370db"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Nuclear envelope */}
        <mesh position={[0, 0, 0]} scale={organelleScale * 1.05}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial
            color="#4f8fff"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>

        {/* Nucleolus */}
        <mesh position={[0.1, 0.1, 0.1]} scale={organelleScale}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Mitochondria */}
        <mesh position={[0.8, 0.3, 0.5]} rotation={[0.5, 0.3, 0]} scale={organelleScale}>
          <capsuleGeometry args={[0.15, 0.5, 8, 16]} />
          <meshStandardMaterial
            color="#ff6347"
            emissive="#ff6347"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.8, -0.4, -0.3]} rotation={[0.3, 0.5, 0.2]} scale={organelleScale}>
          <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
          <meshStandardMaterial
            color="#ff6347"
            emissive="#ff6347"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Endoplasmic Reticulum (ER) */}
        <mesh position={[-0.5, 0.5, 0.3]} scale={organelleScale}>
          <torusGeometry args={[0.4, 0.05, 8, 32, Math.PI]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Golgi apparatus */}
        <mesh position={[-0.6, -0.5, 0]} rotation={[0.5, 0, 0]} scale={organelleScale}>
          <torusGeometry args={[0.3, 0.06, 8, 24]} />
          <meshStandardMaterial
            color="#06d6a0"
            emissive="#06d6a0"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[-0.6, -0.6, 0]} rotation={[0.5, 0, 0]} scale={organelleScale * 0.8}>
          <torusGeometry args={[0.25, 0.05, 8, 24]} />
          <meshStandardMaterial
            color="#06d6a0"
            emissive="#06d6a0"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Ribosomes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const theta = (i / 12) * Math.PI * 2;
          const r = 1.3;
          return (
            <mesh
              key={i}
              position={[Math.cos(theta) * r, Math.sin(theta) * r, (Math.random() - 0.5) * 0.5]}
              scale={organelleScale * 0.3}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color="#ffcc00"
                emissive="#ffcc00"
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}

        {/* Vacuole */}
        <mesh position={[0.5, -0.5, -0.5]} scale={organelleScale}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#4f8fff"
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Centrosomes */}
        <mesh position={[0.3, 0.8, 0]} rotation={[0, 0, Math.PI / 4]} scale={organelleScale}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, Math.PI / 4]} scale={organelleScale}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Labels */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#9370db" />
      </mesh>
      <mesh position={[0.8, 1, 0.8]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6347" />
      </mesh>
      <mesh position={[-1, 1, 0.5]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
