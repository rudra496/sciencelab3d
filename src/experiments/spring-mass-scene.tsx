"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// INTERFACES
// ============================================

interface SpringMassSceneProps {
  onDataChange?: (data: SpringMassData) => void;
  mass?: number;
  springConstant?: number;
  damping?: number;
  initialDisplacement?: number;
  numberOfMasses?: number;
  showTrail?: boolean;
  showVectors?: boolean;
  showEnergyBars?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export interface SpringMassData {
  period: number;
  frequency: number;
  angularFrequency: number;
  displacement: number;
  velocity: number;
  kineticEnergy: number;
  springPotentialEnergy: number;
  gravitationalPotentialEnergy: number;
  totalEnergy: number;
  springForce: number;
  dampingForce: number;
  elapsedTime: number;
  equilibriumPosition: number;
}

// ============================================
// PHYSICS HELPERS
// ============================================

/** Calculate natural frequency ω = sqrt(k/m) */
function calculateAngularFrequency(k: number, m: number): number {
  return Math.sqrt(k / m);
}

/** Calculate period T = 2π/ω */
function calculatePeriod(k: number, m: number): number {
  return 2 * Math.PI * Math.sqrt(m / k);
}

/** Calculate frequency f = 1/T */
function calculateFrequency(k: number, m: number): number {
  return 1 / (2 * Math.PI * Math.sqrt(m / k));
}

/** Calculate spring potential energy PE_spring = ½kx² */
function calculateSpringPE(k: number, x: number): number {
  return 0.5 * k * x * x;
}

/** Calculate kinetic energy KE = ½mv² */
function calculateKE(m: number, v: number): number {
  return 0.5 * m * v * v;
}

// ============================================
// RK4 INTEGRATOR FOR DAMPED HARMONIC MOTION
// ============================================

function rk4Step(
  x: number, v: number,
  k: number, m: number, b: number, dt: number
): [number, number] {
  // Equation: a = -(k/m)x - (b/m)v
  const f = (pos: number, vel: number): [number, number] => {
    const dx = vel;
    const dv = -(k / m) * pos - (b / m) * vel;
    return [dx, dv];
  };

  const [k1x, k1v] = f(x, v);
  const [k2x, k2v] = f(x + k1x * dt * 0.5, v + k1v * dt * 0.5);
  const [k3x, k3v] = f(x + k2x * dt * 0.5, v + k2v * dt * 0.5);
  const [k4x, k4v] = f(x + k3x * dt, v + k3v * dt);

  const newX = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
  const newV = v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
  return [newX, newV];
}

// ============================================
// SPRING COILS GENERATION (ZIGZAG)
// ============================================

interface SpringCoilsProps {
  topY: number;
  bottomY: number;
  width?: number;
  coils?: number;
  color?: string;
}

function SpringCoils({ topY, bottomY, width = 0.4, coils = 10, color = "#888" }: SpringCoilsProps) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const length = topY - bottomY;
    const segments = coils * 4; // 4 segments per coil for zigzag

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = topY - t * length;

      // Zigzag pattern in X direction
      let x = 0;
      const phase = (i % 4);
      if (phase === 1) x = width;
      else if (phase === 3) x = -width;

      pts.push([x, y, 0]);
    }
    return pts;
  }, [topY, bottomY, width, coils]);

  return <Line points={points} color={color} lineWidth={2} />;
}

// ============================================
// 3D ENERGY BAR COMPONENT
// ============================================

interface EnergyBar3DProps {
  position: [number, number, number];
  value: number;
  maxValue: number;
  color: string;
  label: string;
}

function EnergyBar3D({ position, value, maxValue, color, label }: EnergyBar3DProps) {
  const height = Math.max(0.1, (value / maxValue) * 3);
  const width = 0.3;
  const depth = 0.3;

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[width * 1.5, 0.1, depth * 1.5]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Bar */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Label */}
      <Html position={[width, 0.5, 0]} center distanceFactor={8}>
        <div className="text-[9px] font-bold whitespace-nowrap pointer-events-none select-none"
          style={{ color, backgroundColor: "rgba(0,0,0,0.7)", padding: "2px 6px", borderRadius: "4px" }}>
          {label}: {value.toFixed(2)} J
        </div>
      </Html>
    </group>
  );
}

