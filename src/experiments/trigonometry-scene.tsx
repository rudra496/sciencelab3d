"use client";

import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html, Text } from "@react-three/drei";
import * as THREE from "three";

export interface TrigonometryData {
  angle: number;
  radians: number;
  sin: number;
  cos: number;
  tan: number;
  cot?: number;
  sec?: number;
  csc?: number;
  exactValue: string;
  quadrant: string;
  sinValue: string;
  cosValue: string;
  tanValue: string;
}

export interface TrigonometrySceneProps {
  angle: number;
  useRadians: boolean;
  showSin: boolean;
  showCos: boolean;
  showTan: boolean;
  showCot: boolean;
  showSec: boolean;
  showCsc: boolean;
  showGraph: boolean;
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
  showCot,
  showSec,
  showCsc,
  showGraph,
  animationSpeed,
  isPlaying,
  onDataChange,
}: TrigonometrySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const graphRef = useRef<THREE.Group>(null);
  const dataRef = useRef({
    frameCount: 0,
    time: 0,
    currentAngle: angle,
  });
  const [, forceUpdate] = useState({});

  // Auto-animating angle
  const [animatingAngle, setAnimatingAngle] = useState(angle);

  // Graph trace history
  const waveHistoryRef = useRef<{ angle: number; sin: number; cos: number; tan: number }[]>([]);

  // Update animating angle when not manually controlled
  useEffect(() => {
    if (!isPlaying) {
      setAnimatingAngle(angle);
    }
  }, [angle, isPlaying]);

  // Unit circle points (with higher resolution for smooth appearance)
  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 144; i++) {
      const theta = (i / 144) * Math.PI * 2;
      pts.push([Math.cos(theta), Math.sin(theta), 0]);
    }
    return pts;
  }, []);

  // Grid lines for unit circle
  const gridLines = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];
    // Vertical lines
    for (let i = -5; i <= 5; i++) {
      if (i !== 0) {
        lines.push({ start: [i * 0.2, -1.2, 0], end: [i * 0.2, 1.2, 0] });
      }
    }
    // Horizontal lines
    for (let i = -5; i <= 5; i++) {
      if (i !== 0) {
        lines.push({ start: [-1.2, i * 0.2, 0], end: [1.2, i * 0.2, 0] });
      }
    }
    return lines;
  }, []);

  // Special angle markers
  const specialAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

  // Graph trace data
  const graphTracePoints = useMemo(() => {
    if (!showGraph || waveHistoryRef.current.length < 2) return [];

    // Generate sine wave trace
    const sinPoints: [number, number, number][] = waveHistoryRef.current.map((h, i) => [
      -4 + (i / Math.max(waveHistoryRef.current.length - 1, 1)) * 8,
      h.sin,
      0
    ]);

    return sinPoints;
  }, [showGraph, waveHistoryRef.current]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const data = dataRef.current;
    data.time += delta;
    data.frameCount++;

    // Auto-animate angle
    data.currentAngle = (data.currentAngle + delta * animationSpeed * 25) % 360;
    setAnimatingAngle(data.currentAngle);

    // Record wave history
    const rad = (data.currentAngle * Math.PI) / 180;
    waveHistoryRef.current.push({
      angle: data.currentAngle,
      sin: Math.sin(rad),
      cos: Math.cos(rad),
      tan: Math.tan(rad)
    });
    if (waveHistoryRef.current.length > 300) {
      waveHistoryRef.current.shift();
    }

    // Subtle rotation for 3D effect
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(data.time * 0.08) * 0.03;
      groupRef.current.rotation.y = Math.sin(data.time * 0.05) * 0.02;
    }

    if (data.frameCount % 8 === 0) {
      updateReactState();
    }
  });

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
    const nearest = specialAngles.reduce(
      (prev, curr) => (Math.abs(curr - ang) < Math.abs(prev - ang) ? curr : prev)
    );
    if (Math.abs(nearest - ang) < 2) {
      return `${nearest}°`;
    }
    return "";
  }, []);

  const updateReactState = useCallback(() => {
    const rad = (dataRef.current.currentAngle * Math.PI) / 180;
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal = Math.tan(rad);

    const nearest = specialAngles.reduce(
      (prev, curr) => (Math.abs(curr - dataRef.current.currentAngle) < Math.abs(prev - dataRef.current.currentAngle) ? curr : prev)
    );

    let sinStr = sinVal.toFixed(4);
    let cosStr = cosVal.toFixed(4);
    let tanStr = Math.abs(tanVal) > 100 ? "undefined" : tanVal.toFixed(4);

    if (Math.abs(nearest - dataRef.current.currentAngle) < 2) {
      sinStr = `${SPECIAL_ANGLES[nearest].sin} (${sinVal.toFixed(4)})`;
      cosStr = `${SPECIAL_ANGLES[nearest].cos} (${cosVal.toFixed(4)})`;
      tanStr = SPECIAL_ANGLES[nearest].tan;
    }

    onDataChange?.({
      angle: dataRef.current.currentAngle,
      radians: rad,
      sin: sinVal,
      cos: cosVal,
      tan: tanVal,
      cot: cosVal / sinVal,
      sec: 1 / cosVal,
      csc: 1 / sinVal,
      exactValue: getExactValue(dataRef.current.currentAngle),
      quadrant: getQuadrant(dataRef.current.currentAngle),
      sinValue: sinStr,
      cosValue: cosStr,
      tanValue: tanStr,
    });
    forceUpdate({});
  }, [onDataChange, getExactValue]);

  const currentAngle = isPlaying ? animatingAngle : angle;
  const rad = (currentAngle * Math.PI) / 180;
  const cosX = Math.cos(rad);
  const sinY = Math.sin(rad);
  const tanVal = Math.tan(rad);

  // Angle arc
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 50;
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

  // Cotangent line from (0, 1)
  const cotVal = sinY !== 0 ? cosX / sinY : Infinity;
  const cotLinePoints: [number, number, number][] = [[0, 1, 0]];
  if (Math.abs(cotVal) < 10 && Math.abs(sinY) > 0.01) {
    cotLinePoints.push([cotVal, 1, 0]);
  }

  // Secant line from origin to intersection with vertical line x=1
  const secLinePoints: [number, number, number][] = [[0, 0, 0]];
  if (Math.abs(cosX) > 0.01) {
    secLinePoints.push([1, tanVal, 0]);
  }

  // Cosecant line from origin to intersection with horizontal line y=1
  const cscLinePoints: [number, number, number][] = [[0, 0, 0]];
  if (Math.abs(sinY) > 0.01) {
    cscLinePoints.push([cotVal, 1, 0]);
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-8, 5, 5]} intensity={0.6} color="#8b5cf6" />

      <group ref={groupRef}>
        {/* ===== MAIN UNIT CIRCLE SECTION ===== */}
        <group position={[-3.5, 0, 0]}>
          {/* Subtle grid lines */}
          {gridLines.map((line, i) => (
            <Line
              key={`grid-${i}`}
              points={[line.start, line.end]}
              color="#1a1a2e"
              lineWidth={1}
              opacity={0.5}
            />
          ))}

          {/* Main axes */}
          <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#4a5568" lineWidth={2} />
          <Line points={[[0, -4, 0], [0, 4, 0]]} color="#4a5568" lineWidth={2} />

          {/* Unit circle with glow effect */}
          <Line points={circlePoints} color="#a78bfa" lineWidth={3} />
          <Line points={circlePoints} color="#8b5cf6" lineWidth={1.5} opacity={0.5} />

          {/* Special angle tick marks */}
          {specialAngles.map((a) => {
            const rad = (a * Math.PI) / 180;
            const isMajor = [0, 90, 180, 270, 360].includes(a);
            return (
              <group key={a} position={[Math.cos(rad) * 1.05, Math.sin(rad) * 1.05, 0]}>
                <mesh>
                  <sphereGeometry args={[Math.max(0.001, isMajor ? 0.04 : 0.02), 8, 8]} />
                  <meshStandardMaterial
                    color={isMajor ? "#fff" : "#6b7280"}
                    emissive={isMajor ? "#fff" : "#6b7280"}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </group>
            );
          })}

          {/* Angle arc with gradient effect */}
          <Line points={arcPoints} color="#c4b5fd" lineWidth={2.5} opacity={0.8} />

          {/* Radius line to point P */}
          <Line points={[[0, 0, 0], [cosX, sinY, 0]]} color="#fbbf24" lineWidth={3} />

          {/* Cosine line (horizontal on x-axis) - GREEN */}
          {showCos && (
            <>
              <Line points={[[0, 0, 0], [cosX, 0, 0]]} color="#22c55e" lineWidth={3} />
              <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#22c55e" lineWidth={1} opacity={0.3} dashed />
              <mesh position={[cosX / 2, 0, 0]}>
                <sphereGeometry args={[Math.max(0.001, 0.035), 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.7} />
              </mesh>
            </>
          )}

          {/* Sine line (vertical from x-axis) - BLUE */}
          {showSin && (
            <>
              <Line points={[[cosX, 0, 0], [cosX, sinY, 0]]} color="#3b82f6" lineWidth={3} />
              <mesh position={[cosX, sinY / 2, 0]}>
                <sphereGeometry args={[Math.max(0.001, 0.035), 8, 8]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} />
              </mesh>
            </>
          )}

          {/* Tangent line (from x=1) - RED */}
          {showTan && Math.abs(tanVal) < 10 && Math.abs(cosX) > 0.01 && (
            <Line points={tanLinePoints} color="#ef4444" lineWidth={2.5} />
          )}

          {/* Cotangent line (from y=1) - ORANGE */}
          {showCot && Math.abs(cotVal) < 10 && Math.abs(sinY) > 0.01 && (
            <Line points={cotLinePoints} color="#f97316" lineWidth={2.5} />
          )}

          {/* Secant line - PURPLE */}
          {showSec && Math.abs(cosX) > 0.01 && Math.abs(tanVal) < 10 && (
            <Line points={secLinePoints} color="#a855f7" lineWidth={2} opacity={0.7} dashed />
          )}

          {/* Cosecant line - PINK */}
          {showCsc && Math.abs(sinY) > 0.01 && Math.abs(cotVal) < 10 && (
            <Line points={cscLinePoints} color="#ec4899" lineWidth={2} opacity={0.7} dashed />
          )}

          {/* Point P on unit circle */}
          <mesh position={[cosX, sinY, 0]}>
            <sphereGeometry args={[Math.max(0.001, 0.12), 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.9} />
          </mesh>

          {/* Cosine point on x-axis */}
          {showCos && (
            <mesh position={[cosX, 0, 0]}>
              <sphereGeometry args={[Math.max(0.001, 0.07), 10, 10]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
            </mesh>
          )}

          {/* Sine point on y-axis */}
          {showSin && (
            <mesh position={[0, sinY, 0]}>
              <sphereGeometry args={[Math.max(0.001, 0.07), 10, 10]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
            </mesh>
          )}

          {/* Tangent intersection point */}
          {showTan && Math.abs(tanVal) < 10 && Math.abs(cosX) > 0.01 && (
            <mesh position={[1, tanVal, 0]}>
              <sphereGeometry args={[Math.max(0.001, 0.06), 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.7} />
            </mesh>
          )}

          {/* Cotangent intersection point */}
          {showCot && Math.abs(cotVal) < 10 && Math.abs(sinY) > 0.01 && (
            <mesh position={[cotVal, 1, 0]}>
              <sphereGeometry args={[Math.max(0.001, 0.06), 8, 8]} />
              <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.7} />
            </mesh>
          )}

          {/* Center point */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[Math.max(0.001, 0.05), 8, 8]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
          </mesh>

          {/* Labels in 3D */}
          <Text position={[1.5, -0.15, 0]} fontSize={0.15} color="#22c55e" anchorX="center">
            x
          </Text>
          <Text position={[-0.1, 1.5, 0]} fontSize={0.15} color="#3b82f6" anchorX="center">
            y
          </Text>
          <Text position={[cosX * 1.25, sinY * 1.15, 0]} fontSize={0.12} color="#fbbf24" anchorX="center">
            P
          </Text>

          {/* Special Angles Reference Card */}
          <Html position={[0, -2.8, 0]} distanceFactor={12}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-purple-500/50 shadow-xl max-w-[280px]">
              <div className="text-purple-400 font-bold text-xs mb-2 text-center">📐 Special Angles</div>
              <div className="grid grid-cols-5 gap-1 text-[9px]">
                <div className="text-gray-500 font-bold">°</div>
                <div className="text-blue-400 font-bold">sin</div>
                <div className="text-green-400 font-bold">cos</div>
                <div className="text-red-400 font-bold">tan</div>
                <div className="text-gray-400 font-bold">cot</div>

                {specialAngles.filter(a => a % 30 === 0).map((a) => {
                  const sinVal = Math.sin((a * Math.PI) / 180);
                  const cosVal = Math.cos((a * Math.PI) / 180);
                  const tanVal = Math.tan((a * Math.PI) / 180);
                  const isCurrent = Math.abs(currentAngle - a) < 3;
                  return (
                    <React.Fragment key={a}>
                      <div className={`text-center ${isCurrent ? 'bg-purple-600 rounded' : 'text-gray-400'}`}>{a}</div>
                      <div className={`text-center ${isCurrent ? 'bg-blue-600/50 rounded' : 'text-blue-400'}`}>{SPECIAL_ANGLES[a]?.sin || '-'}</div>
                      <div className={`text-center ${isCurrent ? 'bg-green-600/50 rounded' : 'text-green-400'}`}>{SPECIAL_ANGLES[a]?.cos || '-'}</div>
                      <div className={`text-center ${isCurrent ? 'bg-red-600/50 rounded' : 'text-red-400'}`}>{SPECIAL_ANGLES[a]?.tan || '-'}</div>
                      <div className={`text-center ${isCurrent ? 'bg-orange-600/50 rounded' : 'text-orange-400'}`}>{SPECIAL_ANGLES[a]?.tan === '0' ? '∞' : SPECIAL_ANGLES[a]?.tan === '1' ? '1' : SPECIAL_ANGLES[a]?.tan === 'undefined' ? '0' : SPECIAL_ANGLES[a]?.tan === '√3' ? '1/√3' : SPECIAL_ANGLES[a]?.tan === '-√3' ? '-1/√3' : '-'}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </Html>
        </group>

        {/* ===== GRAPH SECTION ===== */}
        {showGraph && (
          <group ref={graphRef} position={[3.5, 0, 0]}>
            {/* Graph axes */}
            <Line points={[[-5, -2, 0], [5, -2, 0]]} color="#4a5568" lineWidth={2} />
            <Line points={[[-5, 2, 0], [-5, -2, 0]]} color="#4a5568" lineWidth={2} />
            <Line points={[[5, 2, 0], [5, -2, 0]]} color="#4a5568" lineWidth={1} opacity={0.5} />
            <Line points={[[-5, 2, 0], [5, 2, 0]]} color="#4a5568" lineWidth={1} opacity={0.5} />

            {/* Grid lines for graph */}
            {Array.from({ length: 9 }).map((_, i) => {
              const y = -1.5 + i * 0.375;
              return (
                <Line
                  key={`graph-grid-${i}`}
                  points={[[-5, y, 0], [5, y, 0]]}
                  color="#1a1a2e"
                  lineWidth={1}
                  opacity={0.4}
                />
              );
            })}

            {/* Sine wave trace */}
            {showSin && waveHistoryRef.current.length > 1 && (
              <Line
                points={waveHistoryRef.current.map((h, i) => [
                  -5 + (i / Math.max(waveHistoryRef.current.length - 1, 1)) * 10,
                  h.sin,
                  0
                ])}
                color="#3b82f6"
                lineWidth={2.5}
              />
            )}

            {/* Cosine wave trace */}
            {showCos && waveHistoryRef.current.length > 1 && (
              <Line
                points={waveHistoryRef.current.map((h, i) => [
                  -5 + (i / Math.max(waveHistoryRef.current.length - 1, 1)) * 10,
                  h.cos * 0.7,
                  0
                ])}
                color="#22c55e"
                lineWidth={1.5}
                opacity={0.6}
              />
            )}

            {/* Current position on wave */}
            {showSin && (
              <>
                <mesh position={[0, Math.sin(rad), 0]}>
                  <sphereGeometry args={[Math.max(0.001, 0.08), 12, 12]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
                </mesh>
                {/* Leading line showing connection */}
                <Line
                  points={[[0, -2, 0], [0, Math.sin(rad), 0]]}
                  color="#3b82f6"
                  lineWidth={1}
                  opacity={0.5}
                  dashed
                />
              </>
            )}

            {/* Graph labels */}
            <Text position={[4.5, 1.7, 0]} fontSize={0.1} color="#3b82f6" anchorX="right">
              sin(θ)
            </Text>
            {showCos && (
              <Text position={[4.5, 1.3, 0]} fontSize={0.08} color="#22c55e" anchorX="right">
                cos(θ)
              </Text>
            )}
            <Text position={[0, -2.3, 0]} fontSize={0.08} color="#9ca3af" anchorX="center">
              Angle →
            </Text>

            {/* Graph info panel */}
            <Html position={[0, 3, 0]} distanceFactor={12}>
              <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-blue-500/50 shadow-xl max-w-[200px]">
                <div className="text-blue-400 font-bold text-xs mb-2 text-center">📈 Wave Graph</div>
                <div className="text-[9px] text-gray-400 space-y-1">
                  <div>• Amplitude: 1</div>
                  <div>• Period: 2π (360°)</div>
                  <div>• Horizontal axis: angle</div>
                  <div>• Vertical axis: value</div>
                </div>
              </div>
            </Html>
          </group>
        )}

        {/* ===== MAIN INFO DISPLAY ===== */}
        {/* Angle display */}
        <Html position={[-3.5, 3.5, 0]} distanceFactor={12}>
          <div className="bg-gray-900/95 px-4 py-3 rounded-lg border border-yellow-500/50 shadow-xl">
            <div className="text-yellow-400 font-bold text-lg text-center">
              θ = {currentAngle.toFixed(1)}° = {rad.toFixed(3)} rad
            </div>
            <div className="text-purple-400 text-xs text-center mt-1">
              Quadrant: {getQuadrant(currentAngle)}
            </div>
          </div>
        </Html>

        {/* Value displays */}
        <Html position={[-7, 2, 0]} distanceFactor={12}>
          <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 shadow-xl space-y-1">
            {showSin && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400 font-bold w-12">sin(θ)</span>
                <span className="text-white">=</span>
                <span className="text-blue-400">{Math.sin(rad).toFixed(4)}</span>
              </div>
            )}
            {showCos && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-bold w-12">cos(θ)</span>
                <span className="text-white">=</span>
                <span className="text-green-400">{Math.cos(rad).toFixed(4)}</span>
              </div>
            )}
            {showTan && Math.abs(tanVal) < 10 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-400 font-bold w-12">tan(θ)</span>
                <span className="text-white">=</span>
                <span className="text-red-400">{tanVal.toFixed(4)}</span>
              </div>
            )}
            {showCot && Math.abs(cotVal) < 10 && Math.abs(sinY) > 0.01 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-orange-400 font-bold w-12">cot(θ)</span>
                <span className="text-white">=</span>
                <span className="text-orange-400">{cotVal.toFixed(4)}</span>
              </div>
            )}
            {showSec && Math.abs(cosX) > 0.01 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-400 font-bold w-12">sec(θ)</span>
                <span className="text-white">=</span>
                <span className="text-purple-400">{(1 / cosX).toFixed(4)}</span>
              </div>
            )}
            {showCsc && Math.abs(sinY) > 0.01 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-pink-400 font-bold w-12">csc(θ)</span>
                <span className="text-white">=</span>
                <span className="text-pink-400">{(1 / sinY).toFixed(4)}</span>
              </div>
            )}
          </div>
        </Html>

        {/* Pythagorean identity */}
        {showSin && showCos && (
          <Html position={[3.5, -3.5, 0]} distanceFactor={12}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-yellow-500/50 shadow-xl">
              <div className="text-yellow-400 font-bold text-xs text-center">
                sin²(θ) + cos²(θ) = 1
              </div>
              <div className="text-[9px] text-gray-400 text-center mt-1">
                ({(Math.sin(rad) ** 2).toFixed(3)}) + ({(Math.cos(rad) ** 2).toFixed(3)}) = {(Math.sin(rad) ** 2 + Math.cos(rad) ** 2).toFixed(3)}
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

export default TrigonometrySceneComponent;
