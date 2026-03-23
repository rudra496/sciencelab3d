'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface NervousSystemData {
  voltage: number;
  phase: string;
  naStatus: string;
  kStatus: string;
  speed: number;
  description: string;
}

interface NervousSystemSceneProps {
  onDataChange?: (data: NervousSystemData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  stepMode?: boolean;
  speed?: number;
  showIonChannels?: boolean;
  showMyelin?: boolean;
  step?: number;
}

type Phase = 'resting' | 'stimulus' | 'depolarization' | 'repolarization' | 'hyperpolarization' | 'synapse';

interface Ion {
  id: number;
  position: [number, number, number];
  type: 'Na' | 'K' | 'neurotransmitter';
  active: boolean;
  velocity: [number, number, number];
  inside: boolean; // Track if ion is inside or outside cell
}

export default function NervousSystemSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  stepMode = false,
  speed = 1,
  showIonChannels = true,
  showMyelin = true,
  step = 0,
}: NervousSystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Physics state in refs
  const phaseRef = useRef<Phase>('resting');
  const voltageRef = useRef(-70);
  const timeRef = useRef(0);
  const ionsRef = useRef<Ion[]>([]);
  const signalPositionRef = useRef(-12); // Position of action potential along axon
  const neurotransmittersRef = useRef<Ion[]>([]);
  const phaseTimerRef = useRef(0);
  const vesiclesRef = useRef<{ position: [number, number, number]; released: boolean }[]>([]);

  // React state for UI updates (throttled)
  const [displayData, setDisplayData] = useState<NervousSystemData>({
    voltage: -70,
    phase: 'Resting',
    naStatus: 'Closed',
    kStatus: 'Closed',
    speed: 120,
    description: 'Neuron at resting potential (-70mV)',
  });

  // Initialize ions
  useEffect(() => {
    const ions: Ion[] = [];
    // Na+ ions outside (red) - high concentration outside
    for (let i = 0; i < 50; i++) {
      ions.push({
        id: i,
        position: [
          -10 + Math.random() * 20,
          0.7 + Math.random() * 0.6,
          -0.5 + Math.random() * 1,
        ],
        type: 'Na',
        active: false,
        velocity: [0, 0, 0],
        inside: false,
      });
    }
    // K+ ions inside (blue) - high concentration inside
    for (let i = 0; i < 50; i++) {
      ions.push({
        id: 50 + i,
        position: [
          -10 + Math.random() * 20,
          -0.2 - Math.random() * 0.3,
          -0.3 + Math.random() * 0.6,
        ],
        type: 'K',
        active: false,
        velocity: [0, 0, 0],
        inside: true,
      });
    }
    ionsRef.current = ions;
    neurotransmittersRef.current = [];

    // Initialize vesicles at axon terminals
    const vesicles: { position: [number, number, number]; released: boolean }[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      vesicles.push({
        position: [7.5, Math.sin(angle) * 0.2, Math.cos(angle) * 0.2],
        released: false,
      });
    }
    vesiclesRef.current = vesicles;

    signalPositionRef.current = -12;
    phaseRef.current = 'resting';
    voltageRef.current = -70;
    timeRef.current = 0;
    phaseTimerRef.current = 0;
  }, [resetTrigger]);

  // Dendrite tree structure
  const dendrites = useMemo(() => {
    const branches: { start: [number, number, number]; end: [number, number, number]; level: number }[] = [];
    // Main dendrite branches
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const length = 1.8 + Math.random() * 1.2;
      branches.push({
        start: [-12.5, 0, 0],
        end: [-12.5 - Math.cos(angle) * length, Math.sin(angle) * 0.6, Math.sin(angle) * length],
        level: 0,
      });
      // Sub-branches
      for (let j = 0; j < 4; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 1.2;
        const subLength = 0.6 + Math.random() * 0.6;
        const startX = -12.5 - Math.cos(angle) * length;
        const startZ = Math.sin(angle) * length;
        branches.push({
          start: [startX, Math.sin(angle) * 0.6, startZ],
          end: [startX - Math.cos(subAngle) * subLength, Math.sin(angle) * 0.6 + Math.sin(subAngle) * 0.4, startZ + Math.sin(subAngle) * subLength],
          level: 1,
        });
      }
    }
    return branches;
  }, []);

  // Myelin segments along axon
  const myelinSegments = useMemo(() => {
    const segments: { start: number; end: number }[] = [];
    if (showMyelin) {
      for (let i = 0; i < 4; i++) {
        segments.push({ start: -8 + i * 3.5, end: -5.5 + i * 3.5 });
      }
    }
    return segments;
  }, [showMyelin]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * speed;
    phaseTimerRef.current += delta * simulationSpeed * speed;

    const phase = phaseRef.current;
    const signalPos = signalPositionRef.current;

    // Step-based progression or auto
    if (stepMode) {
      const phases: Phase[] = ['resting', 'stimulus', 'depolarization', 'repolarization', 'hyperpolarization', 'synapse'];
      if (step >= 0 && step < phases.length) {
        phaseRef.current = phases[step];
        phaseTimerRef.current = step * 1.5;
      }
    } else {
      // Auto progression
      if (phase === 'resting' && phaseTimerRef.current > 2) {
        phaseRef.current = 'stimulus';
        phaseTimerRef.current = 0;
      } else if (phase === 'stimulus' && phaseTimerRef.current > 1.2) {
        phaseRef.current = 'depolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'depolarization' && phaseTimerRef.current > 1.8) {
        phaseRef.current = 'repolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'repolarization' && phaseTimerRef.current > 1.8) {
        phaseRef.current = 'hyperpolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'hyperpolarization' && phaseTimerRef.current > 1.2) {
        phaseRef.current = 'synapse';
        phaseTimerRef.current = 0;
      } else if (phase === 'synapse' && phaseTimerRef.current > 2.5) {
        phaseRef.current = 'resting';
        phaseTimerRef.current = 0;
        signalPositionRef.current = -12;
        neurotransmittersRef.current = [];
        vesiclesRef.current.forEach(v => v.released = false);
      }
    }

    // Update voltage based on phase
    switch (phaseRef.current) {
      case 'resting':
        voltageRef.current = -70;
        signalPositionRef.current = -12 + Math.min(2, phaseTimerRef.current * 0.5);
        break;
      case 'stimulus':
        voltageRef.current = -70 + phaseTimerRef.current * 15;
        signalPositionRef.current = -11.5 + phaseTimerRef.current * 1.5;
        break;
      case 'depolarization':
        voltageRef.current = -55 + phaseTimerRef.current * 55;
        signalPositionRef.current = -10 + phaseTimerRef.current * 5;
        break;
      case 'repolarization':
        voltageRef.current = 40 - phaseTimerRef.current * 75;
        signalPositionRef.current = -1 + phaseTimerRef.current * 4;
        break;
      case 'hyperpolarization':
        voltageRef.current = -35 - phaseTimerRef.current * 35;
        signalPositionRef.current = 3 + phaseTimerRef.current * 2;
        break;
      case 'synapse':
        voltageRef.current = -70;
        signalPositionRef.current = 8;
        break;
    }

    // Update ion movements
    const ions = ionsRef.current;
    ions.forEach((ion) => {
      if (ion.type === 'Na') {
        // Na+ rushes IN during depolarization near signal
        if (phaseRef.current === 'depolarization' && Math.abs(ion.position[0] - signalPos) < 2.5) {
          ion.active = true;
          ion.velocity[1] = -0.025 * simulationSpeed;
          ion.position[1] += ion.velocity[1];
          if (ion.position[1] < 0) ion.inside = true;
        } else if (ion.inside && ion.position[1] < 0.6) {
          // Slow reset via Na+/K+ pump
          ion.position[1] += 0.003 * simulationSpeed;
          if (ion.position[1] > 0.6) ion.inside = false;
        }
      } else if (ion.type === 'K') {
        // K+ rushes OUT during repolarization
        if (phaseRef.current === 'repolarization' && Math.abs(ion.position[0] - signalPos) < 2.5) {
          ion.active = true;
          ion.velocity[1] = 0.025 * simulationSpeed;
          ion.position[1] += ion.velocity[1];
          if (ion.position[1] > 0.3) ion.inside = false;
        } else if (!ion.inside && ion.position[1] > -0.4) {
          // Slow reset via Na+/K+ pump
          ion.position[1] -= 0.003 * simulationSpeed;
          if (ion.position[1] < -0.4) ion.inside = true;
        }
      }
    });

    // Release neurotransmitters at synapse
    if (phaseRef.current === 'synapse') {
      vesiclesRef.current.forEach((vesicle, i) => {
        if (!vesicle.released && phaseTimerRef.current > i * 0.2) {
          vesicle.released = true;
          // Create neurotransmitters
          for (let j = 0; j < 5; j++) {
            neurotransmittersRef.current.push({
              id: neurotransmittersRef.current.length,
              position: [vesicle.position[0], vesicle.position[1], vesicle.position[2]],
              type: 'neurotransmitter',
              active: true,
              velocity: [0.015 * simulationSpeed, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.015],
              inside: false,
            });
          }
        }
      });
    }

    // Move neurotransmitters across synaptic cleft
    neurotransmittersRef.current.forEach((nt) => {
      if (nt.position[0] < 9.8) {
        nt.position[0] += nt.velocity[0];
        nt.position[1] += nt.velocity[1];
        nt.position[2] += nt.velocity[2];
      }
    });

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const phaseNames: Record<Phase, string> = {
        resting: '1. Resting (-70mV)',
        stimulus: '2. Stimulus Arrived',
        depolarization: '3. Depolarization (Na+ IN)',
        repolarization: '4. Repolarization (K+ OUT)',
        hyperpolarization: '5. Hyperpolarization',
        synapse: '6. Synapse (Neurotransmitters)',
      };

      const descriptions: Record<Phase, string> = {
        resting: 'Neuron at resting potential. Voltage-gated Na+ and K+ channels are CLOSED.',
        stimulus: 'Stimulus arrives at dendrites. Slight depolarization begins. Voltage starts rising.',
        depolarization: 'Voltage-gated Na+ channels OPEN! Na+ ions RUSH IN down their concentration gradient. Voltage shoots to +40mV.',
        repolarization: 'Na+ channels close. K+ channels OPEN! K+ ions RUSH OUT. Voltage drops back down.',
        hyperpolarization: 'K+ channels close slowly. Voltage briefly drops below resting potential (-70mV).',
        synapse: 'Action potential reaches axon terminals. Ca2+ channels open, vesicles release NEUROTRANSMITTERS into synaptic cleft.',
      };

      const newData: NervousSystemData = {
        voltage: Math.round(voltageRef.current),
        phase: phaseNames[phaseRef.current],
        naStatus: phaseRef.current === 'depolarization' ? 'OPEN (rushing IN →)' : 'Closed',
        kStatus: phaseRef.current === 'repolarization' ? 'OPEN (rushing OUT ←)' : 'Closed',
        speed: showMyelin ? 120 : 30,
        description: descriptions[phaseRef.current],
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Voltage graph data
  const voltageGraphData = useMemo(() => {
    const points: [number, number, number][] = [];
    const startX = -6;
    const z = -6;

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = startX + t * 10;
      let y = 0;

      if (t < 0.2) y = -70;
      else if (t < 0.3) y = -70 + (t - 0.2) * 100;
      else if (t < 0.45) y = -60 + (t - 0.3) * 666;
      else if (t < 0.65) y = 40 - (t - 0.45) * 400;
      else if (t < 0.75) y = -40 - (t - 0.65) * 300;
      else y = -70;

      const scaledY = (y + 80) / 40;
      points.push([x, scaledY, z]);
    }

    return points;
  }, []);

  const currentGraphPos = useMemo((): [number, number, number] => {
    const phaseProgress: Record<Phase, number> = {
      resting: 0,
      stimulus: 0.25,
      depolarization: 0.35,
      repolarization: 0.55,
      hyperpolarization: 0.7,
      synapse: 0.9,
    };
    const t = phaseProgress[phaseRef.current];
    return [-6 + t * 10, ((displayData.voltage + 80) / 40), -6];
  }, [displayData.voltage, phaseRef.current]);

  const getSignalColor = useCallback(() => {
    const v = voltageRef.current;
    if (v > 0) return '#22d3ee';
    if (v > -60) return '#06b6d4';
    if (v < -70) return '#a78bfa';
    return '#ec4899';
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#ec4899" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Cell Body (Soma) */}
        <mesh position={[-13.5, 0, 0]}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
        {/* Nucleus */}
        <mesh position={[-13.5, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#be185d" roughness={0.5} />
        </mesh>

        {/* Dendrites */}
        {dendrites.map((branch, i) => (
          <Line
            key={i}
            points={[branch.start, branch.end]}
            color="#f472b6"
            lineWidth={branch.level === 0 ? 3 : 1.5}
            opacity={0.8}
            transparent
          />
        ))}

        {/* Axon (long tube) */}
        <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 23, 24]} />
          <meshStandardMaterial
            color="#f9a8d4"
            transparent
            opacity={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Myelin Sheaths */}
        {showMyelin && myelinSegments.map((seg, i) => (
          <group key={i}>
            <mesh position={[(seg.start + seg.end) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.55, 0.55, seg.end - seg.start, 16]} />
              <meshStandardMaterial
                color="#fde047"
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[(seg.start + seg.end) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.57, 0.57, seg.end - seg.start - 0.1, 12]} />
              <meshStandardMaterial
                color="#facc15"
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        ))}

        {/* Nodes of Ranvier */}
        {showMyelin && [-6.75, -3.25, 0.25, 3.75].map((pos, i) => (
          <mesh key={i} position={[pos, 0, 0]}>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial
              color="#f472b6"
              emissive="#f472b6"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Ion Channels */}
        {showIonChannels && Array.from({ length: 18 }).map((_, i) => {
          const xPos = -10 + i * 1.2;
          return (
            <group key={i} position={[xPos, 0.35, Math.sin(i * 0.5) * 0.15]}>
              {/* Channel opening */}
              <mesh>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <meshStandardMaterial
                  color="#06b6d4"
                  emissive="#06b6d4"
                  emissiveIntensity={0.5}
                />
              </mesh>
              {/* Channel pore */}
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
                <meshStandardMaterial color="#1e3a5f" />
              </mesh>
            </group>
          );
        })}

        {/* Ions (Na+ red outside/top, K+ blue inside/bottom) */}
        {ionsRef.current.map((ion) => (
          <mesh key={ion.id} position={ion.position}>
            <sphereGeometry args={[ion.type === 'Na' ? 0.07 : 0.055, 8, 8]} />
            <meshStandardMaterial
              color={ion.type === 'Na' ? '#ef4444' : '#3b82f6'}
              emissive={ion.type === 'Na' ? '#ef4444' : '#3b82f6'}
              emissiveIntensity={ion.active ? 1 : 0.3}
              transparent
              opacity={ion.active ? 1 : 0.5}
            />
          </mesh>
        ))}

        {/* Action potential signal glow */}
        <mesh position={[signalPositionRef.current, 0, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial
            color={getSignalColor()}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight
          position={[signalPositionRef.current, 0, 0]}
          intensity={1.2}
          color={getSignalColor()}
          distance={3.5}
        />

        {/* Axon Terminals with vesicles */}
        <group position={[8, 0, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const vesicle = vesiclesRef.current[i];
            return (
              <group key={i} position={[0.8, Math.sin(angle) * 0.35, Math.cos(angle) * 0.35]}>
                <mesh>
                  <sphereGeometry args={[0.3, 12, 12]} />
                  <meshStandardMaterial color="#8b5cf6" />
                </mesh>
                {/* Vesicle */}
                {!vesicle?.released && (
                  <mesh position={[-0.15, 0, 0]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial
                      color="#fbbf24"
                      emissive="#fbbf24"
                      emissiveIntensity={0.6}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>

        {/* Neurotransmitters in synaptic cleft */}
        {neurotransmittersRef.current.map((nt) => (
          <mesh key={nt.id} position={nt.position}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#a78bfa"
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}

        {/* Post-synaptic neuron dendrite */}
        <mesh position={[10.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 2, 16]} />
          <meshStandardMaterial color="#8b5cf6" opacity={0.7} transparent />
        </mesh>

        {/* Receptors on post-synaptic membrane */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[10, Math.sin(angle) * 0.25, Math.cos(angle) * 0.25]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} />
            </mesh>
          );
        })}

        {/* Voltage Graph */}
        <group position={[0, 5, -6]} rotation={[Math.PI / 4, 0, 0]}>
          <mesh position={[-1, 1, 0]}>
            <boxGeometry args={[11, 3.5, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.95} />
          </mesh>

          <Line points={voltageGraphData} color="#22d3ee" lineWidth={3} />

          <mesh position={currentGraphPos}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.9} />
          </mesh>

          <Html position={[-6.5, 4, 0]} distanceFactor={15}>
            <div className="text-cyan-400 text-xs font-bold">+40mV</div>
          </Html>
          <Html position={[-6.5, 0.5, 0]} distanceFactor={15}>
            <div className="text-gray-400 text-xs">-70mV</div>
          </Html>
          <Html position={[-1, 4.5, 0]} distanceFactor={15}>
            <div className="text-white text-xs font-bold">Action Potential</div>
          </Html>
        </group>

        {/* Main info panel */}
        <Html position={[0, 7, 0]} distanceFactor={15}>
          <div className="bg-gray-900/95 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="text-lg font-bold text-pink-400 mb-2">{displayData.phase}</div>
            <div className="text-sm mb-2">{displayData.description}</div>
            <div className="flex items-center gap-4 text-xs">
              <div>Voltage: <span className={`font-bold px-2 py-0.5 rounded ${
                displayData.voltage > 0 ? 'bg-cyan-500/30 text-cyan-400' :
                displayData.voltage < -70 ? 'bg-purple-500/30 text-purple-400' :
                'bg-blue-500/30 text-blue-400'
              }`}>{displayData.voltage} mV</span></div>
              <div>Speed: <span className="font-bold text-amber-400">{displayData.speed} m/s</span></div>
            </div>
          </div>
        </Html>

        {/* Ion status */}
        <Html position={[-8, 4, 3]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2">Voltage-Gated Ion Channels</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Na+ (Sodium): </span>
              <span className={displayData.naStatus.includes('OPEN') ? 'text-red-400 font-bold bg-red-500/20 px-2 py-0.5 rounded' : 'text-gray-400'}>{displayData.naStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>K+ (Potassium): </span>
              <span className={displayData.kStatus.includes('OPEN') ? 'text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded' : 'text-gray-400'}>{displayData.kStatus}</span>
            </div>
          </div>
        </Html>

        {/* Direction arrows for ion flow */}
        {displayData.naStatus.includes('OPEN') && (
          <Html position={[-2, 2, 2]} distanceFactor={12}>
            <div className="text-red-400 text-xs font-bold animate-pulse">Na+ RUSHING IN ↓</div>
          </Html>
        )}
        {displayData.kStatus.includes('OPEN') && (
          <Html position={[2, 2, 2]} distanceFactor={12}>
            <div className="text-blue-400 text-xs font-bold animate-pulse">K+ RUSHING OUT ↑</div>
          </Html>
        )}

        {/* Labels */}
        <Html position={[-13.5, 2.2, 0]} distanceFactor={12}>
          <div className="bg-pink-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Cell Body (Soma)
          </div>
        </Html>

        <Html position={[-2, 1.5, 0]} distanceFactor={12}>
          <div className="bg-pink-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Axon
          </div>
        </Html>

        {showMyelin && (
          <Html position={[0, -1.5, 0]} distanceFactor={12}>
            <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs">
              Myelin Sheath (Insulation)
            </div>
          </Html>
        )}

        <Html position={[8, 1.8, 0]} distanceFactor={12}>
          <div className="bg-purple-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Axon Terminals
          </div>
        </Html>

        <Html position={[9.5, 1.5, 0]} distanceFactor={12}>
          <div className="bg-indigo-500/90 text-white px-2 py-1 rounded text-xs">
            Synaptic Cleft
          </div>
        </Html>

        {/* Legend */}
        <Html position={[6, 4, 3]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2">Legend</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Neuron Membrane</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span>Myelin Sheath</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <span>Action Potential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span>Neurotransmitters</span>
            </div>
          </div>
        </Html>

        {/* Synapse detail */}
        <Html position={[9, -2, 0]} distanceFactor={12}>
          <div className="bg-purple-900/90 text-white px-3 py-2 rounded text-xs max-w-[180px]">
            <div className="font-bold text-purple-300 mb-1">Synapse</div>
            <div className="text-gray-300">
              Neurotransmitters cross the synaptic cleft and bind to receptors on the next neuron.
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
