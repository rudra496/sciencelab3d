"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * Component to handle canvas resize events
 * Forces the renderer to update when window size changes
 */
function CanvasResizeHandler() {
  const { gl, camera } = useThree();

  useEffect(() => {
    const handleResize = () => {
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gl, camera]);

  return null;
}

export interface SimulationBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

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
  /** Floating simulation bar — play/pause, reset, speed */
  simulationBar?: SimulationBarProps;
}

/**
 * PRODUCTION-LEVEL Experiment Container
 * - True fullscreen: fixed inset-0, 100vw × 100vh
 * - Fully responsive: mobile, tablet, desktop
 * - Auto-resize on window resize
 * - Proper z-index layering
 * - Performance optimized
 * - Floating simulation bar for real-time control
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
  simulationBar,
}: ExperimentContainerProps) {
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect device type with debounce
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();

    const handleResize = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(checkDevice, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Force canvas resize on container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (canvasRef.current) {
          canvasRef.current.style.width = `${width}px`;
          canvasRef.current.style.height = `${height}px`;
          window.dispatchEvent(new Event("resize"));
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => { resizeObserver.disconnect(); };
  }, []);

  // Ensure no body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-linear-to-br from-slate-100 via-blue-50 to-purple-50">
      {/* Main 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={isMobile ? 0.75 : [1, 1.5]}
        className="w-full h-full block touch-none"
        style={{ touchAction: "none" }}
        resize={{ debounce: 0, scroll: false }}
      >
        <CanvasResizeHandler />
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={isMobile ? 60 : isTablet ? 50 : 45}
          near={0.1}
          far={1000}
        />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={isMobile ? 5 : 10}
          maxDistance={isMobile ? 100 : 200}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 6}
          enablePan={!isMobile}
          panSpeed={isMobile ? 0 : 0.5}
          rotateSpeed={isMobile ? 0.5 : 1}
          zoomSpeed={isMobile ? 0.8 : 1.2}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.8} />
        <hemisphereLight args={["#b1e1ff", "#1a1a2e", 0.6]} />
        <pointLight position={[0, 15, 0]} intensity={0.5} color="#8b5cf6" />

        {enableFog && (
          <fog attach="fog" args={[new THREE.Color(backgroundColor).getStyle(), 60, 200]} />
        )}
        <Environment preset="city" />

        {/* Ground - visible grid */}
        <gridHelper args={[200, 80, "#2a2a4a", "#1a1a3a"]} position={[0, -0.01, 0]} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0a0a1e" roughness={0.95} metalness={0.05} />
        </mesh>

        <group>{children}</group>
      </Canvas>

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-white/90 via-white/70 to-transparent p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-2 sm:px-0">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow-md backdrop-blur-sm flex-shrink-0"
          >
            ← <span className="hidden sm:inline">Home</span>
          </button>
          <div className="flex-1 min-w-0 mx-2 sm:mx-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Buttons (top-right) */}
      <div className={`
        absolute top-16 sm:top-20 right-2 sm:right-4 z-20
        flex flex-row sm:flex-col gap-1 sm:gap-2
      `}>
        {controls && (
          <button
            onClick={() => setShowControls(!showControls)}
            className={`
              px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200
              ${showControls
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-white/90 text-gray-700 hover:bg-white border border-gray-200 backdrop-blur-sm shadow-md"}
            `}
          >
            {showControls ? "✓" : "⚙"} <span className="hidden sm:inline">Controls</span>
          </button>
        )}
        {dataPanel && (
          <button
            onClick={() => setShowData(!showData)}
            className={`
              px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200
              ${showData
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-white/90 text-gray-700 hover:bg-white border border-gray-200 backdrop-blur-sm shadow-md"}
            `}
          >
            {showData ? "✓" : "📊"} <span className="hidden sm:inline">Data</span>
          </button>
        )}
      </div>

      {/* Controls Panel - Slide-in Sidebar */}
      {controls && showControls && (
        <div
          className="absolute top-0 right-0 z-30 h-full w-full sm:w-80 md:w-96 bg-white/95 backdrop-blur-xl border-l border-purple-500/30 shadow-2xl overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch", maxHeight: "100vh" }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white/95 backdrop-blur-sm py-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-purple-200">
              <h2 className="text-lg sm:text-xl font-bold text-purple-600">Controls</h2>
              <button onClick={() => setShowControls(false)} className="text-gray-600 hover:text-gray-900 transition-colors text-xl sm:text-2xl p-1">✕</button>
            </div>
            {controls}
          </div>
        </div>
      )}

      {/* Data Panel - Bottom-left */}
      {dataPanel && showData && (
        <div className={`
          absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-20
          bg-white/95 backdrop-blur-xl
          border border-blue-200 rounded-xl shadow-2xl
          p-2 sm:p-4 max-w-full sm:max-w-sm transition-all duration-300
          ${isMobile ? "max-h-[40vh] overflow-y-auto" : ""}
        `}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-blue-200">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-semibold text-blue-600">Real-time Data</h3>
          </div>
          {dataPanel}
        </div>
      )}

      {/* Details Panel - Only visible when explicitly opened */}
      {details && showDetails && (
        <div className="absolute top-20 right-4 z-40 w-80 sm:w-96 max-h-[70vh] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
          <div className="sticky top-0 bg-linear-to-r from-blue-600 to-purple-600 p-3 sm:p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white">Experiment Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:text-gray-200 text-lg transition-colors p-1 bg-white/20 rounded-lg hover:bg-white/30"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(70vh-60px)] text-sm sm:text-base bg-gray-50 text-gray-800">
            {details}
          </div>
        </div>
      )}

      {/* ====== FLOATING SIMULATION BAR ====== */}
      {simulationBar && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-gray-900/90 backdrop-blur-xl border border-gray-600/50 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 shadow-2xl">
          {/* Play / Pause */}
          <button
            onClick={simulationBar.onPlayPause}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all shadow-md ${
              simulationBar.isPlaying
                ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/40"
                : "bg-green-600 hover:bg-green-500 text-white shadow-green-500/40"
            }`}
            title={simulationBar.isPlaying ? "Pause" : "Play"}
          >
            {simulationBar.isPlaying ? "⏸" : "▶"}
          </button>

          {/* Reset */}
          <button
            onClick={simulationBar.onReset}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm sm:text-base transition-all shadow-md"
            title="Reset"
          >
            🔄
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600" />

          {/* Speed control */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">Speed</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={simulationBar.speed}
              onChange={(e) => simulationBar.onSpeedChange(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer touch-none"
              style={{ accentColor: "#8b5cf6" }}
            />
            <span className="text-xs sm:text-sm font-mono text-purple-400 min-w-10 text-center">
              {simulationBar.speed.toFixed(1)}x
            </span>
          </div>
        </div>
      )}

      {/* Instructions hint */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 text-[10px] sm:text-xs text-gray-500 bg-black/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm hidden sm:block">
        <span>🖱️ Drag to rotate • Scroll to zoom • Right-click to pan</span>
      </div>
    </div>
  );
}

export default ExperimentContainer;
