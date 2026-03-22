"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface TrigonometryData {
  angle: number;
  radians: number;
  sin: number;
  cos: number;
  tan: number;
  exactValue: string;
  quadrant: string;
}

export interface TrigonometrySceneProps {
  angle: number;
  useRadians: boolean;
  showSin: boolean;
  showCos: boolean;
  showTan: boolean;
  showWaves: boolean;
  animationSpeed: number;
  isPlaying: boolean;
  onDataChange?: (data: TrigonometryData) => void;
}

// Special angles with exact values
const SPECIAL_ANGLES: Record<number, { sin: string; cos: string; tan: string }> = {
  0: { sin: "0", cos: "1", tan: "0" },
  30: { sin: "1/2", cos: "√3/2", tan: "1/√3" },
  45: { sin: "√2/2", cos: "√2/2", tan: "1" },
  60: { sin: "√3/2", cos: "1/2", tan: "√3" },
  90: { sin: "1", cos: "0", tan: "undefined" },
  120: { sin: "√3/2", cos: "-1/2", tan: "-√3" },
  135: { sin: "√2/2", cos: "-√2/2", tan: "-1" },
  150: { sin: "1/2", cos: "-√3/2", tan: "-1/√3" },
  180: { sin: "0", cos: "-1", tan: "0" },
  210: { sin: "-1/2", cos: "-√3/2", tan: "1/√3" },
  225: { sin: "-√2/2", cos: "-√2/2", tan: "1" },
  240: { sin: "-√3/2", cos: "-1/2", tan: "√3" },
  270: { sin: "-1", cos: "0", tan: "undefined" },
  300: { sin: "-√3/2", cos: "1/2", tan: "-√3" },
  315: { sin: "-√2/2", cos: "√2/2", tan: "-1" },
  330: { sin: "-1/2", cos: "√3/2", tan: "-1/√3" },
  360: { sin: "0", cos: "1", tan: "0" },
};

