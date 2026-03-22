'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface PhotosynthesisData {
  lightReactionRate: number;
  calvinCycleRate: number;
  glucoseProduced: number;
  oxygenReleased: number;
}

interface PhotosynthesisSceneProps {
  onDataChange?: (data: PhotosynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  lightIntensity?: number;
  co2Level?: number;
  waterLevel?: number;
}

// Molecule types for animation
interface Molecule {
  id: string;
  type: 'H2O' | 'CO2' | 'O2' | 'glucose' | 'ATP' | 'NADPH';
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  progress: number;
  speed: number;
}

export default function PhotosynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  lightIntensity = 1,
  co2Level = 1,
  waterLevel = 1,
}: PhotosynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Physics state in refs
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const glucoseProducedRef = useRef(0);
  const oxygenReleasedRef = useRef(0);

  // Animated molecules
  const moleculesRef = useRef<Molecule[]>([]);
  const [visibleMolecules, setVisibleMolecules] = useState<Molecule[]>([]);

  // React state for UI updates (throttled)
  const [glucoseProduced, setGlucoseProduced] = useState(0);
  const [oxygenReleased, setOxygenReleased] = useState(0);
  const frameCountRef = useRef(0);

  // Thylakoid membrane positions
  const thylakoids = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      position: [
        Math.cos(i * 0.7) * 1.8,
        (i - 5) * 0.35,
        Math.sin(i * 0.7) * 1.8,
      ] as [number, number, number],
      angle: i * 0.7,
    }));
  }, []);

  // Stroma lamellae connections
  const stromaConnections = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      start: thylakoids[i * 3].position,
      end: thylakoids[Math.min((i + 1) * 3, 9)].position,
    }));
  }, [thylakoids]);

  // Reset physics state
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    glucoseProducedRef.current = 0;
    oxygenReleasedRef.current = 0;
    moleculesRef.current = [];
    setGlucoseProduced(0);
    setOxygenReleased(0);
    setVisibleMolecules([]);
  }, [resetTrigger]);

  // Spawn new molecules based on reaction rates
  const spawnMolecule = useCallback((type: Molecule['type']) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    let startPos: THREE.Vector3;
    let targetPos: THREE.Vector3;

    switch (type) {
      case 'H2O':
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          -4,
          (Math.random() - 0.5) * 6
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        break;
      case 'CO2':
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          4,
          (Math.random() - 0.5) * 8
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -1.5,
          (Math.random() - 0.5) * 1.5
        );
        break;
      case 'O2':
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          4,
          (Math.random() - 0.5) * 6
        );
        break;
      case 'glucose':
        startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -1.5,
          (Math.random() - 0.5) * 1.5
        );
        targetPos = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          -3,
          (Math.random() - 0.5) * 3
        );
        break;
      default:
        startPos = new THREE.Vector3(0, 0, 0);
        targetPos = new THREE.Vector3(0, 0, 0);
    }

    const molecule: Molecule = {
      id,
      type,
      position: startPos.clone(),
      targetPosition: targetPos,
      progress: 0,
      speed: 0.3 + Math.random() * 0.2,
    };

    moleculesRef.current.push(molecule);
  }, []);

  // Throttled state updates (every 8 frames)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed;
      rotationRef.current += delta * 0.05 * simulationSpeed;
      groupRef.current.rotation.y = rotationRef.current;

      // Calculate reaction rates
      const lightReactionRate = lightIntensity * waterLevel;
      const calvinCycleRate = co2Level * lightIntensity * 0.8;

      // Update product counters (physics state)
      glucoseProducedRef.current = Math.min(100, glucoseProducedRef.current + delta * calvinCycleRate * 4 * simulationSpeed);
      oxygenReleasedRef.current = Math.min(100, oxygenReleasedRef.current + delta * lightReactionRate * 2.5 * simulationSpeed);

      // Spawn molecules based on rates
      if (frameCountRef.current % 30 === 0) {
        if (waterLevel > 0.3 && Math.random() < waterLevel * 0.5) {
          spawnMolecule('H2O');
        }
        if (co2Level > 0.3 && Math.random() < co2Level * 0.4) {
          spawnMolecule('CO2');
        }
        if (oxygenReleasedRef.current > 5 && Math.random() < 0.3) {
          spawnMolecule('O2');
        }
        if (glucoseProducedRef.current > 10 && Math.random() < 0.2) {
          spawnMolecule('glucose');
        }
      }

      // Update molecule positions
      moleculesRef.current = moleculesRef.current.filter(mol => {
        mol.progress += delta * mol.speed * simulationSpeed;
        mol.position.lerp(mol.targetPosition, delta * mol.speed * simulationSpeed);
        return mol.progress < 1;
      });

      // Update React state every 8 frames
      if (frameCountRef.current % 8 === 0) {
        setGlucoseProduced(glucoseProducedRef.current);
        setOxygenReleased(oxygenReleasedRef.current);
        setVisibleMolecules([...moleculesRef.current]);

        if (onDataChange) {
          onDataChange({
            lightReactionRate,
            calvinCycleRate,
            glucoseProduced: Math.round(glucoseProducedRef.current),
            oxygenReleased: Math.round(oxygenReleasedRef.current),
          });
        }
      }
    }
  });

  const renderMolecule = (mol: Molecule) => {
    const colors = {
      H2O: '#06b6d4',
      CO2: '#3b82f6',
      O2: '#ef4444',
      glucose: '#a855f7',
      ATP: '#fbbf24',
      NADPH: '#22c55e',
    };

    const sizes = {
      H2O: 0.25,
      CO2: 0.3,
      O2: 0.2,
      glucose: 0.4,
      ATP: 0.25,
      NADPH: 0.22,
    };

    return (
      <group key={mol.id} position={mol.position}>
        <mesh>
          <sphereGeometry args={[sizes[mol.type], 12, 12]} />
          <meshStandardMaterial
            color={colors[mol.type]}
            emissive={colors[mol.type]}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Label for molecule */}
        <Html position={[0, sizes[mol.type] + 0.15, 0]} distanceFactor={15} center>
          <div className={`text-xs font-bold px-1 py-0.5 rounded whitespace-nowrap`} style={{
            backgroundColor: colors[mol.type],
            color: 'white',
          }}>
            {mol.type}
          </div>
        </Html>
      </group>
    );
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={lightIntensity * 1.2} color="#fef3c7" />
      <pointLight position={[0, -5, 0]} intensity={0.5} color="#22c55e" />
      <pointLight position={[5, 5, 5]} intensity={lightIntensity} color="#fbbf24" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Chloroplast outer membrane */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshPhysicalMaterial
            color="#22c55e"
            transparent
            opacity={0.12}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Thylakoid membrane system */}
        <group position={[0, 0, 0]}>
          {thylakoids.map((thylakoid, i) => (
            <group key={i} position={thylakoid.position}>
              {/* Thylakoid disc */}
              <mesh rotation={[thylakoid.angle * 0.3, thylakoid.angle, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
                <meshStandardMaterial
                  color="#059669"
                  roughness={0.4}
                  metalness={0.1}
                />
              </mesh>

              {/* Light absorption effect */}
              {lightIntensity > 0.5 && (
                <mesh position={[0, 0.2, 0]}>
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={lightIntensity * 0.8}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              )}

              {/* ATP/ADP indicator */}
              {lightIntensity > 0.3 && i % 2 === 0 && (
                <mesh position={[0.5, 0, 0]}>
                  <sphereGeometry args={[0.08, 6, 6]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={lightIntensity * 0.5}
                  />
                </mesh>
              )}
            </group>
          ))}

          {/* Stroma lamellae (connecting thylakoids) */}
          {stromaConnections.map((conn, i) => (
            <group key={i}>
              <mesh position={[
                (conn.start[0] + conn.end[0]) / 2,
                (conn.start[1] + conn.end[1]) / 2,
                (conn.start[2] + conn.end[2]) / 2
              ]}>
                <capsuleGeometry args={[0.15, 0.8, 8, 12]} />
                <meshStandardMaterial
                  color="#047857"
                  roughness={0.5}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Stroma (Calvin cycle area) */}
        <group position={[0, -2, 0]}>
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial
              color="#22c55e"
              transparent
              opacity={0.1}
            />
          </mesh>

          {/* Calvin cycle enzyme indicators */}
          {co2Level > 0.3 && Array.from({ length: 3 }).map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI * 2 / 3) * 0.8,
              0,
              Math.sin(i * Math.PI * 2 / 3) * 0.8
            ]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={co2Level * 0.4}
              />
            </mesh>
          ))}
        </group>

        {/* Animated molecules */}
        {visibleMolecules.map(renderMolecule)}

        {/* Labels */}
        <Html position={[0, -4.5, 0]} distanceFactor={10}>
          <div className="bg-green-600/90 text-white px-3 py-1 rounded text-sm font-medium">
            Chloroplast
          </div>
        </Html>

        {lightIntensity > 0.5 && (
          <Html position={[3, 3, 3]} distanceFactor={12}>
            <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs">
              Light Reactions (Thylakoids)
            </div>
          </Html>
        )}

        {co2Level > 0.3 && (
          <Html position={[0, -3.5, 2]} distanceFactor={12}>
            <div className="bg-green-700/90 text-white px-2 py-1 rounded text-xs">
              Calvin Cycle (Stroma)
            </div>
          </Html>
        )}

        {/* Process indicator */}
        <Html position={[0, 5, 0]} distanceFactor={10}>
          <div className="bg-gray-900/90 px-4 py-2 rounded-lg border border-gray-700">
            <div className="text-white text-sm font-bold">Photosynthesis</div>
            <div className="text-gray-300 text-xs mt-1">
              Light: {(lightIntensity * 100).toFixed(0)}% | CO₂: {(co2Level * 100).toFixed(0)}%
            </div>
            <div className="text-gray-300 text-xs">
              Glucose: {Math.round(glucoseProduced)} | O₂: {Math.round(oxygenReleased)}
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
