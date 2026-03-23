"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface MandelbrotData {
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  escapeRadius: number;
  zoomTargetX: number;
  zoomTargetY: number;
}

export interface MandelbrotSceneProps {
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorScheme: "rainbow" | "fire" | "grayscale" | "electric" | "ocean";
  isPlaying: boolean;
  onDataChange?: (data: MandelbrotData) => void;
  onCenterChange?: (x: number, y: number) => void;
  onZoomChange?: (zoom: number) => void;
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uTime;
uniform float uMaxIterations;
uniform float uZoom;
uniform vec2 uCenter;
uniform float uEscapeRadius;
uniform int uColorScheme;
uniform vec2 uResolution;

varying vec2 vUv;

// HSV to RGB conversion (defined BEFORE use)
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Smooth coloring using logarithm
vec3 getColor(float iterations, float maxIter, int scheme) {
  if (iterations >= maxIter) {
    return vec3(0.0, 0.0, 0.0);
  }

  // Smooth coloring using log2
  float logZn = log(iterations + 1.0) / log(2.0);
  float smoothIter = iterations + 1.0 - logZn;
  float t = smoothIter / maxIter;

  if (scheme == 0) {
    // Rainbow
    float hue = 0.8 * t;
    return hsv2rgb(vec3(hue, 0.85, 0.95));
  } else if (scheme == 1) {
    // Fire
    return vec3(
      min(1.0, t * 3.0),
      max(0.0, min(1.0, t * 2.0 - 0.5)),
      max(0.0, t * 1.5 - 1.0)
    );
  } else if (scheme == 2) {
    // Grayscale
    float gray = t;
    return vec3(gray, gray, gray);
  } else if (scheme == 3) {
    // Electric
    float t2 = sin(t * 6.28) * 0.5 + 0.5;
    return vec3(
      0.1 + 0.9 * t2 * t2,
      0.3 + 0.7 * t * t2,
      0.9 + 0.1 * sin(t * 12.56)
    );
  } else {
    // Ocean
    return vec3(
      0.0 + t * 0.2,
      0.3 + t * 0.5,
      0.6 + t * 0.4
    );
  }
}

void main() {
  // Map UV to complex plane coordinates
  vec2 uv = vUv - 0.5;
  float aspect = uResolution.x / uResolution.y;

  // Calculate coordinates in complex plane
  float scale = 4.0 / uZoom;
  vec2 c = uCenter + uv * vec2(scale * aspect, scale);

  // Mandelbrot iteration
  vec2 z = vec2(0.0);
  float iterations = 0.0;
  float maxIter = uMaxIterations;
  float escapeRadius2 = uEscapeRadius * uEscapeRadius;

  for (float i = 0.0; i < 500.0; i++) {
    if (i >= maxIter) break;

    float x2 = z.x * z.x;
    float y2 = z.y * z.y;

    if (x2 + y2 > escapeRadius2) {
      // Smooth iteration count using Renyi extrapolation
      float logZn = log(x2 + y2) / 2.0;
      float nu = log(logZn / log(2.0)) / log(2.0);
      iterations = i + 1.0 - nu;
      break;
    }

    z = vec2(x2 - y2, 2.0 * z.x * z.y) + c;
    iterations = i;
  }

  if (iterations >= maxIter - 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    vec3 color = getColor(iterations, maxIter, uColorScheme);
    gl_FragColor = vec4(color, 1.0);
  }
}
`;

/**
 * Mandelbrot fractal scene using shader-based rendering on a plane
 * - High-performance GPU rendering using fragment shader
 * - Smooth coloring with log2-based iteration smoothing
 * - Interactive zoom and pan via click
 */
export function MandelbrotSceneComponent({
  maxIterations,
  zoom,
  centerX,
  centerY,
  colorScheme,
  isPlaying,
  onDataChange,
  onCenterChange,
  onZoomChange,
}: MandelbrotSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, camera } = useThree();

  // Refs for all state (performance)
  const frameCountRef = useRef(0);
  const currentZoomRef = useRef(zoom);
  const currentCenterRef = useRef({ x: centerX, y: centerY });
  const targetZoomRef = useRef(zoom);
  const targetCenterRef = useRef({ x: centerX, y: centerY });
  const isAnimatingRef = useRef(false);

  // React state for UI updates (throttled to every 8 frames)
  const [data, setData] = useState<MandelbrotData>({
    maxIterations,
    zoom,
    centerX,
    centerY,
    escapeRadius: 2.0,
    zoomTargetX: centerX,
    zoomTargetY: centerY,
  });

  // Color scheme to int mapping
  const colorSchemeInt = useMemo(() => {
    return { rainbow: 0, fire: 1, grayscale: 2, electric: 3, ocean: 4 }[colorScheme] ?? 0;
  }, [colorScheme]);

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMaxIterations: { value: maxIterations },
        uZoom: { value: zoom },
        uCenter: { value: new THREE.Vector2(centerX, centerY) },
        uEscapeRadius: { value: 2.0 },
        uColorScheme: { value: colorSchemeInt },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
      },
      side: THREE.DoubleSide,
    });
  }, []);

  // Store material ref
  materialRef.current = material;

  // Handle click on plane to zoom to that point
  const handleClick = useCallback((event: any) => {
    event.stopPropagation?.();

    const uv = event.uv;
    if (!uv) return;

    const aspect = size.width / size.height;
    const scale = 4.0 / currentZoomRef.current;

    // Calculate clicked point in complex plane
    const clickX = currentCenterRef.current.x + (uv.x - 0.5) * scale * aspect;
    const clickY = currentCenterRef.current.y + (uv.y - 0.5) * scale;

    // Set new target (zoom in 3x)
    targetCenterRef.current = { x: clickX, y: clickY };
    targetZoomRef.current = Math.min(currentZoomRef.current * 3, 100000);
    isAnimatingRef.current = true;

    onCenterChange?.(clickX, clickY);
  }, [size.width, size.height, onCenterChange]);

  // Update uniforms when props change
  useEffect(() => {
    if (!materialRef.current) return;

    targetZoomRef.current = zoom;
    targetCenterRef.current = { x: centerX, y: centerY };

    materialRef.current.uniforms.uMaxIterations.value = maxIterations;
    materialRef.current.uniforms.uColorScheme.value = colorSchemeInt;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
  }, [maxIterations, zoom, centerX, centerY, colorSchemeInt, size.width, size.height]);

  // Handle resize
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    frameCountRef.current++;
    const time = state.clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;

    // Smooth zoom animation
    if (isAnimatingRef.current || isPlaying) {
      const zoomLerp = 0.08;
      const centerLerp = 0.08;

      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * zoomLerp;
      currentCenterRef.current.x += (targetCenterRef.current.x - currentCenterRef.current.x) * centerLerp;
      currentCenterRef.current.y += (targetCenterRef.current.y - currentCenterRef.current.y) * centerLerp;

      // Check if animation is complete
      const zoomDiff = Math.abs(targetZoomRef.current - currentZoomRef.current);
      const centerDiff = Math.sqrt(
        Math.pow(targetCenterRef.current.x - currentCenterRef.current.x, 2) +
        Math.pow(targetCenterRef.current.y - currentCenterRef.current.y, 2)
      );

      if (zoomDiff < 0.001 && centerDiff < 0.0001) {
        isAnimatingRef.current = false;
      }

      // Update uniforms
      materialRef.current.uniforms.uZoom.value = currentZoomRef.current;
      materialRef.current.uniforms.uCenter.value.set(
        currentCenterRef.current.x,
        currentCenterRef.current.y
      );

      // Notify parent of zoom change
      if (Math.abs(currentZoomRef.current - zoom) > 0.01) {
        onZoomChange?.(currentZoomRef.current);
      }
    }

    // Update React state every 8 frames
    if (frameCountRef.current % 8 === 0) {
      const newData: MandelbrotData = {
        maxIterations,
        zoom: currentZoomRef.current,
        centerX: currentCenterRef.current.x,
        centerY: currentCenterRef.current.y,
        escapeRadius: 2.0,
        zoomTargetX: targetCenterRef.current.x,
        zoomTargetY: targetCenterRef.current.y,
      };
      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Position camera to look down at the plane
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 15, 0);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  return (
    <group>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[16, 16, 1, 1]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Border around the fractal area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.01, 8.1, 64]} />
        <meshBasicMaterial color="#8b5cf6" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* Corner markers */}
      {[[-7.5, 7.5], [7.5, 7.5], [7.5, -7.5], [-7.5, -7.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      ))}
    </group>
  );
}

export default MandelbrotSceneComponent;
