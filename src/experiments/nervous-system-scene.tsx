'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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
  const [impulses, setImpulses] = useState<{ position: number; id: number }[]>([]);
  const [impulseCount, setImpulseCount] = useState(0);
  const timeRef = useRef(0);
  const lastImpulseRef = useRef(0);

  useEffect(() => {
    setImpulses([]);
    setImpulseCount(0);
    timeRef.current = 0;
    lastImpulseRef.current = 0;
  }, [resetTrigger]);

  const segments = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [i * 1.5 - 15, 0, 0] as [number, number, number],
    }));
  }, []);

  useEffect(() => {
    if (onDataChange) {
      const signalSpeed = myelin ? 120 : 30;
      const membranePotential = impulses.length > 0 ? -40 : -70;
      onDataChange({
        membranePotential,
        signalSpeed: signalSpeed * stimulus,
        impulseCount,
      });
    }
  }, [impulses, impulseCount, myelin, stimulus, onDataChange]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;

      const baseSpeed = myelin ? 10 : 4;
      const adjustedSpeed = baseSpeed * stimulus;

      if (timeRef.current - lastImpulseRef.current > 2 / stimulus) {
        lastImpulseRef.current = timeRef.current;
        const newId = impulseCount;
        setImpulseCount((c) => c + 1);
        setImpulses((prev) => [...prev, { position: -15, id: newId }]);
      }

      setImpulses((prev) =>
        prev
          .map((imp) => ({ ...imp, position: imp.position + delta * adjustedSpeed * simulationSpeed * speed }))
          .filter((imp) => imp.position < 16)
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#ec4899" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {segments.map((seg, i) => (
          <group key={i} position={seg.position}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
              <meshPhysicalMaterial
                color="#ec4899"
                transparent
                opacity={0.4}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 1.1, 16]} />
              <meshPhysicalMaterial
                color="#f9a8d4"
                transparent
                opacity={0.3}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 1.1, 16]} />
              <meshPhysicalMaterial
                color="#f9a8d4"
                transparent
                opacity={0.3}
                roughness={0.4}
              />
            </mesh>

            {myelin && i % 3 === 0 && (
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.6, 0.6, 0.8, 16]} />
                <meshStandardMaterial color="#fde047" roughness={0.5} />
              </mesh>
            )}

            {i === 0 && (
              <>
                <Html position={[-1, 1.5, 0]} distanceFactor={10}>
                  <div className="bg-pink-500/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    Cell Body
                  </div>
                </Html>
                <mesh position={[-1, 0, 0]}>
                  <sphereGeometry args={[0.8, 16, 16]} />
                  <meshStandardMaterial color="#ec4899" />
                </mesh>
              </>
            )}

            {i === 19 && (
              <>
                <Html position={[2, 1.5, 0]} distanceFactor={10}>
                  <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    Synapse
                  </div>
                </Html>
                <group position={[1.2, 0, 0]}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <mesh key={j} position={[0.2, j * 0.3 - 0.6, 0]}>
                      <sphereGeometry args={[0.15, 8, 8]} />
                      <meshStandardMaterial color="#8b5cf6" />
                    </mesh>
                  ))}
                </group>
              </>
            )}
          </group>
        ))}

        {impulses.map((imp) => (
          <group key={imp.id} position={[imp.position, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.8}
              />
            </mesh>
            <pointLight intensity={0.5} color="#06b6d4" distance={2} />
          </group>
        ))}

        <Html position={[0, -2, 0]} distanceFactor={10}>
          <div className="bg-pink-500/80 text-white px-3 py-1 rounded text-sm">
            Neuron Axon - {impulses.length > 0 ? 'Firing!' : 'Resting'}
          </div>
        </Html>

        {myelin && (
          <Html position={[0, 2.5, 0]} distanceFactor={10}>
            <div className="bg-amber-500/80 text-white px-2 py-1 rounded text-xs">
              Myelin Sheath
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
