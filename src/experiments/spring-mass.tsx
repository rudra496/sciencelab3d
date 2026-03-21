"use client";

export { SpringMassSceneComponent as default, SpringMassSceneComponent } from "./spring-mass-scene";
export type { SpringData } from "./spring-mass-scene";

// Legacy export - kept for backwards compatibility
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { DataDisplay, EnergyBar } from "@/components/experiment-helpers";
import {
  calculateSpringPeriod,
  calculateSpringAngularFrequency,
  calculateSpringPE,
  calculateKineticEnergy,
} from "@/utils/physics";

export function SpringMassScene() {
  const massRef = useRef<THREE.Mesh>(null);
  const springRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const { mass, stiffness, damping, initialDisplacement, showEnergy, showData, springType } = useControls(
    "Spring-Mass",
    {
      mass: { value: 2, min: 0.5, max: 5, step: 0.1, label: "Mass (kg)" },
      stiffness: { value: 50, min: 10, max: 150, step: 5, label: "Spring Constant (N/m)" },
      damping: { value: 0.3, min: 0, max: 2, step: 0.05, label: "Damping Coefficient" },
      initialDisplacement: { value: 2, min: 0.5, max: 3, step: 0.1, label: "Initial Displacement (m)" },
      springType: { value: "helix", options: ["helix", "zigzag"], label: "Spring Type" },
      showEnergy: { value: true, label: "Show Energy" },
      showData: { value: true, label: "Show Data Panel" },
      reset: button(() => reset()),
    }
  );

  const positionRef = useRef(initialDisplacement);
  const velocityRef = useRef(0);
  const trailPositions = useRef<Float32Array>(new Float32Array(200 * 3));
  const trailColors = useRef<Float32Array>(new Float32Array(200 * 3));
  const trailIndex = useRef(0);

  // Real-time data state
  const [currentData, setCurrentData] = useState({
    period: calculateSpringPeriod(mass, stiffness),
    frequency: 1 / calculateSpringPeriod(mass, stiffness),
    angularFrequency: calculateSpringAngularFrequency(mass, stiffness),
    kineticEnergy: 0,
    potentialEnergy: calculateSpringPE(stiffness, initialDisplacement),
    totalEnergy: calculateSpringPE(stiffness, initialDisplacement),
    displacement: initialDisplacement,
    velocity: 0,
  });

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions.current, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(trailColors.current, 3));
    return geo;
  }, []);

  function reset() {
    positionRef.current = initialDisplacement;
    velocityRef.current = 0;
    trailPositions.current = new Float32Array(200 * 3);
    trailColors.current = new Float32Array(200 * 3);
    trailIndex.current = 0;

    const pe = calculateSpringPE(stiffness, initialDisplacement);
    setCurrentData({
      period: calculateSpringPeriod(mass, stiffness),
      frequency: 1 / calculateSpringPeriod(mass, stiffness),
      angularFrequency: calculateSpringAngularFrequency(mass, stiffness),
      kineticEnergy: 0,
      potentialEnergy: pe,
      totalEnergy: pe,
      displacement: initialDisplacement,
      velocity: 0,
    });
  }

  // Update calculated values when controls change
  useEffect(() => {
    const period = calculateSpringPeriod(mass, stiffness);
    const frequency = 1 / period;
    const angularFreq = calculateSpringAngularFrequency(mass, stiffness);
    setCurrentData((prev) => ({
      ...prev,
      period,
      frequency,
      angularFrequency: angularFreq,
    }));
  }, [mass, stiffness]);

  // Create proper helical spring geometry
  const springGeometry = useMemo(() => {
    const restLength = 3;
    const coils = 12;
    const radius = 0.3;
    const tubeRadius = 0.05;

    if (springType === "helix") {
      // Create a proper helical spring
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: coils * 20 + 1 }, (_, i) => {
          const t = i / (coils * 20);
          const angle = t * coils * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            t * restLength
          );
        })
      );
      return new THREE.TubeGeometry(curve, coils * 20, tubeRadius, 8, false);
    } else {
      // Zigzag spring
      const points: THREE.Vector3[] = [];
      const zigzags = coils * 2;
      for (let i = 0; i <= zigzags * 10; i++) {
        const t = i / (zigzags * 10);
        const zigzag = Math.sin(t * zigzags * Math.PI * 2) * radius;
        points.push(new THREE.Vector3(zigzag, 0, t * restLength));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, zigzags * 10, tubeRadius, 4, false);
    }
  }, [springType]);

  useFrame((_, delta) => {
    if (!massRef.current || !springRef.current) return;
    const dt = Math.min(delta, 0.02);

    const x = positionRef.current;
    const v = velocityRef.current;

    // Spring-mass ODE: ma = -kx - cv
    const a = (-stiffness * x - damping * v) / mass;

    velocityRef.current = v + a * dt;
    positionRef.current = x + velocityRef.current * dt;

    const currentX = positionRef.current;
    const currentV = velocityRef.current;

    massRef.current.position.x = 3 + currentX;

    // Update spring (scale along length)
    const restLength = 3;
    const currentLength = restLength + currentX;
    springRef.current.scale.z = currentLength / restLength;
    springRef.current.position.x = (3 - restLength) / 2 + currentX / 2;

    // Calculate energies
    const ke = calculateKineticEnergy(mass, currentV);
    const pe = calculateSpringPE(stiffness, currentX);
    const totalEnergy = ke + pe;

    setCurrentData({
      period: calculateSpringPeriod(mass, stiffness),
      frequency: 1 / calculateSpringPeriod(mass, stiffness),
      angularFrequency: calculateSpringAngularFrequency(mass, stiffness),
      kineticEnergy: ke,
      potentialEnergy: pe,
      totalEnergy,
      displacement: currentX,
      velocity: currentV,
    });

    // Update trail with fading colors based on velocity
    const idx = trailIndex.current % 200;
    trailPositions.current[idx * 3] = massRef.current.position.x;
    trailPositions.current[idx * 3 + 1] = massRef.current.position.y;
    trailPositions.current[idx * 3 + 2] = massRef.current.position.z;

    // Color based on kinetic energy (orange = fast, blue = slow)
    const speed = Math.abs(currentV);
    const t = Math.min(speed / 5, 1);
    trailColors.current[idx * 3] = 0.3 + t * 0.7; // R
    trailColors.current[idx * 3 + 1] = 0.5 - t * 0.3; // G
    trailColors.current[idx * 3 + 2] = 1 - t * 0.7; // B

    trailIndex.current++;

    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colors = trailRef.current.geometry.attributes.color as THREE.BufferAttribute;
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      trailRef.current.geometry.setDrawRange(0, Math.min(trailIndex.current, 200));
    }
  });

  return (
    <>
      {/* Wall/support */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.2, 2, 1]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -1.2, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>
      <gridHelper args={[12, 24, "#1a1a3e", "#111128"]} position={[2, -1.19, 0]} />

      {/* Spring - proper helical geometry */}
      <mesh ref={springRef} geometry={springGeometry} position={[1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Mass block */}
      <mesh ref={massRef} position={[3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#4f8fff"
          metalness={0.7}
          roughness={0.2}
          emissive="#4f8fff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Equilibrium position marker */}
      <mesh position={[3, -1.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.5} />
      </mesh>

      {/* Displacement indicators */}
      <Line
        points={[
          [3, -0.5, 0],
          [3 + currentData.displacement, -0.5, 0],
        ]}
        color="#f59e0b"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.1}
      />

      {/* Trail with velocity-based coloring */}
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial size={0.05} vertexColors transparent opacity={0.7} sizeAttenuation />
      </points>

      {/* Force vectors */}
      <group position={[3 + currentData.displacement, 0.6, 0]}>
        {/* Spring force (always toward equilibrium) */}
        <Line
          points={[
            [0, 0, 0],
            [-currentData.displacement * stiffness * 0.02, 0, 0],
          ]}
          color="#ec4899"
          lineWidth={2}
        />
        {/* Arrow head */}
        <mesh
          position={[
            -currentData.displacement * stiffness * 0.02 - (currentData.displacement > 0 ? 0.15 : -0.15),
            0,
            0,
          ]}
          rotation={[0, 0, currentData.displacement > 0 ? -Math.PI / 2 : Math.PI / 2]}
        >
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Damping indicator */}
      {damping > 0 && (
        <group position={[3 + currentData.displacement, -0.6, 0]}>
          <mesh>
            <planeGeometry args={[0.4, 0.2]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={Math.min(Math.abs(currentData.velocity) * 0.2, 1)}
            />
          </mesh>
        </group>
      )}

      {/* Scale markings */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i} position={[i * 1 - 1, -1.1, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.15, 0.02]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        </group>
      ))}

      {/* Data Display Panel */}
      {showData && (
        <DataDisplay
          title="Spring-Mass Data"
          position={[4, 3, 0]}
          data={{
            period: { value: currentData.period, unit: "s", color: "#a855f7" },
            frequency: { value: currentData.frequency, unit: "Hz", color: "#ec4899" },
            angularFreq: { value: currentData.angularFrequency, unit: "rad/s", color: "#f59e0b" },
            displacement: { value: currentData.displacement, unit: "m", color: "#06d6a0" },
            velocity: { value: currentData.velocity, unit: "m/s", color: "#4f8fff" },
          }}
        />
      )}

      {/* Energy Bar */}
      {showEnergy && (
        <EnergyBar
          position={[-4, 2, 0]}
          kinetic={currentData.kineticEnergy}
          potential={currentData.potentialEnergy}
          total={currentData.totalEnergy}
        />
      )}
    </>
  );
}
