"use client";

export { ElectromagneticSceneComponent as default, ElectromagneticSceneComponent } from "./electromagnetic-scene";
export type { EMFieldData } from "./electromagnetic-scene";

// Legacy export - kept for backwards compatibility
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { DataDisplay } from "@/components/experiment-helpers";

interface Charge {
  position: THREE.Vector3;
  charge: number;
  velocity: THREE.Vector3;
}

export function ElectromagneticFieldScene() {
  const fieldLinesRef = useRef<THREE.Group>(null);
  const testChargeRef = useRef<THREE.Mesh>(null);
  const fieldVectorsRef = useRef<THREE.InstancedMesh>(null);

  const { q1, q2, testCharge, showFieldLines, showPotential, show3DVectors, showData, testChargeY } =
    useControls("Charges", {
      q1: { value: 1, min: -5, max: 5, step: 0.5, label: "Charge 1 (µC)" },
      q2: { value: -1, min: -5, max: 5, step: 0.5, label: "Charge 2 (µC)" },
      testCharge: { value: 1, min: -2, max: 2, step: 0.1, label: "Test Charge (µC)" },
      showFieldLines: { value: true, label: "Show Field Lines" },
      showPotential: { value: false, label: "Show Potential Surface" },
      show3DVectors: { value: true, label: "Show 3D Field Vectors" },
      showData: { value: true, label: "Show Data Panel" },
      testChargeY: { value: 0, min: -3, max: 3, step: 0.1, label: "Test Charge Y" },
    });

  const charges: Charge[] = [
    { position: new THREE.Vector3(-2, 0, 0), charge: q1, velocity: new THREE.Vector3() },
    { position: new THREE.Vector3(2, 0, 0), charge: q2, velocity: new THREE.Vector3() },
  ];

  // Test charge state
  const [testChargePos, setTestChargePos] = useState(new THREE.Vector3(0, testChargeY, 2));
  const [fieldAtTestCharge, setFieldAtTestCharge] = useState({ x: 0, y: 0, z: 0, magnitude: 0 });
  const [forceOnTestCharge, setForceOnTestCharge] = useState({ x: 0, y: 0, z: 0, magnitude: 0 });

  useEffect(() => {
    setTestChargePos(new THREE.Vector3(0, testChargeY, 2));
  }, [testChargeY]);

  // Calculate electric field at a point
  const calculateField = (position: THREE.Vector3) => {
    let Ex = 0,
      Ey = 0,
      Ez = 0;
    for (const charge of charges) {
      const dx = position.x - charge.position.x;
      const dy = position.y - charge.position.y;
      const dz = position.z - charge.position.z;
      const r2 = dx * dx + dy * dy + dz * dz;
      const r = Math.sqrt(r2);
      if (r < 0.2) continue;

      const E = charge.charge / r2;
      Ex += E * (dx / r);
      Ey += E * (dy / r);
      Ez += E * (dz / r);
    }
    return { x: Ex, y: Ey, z: Ez };
  };

  // Update field at test charge position
  useFrame(() => {
    if (!testChargeRef.current) return;

    const field = calculateField(testChargePos);
    const magnitude = Math.sqrt(field.x * field.x + field.y * field.y + field.z * field.z);

    setFieldAtTestCharge({
      x: field.x,
      y: field.y,
      z: field.z,
      magnitude,
    });

    // Force = qE
    const force = {
      x: field.x * testCharge,
      y: field.y * testCharge,
      z: field.z * testCharge,
      magnitude: magnitude * Math.abs(testCharge),
    };
    setForceOnTestCharge(force);

    // Position test charge
    testChargeRef.current.position.copy(testChargePos);
  });

  const fieldLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const numLines = 24;
    const steps = 50;
    const stepSize = 0.15;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const line: [number, number, number][] = [];

      let startPos: THREE.Vector3;
      const startCharge = charges.find((c) => c.charge > 0) || charges[0];

      if (startCharge.charge > 0) {
        const radius = 0.3;
        startPos = new THREE.Vector3(
          startCharge.position.x + Math.cos(angle) * radius,
          startCharge.position.y + Math.sin(angle) * radius,
          0
        );
      } else {
        const radius = 0.5;
        startPos = new THREE.Vector3(
          startCharge.position.x + Math.cos(angle) * radius,
          startCharge.position.y + Math.sin(angle) * radius,
          0
        );
      }

      let pos = startPos.clone();

      for (let j = 0; j < steps; j++) {
        line.push([pos.x, pos.y, pos.z]);

        let Ex = 0,
          Ey = 0,
          Ez = 0;
        for (const charge of charges) {
          const dx = pos.x - charge.position.x;
          const dy = pos.y - charge.position.y;
          const dz = pos.z - charge.position.z;
          const r2 = dx * dx + dy * dy + dz * dz;
          const r = Math.sqrt(r2);
          if (r < 0.2) continue;

          const E = charge.charge / r2;
          Ex += E * (dx / r);
          Ey += E * (dy / r);
          Ez += E * (dz / r);
        }

        const Emag = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez);
        if (Emag < 0.001) break;

        pos.x += (Ex / Emag) * stepSize;
        pos.y += (Ey / Emag) * stepSize;
        pos.z += (Ez / Emag) * stepSize;

        let hitCharge = false;
        for (const charge of charges) {
          if (pos.distanceTo(charge.position) < 0.3) {
            hitCharge = true;
            break;
          }
        }
        if (hitCharge || Math.abs(pos.x) > 8 || Math.abs(pos.y) > 6 || Math.abs(pos.z) > 4) break;
      }

      if (line.length > 2) lines.push(line);
    }
    return lines;
  }, [q1, q2]);

  // 3D field vectors grid
  const fieldVectorsData = useMemo(() => {
    const vectors: { position: THREE.Vector3; direction: THREE.Vector3; magnitude: number }[] = [];
    const gridSize = 5;
    const spacing = 1.5;

    for (let x = -gridSize; x <= gridSize; x += 2) {
      for (let y = -3; y <= 3; y += 2) {
        for (let z = -2; z <= 2; z += 2) {
          const pos = new THREE.Vector3(x * spacing, y, z * spacing);
          const field = calculateField(pos);
          const mag = Math.sqrt(field.x * field.x + field.y * field.y + field.z * field.z);

          if (mag > 0.01) {
            const dir = new THREE.Vector3(field.x / mag, field.y / mag, field.z / mag);
            vectors.push({ position: pos, direction: dir, magnitude: Math.min(mag, 2) });
          }
        }
      }
    }
    return vectors;
  }, [q1, q2]);

  const potentialSurface = useMemo(() => {
    const segments = 60;
    const size = 12;
    const points: [number, number, number][] = [];

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = ((i / segments) - 0.5) * size;
        const y = ((j / segments) - 0.5) * size;

        let V = 0;
        for (const charge of charges) {
          const r = Math.sqrt((x - charge.position.x) ** 2 + (y - charge.position.y) ** 2);
          if (r > 0.3) V += charge.charge / r;
        }

        const z = Math.max(-2, Math.min(2, V * 0.5));
        points.push([x, y, z]);
      }
    }

    return points;
  }, [q1, q2]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      {/* Grid */}
      <gridHelper args={[16, 32, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />

      {/* Charges */}
      {charges.map((charge, i) => (
        <group key={i} position={[charge.position.x, charge.position.y, charge.position.z]}>
          <mesh>
            <sphereGeometry args={[0.3 * Math.sqrt(Math.abs(charge.charge) + 0.5), 32, 32]} />
            <meshStandardMaterial
              color={charge.charge > 0 ? "#ff6b35" : charge.charge < 0 ? "#4f8fff" : "#666"}
              emissive={charge.charge > 0 ? "#ff6b35" : charge.charge < 0 ? "#4f8fff" : "#666"}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Charge label */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={charge.charge > 0 ? "#ff6b35" : "#4f8fff"} />
          </mesh>
        </group>
      ))}

      {/* Field lines */}
      {showFieldLines &&
        fieldLines.map((line, i) => (
          <Line
            key={i}
            points={line}
            color="#ffffff"
            lineWidth={1}
            opacity={0.4}
            transparent
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
        ))}

      {/* 3D Field Vectors */}
      {show3DVectors && (
        <instancedMesh
          ref={fieldVectorsRef}
          args={[undefined, undefined, fieldVectorsData.length]}
          onUpdate={(mesh) => {
            fieldVectorsData.forEach((data, i) => {
              dummy.position.copy(data.position);
              dummy.lookAt(data.position.clone().add(data.direction));
              dummy.scale.set(data.magnitude * 0.3, 0.05, 0.05);
              dummy.updateMatrix();
              mesh.setMatrixAt(i, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.3} />
        </instancedMesh>
      )}

      {/* Potential surface */}
      {showPotential && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
          <planeGeometry args={[12, 12, 60, 60]} />
          <meshStandardMaterial color="#8b5cf6" wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Test Charge */}
      <mesh ref={testChargeRef} position={[testChargePos.x, testChargePos.y, testChargePos.z]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={testCharge > 0 ? "#22c55e" : testCharge < 0 ? "#ef4444" : "#fff"}
          emissive={testCharge > 0 ? "#22c55e" : testCharge < 0 ? "#ef4444" : "#fff"}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Force vector on test charge */}
      {testCharge !== 0 && forceOnTestCharge.magnitude > 0.01 && (
        <group position={[testChargePos.x, testChargePos.y, testChargePos.z]}>
          <Line
            points={[
              [0, 0, 0],
              [
                (forceOnTestCharge.x / forceOnTestCharge.magnitude) *
                  Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
                (forceOnTestCharge.y / forceOnTestCharge.magnitude) *
                  Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
                (forceOnTestCharge.z / forceOnTestCharge.magnitude) *
                  Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
              ],
            ]}
            color="#ec4899"
            lineWidth={3}
          />
          {/* Arrow head */}
          <mesh
            position={[
              (forceOnTestCharge.x / forceOnTestCharge.magnitude) *
                Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
              (forceOnTestCharge.y / forceOnTestCharge.magnitude) *
                Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
              (forceOnTestCharge.z / forceOnTestCharge.magnitude) *
                Math.min(forceOnTestCharge.magnitude * 0.5, 1.5),
            ]}
          >
            <coneGeometry args={[0.1, 0.2, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* Axis labels */}
      <mesh position={[9, -3, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, -3, 8]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Data Display Panel */}
      {showData && (
        <DataDisplay
          title="Electric Field Data"
          position={[5, 4, 0]}
          data={{
            fieldStrength: { value: fieldAtTestCharge.magnitude, unit: "N/C", color: "#a855f7", decimals: 3 },
            force: { value: forceOnTestCharge.magnitude, unit: "µN", color: "#ec4899", decimals: 3 },
            testCharge: { value: testCharge, unit: "µC", color: "#22c55e" },
            Ex: { value: fieldAtTestCharge.x, unit: "N/C", color: "#f59e0b", decimals: 3 },
            Ey: { value: fieldAtTestCharge.y, unit: "N/C", color: "#06d6a0", decimals: 3 },
            Ez: { value: fieldAtTestCharge.z, unit: "N/C", color: "#4f8fff", decimals: 3 },
          }}
        />
      )}

      {/* Field strength meter */}
      <group position={[-6, 4, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.8]} />
          <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} />
        </mesh>
        {/* Meter bar */}
        <mesh position={[0.3, 0, 0.01]}>
          <boxGeometry args={[1, 0.1, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Meter fill */}
        <mesh
          position={[
            -0.2 + Math.min(fieldAtTestCharge.magnitude * 0.3, 0.6),
            0,
            0.02,
          ]}
        >
          <boxGeometry
            args={[
              Math.min(fieldAtTestCharge.magnitude * 0.6, 1.2),
              0.08,
              0.02,
            ]}
          />
          <meshStandardMaterial
            color={
              fieldAtTestCharge.magnitude > 2
                ? "#ef4444"
                : fieldAtTestCharge.magnitude > 1
                  ? "#f59e0b"
                  : "#22c55e"
            }
            emissive={
              fieldAtTestCharge.magnitude > 2
                ? "#ef4444"
                : fieldAtTestCharge.magnitude > 1
                  ? "#f59e0b"
                  : "#22c55e"
            }
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Scale markings */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-0.5 + i * 0.24, -0.15, 0.02]}>
            <boxGeometry args={[0.02, 0.08, 0.01]} />
            <meshBasicMaterial color="#666" />
          </mesh>
        ))}
      </group>
    </>
  );
}
