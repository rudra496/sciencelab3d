'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface NervousSystemData {
  membranePotential: number;
  signalSpeed: number;
  impulseCount: number;
}

interface NervousSystemSceneProps {
  onDataChange?: (data: NervousSystemData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  stimulus?: number;
  myelin?: boolean;
  speed?: number;
}

interface Impulse {
  position: number;
  id: number;
  intensity: number;
}

/**
 * Nervous System scene component - Performance optimized
 * Visualizes action potential propagation along a neuron axon
 */
export default function NervousSystemSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  stimulus = 1,
  myelin = true,
  speed = 1,
}: NervousSystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Performance refs - physics state updated every frame
  const impulsesRef = useRef<Impulse[]>([]);
  const impulseCountRef = useRef(0);
  const timeRef = useRef(0);
  const lastImpulseTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  // React state - updated only every 8 frames
  const [data, setData] = useState<NervousSystemData>({
    membranePotential: -70,
    signalSpeed: 120,
    impulseCount: 0,
  });

  // Reset on trigger change
  useEffect(() => {
    impulsesRef.current = [];
    impulseCountRef.current = 0;
    timeRef.current = 0;
    lastImpulseTimeRef.current = 0;
    frameCountRef.current = 0;
  }, [resetTrigger]);

  // Axon segments
  const segments = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [i * 1.5 - 15, 0, 0] as [number, number, number],
      hasMyelin: myelin && i % 3 === 0,
      isNodeOfRanvier: i % 3 === 0,
    }));
  }, [myelin]);

  // Axon backbone line
  const axonLine = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = -16; i <= 16; i += 0.5) {
      points.push([i, 0, 0]);
    }
    return points;
  }, []);

  // Synapse structure lines
  const synapseLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    // Synaptic cleft
    for (let i = 0; i < 8; i++) {
      const y = -0.3 + i * 0.1;
      lines.push([
        [15.5, y, -0.3], [16.5, y, 0.3],
      ]);
    }
    return lines;
  }, []);

  // Voltage-gated channel indicators (along axon)
  const channelPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 30; i++) {
      positions.push([
        -14 + i * 0.9,
        0.5,
        Math.sin(i * 0.5) * 0.3,
      ]);
    }
    return positions;
  }, []);

  // Throttled updates (every 8 frames)
  useFrame((_, delta) => {
    if (!groupRef.current || !isPlaying) return;

    timeRef.current += delta * simulationSpeed * speed;

    const baseSpeed = myelin ? 12 : 4;
    const adjustedSpeed = baseSpeed * stimulus;

    // Generate new impulses based on stimulus
    const impulseInterval = 2 / stimulus;
    if (timeRef.current - lastImpulseTimeRef.current > impulseInterval) {
      lastImpulseTimeRef.current = timeRef.current;
      const newId = impulseCountRef.current;
      impulseCountRef.current++;
      impulsesRef.current.push({ position: -15, id: newId, intensity: 1 });
    }

    // Update impulse positions
    const impulses = impulsesRef.current;
    for (let i = impulses.length - 1; i >= 0; i--) {
      impulses[i].position += delta * adjustedSpeed * simulationSpeed * speed;

      // Decay intensity over distance
      impulses[i].intensity = Math.max(0, 1 - (impulses[i].position + 15) / 32);

      // Remove impulses that have traveled past the synapse
      if (impulses[i].position > 17) {
        impulses.splice(i, 1);
      }
    }

    frameCountRef.current++;

    // Update React state only every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const signalSpeed = myelin ? 120 : 30;
      const membranePotential = impulses.length > 0 ? -40 + impulses.length * 5 : -70;

      const newData: NervousSystemData = {
        membranePotential: Math.round(membranePotential),
        signalSpeed: Math.round(signalSpeed * stimulus),
        impulseCount: impulseCountRef.current,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Get current impulses for rendering
  const displayImpulses = useMemo(() => {
    return impulsesRef.current.map(imp => ({
      ...imp,
      position: imp.position,
    }));
  }, [data]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#ec4899" />

      <group ref={groupRef}>
        {/* Axon backbone line */}
        <Line
          points={axonLine}
          color="#ec4899"
          lineWidth={3}
          opacity={0.3}
          transparent
        />

        {/* Axon segments */}
        {segments.map((seg, i) => (
          <group key={i} position={seg.position}>
            {/* Outer membrane */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.35}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>

            {/* Inner cytoplasm */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 1.1, 16]} />
              <meshPhysicalMaterial
                color="#f9a8d4"
                transparent
                opacity={0.25}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 1.1, 16]} />
              <meshPhysicalMaterial
                color="#f9a8d4"
                transparent
                opacity={0.25}
                roughness={0.4}
              />
            </mesh>

            {/* Myelin sheath */}
            {seg.hasMyelin && (
              <>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.6, 0.6, 0.8, 16]} />
                  <meshStandardMaterial
                    color="#fde047"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                {/* Myelin detail */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.62, 0.62, 0.7, 12]} />
                  <meshStandardMaterial
                    color="#facc15"
                    roughness={0.4}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              </>
            )}

            {/* Node of Ranvier (gap in myelin) */}
            {seg.isNodeOfRanvier && myelin && (
              <mesh>
                <sphereGeometry args={[0.45, 12, 12]} />
                <meshStandardMaterial
                  color="#f472b6"
                  emissive="#f472b6"
                  emissiveIntensity={0.2}
                />
              </mesh>
            )}

            {/* Cell body (soma) at start */}
            {i === 0 && (
              <>
                <mesh position={[-1, 0, 0]}>
                  <sphereGeometry args={[0.9, 24, 24]} />
                  <meshStandardMaterial
                    color="#ec4899"
                    metalness={0.3}
                    roughness={0.4}
                  />
                </mesh>
                {/* Nucleus */}
                <mesh position={[-1, 0, 0]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshStandardMaterial
                    color="#be185d"
                    metalness={0.2}
                    roughness={0.5}
                  />
                </mesh>
              </>
            )}

            {/* Synapse at end */}
            {i === 19 && (
              <>
                {/* Synaptic terminal */}
                <mesh position={[1.2, 0, 0]}>
                  <sphereGeometry args={[0.5, 16, 16]} />
                  <meshStandardMaterial color="#8b5cf6" />
                </mesh>

                {/* Synaptic vesicles */}
                {Array.from({ length: 6 }).map((_, j) => (
                  <mesh
                    key={j}
                    position={[1, j * 0.25 - 0.6, 0.2]}
                  >
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial
                      color="#a78bfa"
                      emissive="#a78bfa"
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                ))}

                {/* Synaptic cleft lines */}
                {synapseLines.map((line, j) => (
                  <Line
                    key={j}
                    points={line}
                    color="#a78bfa"
                    lineWidth={1}
                    opacity={0.4}
                    transparent
                  />
                ))}

                {/* Post-synaptic receptors */}
                {Array.from({ length: 4 }).map((_, j) => (
                  <mesh
                    key={j}
                    position={[1.8, j * 0.3 - 0.45, 0.4]}
                  >
                    <boxGeometry args={[0.1, 0.15, 0.1]} />
                    <meshStandardMaterial
                      color="#6366f1"
                      emissive="#6366f1"
                      emissiveIntensity={0.4}
                    />
                  </mesh>
                ))}
              </>
            )}
          </group>
        ))}

        {/* Voltage-gated channels along axon */}
        {channelPositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Action potentials (impulses) traveling along axon */}
        {displayImpulses.map((imp) => (
          <group key={imp.id} position={[imp.position, 0, 0]}>
            {/* Main signal glow */}
            <mesh>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.8 * imp.intensity}
                transparent
                opacity={imp.intensity}
              />
            </mesh>

            {/* Outer glow */}
            <mesh>
              <sphereGeometry args={[0.5, 12, 12]} />
              <meshBasicMaterial
                color="#06b6d4"
                transparent
                opacity={0.3 * imp.intensity}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Point light for illumination */}
            <pointLight
              intensity={0.6 * imp.intensity}
              color="#06b6d4"
              distance={3}
            />

            {/* Depolarization wave effect */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.45, 16]} />
              <meshBasicMaterial
                color="#22d3ee"
                transparent
                opacity={0.4 * imp.intensity}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

        {/* Labels */}
        <Html position={[-2, 1.8, 0]} distanceFactor={10}>
          <div className="bg-pink-500/90 text-white px-3 py-1 rounded text-xs font-medium shadow-lg">
            Cell Body (Soma)
          </div>
        </Html>

        <Html position={[15, 1.8, 0]} distanceFactor={10}>
          <div className="bg-purple-500/90 text-white px-3 py-1 rounded text-xs font-medium shadow-lg">
            Synapse
          </div>
        </Html>

        <Html position={[7, 2.5, 0]} distanceFactor={10}>
          <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
            Axon
          </div>
        </Html>

        {myelin && (
          <Html position={[7, -1.5, 0]} distanceFactor={10}>
            <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs">
              Myelin Sheath (insulation)
            </div>
          </Html>
        )}

        <Html position={[0, -2.5, 0]} distanceFactor={10}>
          <div className="bg-pink-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Neuron Axon - {data.membranePotential > -60 ? 'Firing!' : 'Resting'}
            <div className="text-xs mt-1 opacity-80">
              {data.impulseCount} impulses • {data.signalSpeed} m/s
            </div>
          </div>
        </Html>

        {/* Membrane potential indicator */}
        <Html position={[-4, 2, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-1">Membrane Potential</div>
            <div className={`text-lg font-bold ${data.membranePotential > -60 ? 'text-green-400' : 'text-blue-400'}`}>
              {data.membranePotential} mV
            </div>
            <div className="text-xs opacity-70 mt-1">
              {data.membranePotential > -60 ? 'Depolarized' : 'Resting'}
            </div>
          </div>
        </Html>

        {/* Myelin effect indicator */}
        {myelin && (
          <Html position={[4, 2, 0]} distanceFactor={10}>
            <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
              <div className="font-bold mb-1">Signal Speed</div>
              <div className="text-lg font-bold text-amber-400">
                {data.signalSpeed} m/s
              </div>
              <div className="text-xs opacity-70 mt-1">
                Saltatory conduction
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Ground plane */}
      <gridHelper args={[40, 40, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} rotation={[0, 0, 0]} />
    </>
  );
}
