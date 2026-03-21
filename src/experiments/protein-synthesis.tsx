"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function ProteinSynthesisScene() {
  const sceneRef = useRef<THREE.Group>(null);
  const ribosomeRef = useRef<THREE.Mesh>(null);

  const { phase, translationProgress, showTRNA, rotationSpeed } = useControls("Protein Synthesis", {
    phase: {
      value: "translation",
      options: ["transcription", "translation"],
      label: "Phase"
    },
    translationProgress: { value: 0, min: 0, max: 1, step: 0.01, label: "Translation Progress" },
    showTRNA: { value: true, label: "Show tRNA" },
    rotationSpeed: { value: 0.2, min: 0, max: 0.5, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!sceneRef.current) return;
    sceneRef.current.rotation.y += delta * rotationSpeed;
  });

  // Codon to amino acid mapping
  const codons = [
    { sequence: ["AUG", "UUU", "CGA", "AAU"], aminoAcids: ["Met", "Phe", "Arg", "Asn"] },
  ];

  const aminoAcidColors: Record<string, string> = {
    Met: "#ff6b35",
    Phe: "#4f8fff",
    Arg: "#06d6a0",
    Asn: "#8b5cf6",
  };

  return (
    <>
      <group ref={sceneRef}>
        {phase === "transcription" ? (
          <>
            {/* DNA double helix */}
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = i * 0.3;
              const y = (i - 15) * 0.3;
              const r = 0.4;
              return (
                <group key={i}>
                  <mesh position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#4f8fff" />
                  </mesh>
                  <mesh position={[Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#8b5cf6" />
                  </mesh>
                </group>
              );
            })}

            {/* RNA Polymerase */}
            <mesh position={[0, 0, 0.6]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshStandardMaterial
                color="#ff6347"
                emissive="#ff6347"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* mRNA strand being transcribed */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[0.5, (i - 4) * 0.4, 0.8]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                  color="#ffcc00"
                  emissive="#ffcc00"
                  emissiveIntensity={0.4}
                />
              </mesh>
            ))}

            {/* Nucleus boundary */}
            <mesh scale={[2.5, 2, 2.5]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial
                color="#9370db"
                transparent
                opacity={0.1}
                wireframe
              />
            </mesh>
          </>
        ) : (
          <>
            {/* Ribosome (large and small subunits) */}
            <mesh ref={ribosomeRef} position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#06d6a0"
                emissive="#06d6a0"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0, 0, -0.6]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshStandardMaterial
                color="#06d6a0"
                emissive="#06d6a0"
                emissiveIntensity={0.2}
              />
            </mesh>

            {/* mRNA strand passing through ribosome */}
            {Array.from({ length: 12 }).map((_, i) => {
              const x = (i - 6) * 0.4;
              const isInRibosome = i >= 4 && i <= 7;
              return (
                <mesh key={i} position={[x, 0, isInRibosome ? 0 : 0.4]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial
                    color="#ffcc00"
                    emissive="#ffcc00"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              );
            })}

            {/* tRNA molecules with amino acids */}
            {showTRNA && codons[0].aminoAcids.map((aa, i) => {
              const isActive = i <= Math.floor(translationProgress * 4);
              const yPos = (i - 1.5) * 0.5;
              return (
                <group key={i} position={[yPos, 0, 0]}>
                  {/* tRNA */}
                  <mesh position={[0, 0.3, 0]}>
                    <coneGeometry args={[0.12, 0.3, 8]} />
                    <meshStandardMaterial
                      color="#ec4899"
                      emissive="#ec4899"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                  {/* Amino acid */}
                  {isActive && (
                    <mesh position={[0, 0.55, 0]}>
                      <sphereGeometry args={[0.1, 16, 16]} />
                      <meshStandardMaterial
                        color={aminoAcidColors[aa]}
                        emissive={aminoAcidColors[aa]}
                        emissiveIntensity={0.4}
                      />
                    </mesh>
                  )}
                </group>
              );
            })}

            {/* Growing polypeptide chain */}
            {translationProgress > 0 && (
              <>
                {codons[0].aminoAcids.slice(0, Math.ceil(translationProgress * 4)).map((aa, i) => (
                  <mesh key={i} position={[0, 0.7 + i * 0.2, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial
                      color={aminoAcidColors[aa]}
                      emissive={aminoAcidColors[aa]}
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                ))}
              </>
            )}

            {/* Exit tunnel visualization */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
              <meshStandardMaterial
                color="#06d6a0"
                transparent
                opacity={0.3}
              />
            </mesh>
          </>
        )}
      </group>

      {/* Labels */}
      <mesh position={[3, 2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={phase === "transcription" ? "#ff6347" : "#06d6a0"} />
      </mesh>
      <mesh position={[3, 1.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      {phase === "translation" && showTRNA && (
        <mesh position={[3, 1, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      )}
      <mesh position={[3, 0.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      {/* Amino acid legend */}
      <mesh position={[-3, 2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-2.5, 2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-2, 2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -2.5, 0]} />
    </>
  );
}
