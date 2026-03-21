"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import * as THREE from "three";

interface ImmuneCell {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "macrophage" | "tcell" | "bcell" | "antibody" | "virus";
  target?: THREE.Vector3;
  active: boolean;
}

export default function ImmuneResponseScene() {
  const cellsRef = useRef<THREE.InstancedMesh>(null);

  const { virusCount, immuneResponse, simulationSpeed, triggerInfection } = useControls("Immune System", {
    virusCount: { value: 15, min: 5, max: 30, step: 1, label: "Virus Count" },
    immuneResponse: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Immune Response" },
    simulationSpeed: { value: 1, min: 0.2, max: 2, step: 0.1, label: "Sim Speed" },
    reset: button(() => initializeImmuneSystem()),
    triggerInfection: { value: false, label: "Trigger Infection" },
  });

  const [cells, setCells] = useState<ImmuneCell[]>([]);
  const [infectionStarted, setInfectionStarted] = useState(false);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  function initializeImmuneSystem() {
    const c: ImmuneCell[] = [];

    // Add viruses
    for (let i = 0; i < virusCount; i++) {
      c.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        type: "virus",
        active: false,
      });
    }

    // Add macrophages
    for (let i = 0; i < 5; i++) {
      c.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        type: "macrophage",
        active: false,
      });
    }

    // Add T-cells
    for (let i = 0; i < 4; i++) {
      c.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25
        ),
        type: "tcell",
        active: false,
      });
    }

    // Add B-cells
    for (let i = 0; i < 3; i++) {
      c.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        type: "bcell",
        active: false,
      });
    }

    setCells(c);
    setInfectionStarted(false);
  }

  useMemo(() => {
    initializeImmuneSystem();
  }, [virusCount]);

  useFrame((_, delta) => {
    if (!cellsRef.current) return;
    const dt = Math.min(delta, 0.02) * simulationSpeed;

    setCells(prev => {
      const updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        const cell = updated[i];

        if (cell.type === "virus") {
          // Viruses move randomly and replicate
          if (infectionStarted) {
            cell.velocity.x += (Math.random() - 0.5) * 0.1;
            cell.velocity.y += (Math.random() - 0.5) * 0.1;
            cell.velocity.z += (Math.random() - 0.5) * 0.1;

            cell.position.add(cell.velocity.clone().multiplyScalar(dt));

            // Replicate
            if (Math.random() < 0.002 && updated.filter(c => c.type === "virus").length < 50) {
              updated.push({
                position: cell.position.clone(),
                velocity: cell.velocity.clone(),
                type: "virus",
                active: false,
              });
            }
          }
        } else {
          // Immune cells hunt pathogens
          if (!cell.active && immuneResponse > 0.3) {
            // Find nearest virus
            let nearestVirus: any;
            let nearestDist = Infinity;

            updated.forEach(other => {
              if (other.type === "virus") {
                const dist = cell.position.distanceTo(other.position);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearestVirus = other;
                }
              }
            });

            if (nearestVirus && nearestDist < 5) {
              cell.target = (nearestVirus as ImmuneCell).position.clone();
              cell.active = true;
            }
          }

          // Move towards target or patrol
          if (cell.target) {
            const direction = cell.target.clone().sub(cell.position).normalize();
            cell.position.add(direction.multiplyScalar(dt * (cell.type === "tcell" ? 0.8 : 0.5)));

            // Check if reached target
            if (cell.position.distanceTo(cell.target) < 0.3) {
              // Destroy virus
              const virusIndex = updated.findIndex(c => c.position.distanceTo(cell.target!) < 0.3);
              if (virusIndex >= 0 && updated[virusIndex].type === "virus") {
                updated.splice(virusIndex, 1);

                // B-cells produce antibodies
                if (cell.type === "bcell" && Math.random() < 0.3) {
                  for (let j = 0; j < 3; j++) {
                    updated.push({
                      position: cell.position.clone(),
                      velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                      ),
                      type: "antibody",
                      active: true,
                    });
                  }
                }
              }
              cell.target = undefined;
              cell.active = false;
            }
          } else {
            // Patrol
            cell.velocity.x += (Math.random() - 0.5) * 0.05;
            cell.velocity.y += (Math.random() - 0.5) * 0.05;
            cell.velocity.z += (Math.random() - 0.5) * 0.05;

            cell.position.add(cell.velocity.clone().multiplyScalar(dt * 0.3));
          }
        }

        // Keep in bounds
        if (Math.abs(cell.position.x) > 5) cell.velocity.x *= -1;
        if (Math.abs(cell.position.y) > 2.5) cell.velocity.y *= -1;
        if (Math.abs(cell.position.z) > 2.5) cell.velocity.z *= -1;
      }

      // Antibodies hunt viruses
      updated.forEach(cell => {
        if (cell.type === "antibody") {
          let nearestVirus: any;
          let nearestDist = Infinity;

          updated.forEach(other => {
            if (other.type === "virus") {
              const dist = cell.position.distanceTo(other.position);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestVirus = other;
              }
            }
          });

          if (nearestVirus && nearestDist < 3) {
            const direction = nearestVirus.position.clone().sub(cell.position).normalize();
            cell.position.add(direction.multiplyScalar(dt * 1.2));

            if (nearestDist < 0.2) {
              // Neutralize virus
              const virusIndex = updated.indexOf(nearestVirus);
              if (virusIndex >= 0) {
                updated.splice(virusIndex, 1);
              }
            }
          }
        }
      });

      return updated;
    });

    // Update instance matrices
    const maxCells = 150;
    const colors = new Float32Array(maxCells * 3);

    for (let i = 0; i < maxCells; i++) {
      if (i < cells.length) {
        const cell = cells[i];
        dummy.position.copy(cell.position);

        const size = cell.type === "macrophage" ? 0.3
          : cell.type === "tcell" || cell.type === "bcell" ? 0.2
          : cell.type === "antibody" ? 0.06
          : 0.12;

        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        cellsRef.current.setMatrixAt(i, dummy.matrix);

        // Color based on type
        const color = cell.type === "macrophage" ? { r: 0.9, g: 0.5, b: 0.2 }
          : cell.type === "tcell" ? { r: 0.2, g: 0.6, b: 1 }
          : cell.type === "bcell" ? { r: 0.6, g: 0.2, b: 0.9 }
          : cell.type === "antibody" ? { r: 0.02, g: 1, b: 0.5 }
          : { r: 0.4, g: 0.9, b: 0.4 };

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        cellsRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    cellsRef.current.instanceMatrix.needsUpdate = true;

    const colorAttr = cellsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    if (colorAttr) {
      colorAttr.array = colors;
      colorAttr.needsUpdate = true;
    }
  });

  // Infection counts
  const virusPop = cells.filter(c => c.type === "virus").length;
  const antibodyCount = cells.filter(c => c.type === "antibody").length;

  return (
    <>
      {/* Blood vessel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3, 3, 8, 32, 1, true]} />
        <meshStandardMaterial
          color="#dc143c"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cells */}
      <instancedMesh ref={cellsRef} args={[undefined, undefined, 150]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>

      {/* Virus count indicator */}
      <mesh position={[4, 2, 0]}>
        <sphereGeometry args={[0.1 + virusPop * 0.01, 16, 16]} />
        <meshStandardMaterial
          color={virusPop > 20 ? "#ff6b35" : virusPop > 10 ? "#ffcc00" : "#06d6a0"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Antibody indicator */}
      <mesh position={[4, 1.5, 0]}>
        <sphereGeometry args={[0.1 + antibodyCount * 0.02, 16, 16]} />
        <meshStandardMaterial
          color="#06d6a0"
          emissive="#06d6a0"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Response level indicator */}
      <mesh position={[4, 1, 0]}>
        <boxGeometry args={[0.1, immuneResponse * 2, 0.1]} />
        <meshStandardMaterial
          color="#ff6347"
          emissive="#ff6347"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-4, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff9147" />
      </mesh>
      <mesh position={[-4, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-4, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#9370db" />
      </mesh>
      <mesh position={[-4, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-4, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