// ============================================
// MAIN SCENE COMPONENT
// ============================================

export function SpringMassSceneComponent({
  onDataChange,
  mass = 2,
  springConstant = 50,
  damping = 0.3,
  initialDisplacement = 2,
  numberOfMasses = 1,
  showTrail = true,
  showVectors = true,
  showEnergyBars = true,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger,
}: SpringMassSceneProps) {
  // Refs for masses and springs
  const massRefs = useRef<(THREE.Mesh | null)[]>([]);
  const springRefs = useRef<(THREE.Group | null)[]>([]);
  const trailRef = useRef<THREE.Points>(null);
  const velocityArrowRef = useRef<THREE.Group>(null);
  const forceArrowRef = useRef<THREE.Group>(null);

  // Physics state
  const stateRef = useRef({
    displacements: [] as number[],
    velocities: [] as number[],
    time: 0,
  });

  // Trail
  const MAX_TRAIL = 800;
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

  // Constants
  const g = 9.81;
  const ceilingY = 2;
  const restSpringLength = 3;
  const massSize = 0.6;

  // Calculate equilibrium positions
  // For a vertical spring with mass, equilibrium is where mg = k(stretch)
  // stretch = mg/k, so equilibrium y = -restLength - stretch
  const equilibriumY = useMemo(() => {
    if (numberOfMasses === 1) {
      const stretch = (mass * g) / springConstant;
      return ceilingY - restSpringLength - stretch - massSize / 2;
    }
    // For multiple masses in series, calculate each equilibrium
    const positions: number[] = [];
    let currentY = ceilingY;
    for (let i = 0; i < numberOfMasses; i++) {
      const stretch = ((numberOfMasses - i) * mass * g) / springConstant;
      currentY = currentY - restSpringLength - stretch - massSize;
      positions.push(currentY);
    }
    return positions;
  }, [numberOfMasses, mass, springConstant, ceilingY, restSpringLength, massSize, g]);

  const dataTimerRef = useRef(0);

  // Initialize state
  useEffect(() => {
    stateRef.current = {
      displacements: Array(numberOfMasses).fill(initialDisplacement),
      velocities: Array(numberOfMasses).fill(0),
      time: 0,
    };
    trailBuf.idx = 0;
    trailBuf.positions.fill(0);
    trailBuf.colors.fill(0);
  }, [resetTrigger, initialDisplacement, numberOfMasses, trailBuf]);

  // Cleanup
  useEffect(() => {
    return () => { trailGeo.dispose(); };
  }, [trailGeo]);

  // Frame loop
  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const state = stateRef.current;

    if (isPlaying && dt > 0) {
      // Sub-step for stability
      const steps = Math.max(1, Math.ceil(dt / 0.004));
      const subDt = dt / steps;

      for (let step = 0; step < steps; step++) {
        if (numberOfMasses === 1) {
          // Single mass - simple harmonic motion
          const [newX, newV] = rk4Step(
            state.displacements[0],
            state.velocities[0],
            springConstant,
            mass,
            damping,
            subDt
          );
          state.displacements[0] = newX;
          state.velocities[0] = newV;
        } else {
          // Multiple masses in series - coupled oscillators
          // Each mass is connected to springs above and below
          const newDisplacements = [...state.displacements];
          const newVelocities = [...state.velocities];

          for (let i = 0; i < numberOfMasses; i++) {
            const x = state.displacements[i];
            const v = state.velocities[i];

            // Spring forces (coupled)
            let springForce = 0;
            if (i === 0) {
              // Top mass: connected to ceiling and mass below
              springForce = -springConstant * x + springConstant * (state.displacements[1] - x);
            } else if (i === numberOfMasses - 1) {
              // Bottom mass: connected to mass above only
              springForce = springConstant * (state.displacements[i - 1] - x);
            } else {
              // Middle mass: connected to both
              springForce = springConstant * (state.displacements[i - 1] - x) +
                           springConstant * (state.displacements[i + 1] - x);
            }

            const dampingForce = -damping * v;
            const acceleration = (springForce + dampingForce) / mass;

            newVelocities[i] = v + acceleration * subDt;
            newDisplacements[i] = x + newVelocities[i] * subDt;
          }

          state.displacements = newDisplacements;
          state.velocities = newVelocities;
        }
      }
      state.time += dt;
    }

    // Update mass positions
    const eqPositions = Array.isArray(equilibriumY) ? equilibriumY : [equilibriumY];
    for (let i = 0; i < numberOfMasses; i++) {
      if (massRefs.current[i]) {
        const actualY = eqPositions[i] + state.displacements[i];
        massRefs.current[i]!.position.y = actualY;
      }
    }

    // Update springs (zigzag coils)
    let currentTopY = ceilingY;
    for (let i = 0; i < numberOfMasses; i++) {
      if (springRefs.current[i]) {
        const massY = eqPositions[i] + state.displacements[i];
        const bottomY = massY + massSize / 2;
        currentTopY = i === 0 ? ceilingY : (eqPositions[i - 1] + state.displacements[i - 1] + massSize / 2);
        const springGroup = springRefs.current[i];

        if (springGroup) {
          // Clear previous springs
          while (springGroup.children.length > 0) {
            springGroup.remove(springGroup.children[0]);
          }
          // Add new spring with current dimensions
          const springElement = <SpringCoils
            topY={currentTopY}
            bottomY={bottomY}
            width={0.3 + i * 0.1}
            coils={8 + i * 2}
            color="#aaa"
          />;
          // We need to create the mesh directly since we can't add JSX in useFrame
          const points: [number, number, number][] = [];
          const length = currentTopY - bottomY;
          const segments = (8 + i * 2) * 4;
          for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const y = currentTopY - t * length;
            let x = 0;
            const phase = (j % 4);
            if (phase === 1) x = 0.3 + i * 0.1;
            else if (phase === 3) x = -(0.3 + i * 0.1);
            points.push([x, y, 0]);
          }

          const lineGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
          const lineMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, linewidth: 2 });
          const line = new THREE.Line(lineGeo, lineMat);
          springGroup.add(line);
        }
      }
    }

    // Update trail (for bottom mass)
    if (showTrail && isPlaying) {
      const bottomIdx = numberOfMasses - 1;
      const bottomY = eqPositions[bottomIdx] + state.displacements[bottomIdx];

      const idx = trailBuf.idx % MAX_TRAIL;
      trailBuf.positions[idx * 3] = 0;
      trailBuf.positions[idx * 3 + 1] = bottomY;
      trailBuf.positions[idx * 3 + 2] = 0;

      const speed = Math.abs(state.velocities[bottomIdx]);
      const t = Math.min(speed / 4, 1);
      trailBuf.colors[idx * 3] = 0.3 + t * 0.7;
      trailBuf.colors[idx * 3 + 1] = 0.5 + t * 0.3;
      trailBuf.colors[idx * 3 + 2] = 1.0 - t * 0.5;
      trailBuf.idx++;

      if (trailRef.current) {
        const pos = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const col = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
        pos.needsUpdate = true;
        col.needsUpdate = true;
        trailRef.current.geometry.setDrawRange(0, Math.min(trailBuf.idx, MAX_TRAIL));
      }
    }

    // Update vectors
    const bottomIdx = numberOfMasses - 1;
    const bottomY = eqPositions[bottomIdx] + state.displacements[bottomIdx];
    const v = state.velocities[bottomIdx];
    const springForce = -springConstant * state.displacements[bottomIdx];
    const dampingForce = -damping * v;

    if (showVectors) {
      // Velocity arrow
      if (velocityArrowRef.current) {
        const arrowLength = Math.abs(v) * 0.3;
        velocityArrowRef.current.position.set(-1.5, bottomY, 0);
        velocityArrowRef.current.scale.set(1, Math.max(arrowLength, 0.01), 1);
        velocityArrowRef.current.rotation.z = v > 0 ? Math.PI : 0;
        (velocityArrowRef.current as any).visible = Math.abs(v) > 0.05;
      }

      // Force arrow
      if (forceArrowRef.current) {
        const totalForce = springForce + dampingForce;
        const arrowLength = Math.abs(totalForce) * 0.02;
        forceArrowRef.current.position.set(1.5, bottomY, 0);
        forceArrowRef.current.scale.set(1, Math.max(arrowLength, 0.01), 1);
        forceArrowRef.current.rotation.z = totalForce > 0 ? Math.PI : 0;
        (forceArrowRef.current as any).visible = Math.abs(totalForce) > 0.1;
      }
    }

    // Throttled data callback
    dataTimerRef.current += rawDt;
    if (dataTimerRef.current >= 0.066) {
      dataTimerRef.current = 0;

      const ke = calculateKE(mass, v);
      const peSpring = calculateSpringPE(springConstant, state.displacements[bottomIdx]);
      const peGrav = mass * g * bottomY;
      const totalE = ke + peSpring + peGrav;

      onDataChange?.({
        period: calculatePeriod(springConstant, mass),
        frequency: calculateFrequency(springConstant, mass),
        angularFrequency: calculateAngularFrequency(springConstant, mass),
        displacement: state.displacements[bottomIdx],
        velocity: v,
        kineticEnergy: ke,
        springPotentialEnergy: peSpring,
        gravitationalPotentialEnergy: peGrav,
        totalEnergy: totalE,
        springForce: springForce,
        dampingForce: dampingForce,
        elapsedTime: state.time,
        equilibriumPosition: eqPositions[bottomIdx],
      });
    }
  });

  // Total energy for bar scaling
  const maxEnergy = useMemo(() => {
    const initialPE = calculateSpringPE(springConstant, initialDisplacement);
    const initialGravPE = mass * g * (Array.isArray(equilibriumY) ? equilibriumY[numberOfMasses - 1] : equilibriumY);
    return (initialPE + initialGravPE) * 1.5 || 100;
  }, [springConstant, initialDisplacement, mass, equilibriumY, numberOfMasses, g]);

  return (
    <group>
      {/* ====== LIGHTING ====== */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />
      <pointLight position={[0, 5, 8]} intensity={0.5} color="#8b5cf6" />

      {/* ====== CEILING SUPPORT ====== */}
      <SupportFrame ceilingY={ceilingY} width={12} />

      {/* ====== FLOOR ====== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050510" roughness={0.95} />
      </mesh>
      <gridHelper args={[40, 40, "#1a1a3e", "#0a0a1e"]} position={[0, -14.99, 0]} />

      {/* ====== EQUILIBRIUM LINE ====== */}
      {Array.isArray(equilibriumY) ? (
        equilibriumY.map((eqY, i) => (
          <group key={i}>
            <Line
              points={[[2, eqY, 0], [4, eqY, 0]]}
              color="#22c55e"
              lineWidth={2}
              dashed
              dashSize={0.2}
              gapSize={0.1}
            />
            <mesh position={[4.5, eqY, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          </group>
        ))
      ) : (
        <group>
          <Line
            points={[[2, equilibriumY, 0], [4, equilibriumY, 0]]}
            color="#22c55e"
            lineWidth={2}
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
          <mesh position={[4.5, equilibriumY, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      )}

      {/* ====== SPRINGS ====== */}
      {Array.from({ length: numberOfMasses }).map((_, i) => (
        <group
          key={i}
          ref={(el) => { springRefs.current[i] = el; }}
        />
      ))}

      {/* ====== MASSES ====== */}
      {Array.from({ length: numberOfMasses }).map((_, i) => {
        const eqY = Array.isArray(equilibriumY) ? equilibriumY[i] : equilibriumY;
        const initialY = eqY + initialDisplacement;
        return (
          <group key={i}>
            <mesh
              ref={(el) => { massRefs.current[i] = el; }}
              position={[0, initialY, 0]}
              castShadow
            >
              <boxGeometry args={[massSize * 2, massSize, massSize * 2]} />
              <meshStandardMaterial
                color="#4f8fff"
                metalness={0.7}
                roughness={0.2}
                emissive="#4f8fff"
                emissiveIntensity={0.2}
              />
            </mesh>

            {/* Mass label */}
            <Html position={[massSize + 0.3, 0, 0]} center>
              <div className="text-[10px] text-blue-300 bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
                m{numberOfMasses > 1 ? `${i + 1}` : ""}: {mass.toFixed(1)} kg
              </div>
            </Html>
          </group>
        );
      })}

      {/* ====== TRAIL ====== */}
      {showTrail && (
        <points ref={trailRef} geometry={trailGeo}>
          <pointsMaterial
            size={0.1}
            vertexColors
            transparent
            opacity={0.7}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* ====== FORCE VECTORS ====== */}
      {showVectors && (
        <>
          <group ref={velocityArrowRef}>
            <ArrowMesh color="#22c55e" label="v" />
          </group>
          <group ref={forceArrowRef}>
            <ArrowMesh color="#ef4444" label="F" />
          </group>
        </>
      )}

      {/* ====== 3D ENERGY BARS ====== */}
      {showEnergyBars && (
        <group position={[-6, 0, 0]}>
          <EnergyBar3D
            position={[0, 0, 0]}
            value={calculateKE(mass, Math.abs(stateRef.current.velocities[numberOfMasses - 1] || 0))}
            maxValue={maxEnergy}
            color="#22c55e"
            label="KE"
          />
          <EnergyBar3D
            position={[1.5, 0, 0]}
            value={calculateSpringPE(springConstant, stateRef.current.displacements[numberOfMasses - 1] || 0)}
            maxValue={maxEnergy}
            color="#f59e0b"
            label="PE_spring"
          />
          <EnergyBar3D
            position={[3, 0, 0]}
            value={mass * g * (Array.isArray(equilibriumY) ? equilibriumY[numberOfMasses - 1] : equilibriumY)}
            maxValue={maxEnergy}
            color="#3b82f6"
            label="PE_grav"
          />
          <EnergyBar3D
            position={[4.5, 0, 0]}
            value={
              calculateKE(mass, Math.abs(stateRef.current.velocities[numberOfMasses - 1] || 0)) +
              calculateSpringPE(springConstant, stateRef.current.displacements[numberOfMasses - 1] || 0) +
              mass * g * (Array.isArray(equilibriumY) ? equilibriumY[numberOfMasses - 1] : equilibriumY)
            }
            maxValue={maxEnergy}
            color="#a855f7"
            label="Total"
          />
        </group>
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
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Label */}
      <Html position={[0.25, -0.5, 0]} center>
        <div className="text-[9px] font-bold px-1 py-0.5 rounded pointer-events-none select-none"
          style={{ color, backgroundColor: "rgba(0,0,0,0.6)" }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

/** Ceiling support frame */
function SupportFrame({ ceilingY, width }: { ceilingY: number; width: number }) {
  const beamH = 0.4;
  const beamColor = "#2a2a3e";
  const metalMat = { color: beamColor, metalness: 0.8, roughness: 0.25 };

  return (
    <group>
      {/* Main ceiling beam */}
      <mesh position={[0, ceilingY + beamH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, beamH, 4]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* I-beam flanges */}
      <mesh position={[0, ceilingY + beamH * 0.4, 0]}>
        <boxGeometry args={[width, 0.06, 4.5]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[0, ceilingY - beamH * 0.4, 0]}>
        <boxGeometry args={[width, 0.06, 4.5]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Support pillars */}
      <mesh position={[-width / 2 + 0.3, ceilingY - 2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[width / 2 - 0.3, ceilingY - 2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Spring attachment point */}
      <mesh position={[0, ceilingY - 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Base plates */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.3), ceilingY - 4.15, 0]} receiveShadow>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default SpringMassSceneComponent;
