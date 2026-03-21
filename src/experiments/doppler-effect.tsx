"use client";

export { DopplerSceneComponent as default, DopplerSceneComponent } from "./doppler-scene";
export type { DopplerData } from "./doppler-scene";

// Legacy export - kept for backwards compatibility
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { DataDisplay } from "@/components/experiment-helpers";
import { calculateDopplerFrequency } from "@/utils/physics";

interface Wavefront {
  position: THREE.Vector3;
  radius: number;
  time: number;
  sourceVelocityAtEmission: number;
}

export function DopplerEffectScene() {
  const sourceRef = useRef<THREE.Mesh>(null);
  const observerRef = useRef<THREE.Mesh>(null);

  const { sourceVelocity, frequency, observerPos, showData, showWaveCompression } = useControls("Doppler", {
    sourceVelocity: { value: 3, min: -8, max: 8, step: 0.1, label: "Source Velocity" },
    frequency: { value: 2, min: 0.5, max: 5, step: 0.1, label: "Wave Frequency (Hz)" },
    observerPos: { value: 4, min: 1, max: 8, step: 0.1, label: "Observer Position" },
    showData: { value: true, label: "Show Data Panel" },
    showWaveCompression: { value: true, label: "Show Compression" },
  });

  const wavefrontsRef = useRef<Wavefront[]>([]);
  const timeRef = useRef(0);
  const lastEmissionRef = useRef(0);

  // Real-time frequency data
  const [dopplerData, setDopplerData] = useState({
    observedFreq: frequency,
    freqShift: 0,
    machNumber: 0,
    compressionRatio: 1,
  });

  const ringsGeometry = useMemo(() => {
    const geometries: THREE.RingGeometry[] = [];
    for (let i = 0; i < 30; i++) {
      geometries.push(new THREE.RingGeometry(0.1, 0.15, 64));
    }
    return geometries;
  }, []);

  // Update Doppler calculations when controls change
  useEffect(() => {
    const vWave = 3;
    const baseFreq = frequency;
    const observedFreq = calculateDopplerFrequency(baseFreq, vWave, -sourceVelocity); // Negative because source moving toward observer
    const freqShift = observedFreq - baseFreq;
    const machNumber = Math.abs(sourceVelocity) / vWave;
    const compressionRatio = sourceVelocity >= 0 ? 1 + sourceVelocity / vWave : 1 / (1 - sourceVelocity / vWave);

    setDopplerData({
      observedFreq,
      freqShift,
      machNumber,
      compressionRatio,
    });
  }, [sourceVelocity, frequency]);

  useFrame((_, delta) => {
    if (!sourceRef.current || !observerRef.current) return;
    const dt = Math.min(delta, 0.02);
    timeRef.current += dt;

    // Move source
    const sourceX = Math.sin(timeRef.current * 0.2) * sourceVelocity;
    sourceRef.current.position.x = sourceX;

    // Move observer
    observerRef.current.position.x = observerPos;

    // Emit new wavefronts
    const emissionInterval = 1 / frequency;
    if (timeRef.current - lastEmissionRef.current >= emissionInterval) {
      wavefrontsRef.current.push({
        position: sourceRef.current.position.clone(),
        radius: 0.1,
        time: timeRef.current,
        sourceVelocityAtEmission: sourceVelocity,
      });
      lastEmissionRef.current = timeRef.current;
    }

    // Update wavefronts
    const waveSpeed = 3;
    wavefrontsRef.current.forEach((wave) => {
      wave.radius += waveSpeed * dt;
    });

    // Remove old wavefronts
    wavefrontsRef.current = wavefrontsRef.current.filter((w) => w.radius < 15);
  });

  const vWave = 3;
  const baseFreq = frequency;
  const observedFreq = dopplerData.observedFreq;
  const freqShift = dopplerData.freqShift;
  const machNumber = dopplerData.machNumber;

  return (
    <>
      {/* Grid */}
      <gridHelper args={[20, 40, "#1a1a3e", "#1a1a3e"]} position={[0, -2, 0]} />

      {/* Source (speaker) */}
      <mesh ref={sourceRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.3]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Observer (listener) */}
      <mesh ref={observerRef} position={[observerPos, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.4} />
      </mesh>

      {/* Wavefronts with compression visualization */}
      {wavefrontsRef.current.map((wave, i) => {
        const intensity = Math.max(0, 1 - wave.radius / 12);
        const compression = showWaveCompression
          ? 1 + (wave.sourceVelocityAtEmission / vWave) * (wave.position.x > 0 ? 1 : -1)
          : 1;

        return (
          <mesh key={i} position={[wave.position.x, wave.position.y, wave.position.z - 0.1]}>
            <ringGeometry args={[wave.radius, wave.radius + 0.05 * Math.abs(compression), 64]} />
            <meshBasicMaterial
              color={compression > 1 ? "#ff6b35" : compression < 1 ? "#4f8fff" : "#ffffff"}
              transparent
              opacity={intensity * 0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Sound waves visualization (side view - frequency indicator) */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[16, 2]} />
        <meshBasicMaterial color="#1a1a3e" transparent opacity={0.5} />
      </mesh>

      {/* Direction indicator */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, Math.abs(sourceVelocity), 8]} />
        <meshStandardMaterial color={sourceVelocity > 0 ? "#4f8fff" : "#ec4899"} />
      </mesh>

      {/* Frequency shift visualization bar */}
      <group position={[observerPos, -1.5, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[2, 0.3]} />
          <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>
        {/* Base frequency indicator */}
        <Line
          points={[
            [-0.8, 0, 0.01],
            [-0.8, 0.2, 0.01],
          ]}
          color="#666"
          lineWidth={2}
        />
        {/* Observed frequency indicator */}
        <Line
          points={[
            [
              -0.8 + ((observedFreq - baseFreq) / baseFreq) * 0.5,
              0,
              0.02,
            ],
            [
              -0.8 + ((observedFreq - baseFreq) / baseFreq) * 0.5,
              0.2,
              0.02,
            ],
          ]}
          color={freqShift > 0 ? "#ff6b35" : freqShift < 0 ? "#4f8fff" : "#22c55e"}
          lineWidth={3}
        />
        {/* Scale */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[-0.8 + i * 0.25, -0.05, 0.02]}>
            <boxGeometry args={[0.01, 0.08, 0.01]} />
            <meshBasicMaterial color="#666" />
          </mesh>
        ))}
      </group>

      {/* Mach number indicator */}
      {machNumber > 0.3 && (
        <group position={[-5, 2, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.5]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
          </mesh>
          {/* Mach meter */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[1.4 * Math.min(machNumber, 1), 0.08, 0.02]} />
            <meshStandardMaterial
              color={
                machNumber > 1
                  ? "#ef4444"
                  : machNumber > 0.8
                    ? "#f59e0b"
                    : machNumber > 0.5
                      ? "#22c55e"
                      : "#4f8fff"
              }
              emissive={
                machNumber > 1
                  ? "#ef4444"
                  : machNumber > 0.8
                    ? "#f59e0b"
                    : machNumber > 0.5
                      ? "#22c55e"
                      : "#4f8fff"
              }
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Mach cone indicator for supersonic */}
          {machNumber >= 1 && (
            <>
              <Line
                points={[
                  [-1, 0.2, 0.05],
                  [0, 0, 0.05],
                  [-1, -0.2, 0.05],
                ]}
                color="#ef4444"
                lineWidth={2}
              />
            </>
          )}
        </group>
      )}

      {/* Labels */}
      <mesh position={[-8, 0.4, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[observerPos, 0.4, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>

      {/* Data Display Panel */}
      {showData && (
        <DataDisplay
          title="Doppler Effect Data"
          position={[5, 3, 0]}
          data={{
            sourceFreq: { value: baseFreq, unit: "Hz", color: "#a855f7" },
            observedFreq: { value: observedFreq, unit: "Hz", color: "#06d6a0", decimals: 2 },
            freqShift: { value: freqShift, unit: "Hz", color: freqShift > 0 ? "#ff6b35" : freqShift < 0 ? "#4f8fff" : "#22c55e", decimals: 2 },
            sourceVel: { value: sourceVelocity, unit: "m/s", color: "#f59e0b" },
            machNumber: { value: machNumber, unit: "Mach", color: machNumber > 0.8 ? "#ef4444" : "#ec4899", decimals: 2 },
          }}
        />
      )}

      {/* Wave compression visualization */}
      {showWaveCompression && (
        <group position={[-5, -2, 0]}>
          {/* Compressed region indicator */}
          {sourceVelocity > 0 && (
            <>
              <mesh position={[2, 0, 0]}>
                <planeGeometry args={[1.5, 0.5]} />
                <meshBasicMaterial color="#ff6b35" transparent opacity={0.2} />
              </mesh>
              <mesh position={[2, 0, 0.01]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#ff6b35" />
              </mesh>
            </>
          )}
          {/* Stretched region indicator */}
          {sourceVelocity < 0 && (
            <>
              <mesh position={[-2, 0, 0]}>
                <planeGeometry args={[1.5, 0.5]} />
                <meshBasicMaterial color="#4f8fff" transparent opacity={0.2} />
              </mesh>
              <mesh position={[-2, 0, 0.01]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#4f8fff" />
              </mesh>
            </>
          )}
        </group>
      )}
    </>
  );
}
