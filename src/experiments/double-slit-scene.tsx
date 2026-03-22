"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface DoubleSlitSceneProps {
  onDataChange?: (data: DoubleSlitData) => void;
  wavelength?: number;
  slitSeparation?: number;
  slitWidth?: number;
  particleRate?: number;
  showParticles?: boolean;
  showWaveView?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export interface DoubleSlitData {
  fringeSpacing: number;
  particleCount: number;
  wavelength: number;
  slitSeparation: number;
  slitWidth: number;
}

interface Particle {
  position: THREE.Vector3;
  targetY: number; // Pre-calculated landing position on screen
  velocity: THREE.Vector3;
  active: boolean;
  phase: "source" | "travelling" | "screen";
  progress: number; // 0 to 1 along path
}

/**
 * REAL Quantum Double-Slit Simulation
 *
 * Uses the exact double-slit intensity distribution:
 * I(y) = I0 * cos²(π * d * y / (λ * L)) * sinc²(π * a * y / (λ * L))
 *
 * where:
 * - I(y) is the intensity at screen position y
 * - d is the slit separation
 * - a is the slit width
 * - λ is the wavelength
 * - L is the distance from slits to screen
 * - sinc(x) = sin(x)/x
 *
 * Particles are fired individually and land on the screen according
 * to this probability distribution, demonstrating wave-particle duality.
 */
