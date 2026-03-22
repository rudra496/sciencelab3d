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
    // Na+ ions outside (red)
    for (let i = 0; i < 40; i++) {
      ions.push({
        id: i,
        position: [
          -10 + Math.random() * 20,
          0.8 + Math.random() * 0.5,
          -0.5 + Math.random() * 1,
        ],
        type: 'Na',
        active: false,
        velocity: [0, 0, 0],
      });
    }
    // K+ ions inside (blue)
    for (let i = 0; i < 40; i++) {
      ions.push({
        id: 40 + i,
        position: [
          -10 + Math.random() * 20,
          -0.3 - Math.random() * 0.3,
          -0.3 + Math.random() * 0.6,
        ],
        type: 'K',
        active: false,
        velocity: [0, 0, 0],
      });
    }
    ionsRef.current = ions;
    neurotransmittersRef.current = [];
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
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 1.5 + Math.random() * 1;
      branches.push({
        start: [-12, 0, 0],
        end: [-12 - Math.cos(angle) * length, Math.sin(angle) * 0.5, Math.sin(angle) * length],
        level: 0,
      });
      // Sub-branches
      for (let j = 0; j < 3; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 1;
        const subLength = 0.5 + Math.random() * 0.5;
        const startX = -12 - Math.cos(angle) * length;
        const startZ = Math.sin(angle) * length;
        branches.push({
          start: [startX, Math.sin(angle) * 0.5, startZ],
          end: [startX - Math.cos(subAngle) * subLength, Math.sin(angle) * 0.5 + Math.sin(subAngle) * 0.3, startZ + Math.sin(subAngle) * subLength],
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
      // Myelin sheaths from -8 to 6
      for (let i = 0; i < 4; i++) {
        segments.push({ start: -8 + i * 3.5, end: -5.5 + i * 3.5 });
      }
    }
    return segments;
  }, [showMyelin]);

  // Nodes of Ranvier (gaps in myelin)
  const nodesOfRanvier = useMemo(() => {
    if (!showMyelin) return [];
    return [-6.75, -3.25, 0.25, 3.75];
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
      // Manual step control via step prop
      const phases: Phase[] = ['resting', 'stimulus', 'depolarization', 'repolarization', 'hyperpolarization', 'synapse'];
      if (step >= 0 && step < phases.length) {
        phaseRef.current = phases[step];
      }
    } else {
      // Auto progression
      if (phase === 'resting' && phaseTimerRef.current > 2) {
        phaseRef.current = 'stimulus';
        phaseTimerRef.current = 0;
      } else if (phase === 'stimulus' && phaseTimerRef.current > 1) {
        phaseRef.current = 'depolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'depolarization' && phaseTimerRef.current > 1.5) {
        phaseRef.current = 'repolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'repolarization' && phaseTimerRef.current > 1.5) {
        phaseRef.current = 'hyperpolarization';
        phaseTimerRef.current = 0;
      } else if (phase === 'hyperpolarization' && phaseTimerRef.current > 1) {
        phaseRef.current = 'synapse';
        phaseTimerRef.current = 0;
      } else if (phase === 'synapse' && phaseTimerRef.current > 2) {
        phaseRef.current = 'resting';
        phaseTimerRef.current = 0;
        signalPositionRef.current = -12;
        neurotransmittersRef.current = [];
      }
    }

    // Update voltage based on phase
    switch (phaseRef.current) {
      case 'resting':
        voltageRef.current = -70;
        break;
      case 'stimulus':
        voltageRef.current = -70 + phaseTimerRef.current * 10;
        signalPositionRef.current = -12 + phaseTimerRef.current * 2;
        break;
      case 'depolarization':
        voltageRef.current = -60 + phaseTimerRef.current * 70;
        signalPositionRef.current = -10 + phaseTimerRef.current * 4;
        break;
      case 'repolarization':
        voltageRef.current = 40 - phaseTimerRef.current * 80;
        signalPositionRef.current = -4 + phaseTimerRef.current * 4;
        break;
      case 'hyperpolarization':
        voltageRef.current = -40 - phaseTimerRef.current * 30;
        signalPositionRef.current = 2 + phaseTimerRef.current * 2;
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
        // Na+ rushes IN during depolarization
        if (phaseRef.current === 'depolarization' && Math.abs(ion.position[0] - signalPos) < 3) {
          ion.active = true;
          ion.velocity[1] = -0.02 * simulationSpeed;
          ion.position[1] += ion.velocity[1];
        } else if (ion.position[1] < 0.8) {
          ion.position[1] += 0.005; // Slow return
        }
      } else if (ion.type === 'K') {
        // K+ rushes OUT during repolarization
        if (phaseRef.current === 'repolarization' && Math.abs(ion.position[0] - signalPos) < 3) {
          ion.active = true;
          ion.velocity[1] = 0.02 * simulationSpeed;
          ion.position[1] += ion.velocity[1];
        } else if (ion.position[1] > -0.3) {
          ion.position[1] -= 0.005; // Slow return
        }
      }
    });

    // Release neurotransmitters at synapse
    if (phaseRef.current === 'synapse' && neurotransmittersRef.current.length < 20) {
      neurotransmittersRef.current.push({
        id: neurotransmittersRef.current.length,
        position: [8 + Math.random() * 0.5, 0.2, (Math.random() - 0.5) * 0.5],
        type: 'neurotransmitter',
        active: true,
        velocity: [0.01 * simulationSpeed, 0, (Math.random() - 0.5) * 0.01],
      });
    }

    // Move neurotransmitters across synaptic cleft
    neurotransmittersRef.current.forEach((nt) => {
      if (nt.position[0] < 9.5) {
        nt.position[0] += nt.velocity[0];
        nt.position[2] += nt.velocity[2];
      }
    });

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const phaseNames: Record<Phase, string> = {
        resting: 'Resting (-70mV)',
        stimulus: 'Stimulus Arrived',
        depolarization: 'Depolarization (Na+ influx)',
        repolarization: 'Repolarization (K+ efflux)',
        hyperpolarization: 'Hyperpolarization',
        synapse: 'Synaptic Transmission',
      };

      const descriptions: Record<Phase, string> = {
        resting: 'Neuron at resting potential. Voltage-gated channels closed.',
        stimulus: 'Signal arrives at dendrites. Voltage begins to rise.',
        depolarization: 'Na+ channels open. Na+ rushes IN. Voltage shoots to +40mV.',
        repolarization: 'K+ channels open. K+ rushes OUT. Voltage drops.',
        hyperpolarization: 'Voltage briefly drops below resting potential.',
        synapse: 'Signal reaches axon terminal. Neurotransmitters released into synapse.',
      };

      const newData: NervousSystemData = {
        voltage: Math.round(voltageRef.current),
        phase: phaseNames[phaseRef.current],
        naStatus: phaseRef.current === 'depolarization' ? 'OPEN (rushing IN)' : 'Closed',
        kStatus: phaseRef.current === 'repolarization' ? 'OPEN (rushing OUT)' : 'Closed',
        speed: showMyelin ? 120 : 30,
        description: descriptions[phaseRef.current],
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Voltage graph data for Line component
  const voltageGraphData = useMemo(() => {
    const points: [number, number, number][] = [];
    const startX = -6;
    const z = -6;

    // Action potential waveform
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = startX + t * 10;
      let y = 0;

      if (t < 0.2) y = -70; // Resting
      else if (t < 0.3) y = -70 + (t - 0.2) * 100; // Stimulus
      else if (t < 0.45) y = -60 + (t - 0.3) * 666; // Depolarization
      else if (t < 0.65) y = 40 - (t - 0.45) * 400; // Repolarization
      else if (t < 0.75) y = -40 - (t - 0.65) * 300; // Hyperpolarization
      else y = -70; // Return to resting

      // Scale y to fit
      const scaledY = (y + 80) / 40;
      points.push([x, scaledY, z]);
    }

    return points;
  }, []);

  // Current position indicator on graph
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

  // Get color for signal glow based on voltage
  const getSignalColor = useCallback(() => {
    const v = voltageRef.current;
    if (v > 0) return '#22d3ee'; // Cyan for depolarization
    if (v > -60) return '#06b6d4'; // Light blue
    if (v < -70) return '#a78bfa'; // Purple for hyperpolarization
    return '#ec4899'; // Pink for resting
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#ec4899" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Cell Body (Soma) */}
        <mesh position={[-13, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[-13, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#be185d" roughness={0.5} />
        </mesh>

        {/* Dendrites */}
        {dendrites.map((branch, i) => (
          <Line
            key={i}
            points={[branch.start, branch.end]}
            color="#f472b6"
            lineWidth={branch.level === 0 ? 3 : 1}
            opacity={0.7}
            transparent
          />
        ))}

        {/* Axon (long tube) */}
        <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 22, 24]} />
          <meshStandardMaterial
            color="#f9a8d4"
            transparent
            opacity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Myelin Sheaths */}
        {showMyelin && myelinSegments.map((seg, i) => (
          <group key={i}>
            <mesh position={[(seg.start + seg.end) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.5, 0.5, seg.end - seg.start, 16]} />
              <meshStandardMaterial
                color="#fde047"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
            {/* Myelin layers */}
            <mesh position={[(seg.start + seg.end) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, seg.end - seg.start - 0.1, 12]} />
              <meshStandardMaterial
                color="#facc15"
                transparent
                opacity={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Nodes of Ranvier */}
        {showMyelin && nodesOfRanvier.map((pos, i) => (
          <mesh key={i} position={[pos, 0, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial
              color="#f472b6"
              emissive="#f472b6"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Ion Channels */}
        {showIonChannels && Array.from({ length: 15 }).map((_, i) => (
          <mesh key={i} position={[-10 + i * 1.3, 0.4, Math.sin(i) * 0.2]}>
            <boxGeometry args={[0.1, 0.15, 0.1]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Ions (Na+ red, K+ blue) */}
        {ionsRef.current.map((ion) => (
          <mesh key={ion.id} position={ion.position}>
            <sphereGeometry args={[ion.type === 'Na' ? 0.08 : 0.06, 8, 8]} />
            <meshStandardMaterial
              color={ion.type === 'Na' ? '#ef4444' : '#3b82f6'}
              emissive={ion.type === 'Na' ? '#ef4444' : '#3b82f6'}
              emissiveIntensity={ion.active ? 0.8 : 0.2}
              transparent
              opacity={ion.active ? 1 : 0.4}
            />
          </mesh>
        ))}

        {/* Action potential signal glow traveling along axon */}
        <mesh position={[signalPositionRef.current, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial
            color={getSignalColor()}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight
          position={[signalPositionRef.current, 0, 0]}
          intensity={1}
          color={getSignalColor()}
          distance={3}
        />

        {/* Axon Terminals */}
        <group position={[8, 0, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[0.8, Math.sin(angle) * 0.3, Math.cos(angle) * 0.3]}>
                <sphereGeometry args={[0.25, 12, 12]} />
                <meshStandardMaterial color="#8b5cf6" />
              </mesh>
            );
          })}
        </group>

        {/* Neurotransmitters in synaptic cleft */}
        {neurotransmittersRef.current.map((nt) => (
          <mesh key={nt.id} position={nt.position}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#a78bfa"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

        {/* Post-synaptic neuron (partial) */}
        <mesh position={[10, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" opacity={0.6} transparent />
        </mesh>

        {/* Voltage Graph */}
        <group position={[0, 4, -5]} rotation={[Math.PI / 4, 0, 0]}>
          {/* Graph background */}
          <mesh position={[-1, 1, 0]}>
            <boxGeometry args={[11, 3, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.9} />
          </mesh>

          {/* Voltage waveform */}
          <Line points={voltageGraphData} color="#22d3ee" lineWidth={3} />

          {/* Current position indicator */}
          <mesh position={currentGraphPos}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>

          {/* Voltage labels */}
          <Html position={[-6.5, 3.5, 0]} distanceFactor={15}>
            <div className="text-cyan-400 text-xs font-bold">+40mV</div>
          </Html>
          <Html position={[-6.5, 1, 0]} distanceFactor={15}>
            <div className="text-gray-400 text-xs">-70mV</div>
          </Html>
          <Html position={[-1, 4, 0]} distanceFactor={15}>
            <div className="text-white text-xs font-bold">Action Potential</div>
          </Html>
        </group>

        {/* Labels */}
        <Html position={[-13, 2, 0]} distanceFactor={12}>
          <div className="bg-pink-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Cell Body (Soma)
          </div>
        </Html>

        <Html position={[-2, 1, 0]} distanceFactor={12}>
          <div className="bg-pink-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Axon
          </div>
        </Html>

        {showMyelin && (
          <Html position={[0, -1.5, 0]} distanceFactor={12}>
            <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs">
              Myelin Sheath
            </div>
          </Html>
        )}

        <Html position={[8, 1.5, 0]} distanceFactor={12}>
          <div className="bg-purple-500/90 text-white px-3 py-1 rounded text-xs font-bold">
            Axon Terminals
          </div>
        </Html>

        <Html position={[9.5, 1.5, 0]} distanceFactor={12}>
          <div className="bg-indigo-500/90 text-white px-2 py-1 rounded text-xs">
            Synapse
          </div>
        </Html>

        {/* Main info panel */}
        <Html position={[0, 6, 0]} distanceFactor={15}>
          <div className="bg-gray-900/95 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="text-lg font-bold text-pink-400 mb-2">{displayData.phase}</div>
            <div className="text-sm mb-2">{displayData.description}</div>
            <div className="flex items-center gap-4 text-xs">
              <div>Voltage: <span className={`font-bold ${displayData.voltage > 0 ? 'text-cyan-400' : displayData.voltage < -70 ? 'text-purple-400' : 'text-blue-400'}`}>{displayData.voltage} mV</span></div>
              <div>Speed: <span className="font-bold text-amber-400">{displayData.speed} m/s</span></div>
            </div>
          </div>
        </Html>

        {/* Ion status */}
        <Html position={[-8, 3.5, 3]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2">Ion Channels</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Na+: <span className={displayData.naStatus.includes('OPEN') ? 'text-red-400 font-bold' : ''}>{displayData.naStatus}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>K+: <span className={displayData.kStatus.includes('OPEN') ? 'text-blue-400 font-bold' : ''}>{displayData.kStatus}</span></span>
            </div>
          </div>
        </Html>

        {/* Legend */}
        <Html position={[6, 3.5, 3]} distanceFactor={15}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2">Legend</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Neuron</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span>Myelin</span>
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
      </group>
    </>
  );
}
