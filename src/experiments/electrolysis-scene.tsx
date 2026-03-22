"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

interface Bubble {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: "H2" | "O2";
  active: boolean;
}

export interface ElectrolysisData {
  voltage: number;
  current: number;
  h2Volume: number;
  o2Volume: number;
  reactionStatus: string;
  electrolyte: string;
  step: number;
}

export interface ElectrolysisSceneProps {
  voltage: number;
  electrolyte: "water" | "nacl" | "cuso4";
  isRunning: boolean;
  step: number;
  onDataChange?: (data: ElectrolysisData) => void;
}

const STEPS = [
  { id: 1, title: "Setup", description: "Battery connected to electrodes in electrolyte solution" },
  { id: 2, title: "Current Flows", description: "Electrons flow from battery through wires to electrodes" },
  { id: 3, title: "Reactions Begin", description: "Water molecules split at electrode surfaces" },
  { id: 4, title: "Gases Form", description: "H₂ bubbles form at cathode (-), O₂ at anode (+)" },
  { id: 5, title: "Collection", description: "Gases collected in test tubes - H₂:O₂ ratio = 2:1" },
];

const REACTIONS = {
  cathode: "2H₂O + 2e⁻ → H₂(g) + 2OH⁻",
  anode: "2H₂O → O₂(g) + 4H⁺ + 4e⁻",
};

