"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

export default function ComplexNumbersScene() {
  const planeRef = useRef<THREE.Group>(null);
  const vectorRef = useRef<THREE.Group>(null);

  const { realPart, imagPart, operation, showPolar, animationSpeed } = useControls("Complex Numbers", {
    realPart: { value: 2, min: -4, max: 4, step: 0.1, label: "Real (Re)" },
    imagPart: { value: 1.5, min: -4, max: 4, step: 0.1, label: "Imaginary (Im)" },
    operation: {
      value: "none",
      options: ["none", "add", "multiply", "conjugate", "power"],
      label: "Operation"
    },
    showPolar: { value: true, label: "Show Polar Form" },
    animationSpeed: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Animation Speed" },
  });

  useFrame((_, delta) => {
    if (!planeRef.current || !vectorRef.current) return;
    planeRef.current.rotation.y += delta * animationSpeed * 0.1;
  });

  // Complex number operations
  const complexOps = useMemo(() => {
    const z1 = { re: realPart, im: imagPart };
    const z2 = { re: 1.5, im: 2 }; // Second complex number for operations

    let result = z1;
    let operationResult = z1;

    switch (operation) {
      case "add":
        operationResult = {
          re: z1.re + z2.re,
          im: z1.im + z2.im
        };
        break;
      case "multiply":
        operationResult = {
          re: z1.re * z2.re - z1.im * z2.im,
          im: z1.re * z2.im + z1.im * z2.re
        };
        break;
      case "conjugate":
        operationResult = { re: z1.re, im: -z1.im };
        break;
      case "power":
        const r = Math.sqrt(z1.re * z1.re + z1.im * z1.im);
        const theta = Math.atan2(z1.im, z1.re);
        const newR = Math.pow(r, 2);
        const newTheta = 2 * theta;
        operationResult = {
          re: newR * Math.cos(newTheta),
          im: newR * Math.sin(newTheta)
        };
        break;
    }

    // Polar form
    const modulus = Math.sqrt(operationResult.re * operationResult.re + operationResult.im * operationResult.im);
    const argument = Math.atan2(operationResult.im, operationResult.re);

    return { result: operationResult, modulus, argument };
  }, [realPart, imagPart, operation]);

  const { result, modulus, argument } = complexOps;

  return (
    <>
      <group ref={planeRef}>
        {/* Argand plane (complex plane) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#1a1a3e"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Real axis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.03, 0.03]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Imaginary axis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 10, 0.03]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = (i - 5) * 1;
          return (
            <mesh key={`x-${i}`} position={[x, 0, 0]}>
              <boxGeometry args={[0.01, 8, 0.01]} />
              <meshStandardMaterial color="#1a1a3e" transparent opacity={0.3} />
            </mesh>
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = (i - 5) * 1;
          return (
            <mesh key={`y-${i}`} position={[0, y, 0]}>
              <boxGeometry args={[8, 0.01, 0.01]} />
              <meshStandardMaterial color="#1a1a3e" transparent opacity={0.3} />
            </mesh>
          );
        })}

        {/* Complex number as vector */}
        <group ref={vectorRef}>
          {/* Vector line */}
          <mesh position={[result.re / 2, result.im / 2, 0]} rotation={[0, 0, Math.atan2(result.im, result.re)]}>
            <boxGeometry args={[0.04, Math.sqrt(result.re * result.re + result.im * result.im), 0.04]} />
            <meshStandardMaterial color="#ff6b35" />
          </mesh>

          {/* Point representing complex number */}
          <mesh position={[result.re, result.im, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#ff6b35"
              emissive="#ff6b35"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Projection on real axis */}
          <mesh position={[result.re / 2, 0, 0]}>
            <boxGeometry args={[Math.abs(result.re), 0.04, 0.04]} />
            <meshStandardMaterial color="#4f8fff" />
          </mesh>

          {/* Projection on imaginary axis */}
          <mesh position={[0, result.im / 2, 0]}>
            <boxGeometry args={[0.04, Math.abs(result.im), 0.04]} />
            <meshStandardMaterial color="#06d6a0" />
          </mesh>
        </group>

        {/* Polar form visualization */}
        {showPolar && modulus > 0 && (
          <>
            {/* Modulus circle */}
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[modulus - 0.02, modulus, 64]} />
              <meshStandardMaterial
                color="#ffcc00"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Argument arc */}
            <mesh rotation={[0, 0, argument / 2]}>
              <ringGeometry args={[0.5, 0.55, 32, 1, 0, argument]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>

            {/* Modulus indicator */}
            <mesh position={[modulus / 2, argument / 4, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color="#ffcc00"
                emissive="#ffcc00"
                emissiveIntensity={0.5}
              />
            </mesh>
          </>
        )}

        {/* Second complex number for operations */}
        {operation !== "none" && operation !== "conjugate" && operation !== "power" && (
          <>
            <mesh position={[1.5, 2, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#4f8fff" />
            </mesh>
            <mesh position={[0.75, 1, 0]} rotation={[0, 0, Math.atan2(2, 1.5)]}>
              <boxGeometry args={[0.02, 2.5, 0.02]} />
              <meshStandardMaterial color="#4f8fff" transparent opacity={0.5} />
            </mesh>
          </>
        )}
      </group>

      {/* Value displays */}
      <mesh position={[4, 2.5, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Real and imaginary parts */}
      <mesh position={[4, 2, 0]}>
        <boxGeometry args={[Math.abs(result.re) * 0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[4, 1.7, 0]}>
        <boxGeometry args={[Math.abs(result.im) * 0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#06d6a0" />
      </mesh>

      {/* Modulus and argument */}
      {showPolar && (
        <>
          <mesh position={[4, 1.3, 0]}>
            <sphereGeometry args={[0.08 + modulus * 0.05, 16, 16]} />
            <meshStandardMaterial color="#ffcc00" />
          </mesh>
          <mesh position={[4, 1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, Math.abs(argument) * 0.5, 8]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
        </>
      )}

      {/* Labels */}
      <mesh position={[-4, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-4, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4f8fff" />
      </mesh>
      <mesh position={[-4, 1.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <mesh position={[-4, 1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -4, 0]} />
    </>
  );
}
