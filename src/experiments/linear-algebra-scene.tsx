"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface LinearAlgebraData {
  vectorMagnitude: number;
  dotProduct: number;
  angle: number;
  determinant?: number;
  eigenvalues?: [number, number];
}

export interface LinearAlgebraSceneProps {
  showBasis: boolean;
  showTransform: boolean;
  rotation: number;
  scale: number;
  isPlaying: boolean;
  onDataChange?: (data: LinearAlgebraData) => void;
}

// Apply matrix transformation to a point
function transformPoint(point: [number, number, number], matrix: THREE.Matrix4): [number, number, number] {
  const v = new THREE.Vector3(...point);
  v.applyMatrix4(matrix);
  return [v.x, v.y, v.z];
}

/**
 * Linear Algebra scene component
 * Visualizes vectors, matrices, and transformations in 3D
 */
export function LinearAlgebraSceneComponent({
  showBasis,
  showTransform,
  rotation,
  scale,
  isPlaying,
  onDataChange
}: LinearAlgebraSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<THREE.Group>(null);
  const dataRef = useRef({
    frameCount: 0,
    time: 0,
    rotationMatrix: new THREE.Matrix4(),
    scaleMatrix: new THREE.Matrix4(),
    shearMatrix: new THREE.Matrix4()
  });
  const [, forceUpdate] = useState({});

  // Basis vectors
  const basisVectors = useMemo(() => [
    { dir: [1, 0, 0] as [number, number, number], color: "#ef4444", label: "X" },
    { dir: [0, 1, 0] as [number, number, number], color: "#22c55e", label: "Y" },
    { dir: [0, 0, 1] as [number, number, number], color: "#3b82f6", label: "Z" },
  ], []);

  // Sample vectors for visualization
  const sampleVectors = useMemo(() => [
    new THREE.Vector3(1, 1.5, 0.5).normalize(),
    new THREE.Vector3(-1, 1, 0.8).normalize(),
    new THREE.Vector3(0.5, -1.2, 1).normalize(),
  ], []);

  // Grid points for transformation visualization
  const gridPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const step = 0.5;
    for (let x = -4; x <= 4; x += step) {
      for (let z = -4; z <= 4; z += step) {
        points.push([x, 0, z]);
      }
    }
    return points;
  }, []);

  const updateReactState = useCallback(() => {
    const data = dataRef.current;
    const combinedMatrix = new THREE.Matrix4()
      .multiply(data.rotationMatrix)
      .multiply(data.scaleMatrix);

    const det = combinedMatrix.determinant();

    // Calculate eigenvalues for 2x2 submatrix
    const tr = combinedMatrix.elements[0] + combinedMatrix.elements[5];
    const det2x2 = combinedMatrix.elements[0] * combinedMatrix.elements[5] -
                  combinedMatrix.elements[4] * combinedMatrix.elements[1];
    const discriminant = tr * tr - 4 * det2x2;
    let eigenvalues: [number, number] | undefined;
    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      eigenvalues = [(tr + sqrtD) / 2, (tr - sqrtD) / 2];
    }

    const sampleVector = sampleVectors[0].clone().multiplyScalar(scale);
    const xAxis = new THREE.Vector3(1, 0, 0);
    const dotProduct = sampleVector.clone().normalize().dot(xAxis);
    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);

    onDataChange?.({
      vectorMagnitude: sampleVector.length(),
      dotProduct,
      angle,
      determinant: det,
      eigenvalues,
    });

    forceUpdate({});
  }, [sampleVectors, scale, onDataChange]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    // Update rotation matrix
    const angle = data.time * rotation * 0.3;
    data.rotationMatrix.makeRotationY(angle);

    // Update scale matrix
    const scaleVal = 0.8 + Math.sin(data.time * 0.5) * 0.3;
    data.scaleMatrix.makeScale(scaleVal, scaleVal, scaleVal);

    // Update shear matrix (animated shearing)
    const shearX = Math.sin(data.time * 0.4) * 0.3;
    data.shearMatrix.set(
      1, shearX, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(data.time * 0.2) * 0.15;
      groupRef.current.rotation.x = Math.sin(data.time * 0.15) * 0.1;
    }

    if (transformRef.current) {
      const combinedMatrix = new THREE.Matrix4()
        .multiply(data.rotationMatrix)
        .multiply(data.shearMatrix);
      transformRef.current.matrix.copy(combinedMatrix);
      transformRef.current.matrixAutoUpdate = false;
    }

    // Update React state every 8 frames
    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

  const data = dataRef.current;
  const currentMatrix = new THREE.Matrix4()
    .multiply(data.rotationMatrix)
    .multiply(data.shearMatrix);

  // Transformed basis vectors
  const transformedBasis = basisVectors.map(basis => {
    const transformed = transformPoint(
      [basis.dir[0] * 3, basis.dir[1] * 3, basis.dir[2] * 3],
      currentMatrix
    );
    return { ...basis, transformed };
  });

  // Transformed grid points
  const transformedGrid = gridPoints.map(pt => transformPoint(pt, currentMatrix));

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#6366f1" />

      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* Original basis vectors (faded) */}
        {showBasis && basisVectors.map((basis) => (
          <group key={`orig-${basis.label}`}>
            <Line
              points={[[0, 0, 0], [basis.dir[0] * 2.5, basis.dir[1] * 2.5, basis.dir[2] * 2.5]]}
              color={basis.color}
              lineWidth={2}
              opacity={0.3}
              transparent
            />
          </group>
        ))}

        {/* Transformed basis vectors */}
        {showTransform && transformedBasis.map((basis) => (
          <group key={`trans-${basis.label}`}>
            <Line
              points={[[0, 0, 0], basis.transformed]}
              color={basis.color}
              lineWidth={4}
            />
            <mesh position={basis.transformed.map(v => v * 1.1) as [number, number, number]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshStandardMaterial
                color={basis.color}
                emissive={basis.color}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        ))}

        {/* Transformed grid visualization */}
        {showTransform && (
          <group>
            {/* Horizontal lines */}
            {Array.from({ length: 17 }, (_, i) => {
              const rowPoints = transformedGrid.slice(i * 17, (i + 1) * 17);
              if (rowPoints.length < 2) return null;
              return (
                <Line
                  key={`h-${i}`}
                  points={rowPoints}
                  color="#4f46e5"
                  lineWidth={1}
                  opacity={0.4}
                  transparent
                />
              );
            })}
            {/* Vertical lines */}
            {Array.from({ length: 17 }, (_, i) => {
              const colPoints = transformedGrid.filter((_, idx) => idx % 17 === i);
              if (colPoints.length < 2) return null;
              return (
                <Line
                  key={`v-${i}`}
                  points={colPoints}
                  color="#4f46e5"
                  lineWidth={1}
                  opacity={0.4}
                  transparent
                />
              );
            })}
          </group>
        )}

        {/* Sample vectors with their transformations */}
        {sampleVectors.map((vec, i) => {
          const hue = (i / sampleVectors.length) * 0.15 + 0.1;
          const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
          const endPoint = [vec.x * 2, vec.y * 2, vec.z * 2] as [number, number, number];
          const transformedEnd = transformPoint(endPoint, currentMatrix);

          return (
            <group key={i}>
              {/* Original vector */}
              <Line points={[[0, 0, 0], endPoint]} color={color.getStyle()} lineWidth={2} opacity={0.5} transparent />
              {/* Transformed vector */}
              {showTransform && (
                <>
                  <Line points={[[0, 0, 0], transformedEnd]} color={color.getStyle()} lineWidth={3} />
                  <mesh position={transformedEnd.map(v => v * 1.15) as [number, number, number]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial
                      color={color}
                      emissive={color}
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                </>
              )}
            </group>
          );
        })}

        {/* Origin point */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Reference grid */}
      <gridHelper args={[15, 15, "#1a1a3e", "#1a1a3e"]} position={[0, -0.1, 0]} />

      {/* Coordinate axes */}
      <Line points={[[-8, 0, 0], [8, 0, 0]]} color="#333" lineWidth={1} />
      <Line points={[[0, -8, 0], [0, 8, 0]]} color="#333" lineWidth={1} />
      <Line points={[[0, 0, -8], [0, 0, 8]]} color="#333" lineWidth={1} />
    </>
  );
}

export default LinearAlgebraSceneComponent;
