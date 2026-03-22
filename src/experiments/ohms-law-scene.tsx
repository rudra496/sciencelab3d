"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// INTERFACES
// ============================================

export interface OhmsLawData {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  electronFlowRate: number;
}

export interface OhmsLawSceneProps {
  voltage: number;
  resistance: number;
  loadType: "bulb" | "motor" | "both";
  isPlaying: boolean;
  onDataChange?: (data: OhmsLawData) => void;
}

// Physics state stored in refs (NOT React state)
interface PhysicsState {
  time: number;
  frameCount: number;
  lastDataUpdate: number;
  electronProgress: number[];
  motorRotation: number;
}

// Load type options for dropdown
export const loadTypeOptions: Array<{
  label: string;
  value: "bulb" | "motor" | "both";
  emoji: string;
  color: string;
}> = [
  { label: "Light Bulb", value: "bulb", emoji: "💡", color: "#fbbf24" },
  { label: "Motor", value: "motor", emoji: "⚙️", color: "#60a5fa" },
  { label: "Both", value: "both", emoji: "💡⚙️", color: "#a78bfa" },
];

// ============================================
// PHYSICS CONSTANTS
// ============================================

const NUM_ELECTRONS = 40;
const WIRE_PATH_POINTS = [
  // Battery positive terminal to bulb/motor
  [-6, 0, 0], [-4, 0, 0], [-2, 0, 0], [0, 0, 0],
  // Through load to top wire
  [0, 2, 0], [2, 2, 0], [4, 2, 0],
  // Right side down
  [4, 0, 0], [4, -2, 0],
  // Bottom wire back to battery
  [2, -2, 0], [0, -2, 0], [-2, -2, 0], [-4, -2, 0], [-6, -2, 0],
  // Back to battery negative
  [-6, 0, 0]
] as const;

// ============================================
// CIRCUIT WIRE PATH
// ============================================

function getCircuitPosition(progress: number): THREE.Vector3 {
  const t = progress % 1;
  const numSegments = WIRE_PATH_POINTS.length - 1;
  const segmentT = t * numSegments;
  const segmentIndex = Math.floor(segmentT);
  const localT = segmentT - segmentIndex;

  const start = WIRE_PATH_POINTS[segmentIndex];
  const end = WIRE_PATH_POINTS[Math.min(segmentIndex + 1, numSegments)];

  return new THREE.Vector3(
    start[0] + (end[0] - start[0]) * localT,
    start[1] + (end[1] - start[1]) * localT,
    start[2] + (end[2] - start[2]) * localT
  );
}

// ============================================
// 3D LIGHT BULB COMPONENT
// ============================================

interface LightBulbProps {
  power: number; // Affects brightness
  position: [number, number, number];
}

