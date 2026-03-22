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
  bulbStatus: "off" | "on" | "burned";
  motorRpm: number;
}

export interface OhmsLawSceneProps {
  voltage: number;
  resistance: number;
  bulbEnabled: boolean;
  motorEnabled: boolean;
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
  smokeParticles: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number }>;
  bulbBurned: boolean;
}

// ============================================
// PHYSICS CONSTANTS
// ============================================

const NUM_ELECTRONS = 50;
const DATA_UPDATE_INTERVAL = 8; // Update data every 8 frames

// Circuit wire path - rectangular circuit
const CIRCUIT_PATH: [number, number, number][] = [
  [-8, 0, 0], [-6, 0, 0], [-4, 0, 0], [-2, 0, 0], [0, 0, 0],
  [2, 0, 0], [4, 0, 0], [5, 0, 0],
  [5, 2, 0], [5, 4, 0],
  [3, 4, 0], [1, 4, 0], [-1, 4, 0], [-3, 4, 0], [-5, 4, 0], [-7, 4, 0],
  [-7, 2, 0], [-7, 0, 0],
  [-8, 0, 0]
];

// ============================================
// CIRCUIT POSITION HELPER
// ============================================

function getCircuitPosition(progress: number): THREE.Vector3 {
  const t = progress % 1;
  const numSegments = CIRCUIT_PATH.length - 1;
  const segmentT = t * numSegments;
  const segmentIndex = Math.floor(segmentT);
  const localT = segmentT - segmentIndex;

  const start = CIRCUIT_PATH[segmentIndex];
  const end = CIRCUIT_PATH[Math.min(segmentIndex + 1, numSegments)];

  return new THREE.Vector3(
    start[0] + (end[0] - start[0]) * localT,
    start[1] + (end[1] - start[1]) * localT,
    start[2] + (end[2] - start[2]) * localT
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
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 3.5, 24]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Battery label */}
      <mesh position={[0, 0, 1.3]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Html position={[0, 0, 1.35]} center distanceFactor={12}>
        <div className="text-sm font-bold text-black bg-yellow-400 px-2 py-1 rounded font-mono">
          {voltage.toFixed(1)}V
        </div>
      </Html>

      {/* Positive terminal */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 12]} />
        <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
      </mesh>
      <Html position={[0, 2.3, 0]} center distanceFactor={15}>
        <div className="text-lg font-bold text-red-500">+</div>
      </Html>

      {/* Negative terminal */}
      <mesh position={[0, -1.9, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.2} />
      </mesh>
      <Html position={[0, -2.3, 0]} center distanceFactor={15}>
        <div className="text-lg font-bold text-blue-500">−</div>
      </Html>
    </group>
  );
}

// ============================================
// 3D LIGHT BULB COMPONENT
// ============================================

interface LightBulbProps {
  power: number;
  isBurned: boolean;
  position: [number, number, number];
}

