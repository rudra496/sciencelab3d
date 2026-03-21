"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { calculateFringeSpacing, calculateDoubleSlitIntensity } from "@/utils/physics";

interface DoubleSlitSceneProps {
  onDataChange?: (data: DoubleSlitData) => void;
  wavelength?: number;
  slitSeparation?: number;
  slitWidth?: number;
  intensity?: number;
  showGraph?: boolean;
}

export interface DoubleSlitData {
  fringeSpacing: number;
  maxIntensity: number;
  currentWavelength: number;
}

/**
 * World-class Double Slit Experiment
 */
export function DoubleSlitSceneComponent({
  onDataChange,
  wavelength = 500,
  slitSeparation = 2,
  slitWidth = 0.3,
  intensity = 1,
  showGraph = true,
}: DoubleSlitSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const segments = 200;
  const width = 30;
  const screenDistance = 15;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, 12, segments, 100);
    const colors = new Float32Array((segments + 1) * 101 * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Calculate data
  useEffect(() => {
    const lambda = wavelength / 100;
    const fringeSpacing = calculateFringeSpacing(lambda, screenDistance, slitSeparation);
    const maxIntensity = intensity;

    const data: DoubleSlitData = {
      fringeSpacing,
      maxIntensity,
      currentWavelength: wavelength,
    };
    onDataChange?.(data);
  }, [wavelength, slitSeparation, slitWidth, intensity, showGraph, onDataChange]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta * 2;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = meshRef.current.geometry.attributes.color as THREE.BufferAttribute;

    const lambda = wavelength / 100;
    const d = slitSeparation;
    const a = slitWidth;
    const k = (2 * Math.PI) / lambda;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= 100; j++) {
        const idx = i * 101 + j;
        const x = (posAttr.array[idx * 3] / width + 0.5) * width;
        const y = (posAttr.array[idx * 3 + 1] / 12 + 0.5) * 12;

        if (x < 0) {
          // Source side - wave fronts
          const distFromSource = Math.sqrt(x * x + y * y);
          const wave = Math.sin(k * distFromSource - timeRef.current * 3);
          const brightness = ((wave + 1) / 2) * intensity;

          const color = wavelengthToRGB(wavelength);
          colorAttr.array[idx * 3] = color.r * brightness;
          colorAttr.array[idx * 3 + 1] = color.g * brightness;
          colorAttr.array[idx * 3 + 2] = color.b * brightness;
        } else {
          // Screen side - interference pattern
          const theta = Math.atan(y / screenDistance);
          const beta = (k * d * Math.sin(theta)) / 2;
          const alpha = (k * a * Math.sin(theta)) / 2;

          let interference = 0;
          if (Math.abs(alpha) > 0.001) {
            const sinc = Math.sin(alpha) / alpha;
            interference = Math.cos(beta) ** 2 * sinc ** 2;
          } else {
            interference = Math.cos(beta) ** 2;
          }

          const color = wavelengthToRGB(wavelength);
          const brightness = interference * intensity;
          colorAttr.array[idx * 3] = color.r * brightness;
          colorAttr.array[idx * 3 + 1] = color.g * brightness;
          colorAttr.array[idx * 3 + 2] = color.b * brightness;
        }
      }
    }

    colorAttr.needsUpdate = true;
  });

  const lambda = wavelength / 100;
  const fringeSpacing = calculateFringeSpacing(lambda, screenDistance, slitSeparation);

  // Intensity graph points
  const intensityGraphPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const k = (2 * Math.PI) / lambda;
    const d = slitSeparation;
    const a = slitWidth;
    for (let y = -6; y <= 6; y += 0.1) {
      const theta = Math.atan(y / screenDistance);
      const beta = (k * d * Math.sin(theta)) / 2;
      const alpha = (k * a * Math.sin(theta)) / 2;

      let intensityVal = 0;
      if (Math.abs(alpha) > 0.001) {
        const sinc = Math.sin(alpha) / alpha;
        intensityVal = Math.cos(beta) ** 2 * sinc ** 2;
      } else {
        intensityVal = Math.cos(beta) ** 2;
      }

      points.push([screenDistance + 2 + intensityVal * 3, y, 0]);
    }
    return points;
  }, [wavelength, slitSeparation, slitWidth, screenDistance]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.5, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.95} />
      </mesh>
      <gridHelper args={[60, 60, "#1a1a3e", "#0a0a1e"]} position={[width / 2, -0.49, 0]} />

      {/* Light source */}
      <group position={[-12, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={wavelengthToColor(wavelength)}
            emissive={wavelengthToColor(wavelength)}
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Double slit barrier */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 12, 3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Slit openings */}
      <mesh position={[0, slitSeparation / 2, 0]}>
        <boxGeometry args={[0.2, slitWidth, 3]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0, -slitSeparation / 2, 0]}>
        <boxGeometry args={[0.2, slitWidth, 3]} />
        <meshBasicMaterial color="#000" />
      </mesh>

      {/* Interference pattern */}
      <mesh ref={meshRef} geometry={geometry} position={[width / 2 - 3, 0, -0.5]} rotation={[0, 0, 0]}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Detection screen with intensity graph */}
      <group position={[screenDistance, 0, 0]}>
        {/* Screen */}
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 12, 0.5]} />
          <meshStandardMaterial color="#1a1a3e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Intensity markers - maxima */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yPos = i * fringeSpacing;
          if (Math.abs(yPos) > 6) return null;
          return (
            <group key={i} position={[0.15, yPos, 0.2]}>
              <mesh>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={wavelengthToColor(wavelength)} />
              </mesh>
            </group>
          );
        })}

        {/* Minima markers */}
        {Array.from({ length: 4 }).map((_, i) => {
          const yPos = (i + 0.5) * fringeSpacing;
          if (Math.abs(yPos) > 6) return null;
          return (
            <group key={`min-${i}`} position={[0.15, yPos, 0.2]}>
              <Line
                points={[[-0.08, -0.08, 0], [0.08, 0.08, 0]]}
                color="#666"
                lineWidth={2}
              />
            </group>
          );
        })}
      </group>

      {/* Intensity graph */}
      {showGraph && (
        <group position={[screenDistance + 2, 0, 0]}>
          {/* Graph background */}
          <mesh>
            <planeGeometry args={[4, 12]} />
            <meshBasicMaterial color="#0a0a1a" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Intensity curve */}
          <Line points={intensityGraphPoints} color="#ffffff" lineWidth={2} opacity={0.8} />
          {/* Base line */}
          <Line points={[[screenDistance + 2, -6, 0.05], [screenDistance + 2, 6, 0.05]]} color="#666" lineWidth={1} />
        </group>
      )}

      {/* Labels */}
      <mesh position={[-12, 1.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={wavelengthToColor(wavelength)} />
      </mesh>
    </group>
  );
}

function wavelengthToRGB(wavelength: number): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) { r = (440 - wavelength) / (440 - 380); b = 1; }
  else if (wavelength >= 440 && wavelength < 490) { g = (wavelength - 440) / (490 - 440); b = 1; }
  else if (wavelength >= 490 && wavelength < 510) { g = 1; b = (510 - wavelength) / (510 - 490); }
  else if (wavelength >= 510 && wavelength < 580) { r = (wavelength - 510) / (580 - 510); g = 1; }
  else if (wavelength >= 580 && wavelength < 645) { r = 1; g = (645 - wavelength) / (645 - 580); }
  else if (wavelength >= 645 && wavelength <= 700) { r = 1; }
  return { r, g, b };
}

function wavelengthToColor(wavelength: number): string {
  const { r, g, b } = wavelengthToRGB(wavelength);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export default DoubleSlitSceneComponent;