function LightBulb({ power, position }: LightBulbProps) {
  const bulbRef = useRef<THREE.Group>(null);
  const filamentRef = useRef<THREE.Mesh>(null);

  // Brightness based on power (P = V^2/R), normalized 0-1
  const brightness = Math.min(power / 50, 1);
  const glowIntensity = brightness * 3;
  const bulbColor = new THREE.Color().setHSL(0.12, 1, 0.5 + brightness * 0.5);

  useFrame(() => {
    if (filamentRef.current) {
      // Pulsating filament effect
      const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1 * brightness;
      (filamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity * pulse;
    }
  });

  return (
    <group ref={bulbRef} position={position}>
      {/* Glass bulb */}
      <mesh castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={bulbColor}
          transparent
          opacity={0.3 + brightness * 0.4}
          metalness={0.1}
          roughness={0.1}
          emissive={bulbColor}
          emissiveIntensity={glowIntensity * 0.5}
        />
      </mesh>

      {/* Filament inside */}
      <mesh ref={filamentRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ff6600"
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Metal base */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Base threads */}
      <mesh position={[0, -1.1, 0]} castShadow>
        <torusGeometry args={[0.38, 0.05, 8, 16]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Contact point */}
      <mesh position={[0, -1.2, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#aaa" metalness={1} roughness={0.1} />
      </mesh>

      {/* Glow effect */}
      {brightness > 0.1 && (
        <pointLight
          position={[0, 0, 0]}
          intensity={glowIntensity * 2}
          color="#ffaa44"
          distance={8}
        />
      )}

      {/* Power label */}
      <Html position={[1.2, 0, 0]} center distanceFactor={10}>
        <div className="text-[10px] text-amber-300 bg-black/70 px-2 py-1 rounded whitespace-nowrap pointer-events-none select-none">
          💡 P = {power.toFixed(1)}W
        </div>
      </Html>
    </group>
  );
}

// ============================================
// 3D MOTOR/FAN COMPONENT
// ============================================

interface MotorProps {
  current: number; // Affects rotation speed
  position: [number, number, number];
}

function Motor({ current, position }: MotorProps) {
  const motorRef = useRef<THREE.Group>(null);
  const stateRef = useRef({ rotation: 0 });

  // Rotation speed based on current
  const rotationSpeed = current * 0.1;

  useFrame((_, delta) => {
    if (motorRef.current) {
      stateRef.current.rotation += rotationSpeed * delta * 10;
      motorRef.current.rotation.y = stateRef.current.rotation;
    }
  });

  return (
    <group ref={motorRef} position={position}>
      {/* Motor body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.8, 16]} />
        <meshStandardMaterial color="#445566" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Motor cap */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#667788" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Fan blades (rotating part) */}
      <group position={[0, 0.6, 0]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <mesh position={[0, 0.2, 0.3]} castShadow>
              <boxGeometry args={[0.15, 0.05, 0.5]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        ))}
        {/* Center hub */}
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Mounting bracket */}
      <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Speed label */}
      <Html position={[1.2, 0, 0]} center distanceFactor={10}>
        <div className="text-[10px] text-blue-300 bg-black/70 px-2 py-1 rounded whitespace-nowrap pointer-events-none select-none">
          ⚙️ I = {current.toFixed(2)}A
        </div>
      </Html>
    </group>
  );
}

// ============================================
// 3D BATTERY COMPONENT
// ============================================

interface BatteryProps {
  voltage: number;
  position: [number, number, number];
}

function Battery({ voltage, position }: BatteryProps) {
  return (
    <group position={position}>
      {/* Battery body */}
      <mesh castShadow>
        <cylinderGeometry args={[1, 1, 3, 16]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Positive terminal (top) */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 8]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Negative terminal (bottom) */}
      <mesh position={[0, -1.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Voltage label */}
      <Html position={[0, 0, 1.3]} center>
        <div className="text-sm font-bold text-amber-400 bg-black/80 px-3 py-1.5 rounded whitespace-nowrap pointer-events-none select-none border border-amber-500/30">
          {voltage}V DC
        </div>
      </Html>

      {/* Polarity indicators */}
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <Html position={[0, 2.2, 0.1]} center distanceFactor={15}>
        <div className="text-[10px] font-bold text-red-500 pointer-events-none select-none">+</div>
      </Html>
    </group>
  );
}

// ============================================
// ELECTRON PARTICLE
// ============================================

interface ElectronParticlesProps {
  progress: number[];
  current: number; // Affects size and glow
}

function ElectronParticles({ progress, current }: ElectronParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Electron size and glow based on current
  const electronSize = 0.08 + Math.min(current / 10, 0.08);
  const glowIntensity = 0.5 + Math.min(current / 5, 1);

  useFrame(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < progress.length; i++) {
      const pos = getCircuitPosition(progress[i]);
      dummy.position.copy(pos);
      dummy.scale.set(electronSize, electronSize, electronSize);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_ELECTRONS]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#60a5fa"
        emissive="#3b82f6"
        emissiveIntensity={glowIntensity}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

export function OhmsLawSceneComponent({
  voltage,
  resistance,
  loadType,
  isPlaying,
  onDataChange,
}: OhmsLawSceneProps) {
  const physicsStateRef = useRef<PhysicsState>({
    time: 0,
    frameCount: 0,
    lastDataUpdate: 0,
    electronProgress: Array.from({ length: NUM_ELECTRONS }, (_, i) => i / NUM_ELECTRONS),
    motorRotation: 0,
  });

  // Calculate electrical values using Ohm's Law
  const current = voltage / resistance;
  const power = voltage * current; // P = V*I = V^2/R
  const electronFlowRate = current * 6.242e18; // Electrons per second (simplified)

  // Update physics and data callback
  useFrame((_, delta) => {
    const state = physicsStateRef.current;

    if (isPlaying) {
      state.time += delta;

      // Update electron positions based on current
      const speed = current * 0.02 * delta;
      state.electronProgress = state.electronProgress.map(p => (p + speed) % 1);
    }

    // Throttled data update: every 7 frames (approximately every 100ms at 60fps)
    state.frameCount++;
    state.lastDataUpdate++;

    if (state.lastDataUpdate >= 7 && onDataChange) {
      state.lastDataUpdate = 0;

      onDataChange({
        voltage,
        current,
        resistance,
        power,
        electronFlowRate,
      });
    }
  });

  // Circuit wire points for Line component
  const wirePoints = useMemo(() => WIRE_PATH_POINTS.map(p => [p[0], p[1], p[2]] as [number, number, number]), []);

  // Adjust load positions based on load type
  const showBulb = loadType === "bulb" || loadType === "both";
  const showMotor = loadType === "motor" || loadType === "both";
  const bulbPosition: [number, number, number] = loadType === "both" ? [-1.5, 0, 0] : [0, 0, 0];
  const motorPosition: [number, number, number] = loadType === "both" ? [1.5, 0, 0] : [0, 0, 0];

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#fbbf24" />

      {/* ====== FLOOR ====== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} />
      </mesh>
      <gridHelper args={[20, 20, "#1a1a3e", "#0a0a1e"]} position={[0, -2.99, 0]} />

      {/* ====== CIRCUIT BOARD BASE ====== */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <boxGeometry args={[14, 0.2, 6]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ====== CIRCUIT WIRES ====== */}
      <Line
        points={wirePoints}
        color="#d97706"
        lineWidth={3}
      />

      {/* Wire glow effect (slightly larger, transparent) */}
      <Line
        points={wirePoints}
        color="#fbbf24"
        lineWidth={6}
        transparent
        opacity={0.2}
      />

      {/* ====== BATTERY (Left Side) ====== */}
      <Battery voltage={voltage} position={[-6, 0, 0]} />

      {/* ====== LOADS (Center) ====== */}
      {showBulb && <LightBulb power={loadType === "both" ? power / 2 : power} position={bulbPosition} />}
      {showMotor && <Motor current={current} position={motorPosition} />}

      {/* ====== ELECTRONS (Animated Flow) ====== */}
      {isPlaying && (
        <ElectronParticles
          progress={physicsStateRef.current.electronProgress}
          current={current}
        />
      )}

      {/* ====== CURRENT FLOW ARROWS ====== */}
      {isPlaying && current > 0 && (
        <>
          <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.15, 0.3, 4]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.8}
            />
          </mesh>
          <Html position={[0, 3, 0]} center>
            <div className="text-[10px] text-amber-400 bg-black/70 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
              Electron flow →
            </div>
          </Html>
        </>
      )}

      {/* ====== OHM'S LAW DISPLAY ====== */}
      <group position={[0, 4, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[5, 1.2]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.8} />
        </mesh>
        <Html position={[0, 0, 0.1]} center>
          <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 text-white px-4 py-2 rounded-lg border border-amber-500/30 whitespace-nowrap">
            <div className="font-mono text-sm">
              <span className="text-amber-300">V</span> = {voltage}V |
              <span className="text-red-300"> I</span> = {current.toFixed(2)}A |
              <span className="text-blue-300"> R</span> = {resistance}Ω
            </div>
            <div className="font-mono text-xs text-amber-200 mt-1">
              I = V / R = {voltage} / {resistance} = {current.toFixed(2)} A
            </div>
          </div>
        </Html>
      </group>

      {/* ====== CONNECTION POINTS ====== */}
      {[
        [-6, 2, 0], [-6, -2, 0], // Battery terminals
        [0, 0, 0], // Load center
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default OhmsLawSceneComponent;
