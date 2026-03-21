"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html, Text } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// INTERFACES
// ============================================

interface ProjectileSceneProps {
  onDataChange?: (data: ProjectileData) => void;
  velocity?: number;
  angle?: number;
  gravity?: number;
  mass?: number;
  airResistance?: boolean;
  dragCoefficient?: number;
  targetDistance?: number;
  showTrail?: boolean;
  showPrediction?: boolean;
  showVelocityVector?: boolean;
  showGhostMarkers?: boolean;
  showDistanceMarkers?: boolean;
  resetTrigger?: number;
  isPlaying?: boolean;
  simulationSpeed?: number;
}

export interface ProjectileData {
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  flightTime: number;
  maxHeight: number;
  range: number;
  predictedRange: number;
  predictedMaxHeight: number;
  predictedTimeOfFlight: number;
  kineticEnergy: number;
  potentialEnergy: number;
  hasLanded: boolean;
  impactVelocity: number;
  impactAngle: number;
}

// ============================================
// RK4 FOR AIR RESISTANCE
// ============================================

interface State2D { x: number; y: number; vx: number; vy: number; }

function rk4Projectile(
  state: State2D, g: number, drag: number, m: number, dt: number
): State2D {
  const deriv = (s: State2D): State2D => {
    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const dragFactor = drag > 0 ? (drag / m) * speed : 0;
    return {
      x: s.vx,
      y: s.vy,
      vx: -dragFactor * s.vx,
      vy: -g - dragFactor * s.vy,
    };
  };

  const k1 = deriv(state);
  const s2 = {
    x: state.x + k1.x * dt * 0.5,
    y: state.y + k1.y * dt * 0.5,
    vx: state.vx + k1.vx * dt * 0.5,
    vy: state.vy + k1.vy * dt * 0.5,
  };
  const k2 = deriv(s2);
  const s3 = {
    x: state.x + k2.x * dt * 0.5,
    y: state.y + k2.y * dt * 0.5,
    vx: state.vx + k2.vx * dt * 0.5,
    vy: state.vy + k2.vy * dt * 0.5,
  };
  const k3 = deriv(s3);
  const s4 = {
    x: state.x + k3.x * dt,
    y: state.y + k3.y * dt,
    vx: state.vx + k3.vx * dt,
    vy: state.vy + k3.vy * dt,
  };
  const k4 = deriv(s4);

  return {
    x: state.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: state.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    vx: state.vx + (dt / 6) * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx),
    vy: state.vy + (dt / 6) * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy),
  };
}

// ============================================
// MAIN SCENE
// ============================================

