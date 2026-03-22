"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface DopplerSceneProps {
  onDataChange?: (data: DopplerData) => void;
  sourceFrequency?: number;
  sourceVelocity?: number;
  sourceDirection?: number; // -1 (left) to 1 (right), 0 = stopped
  autoOscillate?: boolean;
  observerPosition?: number; // x position
  waveSpeed?: number;
  showWavefronts?: boolean;
  resetTrigger?: number;
}

export interface DopplerData {
  sourceFrequency: number;
  observedFrequency: number;
  dopplerShiftRatio: number;
  machNumber: number;
  waveSpeed: number;
  shiftType: "blueshift" | "redshift" | "none";
}

/**
 * World-class Doppler Effect Simulation
 *
 * Physics: Uses refs for all state, updates React state only every 8 frames.
 * Wavefronts are colored based on compression/expansion:
 * - Blue: Compressed ahead of moving source (higher perceived frequency)
 * - Red: Expanded behind moving source (lower perceived frequency)
 */
export function DopplerSceneComponent({
  onDataChange,
  sourceFrequency = 2,
  sourceVelocity = 5,
  sourceDirection = 0,
  autoOscillate = true,
  observerPosition = 15,
  waveSpeed = 10,
  showWavefronts = true,
  resetTrigger,
}: DopplerSceneProps) {
  // === REFS FOR ALL PHYSICS STATE ===
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const sourceXRef = useRef(0);
  const sourceVelRef = useRef(0);

  // Waves: each wave remembers where it was emitted (emissionX) and when (emissionTime)
  const wavesRef = useRef<Array<{ emissionX: number; emissionTime: number }>>([]);

  // React state for display (updated only every 8 frames)
  const [data, setData] = useState<DopplerData>({
    sourceFrequency,
    observedFrequency: sourceFrequency,
    dopplerShiftRatio: 1,
    machNumber: 0,
    waveSpeed,
    shiftType: "none",
  });

  // Reset handler
  useEffect(() => {
    if (resetTrigger !== undefined) {
      timeRef.current = 0;
      frameCountRef.current = 0;
      sourceXRef.current = 0;
      sourceVelRef.current = 0;
      wavesRef.current = [];
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    frameCountRef.current++;

    // === UPDATE SOURCE PHYSICS ===
    if (autoOscillate) {
      // Auto-oscillate: source moves back and forth sinusoidally
      const oscillationSpeed = 0.5;
      const amplitude = 10;
      sourceXRef.current = Math.sin(timeRef.current * oscillationSpeed) * amplitude;
      sourceVelRef.current = Math.cos(timeRef.current * oscillationSpeed) * amplitude * oscillationSpeed;
    } else {
      // Manual control: source moves based on direction input
      const maxPos = 18;
      sourceVelRef.current = sourceDirection * sourceVelocity;
      sourceXRef.current += sourceVelRef.current * delta;

      // Clamp to bounds
      if (sourceXRef.current > maxPos) sourceXRef.current = maxPos;
      if (sourceXRef.current < -maxPos) sourceXRef.current = -maxPos;
    }

    // === EMIT NEW WAVES ===
    const waveInterval = 1 / sourceFrequency;
    const lastWave = wavesRef.current[wavesRef.current.length - 1];

    if (!lastWave || timeRef.current - lastWave.emissionTime >= waveInterval) {
      wavesRef.current.push({
        emissionX: sourceXRef.current,
        emissionTime: timeRef.current,
      });
      // Keep only last 25 waves for performance
      if (wavesRef.current.length > 25) {
        wavesRef.current.shift();
      }
    }

    // === UPDATE REACT STATE EVERY 8 FRAMES ===
    if (frameCountRef.current % 8 === 0) {
      // Calculate Doppler shift for observer
      const obsX = observerPosition;
      const srcX = sourceXRef.current;
      const srcVel = sourceVelRef.current;

      // Doppler formula: f_obs = f_src * (v_wave / (v_wave - v_source))
      // where v_source is positive when moving TOWARD observer
      const sourceToObserver = obsX - srcX;
      const sourceVelTowardObserver = sourceToObserver > 0 ? srcVel : -srcVel;

      let observedFreq: number;
      let shiftType: "blueshift" | "redshift" | "none";

      if (Math.abs(srcVel) < 0.1) {
        observedFreq = sourceFrequency;
        shiftType = "none";
      } else if (sourceVelTowardObserver > 0) {
        // Source moving toward observer: blueshift
        observedFreq = sourceFrequency * (waveSpeed / (waveSpeed - sourceVelTowardObserver));
        shiftType = "blueshift";
      } else {
        // Source moving away from observer: redshift
        observedFreq = sourceFrequency * (waveSpeed / (waveSpeed + Math.abs(sourceVelTowardObserver)));
        shiftType = "redshift";
      }

      const machNumber = Math.abs(srcVel) / waveSpeed;
      const dopplerShiftRatio = observedFreq / sourceFrequency;

      const newData: DopplerData = {
        sourceFrequency,
        observedFrequency: Math.max(0, observedFreq),
        dopplerShiftRatio,
        machNumber,
        waveSpeed,
        shiftType,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Get wave color based on Doppler effect
  // Waves ahead of source (in direction of motion) are compressed -> blue
  // Waves behind source are expanded -> red
  const getWaveColor = (waveEmissionX: number): string => {
    const currentSourceX = sourceXRef.current;
    const sourceVel = sourceVelRef.current;

    if (Math.abs(sourceVel) < 0.1) return "#22c55e"; // Green when stationary

    // If source moving right (vel > 0):
    // - Waves emitted at smaller X (behind) are redshifted
    // - Waves ahead would be blueshifted (but haven't been emitted yet)
    // If source moving left (vel < 0):
    // - Waves emitted at larger X (behind) are redshifted

    const relativePos = waveEmissionX - currentSourceX;
    const movingRight = sourceVel > 0;

    // Wave is "behind" the source if it's on the opposite side of motion
    const isBehind = movingRight ? relativePos < 0 : relativePos > 0;

    return isBehind ? "#ef4444" : "#3b82f6"; // Red behind, blue ahead
  };

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[80, 80, "#1a1a3e", "#0a0a1e"]} position={[0, -1.99, 0]} />

      {/* Observer - adjustable position */}
      <group position={[observerPosition, 0, 0]}>
        {/* Observer base */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.5, 32]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Observer head/sensor */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* "Ear" indicator */}
        <mesh position={[0.4, 0.4, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#c4b5fd" />
        </mesh>
        {/* Glow effect */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
        </mesh>
        {/* Observer label pole */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        {/* Label */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </group>

      {/* Sound source - moves left/right */}
      <group position={[sourceXRef.current, 0, 0]}>
        {/* Source sphere (speaker) */}
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.8}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
        </mesh>
        {/* Direction indicator */}
        {Math.abs(sourceVelRef.current) > 0.1 && (
          <group rotation={[0, 0, sourceVelRef.current > 0 ? -Math.PI / 2 : Math.PI / 2]}>
            <mesh position={[1.8, 0, 0]}>
              <coneGeometry args={[0.4, 0.8, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        )}
      </group>

      {/* Wavefronts - circular waves emanating from emission points */}
      {showWavefronts && (
        <group>
          {wavesRef.current.map((wave, i) => {
            const age = timeRef.current - wave.emissionTime;
            const radius = age * waveSpeed;
            const maxRadius = 35;

            if (radius > maxRadius || radius < 0.1) return null;

            const opacity = Math.max(0, 0.7 - (age / 6));
            const waveColor = getWaveColor(wave.emissionX);

            return (
              <group key={i} position={[wave.emissionX, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
                  <meshBasicMaterial
                    color={waveColor}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Center reference line */}
      <Line
        points={[[-35, 0, 0], [35, 0, 0]]}
        color="#333355"
        lineWidth={2}
        opacity={0.6}
        transparent
      />

      {/* Direction indicators on floor */}
      <Line
        points={[[-25, -1.95, 5], [-20, -1.95, 5]]}
        color="#4a5568"
        lineWidth={3}
        dashed
        dashSize={0.5}
        gapSize={0.3}
      />
      <mesh position={[-26, -1.9, 5]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[-19, -1.9, 5]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Mach cone for supersonic */}
      {data.machNumber >= 1 && (
        <group position={[sourceXRef.current, 0, 0]}>
          <mesh rotation={[0, sourceVelRef.current > 0 ? 0 : Math.PI, 0]}>
            <coneGeometry args={[20, 40, 2]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default DopplerSceneComponent;