export function ElectrolysisSceneComponent({
  voltage,
  electrolyte,
  isRunning,
  step,
  onDataChange,
}: ElectrolysisSceneProps) {
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const electronsRef = useRef<THREE.InstancedMesh>(null);
  const cathodeRef = useRef<THREE.Mesh>(null);
  const anodeRef = useRef<THREE.Mesh>(null);

  // Physics state refs (no re-renders)
  const physicsRef = useRef({
    bubbles: [] as Bubble[],
    electrons: [] as THREE.Vector3[],
    frameCount: 0,
    h2Volume: 0,
    o2Volume: 0,
    lastBubbleTime: 0,
    electronOffset: 0,
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [data, setData] = useState<ElectrolysisData>({
    voltage,
    current: 0,
    h2Volume: 0,
    o2Volume: 0,
    reactionStatus: "Ready",
    electrolyte,
    step,
  });

  // Initialize bubbles and electrons pool
  useEffect(() => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 200; i++) {
      bubbles.push({
        position: new THREE.Vector3(0, -100, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        type: "H2",
        active: false,
      });
    }
    const electrons: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      electrons.push(new THREE.Vector3(0, -100, 0));
    }
    physicsRef.current.bubbles = bubbles;
    physicsRef.current.electrons = electrons;
  }, []);

  // Get electrolyte color
  const getElectrolyteColor = () => {
    switch (electrolyte) {
      case "water": return "#4a90d9";
      case "nacl": return "#87ceeb";
      case "cuso4": return "#4169e1";
      default: return "#4a90d9";
    }
  };

  useFrame((state, delta) => {
    if (!bubblesRef.current) return;
    const dt = Math.min(delta, 0.02);
    const physics = physicsRef.current;
    const time = state.clock.elapsedTime;

    const maxBubbles = 200;
    const shouldSpawnBubbles = isRunning && step >= 3;
    const bubbleSpawnRate = voltage * 0.05;

    // Generate new bubbles based on voltage (2:1 H2:O2 ratio)
    if (shouldSpawnBubbles && time - physics.lastBubbleTime > (1 / bubbleSpawnRate)) {
      // Spawn H2 bubbles at cathode (2 bubbles)
      for (let h = 0; h < 2; h++) {
        const inactiveIndex = physics.bubbles.findIndex(b => !b.active);
        if (inactiveIndex !== -1) {
          const bubble = physics.bubbles[inactiveIndex];
          bubble.position.set(
            -1.8 + (Math.random() - 0.5) * 0.3,
            -1.2,
            (Math.random() - 0.5) * 0.3
          );
          bubble.velocity.set(
            (Math.random() - 0.5) * 0.15,
            0.4 + Math.random() * 0.4,
            (Math.random() - 0.5) * 0.1
          );
          bubble.type = "H2";
          bubble.active = true;
          physics.h2Volume += 0.01;
        }
      }

      // Spawn O2 bubble at anode (1 bubble, larger)
      const inactiveIndex = physics.bubbles.findIndex(b => !b.active);
      if (inactiveIndex !== -1) {
        const bubble = physics.bubbles[inactiveIndex];
        bubble.position.set(
          1.8 + (Math.random() - 0.5) * 0.3,
          -1.2,
          (Math.random() - 0.5) * 0.3
        );
        bubble.velocity.set(
          (Math.random() - 0.5) * 0.12,
          0.3 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.1
        );
        bubble.type = "O2";
        bubble.active = true;
        physics.o2Volume += 0.01;
      }
      physics.lastBubbleTime = time;
    }

    // Update bubble positions
    for (let i = 0; i < maxBubbles; i++) {
      const bubble = physics.bubbles[i];

      if (bubble.active) {
        const speed = voltage / 6;
        bubble.position.add(bubble.velocity.clone().multiplyScalar(dt * speed));

        // Add wobble for realism
        bubble.position.x += Math.sin(time * 4 + i) * 0.003;
        bubble.position.z += Math.cos(time * 3 + i) * 0.003;

        // Deactivate if above surface or in gas collection tube
        if (bubble.position.y > (step >= 4 ? 4 : 2.5)) {
          bubble.active = false;
          bubble.position.y = -100;
        }
      }

      // Update instance matrix
      if (bubble.active) {
        dummy.position.copy(bubble.position);
        const size = bubble.type === "H2" ? 0.05 : 0.1;
        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    bubblesRef.current.instanceMatrix.needsUpdate = true;

    // Update electron flow (step 2+)
    if (step >= 2) {
      physics.electronOffset = (physics.electronOffset + dt * voltage * 0.5) % 1;
    }

    // Throttled state update - only every 8 frames
    physics.frameCount++;
    if (physics.frameCount % 8 === 0) {
      const current = isRunning ? voltage * 0.15 : 0;
      const getStatus = () => {
        if (!isRunning) return "Paused";
        if (step === 1) return "Setup complete";
        if (step === 2) return "Current flowing";
        if (step === 3) return "Reactions starting";
        if (step >= 4) return "Gases producing";
        return "Ready";
      };

      const newData: ElectrolysisData = {
        voltage,
        current,
        h2Volume: Math.min(physics.h2Volume, 50),
        o2Volume: Math.min(physics.o2Volume, 25),
        reactionStatus: getStatus(),
        electrolyte,
        step,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Electron path points for wire visualization
  const cathodeWirePath = [
    [-0.5, 3.5, 0],
    [-0.5, 1.5, 0],
    [-1.8, 1.5, 0],
    [-1.8, 0, 0],
  ] as [number, number, number][];

  const anodeWirePath = [
    [0.5, 3.5, 0],
    [0.5, 1.5, 0],
    [1.8, 1.5, 0],
    [1.8, 0, 0],
  ] as [number, number, number][];

  const electronColor = "#ffff00";

  return (
    <>
      {/* Floor/Grid */}
      <gridHelper args={[20, 40, "#1a1a2e", "#1a1a2e"]} position={[0, -2.5, 0]} />

      {/* Battery */}
      <group position={[0, 3.5, 0]}>
        {/* Main body */}
        <mesh>
          <boxGeometry args={[1.2, 0.6, 0.5]} />
          <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Positive terminal */}
        <mesh position={[0.4, 0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#dc2626" metalness={0.7} />
        </mesh>
        {/* Negative terminal */}
        <mesh position={[-0.4, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#2563eb" metalness={0.7} />
        </mesh>
        {/* Voltage label */}
        <Text
          position={[0, 0, 0.26]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {voltage}V
        </Text>
        {/* + and - labels */}
        <Text position={[0.5, 0.7, 0]} fontSize={0.2} color="#dc2626" anchorX="center">+</Text>
        <Text position={[-0.5, 0.6, 0]} fontSize={0.25} color="#2563eb" anchorX="center">−</Text>
      </group>

      {/* Wires with electron flow animation */}
      {step >= 2 && (
        <>
          {/* Cathode wire (electrons TO cathode) */}
          <Line
            points={cathodeWirePath}
            color="#b8860b"
            lineWidth={3}
          />
          {/* Anode wire (electrons FROM anode) */}
          <Line
            points={anodeWirePath}
            color="#b8860b"
            lineWidth={3}
          />
          {/* Electron indicators */}
          <instancedMesh ref={electronsRef} args={[undefined, undefined, 20]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={electronColor} emissive={electronColor} emissiveIntensity={0.8} />
          </instancedMesh>
        </>
      )}

      {/* Beaker */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 3.5, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Beaker base */}
      <mesh position={[0, -1.75, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      {/* Electrolyte solution */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 2.8, 32]} />
        <meshStandardMaterial
          color={getElectrolyteColor()}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Liquid surface with subtle wave */}
      <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.35, 32]} />
        <meshStandardMaterial
          color={getElectrolyteColor()}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cathode (-) electrode - BLUE */}
      <group position={[-1.8, -0.5, 0]}>
        <mesh ref={cathodeRef}>
          <cylinderGeometry args={[0.12, 0.12, 3, 16]} />
          <meshStandardMaterial
            color="#2563eb"
            metalness={0.9}
            roughness={0.1}
            emissive="#2563eb"
            emissiveIntensity={isRunning && step >= 3 ? 0.3 : 0}
          />
        </mesh>
        {/* CATHODE label */}
        <Text position={[-0.5, 1.5, 0]} fontSize={0.18} color="#2563eb" anchorX="right">
          CATHODE (−)
        </Text>
        {step >= 3 && (
          <Text position={[-0.5, 1.2, 0]} fontSize={0.1} color="#60a5fa" anchorX="right" maxWidth={3}>
            {REACTIONS.cathode}
          </Text>
        )}
      </group>

      {/* Anode (+) electrode - RED */}
      <group position={[1.8, -0.5, 0]}>
        <mesh ref={anodeRef}>
          <cylinderGeometry args={[0.12, 0.12, 3, 16]} />
          <meshStandardMaterial
            color="#dc2626"
            metalness={0.9}
            roughness={0.1}
            emissive="#dc2626"
            emissiveIntensity={isRunning && step >= 3 ? 0.3 : 0}
          />
        </mesh>
        {/* ANODE label */}
        <Text position={[0.5, 1.5, 0]} fontSize={0.18} color="#dc2626" anchorX="left">
          ANODE (+)
        </Text>
        {step >= 3 && (
          <Text position={[0.5, 1.2, 0]} fontSize={0.1} color="#f87171" anchorX="left" maxWidth={3}>
            {REACTIONS.anode}
          </Text>
        )}
      </group>

      {/* Gas collection test tubes */}
      {step >= 4 && (
        <>
          {/* H2 collection tube over cathode */}
          <group position={[-1.8, 2.5, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 2, 16, 1, true]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* H2 gas fill indicator */}
            <mesh position={[0, -0.5 + Math.min(data.h2Volume / 50, 0.8), 0]}>
              <cylinderGeometry args={[0.32, 0.32, Math.min(data.h2Volume / 25, 1.5), 16]} />
              <meshStandardMaterial
                color="#2563eb"
                transparent
                opacity={0.4}
              />
            </mesh>
            {/* Volume markings */}
            {[0.3, 0.6, 0.9].map((h, i) => (
              <mesh key={i} position={[0.36, -0.8 + h, 0]}>
                <boxGeometry args={[0.08, 0.015, 0.015]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
            <Text position={[0, 1.1, 0]} fontSize={0.15} color="#2563eb" anchorX="center">
              H₂
            </Text>
          </group>

          {/* O2 collection tube over anode */}
          <group position={[1.8, 2.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.35, 0.35, 2, 16, 1, true]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* O2 gas fill indicator */}
            <mesh position={[0, -0.5 + Math.min(data.o2Volume / 50, 0.4), 0]}>
              <cylinderGeometry args={[0.32, 0.32, Math.min(data.o2Volume / 25, 1.5), 16]} />
              <meshStandardMaterial
                color="#dc2626"
                transparent
                opacity={0.4}
              />
            </mesh>
            {/* Volume markings */}
            {[0.3, 0.6, 0.9].map((h, i) => (
              <mesh key={i} position={[0.36, -0.8 + h, 0]}>
                <boxGeometry args={[0.08, 0.015, 0.015]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
            <Text position={[0, 1.1, 0]} fontSize={0.15} color="#dc2626" anchorX="center">
              O₂
            </Text>
          </group>
        </>
      )}

      {/* Bubbles */}
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, 200]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </instancedMesh>

      {/* Step info display */}
      {step >= 1 && step <= 5 && (
        <group position={[0, -2.2, 3]}>
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[4, 0.8]} />
            <meshStandardMaterial
              color="#0a0a1a"
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text position={[0, 0.15, 0]} fontSize={0.14} color="#ffffff" anchorX="center">
            Step {step}: {STEPS[step - 1].title}
          </Text>
          <Text position={[0, -0.05, 0]} fontSize={0.09} color="#94a3b8" anchorX="center" maxWidth={3.8}>
            {STEPS[step - 1].description}
          </Text>
        </group>
      )}

      {/* Balanced equation at step 5 */}
      {step === 5 && (
        <group position={[0, 5, 0]}>
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[6, 0.6]} />
            <meshStandardMaterial
              color="#0a0a1a"
              transparent
              opacity={0.9}
            />
          </mesh>
          <Text position={[0, 0, 0]} fontSize={0.12} color="#4ade80" anchorX="center">
            2H₂O(l) → 2H₂(g) + O₂(g)
          </Text>
        </group>
      )}
    </>
  );
}

export default ElectrolysisSceneComponent;