export function ProjectileMotionSceneComponent({
  onDataChange,
  velocity = 30,
  angle = 45,
  gravity = 9.81,
  mass = 1,
  airResistance = false,
  dragCoefficient = 0.02,
  targetDistance = 50,
  showTrail = true,
  showPrediction = true,
  showVelocityVector = true,
  showGhostMarkers = true,
  showDistanceMarkers = true,
  resetTrigger,
  isPlaying = true,
  simulationSpeed = 1,
}: ProjectileSceneProps) {
  const projectileRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const velArrowRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Group>(null);
  const launcherRef = useRef<THREE.Group>(null);

  const simRef = useRef({
    launched: false,
    state: { x: 0, y: 0, vx: 0, vy: 0 } as State2D,
    time: 0,
    maxHeight: 0,
    ghostTimer: 0,
    ghostPositions: [] as [number, number, number][],
  });
  const dataTimer = useRef(0);

  // Trail
  const MAX_TRAIL = 2000;
  const trailBuf = useMemo(() => ({
    positions: new Float32Array(MAX_TRAIL * 3),
    colors: new Float32Array(MAX_TRAIL * 3),
    idx: 0,
  }), []);
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(trailBuf.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(trailBuf.colors, 3));
    return g;
  }, []);

  // Predicted trajectory (no drag, analytical)
  const angleRad = (angle * Math.PI) / 180;
  const predictedPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const totalTime = (2 * velocity * Math.sin(angleRad)) / gravity;
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalTime;
      const x = velocity * Math.cos(angleRad) * t;
      const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
      pts.push([x, Math.max(y, 0) + 0.5, 0]);
    }
    return pts;
  }, [velocity, angleRad, gravity]);

  const predictedRange = (velocity * velocity * Math.sin(2 * angleRad)) / gravity;
  const predictedMaxHeight = (velocity * velocity * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * gravity);
  const predictedTOF = (2 * velocity * Math.sin(angleRad)) / gravity;

  // Smoke particles
  const smokeParticles = useRef<THREE.Mesh[]>([]);
  const smokeData = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }[]>([]);

  // Target hit
  const [targetHit, setTargetHit] = useState(false);

  // Reset
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      const rad = (angle * Math.PI) / 180;
      simRef.current = {
        launched: true,
        state: {
          x: 0,
          y: 0,
          vx: velocity * Math.cos(rad),
          vy: velocity * Math.sin(rad),
        },
        time: 0,
        maxHeight: 0,
        ghostTimer: 0,
        ghostPositions: [],
      };
      trailBuf.idx = 0;
      trailBuf.positions.fill(0);
      trailBuf.colors.fill(0);
      setTargetHit(false);
      smokeData.current = [];
      // Create smoke burst at muzzle
      for (let i = 0; i < 15; i++) {
        smokeData.current.push({
          pos: new THREE.Vector3(2.2 * Math.cos(-rad + Math.PI / 2), 2.2 * Math.sin(-rad + Math.PI / 2) + 0.5, (Math.random() - 0.5) * 0.5),
          vel: new THREE.Vector3(
            Math.cos(-rad + Math.PI / 2) * (1 + Math.random() * 2) + (Math.random() - 0.5),
            Math.sin(-rad + Math.PI / 2) * (1 + Math.random() * 2) + Math.random() * 2,
            (Math.random() - 0.5) * 2
          ),
          life: 0,
          maxLife: 0.5 + Math.random() * 1.0,
        });
      }
      if (projectileRef.current) {
        projectileRef.current.position.set(0, 0.5, 0);
      }
    }
  }, [resetTrigger, angle, velocity, trailBuf]);

  // Update launcher rotation
  useFrame(() => {
    if (launcherRef.current) {
      // Rotate the barrel group around Z axis
      const barrelGroup = launcherRef.current.children[2]; // Rotating platform
      if (barrelGroup) {
        barrelGroup.rotation.z = angleRad;
      }
    }
  });

  // Main frame loop
  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const sim = simRef.current;

    // Update smoke particles
    smokeData.current = smokeData.current.filter((p) => {
      p.life += rawDt;
      if (p.life >= p.maxLife) return false;
      p.pos.addScaledVector(p.vel, rawDt);
      p.vel.y += rawDt * 0.5; // float up slightly
      return true;
    });
    // Update smoke refs
    smokeParticles.current.forEach((mesh, i) => {
      const p = smokeData.current[i];
      if (p) {
        mesh.position.copy(p.pos);
        const t = p.life / p.maxLife;
        mesh.scale.setScalar(1 + t * 3);
        (mesh.material as THREE.MeshStandardMaterial).opacity = (1 - t) * 0.5;
        mesh.visible = true;
      } else {
        mesh.visible = false;
      }
    });

    if (sim.launched && isPlaying && dt > 0) {
      sim.time += dt;

      // Physics step
      if (airResistance) {
        const steps = Math.max(1, Math.ceil(dt / 0.004));
        const subDt = dt / steps;
        for (let i = 0; i < steps; i++) {
          sim.state = rk4Projectile(sim.state, gravity, dragCoefficient, mass, subDt);
        }
      } else {
        // Analytical solution (exact)
        const t = sim.time;
        sim.state.x = velocity * Math.cos(angleRad) * t;
        sim.state.y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
        sim.state.vx = velocity * Math.cos(angleRad);
        sim.state.vy = velocity * Math.sin(angleRad) - gravity * t;
      }

      const x = sim.state.x;
      const y = Math.max(0, sim.state.y);
      sim.maxHeight = Math.max(sim.maxHeight, y);

      // Ghost markers every 0.5s
      sim.ghostTimer += dt;
      if (sim.ghostTimer >= 0.5) {
        sim.ghostTimer -= 0.5;
        sim.ghostPositions.push([x, y + 0.5, 0]);
        if (sim.ghostPositions.length > 30) sim.ghostPositions.shift();
      }

      // Update projectile
      if (projectileRef.current) {
        projectileRef.current.position.set(x, y + 0.5, 0);
        // Rotate to face velocity direction
        const speed = Math.sqrt(sim.state.vx * sim.state.vx + sim.state.vy * sim.state.vy);
        if (speed > 0.1) {
          projectileRef.current.rotation.z = -Math.atan2(sim.state.vy, sim.state.vx);
        }
      }

      // Velocity arrow
      if (velArrowRef.current && showVelocityVector) {
        const vScale = 0.15;
        velArrowRef.current.position.set(x, y + 0.5, 0);
        const arrowAngle = Math.atan2(sim.state.vy, sim.state.vx);
        const speed = Math.sqrt(sim.state.vx * sim.state.vx + sim.state.vy * sim.state.vy);
        velArrowRef.current.rotation.z = arrowAngle - Math.PI / 2;
        velArrowRef.current.scale.set(1, Math.max(speed * vScale, 0.1), 1);
        velArrowRef.current.visible = speed > 0.5;
      }

      // Trail
      if (showTrail && trailRef.current) {
        const idx = trailBuf.idx % MAX_TRAIL;
        trailBuf.positions[idx * 3] = x;
        trailBuf.positions[idx * 3 + 1] = y + 0.5;
        trailBuf.positions[idx * 3 + 2] = 0;
        const speed = Math.sqrt(sim.state.vx * sim.state.vx + sim.state.vy * sim.state.vy);
        const t = Math.min(speed / velocity, 1);
        trailBuf.colors[idx * 3] = 0.2 + t * 0.8;
        trailBuf.colors[idx * 3 + 1] = 0.6 - t * 0.4;
        trailBuf.colors[idx * 3 + 2] = 1.0 - t * 0.7;
        trailBuf.idx++;
        const pos = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const col = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
        pos.needsUpdate = true;
        col.needsUpdate = true;
        trailRef.current.geometry.setDrawRange(0, Math.min(trailBuf.idx, MAX_TRAIL));
      }

      // Target hit check
      if (!targetHit && Math.abs(x - targetDistance) < 2 && y < 2) {
        setTargetHit(true);
      }

      // Landing
      if (sim.state.y <= 0 && sim.time > 0.1) {
        sim.launched = false;
        // Landing dust
        for (let i = 0; i < 20; i++) {
          smokeData.current.push({
            pos: new THREE.Vector3(x + (Math.random() - 0.5) * 0.5, 0.5, (Math.random() - 0.5) * 0.5),
            vel: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4),
            life: 0,
            maxLife: 0.8 + Math.random() * 1.5,
          });
        }
      }

      // Data callback
      dataTimer.current += rawDt;
      if (dataTimer.current >= 0.066) {
        dataTimer.current = 0;
        const speed = Math.sqrt(sim.state.vx * sim.state.vx + sim.state.vy * sim.state.vy);
        const ke = 0.5 * mass * speed * speed;
        const pe = mass * gravity * y;
        const impactVel = sim.state.y <= 0 ? speed : 0;
        const impactAngle = sim.state.y <= 0 ? Math.abs(Math.atan2(sim.state.vy, sim.state.vx) * 180 / Math.PI) : 0;
        onDataChange?.({
          currentX: x,
          currentY: y,
          velocityX: sim.state.vx,
          velocityY: sim.state.vy,
          speed,
          flightTime: sim.time,
          maxHeight: sim.maxHeight,
          range: x,
          predictedRange,
          predictedMaxHeight,
          predictedTimeOfFlight: predictedTOF,
          kineticEnergy: ke,
          potentialEnergy: pe,
          hasLanded: !sim.launched,
          impactVelocity: impactVel,
          impactAngle: impactAngle,
        });
      }
    }
  });

  // Ghost marker component
  const ghostMarkers = useMemo(() => {
    if (!showGhostMarkers) return null;
    return simRef.current.ghostPositions.map((pos, i) => (
      <mesh key={`ghost-${i}`} position={pos}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGhostMarkers, simRef.current.ghostPositions.length]);

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[30, 40, 20]} intensity={1.0} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-100} shadow-camera-right={100}
        shadow-camera-top={50} shadow-camera-bottom={-10} />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />
      <hemisphereLight args={["#87ceeb", "#3d2b1f", 0.3]} />

      {/* ====== SKY DOME ====== */}
      <mesh position={[50, -5, 0]}>
        <sphereGeometry args={[300, 32, 32]} />
        <meshBasicMaterial color="#0a0a2e" side={THREE.BackSide} />
      </mesh>

      {/* ====== GROUND ====== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -0.01, 0]} receiveShadow>
        <planeGeometry args={[300, 100]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.95} />
      </mesh>
      <gridHelper args={[300, 150, "#1a3a1a", "#0a1a0a"]} position={[50, 0.01, 0]} />

      {/* ====== BACKGROUND HILLS ====== */}
      {[30, 60, 100, 150].map((dist, i) => (
        <mesh key={i} position={[dist, -2, -20 - i * 5]}>
          <coneGeometry args={[15 + i * 5, 8 + i * 3, 6]} />
          <meshStandardMaterial color={`rgb(${20 + i * 5}, ${40 + i * 8}, ${20 + i * 5})`} />
        </mesh>
      ))}

      {/* ====== DISTANCE MARKERS ====== */}
      {showDistanceMarkers && Array.from({ length: 15 }).map((_, i) => {
        const dist = (i + 1) * 10;
        return (
          <group key={i} position={[dist, 0, -4]}>
            <mesh>
              <boxGeometry args={[0.08, 0.5, 0.5]} />
              <meshStandardMaterial color="#3a3a5a" />
            </mesh>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.5}
              color="#6a6a8a"
              anchorX="center"
              anchorY="middle"
            >
              {`${dist}m`}
            </Text>
          </group>
        );
      })}

      {/* ====== HEIGHT MARKERS ====== */}
      {Array.from({ length: 8 }).map((_, i) => {
        const h = (i + 1) * 5;
        return (
          <group key={i} position={[-2, h, 0]}>
            <mesh>
              <boxGeometry args={[1, 0.06, 0.06]} />
              <meshStandardMaterial color="#2a2a4a" />
            </mesh>
            <Text position={[-0.8, 0, 0]} fontSize={0.35} color="#4a4a6a" anchorX="center">
              {`${h}m`}
            </Text>
          </group>
        );
      })}

      {/* ====== LAUNCHER ====== */}
      <group ref={launcherRef} position={[0, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 2.2, 0.3, 32]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <torusGeometry args={[1.5, 0.08, 8, 32]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Rotating barrel */}
        <group rotation={[0, 0, angleRad]}>
          <mesh position={[1, 0, 0]} castShadow>
            <boxGeometry args={[2, 0.35, 0.5]} />
            <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 1.8, 16]} />
            <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#5a5a6a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Muzzle indicator */}
          <mesh position={[3.3, 0, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* Control panel */}
        <mesh position={[-1.2, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.35]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[-1.2, 0.75, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* ====== PROJECTILE ====== */}
      <mesh ref={projectileRef} position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#ef4444" metalness={0.85} roughness={0.15} emissive="#ef4444" emissiveIntensity={0.2} />
      </mesh>

      {/* ====== VELOCITY ARROW ====== */}
      {showVelocityVector && (
        <group ref={velArrowRef}>
          <ArrowMesh color="#22c55e" label="v" />
        </group>
      )}

      {/* ====== PREDICTED TRAJECTORY ====== */}
      {showPrediction && predictedPoints.length > 0 && (
        <Line points={predictedPoints} color="#4ade80" lineWidth={2} dashed dashSize={0.5} gapSize={0.3} opacity={0.5} />
      )}

      {/* ====== TRAIL ====== */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeo}>
          <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation depthWrite={false} />
        </points>
      )}

      {/* ====== GHOST MARKERS ====== */}
      {ghostMarkers}

      {/* ====== TARGET ====== */}
      <TargetAssembly position={[targetDistance, 0, 0]} isHit={targetHit} />

      {/* ====== SMOKE PARTICLES ====== */}
      <group ref={smokeRef}>
        {Array.from({ length: 35 }).map((_, i) => (
          <mesh key={i} ref={(el) => { if (el) smokeParticles.current[i] = el; }} visible={false}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshBasicMaterial color="#aaaaaa" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ArrowMesh({ color, label }: { color: string; label: string }) {
  return (
    <group>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0.4, -0.5, 0]} center>
        <div className="text-[9px] font-bold px-1 py-0.5 rounded pointer-events-none select-none"
          style={{ color, backgroundColor: "rgba(0,0,0,0.6)" }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function TargetAssembly({ position, isHit }: { position: [number, number, number]; isHit: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.8, 0.2, 32]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 6, 8]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0, 6.2, 0]}>
        {/* Target face */}
        {[1.5, 1.2, 0.9, 0.6, 0.3].map((r, i) => {
          const colors = ["#ffffff", "#ff0000", "#ffffff", "#ff0000", "#ffcc00"];
          return (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.15, r, 32]} />
              <meshBasicMaterial color={colors[i]} />
            </mesh>
          );
        })}
        {/* Hit glow */}
        {isHit && (
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
      {/* Distance label */}
      <Text position={[0, 7.5, 0]} fontSize={0.5} color="#6a6a8a" anchorX="center">
        {`${position[0]}m`}
      </Text>
    </group>
  );
}

export default ProjectileMotionSceneComponent;
