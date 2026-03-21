"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html, Text } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// INTERFACES
// ============================================

interface PendulumSceneProps {
  onDataChange?: (data: PendulumData) => void;
  length?: number;
  gravity?: number;
  mass?: number;
  damping?: number;
  initialAngle?: number;
  showTrail?: boolean;
  showVectors?: boolean;
  showAngleArc?: boolean;
  showProtractor?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export interface PendulumData {
  period: number;
  periodMeasured: number;
  frequency: number;
  angularFrequency: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  angle: number;
  angleDeg: number;
  angularVelocity: number;
  tangentialVelocity: number;
  elapsedTime: number;
  oscillations: number;
  phaseAngle: number;
  phaseVelocity: number;
}

// ============================================
// PHYSICS HELPERS
// ============================================

/** Large-angle period correction: T = T₀ × (1 + θ₀²/16 + 11θ₀⁴/3072) */
function correctedPeriod(L: number, g: number, theta0: number): number {
  const T0 = 2 * Math.PI * Math.sqrt(L / g);
  const correction = 1 + (theta0 * theta0) / 16 + (11 * theta0 * theta0 * theta0 * theta0) / 3072;
  return T0 * correction;
}

function pendulumPE(m: number, g: number, L: number, theta: number): number {
  return m * g * L * (1 - Math.cos(theta));
}

function pendulumKE(m: number, L: number, omega: number): number {
  return 0.5 * m * L * L * omega * omega;
}

// ============================================
// RK4 INTEGRATOR
// ============================================

function rk4Step(
  theta: number, omega: number,
  g: number, L: number, b: number, dt: number
): [number, number] {
  const f = (th: number, om: number): [number, number] => {
    const dTheta = om;
    const dOmega = -(g / L) * Math.sin(th) - b * om;
    return [dTheta, dOmega];
  };

  const [k1a, k1b] = f(theta, omega);
  const [k2a, k2b] = f(theta + k1a * dt * 0.5, omega + k1b * dt * 0.5);
  const [k3a, k3b] = f(theta + k2a * dt * 0.5, omega + k2b * dt * 0.5);
  const [k4a, k4b] = f(theta + k3a * dt, omega + k3b * dt);

  const newTheta = theta + (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
  const newOmega = omega + (dt / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
  return [newTheta, newOmega];
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

export function PendulumSceneComponent({
  onDataChange,
  length = 10,
  gravity = 9.81,
  mass = 2,
  damping = 0.005,
  initialAngle = Math.PI / 4,
  showTrail = true,
  showVectors = true,
  showAngleArc = true,
  showProtractor = true,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger,
}: PendulumSceneProps) {
  // Refs
  const bobRef = useRef<THREE.Group>(null);
  const stringRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const velocityArrowRef = useRef<THREE.Group>(null);
  const gravityArrowRef = useRef<THREE.Group>(null);
  const tensionArrowRef = useRef<THREE.Group>(null);
  const netArrowRef = useRef<THREE.Group>(null);
  const angleArcRef = useRef<any>(null);

  // Physics state (refs for per-frame)
  const stateRef = useRef({
    theta: initialAngle,
    omega: 0,
    time: 0,
    lastTheta: initialAngle,
    oscillations: 0,
    lastCrossTime: 0,
    measuredPeriod: 0,
  });
  const dataTimerRef = useRef(0);

  // Trail
  const MAX_TRAIL = 1200;
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

  // Bob radius scales with mass (visual hint)
  const bobRadius = 0.5 + mass * 0.08;

  // Reset
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      stateRef.current = {
        theta: initialAngle,
        omega: 0,
        time: 0,
        lastTheta: initialAngle,
        oscillations: 0,
        lastCrossTime: 0,
        measuredPeriod: 0,
      };
      dataTimerRef.current = 0;
      trailBuf.idx = 0;
      trailBuf.positions.fill(0);
      trailBuf.colors.fill(0);
    }
  }, [resetTrigger, initialAngle, trailBuf]);

  // Cleanup
  useEffect(() => {
    return () => { trailGeo.dispose(); };
  }, [trailGeo]);

  // Frame loop
  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const s = stateRef.current;

    if (isPlaying && dt > 0) {
      // Sub-step for stability at high speed
      const steps = Math.max(1, Math.ceil(dt / 0.004));
      const subDt = dt / steps;
      for (let i = 0; i < steps; i++) {
        const [newTheta, newOmega] = rk4Step(s.theta, s.omega, gravity, length, damping, subDt);
        s.lastTheta = s.theta;
        s.theta = newTheta;
        s.omega = newOmega;
      }
      s.time += dt;

      // Count oscillations (zero-crossing detection)
      if (s.lastTheta < 0 && s.theta >= 0) {
        s.oscillations++;
        if (s.lastCrossTime > 0) {
          s.measuredPeriod = s.time - s.lastCrossTime;
        }
        s.lastCrossTime = s.time;
      }
    }

    const theta = s.theta;
    const omega = s.omega;

    // Bob position
    const bx = Math.sin(theta) * length;
    const by = -Math.cos(theta) * length;

    // Update bob
    if (bobRef.current) {
      bobRef.current.position.set(bx, by, 0);
    }

    // Update string (thin cylinder from pivot to bob)
    if (stringRef.current) {
      const midX = bx * 0.5;
      const midY = by * 0.5;
      stringRef.current.position.set(midX, midY, 0);
      const strLen = Math.sqrt(bx * bx + by * by);
      stringRef.current.scale.set(1, strLen, 1);
      stringRef.current.rotation.z = Math.atan2(bx, -by);
    }

    // Trail
    if (showTrail && isPlaying && trailRef.current) {
      const idx = trailBuf.idx % MAX_TRAIL;
      trailBuf.positions[idx * 3] = bx;
      trailBuf.positions[idx * 3 + 1] = by;
      trailBuf.positions[idx * 3 + 2] = 0;
      const speed = Math.abs(omega);
      const t = Math.min(speed / 3, 1);
      trailBuf.colors[idx * 3] = 0.4 + t * 0.6;
      trailBuf.colors[idx * 3 + 1] = 0.3 + t * 0.4;
      trailBuf.colors[idx * 3 + 2] = 1.0 - t * 0.2;
      trailBuf.idx++;
      const pos = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const col = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
      pos.needsUpdate = true;
      col.needsUpdate = true;
      trailRef.current.geometry.setDrawRange(0, Math.min(trailBuf.idx, MAX_TRAIL));
    }

    // Force vectors
    if (showVectors) {
      const vScale = 0.3;
      const tangentialSpeed = omega * length;
      // Velocity (tangent to arc)
      if (velocityArrowRef.current) {
        const vx = Math.cos(theta) * tangentialSpeed * vScale;
        const vy = Math.sin(theta) * tangentialSpeed * vScale;
        velocityArrowRef.current.position.set(bx, by, 0);
        velocityArrowRef.current.rotation.z = Math.atan2(vy, vx) - Math.PI / 2;
        const mag = Math.sqrt(vx * vx + vy * vy);
        velocityArrowRef.current.scale.set(1, Math.max(mag, 0.01), 1);
        velocityArrowRef.current.visible = mag > 0.05;
      }

      // Gravity (always down)
      if (gravityArrowRef.current) {
        gravityArrowRef.current.position.set(bx, by, 0);
        gravityArrowRef.current.rotation.z = 0; // pointing down
        gravityArrowRef.current.scale.set(1, mass * gravity * 0.05, 1);
      }

      // Tension (along string toward pivot)
      if (tensionArrowRef.current) {
        const tensionMag = mass * gravity * Math.cos(theta) + mass * length * omega * omega;
        tensionArrowRef.current.position.set(bx, by, 0);
        tensionArrowRef.current.rotation.z = Math.atan2(-bx, -by) + Math.PI / 2;
        tensionArrowRef.current.scale.set(1, Math.max(tensionMag * 0.05, 0.01), 1);
      }

      // Net force
      if (netArrowRef.current) {
        const fx = -mass * gravity * Math.sin(theta) - damping * omega * mass * length * Math.cos(theta);
        const fy = -mass * gravity * Math.cos(theta) + mass * length * omega * omega - damping * omega * mass * length * Math.sin(theta);
        const fMag = Math.sqrt(fx * fx + fy * fy);
        netArrowRef.current.position.set(bx, by, 0);
        netArrowRef.current.rotation.z = Math.atan2(fy, fx) - Math.PI / 2;
        netArrowRef.current.scale.set(1, Math.max(fMag * 0.05, 0.01), 1);
        netArrowRef.current.visible = fMag > 0.01;
      }
    }

    // Angle arc
    if (showAngleArc && angleArcRef.current) {
      const arcPoints: [number, number, number][] = [];
      const arcLen = Math.abs(theta);
      const arcSteps = 30;
      const arcRadius = Math.min(length * 0.3, 3);
      for (let i = 0; i <= arcSteps; i++) {
        const a = (i / arcSteps) * arcLen * Math.sign(theta);
        arcPoints.push([
          Math.sin(a) * arcRadius,
          -Math.cos(a) * arcRadius,
          0
        ]);
      }
      const pos = angleArcRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < arcPoints.length; i++) {
        pos.setXYZ(i, arcPoints[i][0], arcPoints[i][1], arcPoints[i][2]);
      }
      for (let i = arcPoints.length; i < pos.count; i++) {
        pos.setXYZ(i, 0, 0, 0);
      }
      pos.needsUpdate = true;
    }

