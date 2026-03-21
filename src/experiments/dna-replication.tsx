"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function DNAReplicationScene() {
  const dnaRef = useRef<THREE.Group>(null);

  const { replicationProgress, showEnzymes, rotationSpeed } = useControls("DNA Replication", {
    replicationProgress: { value: 0, min: 0, max: 1, step: 0.01, label: "Progress" },
    showEnzymes: { value: true, label: "Show Enzymes" },
    rotationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Rotation Speed" },
  });

  useFrame((_, delta) => {
    if (!dnaRef.current) return;
    dnaRef.current.rotation.y += delta * rotationSpeed;
  });

  // Generate DNA helix
  const { strands, basePairs } = useMemo(() => {
    const strandPoints: [number, number, number][][] = [[], []];
    const pairGeometry: Array<{ pos1: [number, number, number]; pos2: [number, number, number]; type: string }> = [];

    const turns = 6;
    const pointsPerTurn = 20;
    const totalPoints = turns * pointsPerTurn;
    const height = 8;
    const radius = 0.5;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      strandPoints[0].push([x1, y, z1]);
      strandPoints[1].push([x2, y, z2]);

      // Add base pairs every few points
      if (i % 3 === 0) {
        const types = ["AT", "GC", "TA", "CG"];
        pairGeometry.push({
          pos1: [x1, y, z1],
          pos2: [x2, y, z2],
          type: types[i % 4],
        });
      }
    }

    return { strands: strandPoints, basePairs: pairGeometry };
  }, []);

  return (
    <>
      <group ref={dnaRef}>
        {/* DNA Backbone - Original strands */}
        {strands[0].map((point, i) => (
          <mesh key={`s1-${i}`} position={point}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#4f8fff"
              emissive="#4f8fff"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
        {strands[1].map((point, i) => (
          <mesh key={`s2-${i}`} position={point}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Base pairs */}
        {basePairs.map((pair, i) => {
          const forkPosition = replicationProgress * basePairs.length;
          const isReplicated = i < forkPosition;

          return (
            <group key={i}>
              {/* Original base */}
              <mesh position={pair.pos1}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                <meshStandardMaterial
                  color={pair.type.includes("A") || pair.type.includes("T") ? "#ff6b35" : "#06d6a0"}
                />
              </mesh>

              {/* Unzipped visualization */}
              {!isReplicated && (
                <>
                  <mesh position={pair.pos2}>
                    <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                    <meshStandardMaterial
                      color={pair.type.includes("A") || pair.type.includes("T") ? "#ff6b35" : "#06d6a0"}
                    />
                  </mesh>
                  {/* Hydrogen bond */}
                  <mesh position={[
                    (pair.pos1[0] + pair.pos2[0]) / 2,
                    (pair.pos1[1] + pair.pos2[1]) / 2,
                    (pair.pos1[2] + pair.pos2[2]) / 2
                  ]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
                  </mesh>
                </>
              )}

              {/* New strands (after replication) */}
              {isReplicated && (
                <>
                  <mesh position={pair.pos1}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
                  </mesh>
                  <mesh position={pair.pos2}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
                  </mesh>
                </>
              )}
            </group>
          );
        })}

        {/* Helicase (unzipping enzyme) */}
        {showEnzymes && replicationProgress > 0 && replicationProgress < 1 && (
          <mesh position={[
            0,
            (replicationProgress - 0.5) * 8,
            0
          ]}>
            <coneGeometry args={[0.3, 0.5, 16]} />
            <meshStandardMaterial
              color="#ff6347"
              emissive="#ff6347"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}

        {/* DNA Polymerase */}
        {showEnzymes && replicationProgress > 0.1 && (
          <mesh position={[0.5, (replicationProgress - 0.5) * 8 - 0.5, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}
        {showEnzymes && replicationProgress > 0.1 && (
          <mesh position={[-0.5, (replicationProgress - 0.5) * 8 - 0.5, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#06d6a0"
              emissive="#06d6a0"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* Labels */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[2.5, -0.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[2.5, -1, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>

      {/* Enzyme labels */}
      {showEnzymes && replicationProgress > 0 && (
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff6347" />
        </mesh>
      )}
      {showEnzymes && replicationProgress > 0.1 && (
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#06d6a0" />
        </mesh>
      )}
      <mesh position={[1.5, -4, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[1.5, -4.5, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -5, 0]} />
    </>
  );
}