export function DoubleSlitSceneComponent({
  onDataChange,
  wavelength = 500,
  slitSeparation = 2,
  slitWidth = 0.3,
  particleRate = 2,
  showParticles = true,
  showWaveView = false,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger,
}: DoubleSlitSceneProps) {
  const particlesRef = useRef<Particle[]>([]);
  const screenHitsRef = useRef<number[]>(new Array(300).fill(0));
  const maxHitsRef = useRef(1);
  const timeRef = useRef(0);
  const lastParticleTimeRef = useRef(0);
  const totalParticlesRef = useRef(0);

  // Scene setup
  const sourcePos = useMemo(() => new THREE.Vector3(-12, 0, 0), []);
  const barrierX = 0;
  const screenX = 12;
  const screenHeight = 16;

  const [particlePositions, setParticlePositions] = useState<Float32Array>(new Float32Array(500 * 3));
  const [screenIntensities, setScreenIntensities] = useState<Float32Array>(new Float32Array(300));

  /**
   * Calculate the double-slit intensity at screen position y
   * I(y) = I0 * cos²(π * d * y / (λ * L)) * sinc²(π * a * y / (λ * L))
   */
  const calculateIntensity = (y: number): number => {
    // Convert wavelength from nm to simulation units
    const lambda = wavelength / 10000; // Scale factor for simulation
    const L = screenX - barrierX;
    const d = slitSeparation;
    const a = slitWidth;

    // Small angle approximation: sin(theta) ≈ theta ≈ y/L
    const y_normalized = y / L;

    // Double-slit interference term: cos²(π * d * y / (λ * L))
    const interferenceArg = (Math.PI * d * y_normalized) / lambda;
    const interference = Math.cos(interferenceArg) ** 2;

    // Single-slit diffraction envelope: sinc²(π * a * y / (λ * L))
    const diffractionArg = (Math.PI * a * y_normalized) / lambda;
    let diffraction = 1;
    if (Math.abs(diffractionArg) > 0.0001) {
      const sinc = Math.sin(diffractionArg) / diffractionArg;
      diffraction = sinc ** 2;
    }

    return interference * diffraction;
  };

  /**
   * Sample a screen position according to the quantum probability distribution
   * Uses rejection sampling to pick positions proportional to intensity
   */
  const sampleQuantumPosition = (): number => {
    const maxAttempts = 200;
    const searchRange = screenHeight * 1.5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick a random position on screen
      const y = (Math.random() - 0.5) * 2 * searchRange;

      // Calculate quantum probability at this position
      const probability = calculateIntensity(y);

      // Accept or reject based on probability
      if (Math.random() < probability) {
        return y;
      }
    }

    // Fallback: return a random position near center
    return (Math.random() - 0.5) * screenHeight;
  };

  // Data calculation and reporting
  useEffect(() => {
    const lambda = wavelength / 10000;
    const L = screenX - barrierX;
    const d = slitSeparation;

    // Fringe spacing: Δy = λ * L / d
    const fringeSpacing = (lambda * L) / d;

    const data: DoubleSlitData = {
      fringeSpacing: fringeSpacing * 1000, // Convert to mm
      particleCount: totalParticlesRef.current,
      wavelength,
      slitSeparation,
      slitWidth,
    };
    onDataChange?.(data);
  }, [wavelength, slitSeparation, slitWidth, onDataChange, screenIntensities]);

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      particlesRef.current = [];
      screenHitsRef.current = new Array(300).fill(0);
      maxHitsRef.current = 1;
      timeRef.current = 0;
      lastParticleTimeRef.current = 0;
      totalParticlesRef.current = 0;
      setParticlePositions(new Float32Array(500 * 3));
      setScreenIntensities(new Float32Array(300));
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.033) * simulationSpeed;
    timeRef.current += dt;

    // Spawn new particles at specified rate
    const spawnInterval = 1 / particleRate;
    if (timeRef.current - lastParticleTimeRef.current > spawnInterval) {
      // Pre-calculate where this particle will land (quantum measurement)
      const targetY = sampleQuantumPosition();

      // Calculate velocity to hit the target
      const travelTime = (screenX - sourcePos.x) / 10; // Speed of 10 units/sec
      const vy = targetY / travelTime;

      const particle: Particle = {
        position: sourcePos.clone(),
        targetY,
        velocity: new THREE.Vector3(10, vy, 0),
        active: true,
        phase: "source",
        progress: 0,
      };
      particlesRef.current.push(particle);
      lastParticleTimeRef.current = timeRef.current;
    }

    const positions = new Float32Array(500 * 3);
    let idx = 0;

    // Update all particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      if (!p.active) continue;

      // Move particle
      p.position.add(p.velocity.clone().multiplyScalar(dt));
      p.progress = (p.position.x - sourcePos.x) / (screenX - sourcePos.x);

      // Check if passed barrier (slits)
      if (p.phase === "source" && p.position.x >= barrierX) {
        // Check if particle goes through either slit
        const slit1Y = slitSeparation / 2;
        const slit2Y = -slitSeparation / 2;

        const yAtBarrier = p.position.y;
        const inSlit1 = Math.abs(yAtBarrier - slit1Y) < slitWidth / 2;
        const inSlit2 = Math.abs(yAtBarrier - slit2Y) < slitWidth / 2;

        if (inSlit1 || inSlit2) {
          p.phase = "travelling";
          // Adjust trajectory slightly for diffraction
          p.velocity.y += (Math.random() - 0.5) * 0.3;
          p.velocity.normalize().multiplyScalar(10);
        } else {
          // Blocked by barrier
          p.active = false;
        }
      }

      // Check if reached screen
      if (p.position.x >= screenX) {
        p.phase = "screen";

        // Record hit position
        const screenIndex = Math.floor(
          ((p.position.y + screenHeight / 2) / screenHeight) * 300
        );
        if (screenIndex >= 0 && screenIndex < 300) {
          screenHitsRef.current[screenIndex]++;
          totalParticlesRef.current++;
          if (screenHitsRef.current[screenIndex] > maxHitsRef.current) {
            maxHitsRef.current = screenHitsRef.current[screenIndex];
          }
        }

        p.active = false;
      }

      // Store position for rendering
      if (p.active && idx < 500) {
        positions[idx * 3] = p.position.x;
        positions[idx * 3 + 1] = p.position.y;
        positions[idx * 3 + 2] = p.position.z;
        idx++;
      }

      // Remove inactive particles
      if (!p.active) {
        particlesRef.current.splice(i, 1);
      }
    }

    setParticlePositions(positions);

    // Update screen intensity visualization
    const intensities = new Float32Array(300);
    for (let i = 0; i < 300; i++) {
      if (maxHitsRef.current > 0) {
        intensities[i] = screenHitsRef.current[i] / maxHitsRef.current;
      }
    }
    setScreenIntensities(intensities);
  });

  // Theoretical intensity curve for comparison
  const intensityCurvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const y = ((i / steps) * screenHeight * 1.4) - screenHeight * 0.7;
      const intensity = calculateIntensity(y);
      // Draw curve to the right of the screen
      points.push([screenX + 1 + intensity * 5, y, 0]);
    }
    return points;
  }, [wavelength, slitSeparation, slitWidth, screenHeight]);

  // Screen hit bars (accumulated pattern)
  const screenHitBars = useMemo(() => {
    const bars: { y: number; height: number; opacity: number }[] = [];
    const barWidth = screenHeight / 300;

    for (let i = 0; i < 300; i++) {
      const hits = screenHitsRef.current[i];
      if (hits > 0) {
        const opacity = Math.min(hits / maxHitsRef.current, 1);
        const y = ((i / 300) * screenHeight) - screenHeight / 2;
        bars.push({
          y,
          height: barWidth * 0.95,
          opacity,
        });
      }
    }
    return bars;
  }, [screenIntensities]);

  // Wavelength to color
  const wavelengthColor = `hsl(${540 - wavelength * 0.6}, 100%, 50%)`;
  const wavelengthHex = useMemo(() => {
    const hue = 540 - wavelength * 0.6;
    return `hsl(${hue}, 100%, 50%)`;
  }, [wavelength]);

  return (
    <group>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[35, 25]} />
        <meshStandardMaterial color="#050510" roughness={0.95} metalness={0.1} />
      </mesh>
      <gridHelper args={[35, 35, "#1a1a3e", "#0a0a1e"]} position={[0, -7.99, 0]} />

      {/* Particle Source (left side) */}
      <group position={sourcePos}>
        {/* Source housing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.8, 1.5, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Emissive aperture */}
        <mesh position={[0.5, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={wavelengthHex}
            emissive={wavelengthHex}
            emissiveIntensity={3}
          />
        </mesh>
        {/* Point light from source */}
        <pointLight color={wavelengthHex} intensity={3} distance={8} />
        {/* Glow effect */}
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={wavelengthHex}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Barrier with two slits (center) */}
      <group position={[barrierX, 0, 0]}>
        {/* Top barrier segment */}
        <mesh position={[0, slitSeparation / 2 + slitWidth / 2 + 3.5, 0]} castShadow>
          <boxGeometry args={[0.3, 7, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Middle barrier segment (between slits) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.3, slitSeparation - slitWidth, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Bottom barrier segment */}
        <mesh position={[0, -slitSeparation / 2 - slitWidth / 2 - 3.5, 0]} castShadow>
          <boxGeometry args={[0.3, 7, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Slit glow markers */}
        <mesh position={[0.15, slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, slitWidth, 2.6]} />
          <meshBasicMaterial color={wavelengthHex} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.15, -slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, slitWidth, 2.6]} />
          <meshBasicMaterial color={wavelengthHex} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Detection Screen (right side) */}
      <group position={[screenX, 0, 0]}>
        {/* Screen backing */}
        <mesh receiveShadow>
          <boxGeometry args={[0.3, screenHeight, 0.8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Screen frame - top */}
        <mesh position={[0, screenHeight / 2 + 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 1]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Screen frame - bottom */}
        <mesh position={[0, -screenHeight / 2 - 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 1]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Accumulated particle pattern on screen */}
        {screenHitBars.map((bar, i) => (
          <mesh key={i} position={[0.2, bar.y, 0.15]}>
            <boxGeometry args={[0.08, bar.height, 0.08]} />
            <meshBasicMaterial
              color={wavelengthHex}
              transparent
              opacity={bar.opacity * 0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Flying particles */}
      {showParticles && (
        <points geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))}>
          <pointsMaterial
            size={0.12}
            color={wavelengthHex}
            transparent
            opacity={0.95}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Theoretical intensity curve (for comparison) */}
      {showWaveView && (
        <group position={[0, 0, -0.8]}>
          {/* Intensity curve */}
          <Line
            points={intensityCurvePoints}
            color={wavelengthHex}
            lineWidth={3}
            opacity={0.9}
          />
          {/* Base line */}
          <Line
            points={[
              [screenX + 1, -screenHeight * 0.7, 0],
              [screenX + 1, screenHeight * 0.7, 0]
            ]}
            color="#444"
            lineWidth={1}
            opacity={0.5}
          />
          {/* Tick marks */}
          {[
            -screenHeight * 0.5,
            -screenHeight * 0.25,
            0,
            screenHeight * 0.25,
            screenHeight * 0.5,
          ].map((y, i) => (
            <Line
              key={i}
              points={[
                [screenX + 0.8, y, 0],
                [screenX + 1.2, y, 0]
              ]}
              color="#666"
              lineWidth={1}
              opacity={0.3}
            />
          ))}
        </group>
      )}

      {/* Labels / info plates */}
      <group position={[sourcePos.x, 2.5, 0]}>
        <mesh>
          <planeGeometry args={[4, 0.6]} />
          <meshBasicMaterial color="#1a1a3e" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Distance markers on floor */}
      <group position={[0, -7.95, 2]}>
        {[...Array(5)].map((_, i) => {
          const x = -10 + i * 5;
          return (
            <group key={i} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.08, 0.08, 0.4]} />
                <meshStandardMaterial color="#555" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export default DoubleSlitSceneComponent;