function LightBulb({ power, isBurned, position }: LightBulbProps) {
  const bulbRef = useRef<THREE.Mesh>(null);
  const filamentRef = useRef<THREE.Mesh>(null);

  // Brightness based on power (P = V^2/R), normalized
  const maxPower = 100; // Max power for full brightness
  const brightness = isBurned ? 0 : Math.min(power / maxPower, 1);
  const glowIntensity = brightness * 5;
  const bulbColor = isBurned
    ? new THREE.Color("#333333")
    : new THREE.Color().setHSL(0.1, 1, 0.3 + brightness * 0.6);

  useFrame(() => {
    if (bulbRef.current && filamentRef.current && !isBurned && power > 0) {
      // Pulsating filament effect
      const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1 * brightness;
      (filamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity * pulse;
      (bulbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity * 0.3 * pulse;
    }
    if (bulbRef.current && isBurned) {
      (bulbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      (filamentRef.current?.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  });

  return (
    <group position={position}>
      {/* Glass bulb */}
      <mesh ref={bulbRef} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={bulbColor}
          transparent
          opacity={isBurned ? 0.8 : 0.3 + brightness * 0.5}
          metalness={0.1}
          roughness={0.1}
          emissive={bulbColor}
          emissiveIntensity={glowIntensity * 0.3}
        />
      </mesh>

      {/* Filament (coil) */}
      <mesh ref={filamentRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[0.3, 0.05, 64, 8, 2, 3]} />
        <meshStandardMaterial
          color={isBurned ? "#222" : "#ff8800"}
          emissive={isBurned ? "#111" : "#ff6600"}
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Metal base */}
      <mesh position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.4, 20]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Screw threads */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={i} position={[0, -1.35 - i * 0.15, 0]} castShadow>
          <torusGeometry args={[0.42, 0.04, 8, 24]} />
          <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Contact point */}
      <mesh position={[0, -1.9, 0]}>
        <circleGeometry args={[0.25, 20]} />
        <meshStandardMaterial color="#d1d5db" metalness={1} roughness={0.1} />
      </mesh>

      {/* Point light for glow effect */}
      {!isBurned && brightness > 0.05 && (
        <pointLight
          position={[0, 0, 0]}
          intensity={glowIntensity * 3}
          color="#ffaa44"
          distance={15}
          decay={2}
        />
      )}

      {/* SpotLight for light cone projection */}
      {!isBurned && brightness > 0.1 && (
        <spotLight
          position={[0, 0, 0]}
          target-position={[0, -3, 0]}
          intensity={glowIntensity * 2}
          color="#ffcc88"
          angle={Math.PI / 4}
          penumbra={0.5}
          distance={20}
          decay={1.5}
          castShadow
        />
      )}

      {/* Power label */}
      <Html position={[1.5, 0, 0]} center distanceFactor={10}>
        <div className="text-[10px] text-amber-300 bg-black/80 px-2 py-1 rounded whitespace-nowrap pointer-events-none select-none border border-amber-500/30">
          💡 {isBurned ? "BURNT!" : `P = ${power.toFixed(1)}W`}
        </div>
      </Html>
    </group>
  );
}

// ============================================
// 3D MOTOR/FAN COMPONENT
// ============================================

interface MotorProps {
  current: number;
  position: [number, number, number];
}

function Motor({ current, position }: MotorProps) {
  const motorRef = useRef<THREE.Group>(null);
  const stateRef = useRef({ rotation: 0 });

  // Rotation speed proportional to current: speed = current * factor
  const rotationSpeed = current * 0.15;

  useFrame((_, delta) => {
    if (motorRef.current) {
      stateRef.current.rotation += rotationSpeed * delta * 60;
      motorRef.current.rotation.z = stateRef.current.rotation;
    }
  });

  const rpm = Math.abs(current * 300); // RPM proportional to current

  return (
    <group position={position}>
      {/* Motor body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 1, 24]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Motor front cap */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 20]} />
        <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Motor back cap */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 20]} />
        <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Fan blades (rotating part) */}
      <group ref={motorRef} position={[0, 0.7, 0]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]}>
            <mesh position={[0, 0.15, 0.25]} castShadow>
              <boxGeometry args={[0.12, 0.04, 0.55]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Center hub */}
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
          <meshStandardMaterial color="#6b7280" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Mounting bracket */}
      <mesh position={[0, -0.8, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <boxGeometry args={[1, 0.1, 0.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Speed label */}
      <Html position={[1.5, 0, 0]} center distanceFactor={10}>
        <div className="text-[10px] text-blue-300 bg-black/80 px-2 py-1 rounded whitespace-nowrap pointer-events-none select-none border border-blue-500/30">
          ⚙️ I = {current.toFixed(2)}A
          <br />
          {rpm.toFixed(0)} RPM
        </div>
      </Html>
    </group>
  );
}

// ============================================
// DIGITAL DISPLAY (AMMETER/VOLTMETER)
// ============================================

interface DigitalDisplayProps {
  value: number;
  unit: string;
  label: string;
  color: string;
  position: [number, number, number];
}

function DigitalDisplay({ value, unit, label, color, position }: DigitalDisplayProps) {
  return (
    <group position={position}>
      {/* Display body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Display screen */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.3, 0.6]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Digital value */}
      <Html position={[0, 0, 0.15]} center distanceFactor={12}>
        <div className="text-black font-mono font-bold text-sm bg-opacity-100">
          <div className="text-[8px] opacity-75">{label}</div>
          <div>{value.toFixed(2)}{unit}</div>
        </div>
      </Html>
    </group>
  );
}

// ============================================
// SMOKE PARTICLES (for burnt bulb)
// ============================================

interface SmokeParticlesProps {
  particles: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number }>;
}

