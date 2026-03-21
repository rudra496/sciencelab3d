"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

function createParametricGeometry(
  func: (u: number, v: number, target: THREE.Vector3) => void,
  slices: number,
  stacks: number
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i <= slices; i++) {
    for (let j = 0; j <= stacks; j++) {
      const u = i / slices;
      const v = j / stacks;
      const target = new THREE.Vector3();
      func(u, v, target);
      vertices.push(target.x, target.y, target.z);
      uvs.push(u, v);
    }
  }

  // Compute normals via cross product of tangent vectors
  for (let i = 0; i <= slices; i++) {
    for (let j = 0; j <= stacks; j++) {
      const u = i / slices;
      const v = j / stacks;
      const eps = 0.001;
      const p = new THREE.Vector3();
      const pu = new THREE.Vector3();
      const pv = new THREE.Vector3();
      func(u, v, p);
      func(Math.min(u + eps, 1), v, pu);
      func(u, Math.min(v + eps, 1), pv);
      const normal = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(pu, p),
        new THREE.Vector3().subVectors(pv, p)
      ).normalize();
      normals.push(normal.x, normal.y, normal.z);
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < stacks; j++) {
      const a = i * (stacks + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (stacks + 1) + j;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

export default function TopologySurfacesScene() {
  const surfaceRef = useRef<THREE.Mesh>(null);

  const { surfaceType, showWireframe, transparency, rotationSpeed, segments } = useControls("Topology", {
    surfaceType: {
      value: "mobius",
      options: ["mobius", "klein", "torus", "sphere", "projective"],
      label: "Surface"
    },
    showWireframe: { value: true, label: "Show Wireframe" },
    transparency: { value: 0.7, min: 0, max: 1, step: 0.05, label: "Transparency" },
    rotationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Rotation Speed" },
    segments: { value: 64, min: 32, max: 128, step: 16, label: "Geometry Detail" },
  });

  useFrame((_, delta) => {
    if (!surfaceRef.current) return;
    surfaceRef.current.rotation.x += delta * rotationSpeed * 0.3;
    surfaceRef.current.rotation.y += delta * rotationSpeed * 0.5;
  });

  const surfaceGeometry = useMemo(() => {
    switch (surfaceType) {
      case "mobius":
        return createParametricGeometry((u, v, target) => {
          const mu = u * Math.PI * 2;
          const mv = v * 2 - 1;
          const x = (1 + mv / 2 * Math.cos(mu / 2)) * Math.cos(mu);
          const y = (1 + mv / 2 * Math.cos(mu / 2)) * Math.sin(mu);
          const z = mv / 2 * Math.sin(mu / 2);
          target.set(x * 1.5, y * 1.5, z * 1.5);
        }, segments, segments);

      case "klein":
        return createParametricGeometry((u, v, target) => {
          const mu = u * Math.PI * 2;
          const mv = v * Math.PI * 2;
          const x = (2 + Math.cos(mv / 2) * Math.sin(mu) - Math.sin(mv / 2) * Math.sin(2 * mu)) * Math.cos(mv);
          const y = (2 + Math.cos(mv / 2) * Math.sin(mu) - Math.sin(mv / 2) * Math.sin(2 * mu)) * Math.sin(mv);
          const z = Math.sin(mv / 2) * Math.sin(mu) + Math.cos(mv / 2) * Math.sin(2 * mu);
          target.set(x * 0.5, y * 0.5, z * 0.5);
        }, segments, segments);

      case "torus":
        return new THREE.TorusGeometry(1.2, 0.5, Math.floor(segments / 4), segments);

      case "sphere":
        return new THREE.SphereGeometry(1.5, Math.floor(segments / 2), Math.floor(segments / 2));

      case "projective":
        return createParametricGeometry((u, v, target) => {
          const mu = u * Math.PI;
          const mv = v * Math.PI;
          const a = Math.cos(mu) * Math.sin(mv);
          const b = Math.sin(mu) * Math.sin(mv);
          const c = Math.cos(mv);
          const x = a * (a * a * 2 - b * b - c * c);
          const y = b * (a * a * 2 - b * b - c * c);
          const z = c * (a * a - b * b);
          target.set(x, y, z);
        }, segments, segments);

      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [surfaceType, segments]);

  const topologyInfo = useMemo(() => {
    switch (surfaceType) {
      case "mobius": return { genus: 1, orientable: false, euler: 0, sides: 1 };
      case "klein": return { genus: 2, orientable: false, euler: 0, sides: 1 };
      case "torus": return { genus: 1, orientable: true, euler: 0, sides: 2 };
      case "sphere": return { genus: 0, orientable: true, euler: 2, sides: 2 };
      case "projective": return { genus: 1, orientable: false, euler: 1, sides: 1 };
      default: return { genus: 0, orientable: true, euler: 2, sides: 2 };
    }
  }, [surfaceType]);

  return (
    <>
      <mesh ref={surfaceRef} geometry={surfaceGeometry}>
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={transparency}
          side={THREE.DoubleSide}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {showWireframe && (
        <mesh geometry={surfaceGeometry}>
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
        </mesh>
      )}

      <group>
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 2, Math.sin(angle) * 2, 0]}>
              <coneGeometry args={[0.1, 0.2, 8]} />
              <meshStandardMaterial
                color={topologyInfo.orientable ? "#06d6a0" : "#ff6b35"}
                emissive={topologyInfo.orientable ? "#06d6a0" : "#ff6b35"}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}