export function TrigonometrySceneComponent({
  angle,
  useRadians,
  showSin,
  showCos,
  showTan,
  showWaves,
  animationSpeed,
  isPlaying,
  onDataChange,
}: TrigonometrySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dataRef = useRef({
    frameCount: 0,
    time: 0,
    currentAngle: angle,
  });
  const [, forceUpdate] = useState({});

  // Unit circle
  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const theta = (i / 120) * Math.PI * 2;
      pts.push([Math.cos(theta), Math.sin(theta), 0]);
    }
    return pts;
  }, []);

  // Special angle markers
  const specialAngleMarkers = useMemo(() => {
    const markers: { position: [number, number, number]; angle: number }[] = [];
    [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].forEach((a) => {
      const rad = (a * Math.PI) / 180;
      markers.push({
        position: [Math.cos(rad) * 1.15, Math.sin(rad) * 1.15, 0],
        angle: a,
      });
    });
    return markers;
  }, []);

  // Wave functions
  const sinWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.06;
      pts.push([x, Math.sin(x), 0]);
    }
    return pts;
  }, []);

  const cosWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.06;
      pts.push([x, Math.cos(x), 0]);
    }
    return pts;
  }, []);

  const tanWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i - 100) * 0.06;
      const tan = Math.tan(x);
      const clampedTan = Math.max(-3, Math.min(3, tan));
      pts.push([x, clampedTan, 0]);
    }
    return pts;
  }, []);

  // Axis lines
  const xAxisPoints = useMemo(() => [[-5, 0, 0], [5, 0, 0]] as [number, number, number][], []);
  const yAxisPoints = useMemo(() => [[0, -3, 0], [0, 3, 0]] as [number, number, number][], []);

  const getQuadrant = (ang: number) => {
    const normalized = ((ang % 360) + 360) % 360;
    if (normalized === 0 || normalized === 180 || normalized === 360) return "On Axis";
    if (normalized === 90 || normalized === 270) return "On Axis";
    if (normalized < 90) return "I";
    if (normalized < 180) return "II";
    if (normalized < 270) return "III";
    return "IV";
  };

  const getExactValue = useCallback((ang: number) => {
    const nearest = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].reduce(
      (prev, curr) => (Math.abs(curr - ang) < Math.abs(prev - ang) ? curr : prev)
    );
    if (Math.abs(nearest - ang) < 2) {
      return `${nearest}° (${SPECIAL_ANGLES[nearest].sin}, ${SPECIAL_ANGLES[nearest].cos})`;
    }
    return "";
  }, []);

  const updateReactState = useCallback(() => {
    const rad = (dataRef.current.currentAngle * Math.PI) / 180;
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal = Math.tan(rad);

    onDataChange?.({
      angle: dataRef.current.currentAngle,
      radians: rad,
      sin: sinVal,
      cos: cosVal,
      tan: tanVal,
      exactValue: getExactValue(dataRef.current.currentAngle),
      quadrant: getQuadrant(dataRef.current.currentAngle),
    });
    forceUpdate({});
  }, [onDataChange, getExactValue]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    // Auto-animate angle
    data.currentAngle = (data.currentAngle + delta * animationSpeed * 15) % 360;

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(data.time * 0.1) * 0.02;
    }

    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

  // Override with manual angle
  dataRef.current.currentAngle = angle;

  const rad = (angle * Math.PI) / 180;
  const cosX = Math.cos(rad);
  const sinY = Math.sin(rad);
  const tanVal = Math.tan(rad);

  // Angle arc
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * rad;
      pts.push([0.4 * Math.cos(theta), 0.4 * Math.sin(theta), 0]);
    }
    return pts;
  }, [rad]);

  // Tangent line from (1, 0)
  const tanLinePoints: [number, number, number][] = [[1, 0, 0]];
  if (Math.abs(tanVal) < 10 && Math.abs(cosX) > 0.01) {
    tanLinePoints.push([1, tanVal, 0]);
  }

  // Wave position for current angle
  const waveX = ((angle / 360) * Math.PI * 2 - Math.PI) * 1.5;

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

      <group ref={groupRef}>
        {/* ===== UNIT CIRCLE SECTION ===== */}
        <group position={[-3, 0, 0]}>
          {/* Main axes */}
          <Line points={xAxisPoints} color="#666" lineWidth={1} />
          <Line points={yAxisPoints} color="#666" lineWidth={1} />

          {/* Unit circle */}
          <Line points={circlePoints} color="#8b5cf6" lineWidth={2} />

          {/* Special angle markers */}
          {specialAngleMarkers.map((marker, i) => {
            const isMajor = [0, 90, 180, 270, 360].includes(marker.angle);
            return (
              <mesh key={i} position={marker.position}>
                <sphereGeometry args={[isMajor ? 0.05 : 0.03, 8, 8]} />
                <meshStandardMaterial
                  color={isMajor ? "#fff" : "#888"}
                  emissive={isMajor ? "#fff" : "#888"}
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })}

          {/* Angle arc */}
          <Line points={arcPoints} color="#a78bfa" lineWidth={2} />

          {/* Radius line to point P */}
          <Line points={[[0, 0, 0], [cosX, sinY, 0]]} color="#fbbf24" lineWidth={3} />

          {/* Cosine line (horizontal on x-axis) */}
          {showCos && (
            <>
              <Line points={[[0, 0, 0], [cosX, 0, 0]]} color="#3b82f6" lineWidth={3} />
              <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#3b82f6" lineWidth={1} opacity={0.5} />
            </>
          )}

          {/* Sine line (vertical from x-axis) */}
          {showSin && (
            <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#22c55e" lineWidth={3} />
          )}

          {/* Tangent line (from x=1) */}
          {showTan && Math.abs(tanVal) < 10 && Math.abs(cosX) > 0.01 && (
            <Line points={tanLinePoints} color="#ef4444" lineWidth={2} opacity={0.7} />
          )}

          {/* Point P on unit circle */}
          <mesh position={[cosX, sinY, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.7} />
          </mesh>

          {/* Cosine point on x-axis */}
          {showCos && (
            <mesh position={[cosX, 0, 0]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
            </mesh>
          )}

          {/* Sine point on y-axis */}
          {showSin && (
            <mesh position={[0, sinY, 0]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
            </mesh>
          )}

          {/* Center point */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>

          {/* Axis labels */}
          <mesh position={[1.3, -0.15, 0]}>
            <planeGeometry args={[0.25, 0.25]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[-0.2, 1.3, 0]}>
            <planeGeometry args={[0.25, 0.25]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>

          {/* P label */}
          <mesh position={[cosX * 1.15, sinY * 1.15, 0]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>

        {/* ===== WAVE SECTION ===== */}
        {showWaves && (
          <group position={[3, 0, 0]}>
            {/* Wave background */}
            <Line points={[[-6, -2, 0], [6, -2, 0]]} color="#444" lineWidth={1} />
            <Line points={[[-6, 2, 0], [-6, -2, 0]]} color="#444" lineWidth={1} />

            {/* Sin wave */}
            {showSin && (
              <>
                <Line points={sinWavePoints} color="#22c55e" lineWidth={2} />
                <mesh position={[waveX, Math.sin((angle / 360) * Math.PI * 2), 0]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
                </mesh>
              </>
            )}

            {/* Cos wave */}
            {showCos && (
              <>
                <Line points={cosWavePoints} color="#3b82f6" lineWidth={1.5} opacity={0.6} />
                <mesh position={[waveX, Math.cos((angle / 360) * Math.PI * 2), 0]}>
                  <sphereGeometry args={[0.06, 10, 10]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
                </mesh>
              </>
            )}

            {/* Tan wave */}
            {showTan && (
              <Line points={tanWavePoints} color="#ef4444" lineWidth={1} opacity={0.4} />
            )}

            {/* Current position indicator line */}
            <Line points={[[waveX, -2, 0], [waveX, 2, 0]]} color="#666" lineWidth={1} opacity={0.3} />
          </group>
        )}
      </group>
    </>
  );
}

export default TrigonometrySceneComponent;