function SmokeParticles({ particles }: SmokeParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      dummy.position.copy(p.pos);
      const scale = p.life * 0.3;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#888"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ============================================
// ELECTRON PARTICLES
// ============================================

interface ElectronParticlesProps {
  progress: number[];
  current: number;
}

function ElectronParticles({ progress, current }: ElectronParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Electron size and glow based on current
  const electronSize = 0.1 + Math.min(current / 20, 0.1);
  const glowIntensity = 0.5 + Math.min(current / 10, 1.5);

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
// POWER METER
// ============================================

interface PowerMeterProps {
  power: number;
  position: [number, number, number];
}

function PowerMeter({ power, position }: PowerMeterProps) {
  const maxPower = 100;
  const percentage = Math.min(power / maxPower, 1);

  return (
    <group position={position}>
      {/* Meter body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.2, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.5, 0.2]} center distanceFactor={12}>
        <div className="text-[9px] text-gray-400 font-semibold">POWER METER</div>
      </Html>

      {/* Power value */}
      <Html position={[0, 0, 0.2]} center distanceFactor={12}>
        <div className="text-green-400 font-mono font-bold text-sm">
          {power.toFixed(2)} W
        </div>
      </Html>

      {/* Power bar */}
      <mesh position={[0, -0.25, 0.16]}>
        <planeGeometry args={[1.8, 0.15]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* Animated power fill */}
      <mesh position={[-0.9 + percentage * 0.9, -0.25, 0.17]}>
        <planeGeometry args={[percentage * 1.8, 0.12]} />
        <meshBasicMaterial
          color={percentage > 0.8 ? "#ef4444" : percentage > 0.5 ? "#f59e0b" : "#22c55e"}
        />
      </mesh>

      {/* Formula display */}
      <Html position={[0, -0.6, 0.2]} center distanceFactor={15}>
        <div className="text-[8px] text-gray-500 font-mono whitespace-nowrap">
          P = V × I = V²/R
        </div>
      </Html>
    </group>
  );
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

export function OhmsLawSceneComponent({
  voltage,
  resistance,
  bulbEnabled,
  motorEnabled,
  isPlaying,
  onDataChange,
}: OhmsLawSceneProps) {
  const physicsStateRef = useRef<PhysicsState>({
    time: 0,
    frameCount: 0,
    lastDataUpdate: 0,
    electronProgress: Array.from({ length: NUM_ELECTRONS }, (_, i) => i / NUM_ELECTRONS),
    motorRotation: 0,
    smokeParticles: [],
    bulbBurned: false,
  });

  // Calculate electrical values using Ohm's Law
  const currentRef = useRef(voltage / resistance);
  const powerRef = useRef(voltage * currentRef.current);

  // Check if bulb should burn out (>12V at low resistance <50Ω)
  const shouldBurnBulb = bulbEnabled && voltage > 12 && resistance < 50;

  // Update physics and data callback
  useFrame((_, delta) => {
    const state = physicsStateRef.current;

    if (isPlaying) {
      state.time += delta;

      // Update current and power
      currentRef.current = voltage / resistance;
      powerRef.current = voltage * currentRef.current;

      // Check bulb burnout
      if (shouldBurnBulb && !state.bulbBurned) {
        state.bulbBurned = true;
        // Create initial smoke particles
        for (let i = 0; i < 30; i++) {
          state.smokeParticles.push({
            pos: new THREE.Vector3(-2, 2, 0),
            vel: new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              Math.random() * 0.3,
              (Math.random() - 0.5) * 0.3
            ),
            life: 1,
          });
        }
      } else if (!shouldBurnBulb) {
        state.bulbBurned = false;
        state.smokeParticles = [];
      }

      // Update smoke particles
      state.smokeParticles = state.smokeParticles.filter(p => {
        p.pos.add(p.vel);
        p.life -= delta * 0.5;
        return p.life > 0;
      });

      // Update electron positions based on current (speed proportional to current)
      const speed = currentRef.current * 0.01 * delta;
      state.electronProgress = state.electronProgress.map(p => (p + speed) % 1);

      // Update motor rotation
      state.motorRotation += currentRef.current * 0.15 * delta * 60;
    }

    // Throttled data update: every 8 frames
    state.frameCount++;
    state.lastDataUpdate++;

    if (state.lastDataUpdate >= DATA_UPDATE_INTERVAL && onDataChange) {
      state.lastDataUpdate = 0;

      // Determine bulb status
      let bulbStatus: "off" | "on" | "burned" = "off";
      if (bulbEnabled) {
        if (state.bulbBurned) {
          bulbStatus = "burned";
        } else if (voltage > 0) {
          bulbStatus = "on";
        }
      }

      // Motor RPM calculation
      const motorRpm = motorEnabled ? Math.abs(currentRef.current * 300) : 0;

      onDataChange({
        voltage,
        current: currentRef.current,
        resistance,
        power: powerRef.current,
        bulbStatus,
        motorRpm,
      });
    }
  });

  // Circuit wire points for Line component
  const wirePoints = useMemo(() => CIRCUIT_PATH.map(p => [...p] as [number, number, number]), []);

  // Component positions
  const bulbPosition: [number, number, number] = [-2, 2, 0];
  const motorPosition: [number, number, number] = [2, 2, 0];
  const voltmeterPosition: [number, number, number] = [3, 0, 0];
  const ammeterPosition: [number, number, number] = [-3, 0, 0];
  const powerMeterPosition: [number, number, number] = [0, 4.5, 0];

  // Calculate current power for bulb
  const bulbPower = bulbEnabled ? powerRef.current : 0;

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.5} />
      <hemisphereLight args={["#b1e1ff", "#1a1a2e", 0.4]} />

      {/* ====== CIRCUIT BOARD BASE ====== */}
      <mesh position={[-1, -1, -0.5]} receiveShadow>
        <boxGeometry args={[18, 12, 0.3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Grid lines on board */}
      <gridHelper args={[16, 16, "#1e3a5f", "#0f2744"]} position={[-1, -0.84, -0.34]} />

      {/* ====== CIRCUIT WIRES (Thick tubes) ====== */}
      {CIRCUIT_PATH.map((point, i) => {
        if (i === 0) return null;
        const prev = CIRCUIT_PATH[i - 1];
        const midPoint = [
          (prev[0] + point[0]) / 2,
          (prev[1] + point[1]) / 2,
          (prev[2] + point[2]) / 2,
        ] as [number, number, number];
        const length = Math.sqrt(
          Math.pow(point[0] - prev[0], 2) +
          Math.pow(point[1] - prev[1], 2) +
          Math.pow(point[2] - prev[2], 2)
        );
        const angle = Math.atan2(point[1] - prev[1], point[0] - prev[0]);

        return (
          <group key={i} position={midPoint} rotation={[0, 0, angle]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.08, 0.08, length, 8]} />
              <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Glow effect */}
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, length, 8]} />
              <meshStandardMaterial
                color="#fbbf24"
                transparent
                opacity={0.2}
                emissive="#f59e0b"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Wire visual overlay with Line */}
      <Line
        points={wirePoints}
        color="#d97706"
        lineWidth={2}
      />

      {/* ====== BATTERY (Left Side) ====== */}
      <Battery voltage={voltage} position={[-7, 2, 0]} />

      {/* ====== LOADS (Top) ====== */}
      {bulbEnabled && (
        <LightBulb
          power={bulbPower}
          isBurned={physicsStateRef.current.bulbBurned}
          position={bulbPosition}
        />
      )}
      {motorEnabled && (
        <Motor current={currentRef.current} position={motorPosition} />
      )}

      {/* ====== METERS ====== */}
      <DigitalDisplay
        value={voltage}
        unit="V"
        label="VOLTMETER"
        color="#06b6d4"
        position={voltmeterPosition}
      />
      <DigitalDisplay
        value={currentRef.current}
        unit="A"
        label="AMMETER"
        color="#8b5cf6"
        position={ammeterPosition}
      />

      {/* ====== POWER METER ====== */}
      <PowerMeter power={powerRef.current} position={powerMeterPosition} />

      {/* ====== ELECTRONS (Animated Flow) ====== */}
      {isPlaying && voltage > 0 && (
        <ElectronParticles
          progress={physicsStateRef.current.electronProgress}
          current={currentRef.current}
        />
      )}

      {/* ====== SMOKE PARTICLES (Burnt Bulb) ====== */}
      {physicsStateRef.current.smokeParticles.length > 0 && (
        <SmokeParticles particles={physicsStateRef.current.smokeParticles} />
      )}

      {/* ====== CONNECTION POINTS ====== */}
      {[
        [-7, 4, 0], [-7, 0, 0], // Battery terminals
        [-2, 2, 0], [2, 2, 0], // Load positions
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.9}
            roughness={0.1}
            emissive="#fbbf24"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* ====== OHM'S LAW DISPLAY ====== */}
      <group position={[0, 6, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[6, 1.5]} />
          <meshStandardMaterial color="#0a0a1a" transparent opacity={0.85} />
        </mesh>
        <Html position={[0, 0, 0.1]} center>
          <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white px-5 py-2.5 rounded-xl border border-slate-600/50 whitespace-nowrap">
            <div className="font-mono text-sm space-y-1">
              <div className="text-amber-400 font-semibold">Ohm's Law</div>
              <div className="text-slate-300">
                <span className="text-amber-300">V</span> = {voltage.toFixed(1)}V |{" "}
                <span className="text-blue-300">I</span> = {currentRef.current.toFixed(3)}A |{" "}
                <span className="text-red-300">R</span> = {resistance}Ω
              </div>
              <div className="text-green-300">
                P = V × I = {powerRef.current.toFixed(2)}W
              </div>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

export default OhmsLawSceneComponent;