    // Throttled data callback (~15fps)
    dataTimerRef.current += rawDt;
    if (dataTimerRef.current >= 0.066) {
      dataTimerRef.current = 0;
      const ke = pendulumKE(mass, length, omega);
      const pe = pendulumPE(mass, gravity, length, theta);
      onDataChange?.({
        period: correctedPeriod(length, gravity, Math.abs(initialAngle)),
        periodMeasured: s.measuredPeriod,
        frequency: 1 / correctedPeriod(length, gravity, Math.abs(initialAngle)),
        angularFrequency: Math.sqrt(gravity / length),
        kineticEnergy: ke,
        potentialEnergy: pe,
        totalEnergy: ke + pe,
        angle: theta,
        angleDeg: (theta * 180) / Math.PI,
        angularVelocity: omega,
        tangentialVelocity: omega * length,
        elapsedTime: s.time,
        oscillations: s.oscillations,
        phaseAngle: theta,
        phaseVelocity: omega,
      });
    }
  });

  // Arrow component for force vectors
  const arrowColor = useCallback((type: "velocity" | "gravity" | "tension" | "net") => {
    const colors = { velocity: "#22c55e", gravity: "#3b82f6", tension: "#ef4444", net: "#eab308" };
    return colors[type];
  }, []);

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[15, 25, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 12, -8]} intensity={0.3} />
      <pointLight position={[0, 5, 8]} intensity={0.4} color="#8b5cf6" />

      {/* ====== SUPPORT FRAME ====== */}
      <SupportFrame width={length * 1.6} height={length * 1.15} />

      {/* ====== PROTRACTOR ON GROUND ====== */}
      {showProtractor && <ProtractorArc radius={Math.min(length * 0.4, 4)} maxAngle={80} />}

      {/* ====== EQUILIBRIUM LINE ====== */}
      <Line
        points={[[0, 0, 0], [0, -length - 2, 0]]}
        color="#ffffff"
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.2}
        opacity={0.25}
      />

      {/* ====== ANGLE ARC ====== */}
      {showAngleArc && (
        <Line
          ref={angleArcRef}
          points={Array.from({ length: 31 }, () => [0, 0, 0])}
          color="#f59e0b"
          lineWidth={2}
        />
      )}

      {/* ====== STRING ====== */}
      <mesh ref={stringRef} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ====== TRAIL ====== */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeo}>
          <pointsMaterial
            size={0.12}
            vertexColors
            transparent
            opacity={0.7}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* ====== BOB ASSEMBLY ====== */}
      <group ref={bobRef}>
        {/* Hook ring at top */}
        <mesh position={[0, bobRadius + 0.15, 0]}>
          <torusGeometry args={[0.15, 0.04, 8, 16]} />
          <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Main bob */}
        <mesh castShadow>
          <sphereGeometry args={[bobRadius, 48, 48]} />
          <meshStandardMaterial
            color="#a855f7"
            metalness={0.85}
            roughness={0.15}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Inner core */}
        <mesh>
          <sphereGeometry args={[bobRadius * 0.55, 32, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            metalness={0.7}
            roughness={0.2}
            emissive="#ec4899"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Glow */}
        <mesh>
          <sphereGeometry args={[bobRadius * 1.35, 32, 32]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Mass label */}
        <Html position={[bobRadius + 0.5, 0, 0]} center>
          <div className="text-[10px] text-purple-300 bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            {mass.toFixed(1)} kg
          </div>
        </Html>
      </group>

      {/* ====== FORCE VECTORS ====== */}
      {showVectors && (
        <>
          <group ref={velocityArrowRef}>
            <ArrowMesh color="#22c55e" label="v" />
          </group>
          <group ref={gravityArrowRef}>
            <ArrowMesh color="#3b82f6" label="mg" />
          </group>
          <group ref={tensionArrowRef}>
            <ArrowMesh color="#ef4444" label="T" />
          </group>
          <group ref={netArrowRef}>
            <ArrowMesh color="#eab308" label="F" />
          </group>
        </>
      )}
    </group>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Arrow for force/velocity vectors */
function ArrowMesh({ color, label }: { color: string; label: string }) {
  return (
    <group>
      {/* Shaft */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Label */}
      <Html position={[0.3, -0.5, 0]} center>
        <div className="text-[9px] font-bold px-1 py-0.5 rounded pointer-events-none select-none"
          style={{ color, backgroundColor: "rgba(0,0,0,0.6)" }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

/** Metal support frame */
function SupportFrame({ width, height }: { width: number; height: number }) {
  const beamH = 0.5;
  const pillarW = 0.4;
  const beamColor = "#2a2a3e";
  const metalMat = { color: beamColor, metalness: 0.8, roughness: 0.25 };

  return (
    <group>
      {/* Top horizontal beam */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, beamH, pillarW * 1.5]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* I-beam flanges */}
      <mesh position={[0, beamH * 0.35, 0]}>
        <boxGeometry args={[width, 0.08, pillarW * 2]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[0, -beamH * 0.35, 0]}>
        <boxGeometry args={[width, 0.08, pillarW * 2]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Left pillar */}
      <mesh position={[-width / 2 + pillarW / 2, -height / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, height, pillarW]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Right pillar */}
      <mesh position={[width / 2 - pillarW / 2, -height / 2, 0]} castShadow>
        <boxGeometry args={[pillarW, height, pillarW]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Cross brace */}
      <mesh position={[0, -height, 0]} receiveShadow>
        <boxGeometry args={[width, 0.3, pillarW * 1.2]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Pivot bearing */}
      <mesh position={[0, -beamH / 2 - 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Base plates */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - pillarW / 2), -height - 0.15, 0]} receiveShadow>
          <boxGeometry args={[pillarW * 2, 0.15, pillarW * 2]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Protractor arc on the ground plane */
function ProtractorArc({ radius, maxAngle }: { radius: number; maxAngle: number }) {
  const ticks = useMemo(() => {
    const points: React.ReactElement[] = [];
    for (let deg = -maxAngle; deg <= maxAngle; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 10 === 0;
      const innerR = isMajor ? radius * 0.85 : radius * 0.92;
      points.push(
        <Line
          key={deg}
          points={[
            [Math.sin(rad) * innerR, -Math.cos(rad) * innerR, 0],
            [Math.sin(rad) * radius, -Math.cos(rad) * radius, 0],
          ]}
          color={isMajor ? "#4a4a6a" : "#2a2a4a"}
          lineWidth={isMajor ? 2 : 1}
        />
      );
      if (isMajor && deg !== 0) {
        points.push(
          <Text
            key={`label-${deg}`}
            position={[
              Math.sin(rad) * (radius + 0.5),
              -Math.cos(rad) * (radius + 0.5),
              0,
            ]}
            fontSize={0.35}
            color="#6a6a8a"
            anchorX="center"
            anchorY="middle"
          >
            {`${Math.abs(deg)}°`}
          </Text>
        );
      }
    }
    return points;
  }, [radius, maxAngle]);

  return (
    <group position={[0, 0, 0]}>
      {/* Protractor arc */}
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const a = ((i / 63) * maxAngle * 2 - maxAngle) * (Math.PI / 180);
          return [Math.sin(a) * radius, -Math.cos(a) * radius, 0];
        })}
        color="#3a3a5a"
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      {ticks}
    </group>
  );
}

export default PendulumSceneComponent;
