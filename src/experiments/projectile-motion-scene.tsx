"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
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
  // Refs for all physics state
  const projectileRef = useRef<THREE.Mesh>(null);
  const velArrowRef = useRef<THREE.Group>(null);
  const launcherRef = useRef<THREE.Group>(null);

  // Instanced mesh for ghost markers (performance optimization)
  const ghostInstancedRef = useRef<THREE.InstancedMesh>(null);
  const GHOST_COUNT = 30;

  // Trail line points (smooth curve instead of dots)
  const trailPointsRef = useRef<[number, number, number][]>([]);
  const MAX_TRAIL_POINTS = 500;

  // Simulation state - ALL in refs for performance
  const simRef = useRef({
    launched: false,
    state: { x: 0, y: 0, vx: 0, vy: 0 } as State2D,
    time: 0,
    maxHeight: 0,
    ghostTimer: 0,
    ghostCount: 0,
    lastDataUpdate: 0,
  });

  // React state for target hit only
  const [targetHit, setTargetHit] = useState(false);

  // Computed values
  const angleRad = (angle * Math.PI) / 180;

  // Predicted trajectory (no drag, analytical)
  const predictedPoints = useMemo(() => {
    if (!showPrediction) return [];
    const pts: [number, number, number][] = [];
    const totalTime = (2 * velocity * Math.sin(angleRad)) / gravity;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalTime;
      const x = velocity * Math.cos(angleRad) * t;
      const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
      pts.push([x, Math.max(y, 0) + 0.5, 0]);
    }
    return pts;
  }, [velocity, angleRad, gravity, showPrediction]);

  const predictedRange = (velocity * velocity * Math.sin(2 * angleRad)) / gravity;
  const predictedMaxHeight = (velocity * velocity * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * gravity);
  const predictedTOF = (2 * velocity * Math.sin(angleRad)) / gravity;

  // Launch angle indicator arc
  const angleArcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const arcRadius = 3;
    const arcLength = angleRad;
    const steps = 20;
    // Arc from 0 (horizontal) to angle
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * arcLength;
      pts.push([
        Math.cos(Math.PI / 2 - t) * arcRadius,
        Math.sin(Math.PI / 2 - t) * arcRadius + 0.5,
        0
      ]);
    }
    return pts;
  }, [angleRad]);

  // Reset handler
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
        ghostCount: 0,
        lastDataUpdate: 0,
      };
      trailPointsRef.current = [];
      setTargetHit(false);
      if (projectileRef.current) {
        projectileRef.current.position.set(0, 0.5, 0);
      }
      // Reset ghost instances
      if (ghostInstancedRef.current) {
        const dummy = new THREE.Object3D();
        dummy.position.set(0, -1000, 0); // Hide off-screen
        for (let i = 0; i < GHOST_COUNT; i++) {
          dummy.updateMatrix();
          ghostInstancedRef.current.setMatrixAt(i, dummy.matrix);
        }
        ghostInstancedRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [resetTrigger, angle, velocity]);

  // Combined useFrame for minimal overhead
  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const sim = simRef.current;

    // Update launcher rotation
    if (launcherRef.current) {
      const barrelGroup = launcherRef.current.children[2];
      if (barrelGroup) {
        barrelGroup.rotation.z = angleRad;
      }
    }

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

      // Update projectile position
      if (projectileRef.current) {
        projectileRef.current.position.set(x, y + 0.5, 0);
        const speed = Math.sqrt(sim.state.vx * sim.state.vx + sim.state.vy * sim.state.vy);
        if (speed > 0.1) {
          projectileRef.current.rotation.z = -Math.atan2(sim.state.vy, sim.state.vx);
        }
      }

      // Update trail points
      if (showTrail) {
        trailPointsRef.current.push([x, y + 0.5, 0]);
        if (trailPointsRef.current.length > MAX_TRAIL_POINTS) {
          trailPointsRef.current.shift();
        }
      }

      // Ghost markers every 0.5s (using instanced mesh)
      if (showGhostMarkers) {
        sim.ghostTimer += dt;
        if (sim.ghostTimer >= 0.5) {
          sim.ghostTimer -= 0.5;
          if (sim.ghostCount < GHOST_COUNT) {
            sim.ghostCount++;
          }
        }
      }

      // Update ghost instances
      if (ghostInstancedRef.current && showGhostMarkers) {
        const dummy = new THREE.Object3D();
        // Calculate ghost positions based on time intervals
        for (let i = 0; i < sim.ghostCount; i++) {
          const ghostTime = (i + 1) * 0.5;
          let gx, gy;
          if (!airResistance) {
            gx = velocity * Math.cos(angleRad) * ghostTime;
            gy = Math.max(0, velocity * Math.sin(angleRad) * ghostTime - 0.5 * gravity * ghostTime * ghostTime);
          } else {
            // For air resistance, we can recalculate - this is fast enough
            let gState = { x: 0, y: 0, vx: velocity * Math.cos(angleRad), vy: velocity * Math.sin(angleRad) };
            const steps = Math.max(1, Math.ceil(ghostTime / 0.004));
            const subDt = ghostTime / steps;
            for (let s = 0; s < steps; s++) {
              gState = rk4Projectile(gState, gravity, dragCoefficient, mass, subDt);
            }
            gx = gState.x;
            gy = Math.max(0, gState.y);
          }
          dummy.position.set(gx, gy + 0.5, 0);
          dummy.updateMatrix();
          ghostInstancedRef.current.setMatrixAt(i, dummy.matrix);
        }
        // Hide unused instances
        for (let i = sim.ghostCount; i < GHOST_COUNT; i++) {
          dummy.position.set(0, -1000, 0);
          dummy.updateMatrix();
          ghostInstancedRef.current.setMatrixAt(i, dummy.matrix);
        }
        ghostInstancedRef.current.instanceMatrix.needsUpdate = true;
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

      // Target hit check
      if (!targetHit && Math.abs(x - targetDistance) < 2 && y < 2) {
        setTargetHit(true);
      }

      // Landing
      if (sim.state.y <= 0 && sim.time > 0.1) {
        sim.launched = false;
      }

      // Data callback throttled to every 10 frames (~166ms at 60fps)
      sim.lastDataUpdate += rawDt;
      if (sim.lastDataUpdate >= 0.166) {
        sim.lastDataUpdate = 0;
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

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 20]} intensity={1.0} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-100} shadow-camera-right={100}
        shadow-camera-top={50} shadow-camera-bottom={-10} />
      <hemisphereLight args={["#87ceeb", "#3d2b1f", 0.3]} />

      {/* ====== GROUND WITH GRID ====== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, -0.01, 0]} receiveShadow>
        <planeGeometry args={[300, 150]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.95} />
      </mesh>
      <gridHelper args={[300, 150, "#2a4a2a", "#1a3a1a"]} position={[60, 0.01, 0]} />

      {/* ====== SKY DOME ====== */}
      <mesh position={[60, -10, 0]}>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial color="#0a0a2e" side={THREE.BackSide} />
      </mesh>

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

      {/* ====== LAUNCH ANGLE INDICATOR ARC ====== */}
      {showPrediction && angleArcPoints.length > 0 && (
        <Line points={angleArcPoints} color="#f59e0b" lineWidth={2} opacity={0.7} />
      )}

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

      {/* ====== TRAIL (smooth curve) ====== */}
      {showTrail && trailPointsRef.current.length > 1 && (
        <Line
          points={trailPointsRef.current}
          color="#60a5fa"
          lineWidth={3}
          opacity={0.8}
        />
      )}

      {/* ====== GHOST MARKERS (instanced) ====== */}
      {showGhostMarkers && (
        <instancedMesh
          ref={ghostInstancedRef}
          args={[new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.4 }), GHOST_COUNT]}
          position={[0, 0, 0]}
        />
      )}

      {/* ====== TARGET ====== */}
      <TargetAssembly position={[targetDistance, 0, 0]} isHit={targetHit} />
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
        {[1.5, 1.2, 0.9, 0.6, 0.3].map((r, i) => {
          const colors = ["#ffffff", "#ff0000", "#ffffff", "#ff0000", "#ffcc00"];
          return (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.15, r, 32]} />
              <meshBasicMaterial color={colors[i]} />
            </mesh>
          );
        })}
        {isHit && (
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
      <Text position={[0, 7.5, 0]} fontSize={0.5} color="#6a6a8a" anchorX="center">
        {`${position[0]}m`}
      </Text>
    </group>
  );
}

export default ProjectileMotionSceneComponent;
