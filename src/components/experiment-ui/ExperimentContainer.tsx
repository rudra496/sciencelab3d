"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export interface ExperimentContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  controls?: ReactNode;
  dataPanel?: ReactNode;
  details?: ReactNode;
  cameraPosition?: [number, number, number];
  enableFog?: boolean;
  backgroundColor?: string;
}

/**
 * Professional fullscreen experiment container
 * - 100vw × 100vh viewport coverage
 * - No scrollbars or overflow
 * - Proper Three.js resource disposal
 * - Responsive design
 */
export function ExperimentContainer({
  children,
  title,
  description,
  controls,
  dataPanel,
  details,
  cameraPosition = [35, 25, 35],
  enableFog = true,
  backgroundColor = "#050510",
}: ExperimentContainerProps) {
  const [showControls, setShowControls] = useState(false);
  const [showData, setShowData] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for cleanup
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect mobile with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Prevent body scroll when experiment is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-950">
      {/* Main 3D Canvas - Fullscreen */}
      <Canvas
        ref={canvasRef}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={isMobile ? 50 : 45}
          near={0.1}
          far={1000}
        />

        {/* Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 6}
          enablePan={!isMobile}
          panSpeed={isMobile ? 0 : 0.5}
          rotateSpeed={isMobile ? 0.5 : 1}
          zoomSpeed={isMobile ? 0.8 : 1.2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        <pointLight position={[0, 15, 0]} intensity={0.3} color="#8b5cf6" />

        {/* Environment */}
        {enableFog && (
          <fog
            attach="fog"
            args={[new THREE.Color(backgroundColor).getStyle(), 30, 150]}
          />
        )}
        <Environment preset="night" />

        {/* Ground with shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color={backgroundColor}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.4}
          scale={100}
          blur={2}
          far={50}
        />

        {/* Experiment Scene */}
        <group>{children}</group>
      </Canvas>

      {/* Header Bar - Floating */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-300 mt-1 hidden md:block">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Buttons - Top Right */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        {controls && (
          <button
            onClick={() => setShowControls(!showControls)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${showControls
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"}
            `}
          >
            {showControls ? "✓ Controls" : "⚙ Controls"}
          </button>
        )}
        {dataPanel && (
          <button
            onClick={() => setShowData(!showData)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${showData
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"}
            `}
          >
            {showData ? "✓ Data" : "📊 Data"}
          </button>
        )}
        {details && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${showDetails
                ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"}
            `}
          >
            {showDetails ? "✓ Info" : "ℹ Info"}
          </button>
        )}
      </div>

      {/* Controls Panel - Slide in from right */}
      {controls && showControls && (
        <div className={`
          absolute top-0 right-0 z-30 h-full w-80 md:w-96
          bg-gradient-to-l from-gray-900/95 to-gray-900/90 backdrop-blur-xl
          border-l border-purple-500/30 shadow-2xl
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${showControls ? "translate-x-0" : "translate-x-full"}
        `}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900/95 backdrop-blur-sm py-2 -mx-6 px-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-purple-400">Controls</h2>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            {controls}
          </div>
        </div>
      )}

      {/* Data Panel - Bottom Left */}
      {dataPanel && showData && (
        <div className={`
          absolute bottom-4 left-4 z-20
          bg-gradient-to-br from-gray-900/95 to-blue-900/90 backdrop-blur-xl
          border border-blue-500/30 rounded-xl shadow-2xl
          p-4 max-w-sm transition-all duration-300
          ${isMobile ? "max-h-48 overflow-y-auto" : ""}
        `}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/30">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-blue-400">Real-time Data</h3>
          </div>
          {dataPanel}
        </div>
      )}

      {/* Details Panel - Modal */}
      {details && showDetails && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-green-500/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-400">Experiment Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {details}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Info Toggle */}
      {isMobile && description && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute top-20 left-4 z-20 px-3 py-2 bg-gray-800/80 text-white text-sm rounded-lg backdrop-blur-sm"
        >
          ℹ Info
        </button>
      )}

      {/* Instructions hint */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-gray-500 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
        🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
      </div>
    </div>
  );
}

export default ExperimentContainer;
