"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * Component to handle canvas resize events
 * Forces the renderer to update when window size changes
 */
function CanvasResizeHandler() {
  const { gl, camera, size } = useThree();
  
  useEffect(() => {
    const handleResize = () => {
      // Force update renderer size
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Update camera aspect ratio
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Initial sizing
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gl, camera]);
  
  return null;
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
}

/**
 * PRODUCTION-LEVEL Experiment Container
 * - True fullscreen: fixed inset-0, 100vw × 100vh
 * - Fully responsive: mobile, tablet, desktop
 * - Auto-resize on window resize
 * - Proper z-index layering
 * - Performance optimized
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
  const [showData, setShowData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Refs for cleanup
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect device type with debounce
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();

    // Debounced resize handler
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

  // Force canvas resize on container size changes (for split-screen windows)
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Force canvas to resize
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          
          // Trigger Three.js resize
          const event = new Event('resize');
          window.dispatchEvent(event);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Ensure no body scroll - only set overflow hidden
  // Note: Don't set position: fixed as it breaks mobile scroll behavior
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      {/* Main 3D Canvas - FULLSCREEN with responsive sizing */}
      <Canvas
        ref={canvasRef}
        shadows
        gl={{
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          powerPreference: "high-performance",
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={isMobile ? 1 : [1, 2]} // Fixed DPR on mobile for consistency
        className="w-full h-full block touch-none"
        style={{ touchAction: 'none' }}
        resize={{ debounce: 0, scroll: false }}
      >
        {/* Handle canvas resize events */}
        <CanvasResizeHandler />
        {/* Responsive Camera */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={isMobile ? 60 : isTablet ? 50 : 45}
          near={0.1}
          far={1000}
        />

        {/* Responsive Controls */}
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

        {/* Ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={backgroundColor} roughness={0.9} metalness={0.1} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={100} blur={2} far={50} />

        {/* Experiment Scene */}
        <group>{children}</group>
      </Canvas>

      {/* Header Bar - Responsive */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/90 via-white/70 to-transparent p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-2 sm:px-0">
          <div className="flex-1 min-w-0">
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

      {/* Toggle Buttons - Responsive */}
      <div className={`
        absolute top-16 sm:top-20 right-2 sm:right-4 z-20
        flex flex-row sm:flex-col gap-1 sm:gap-2
        ${isMobile ? "flex-row" : "flex-col"}
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
            aria-label={showControls ? "Hide controls" : "Show controls"}
          >
            {showControls ? "✓" : "⚙"} <span className="hidden sm:inline">{showControls ? "Controls" : "Controls"}</span>
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
            aria-label={showData ? "Hide data" : "Show data"}
          >
            {showData ? "✓" : "📊"} <span className="hidden sm:inline">{showData ? "Data" : "Data"}</span>
          </button>
        )}
        {details && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`
              px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200
              ${showDetails
                ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                : "bg-white/90 text-gray-700 hover:bg-white border border-gray-200 backdrop-blur-sm shadow-md"}
            `}
            aria-label={showDetails ? "Hide info" : "Show info"}
          >
            {showDetails ? "✓" : "ℹ"} <span className="hidden sm:inline">{showDetails ? "Info" : "Info"}</span>
          </button>
        )}
      </div>

      {/* Controls Panel - Responsive Slide-in */}
      {controls && showControls && (
        <div className={`
          absolute top-0 right-0 z-30 h-full w-full sm:w-80 md:w-96
          bg-gradient-to-l from-gray-900/95 to-gray-900/90 backdrop-blur-xl
          border-l border-purple-500/30 shadow-2xl
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${showControls ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
          maxHeight: '100vh'
        }}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-gray-900/95 backdrop-blur-sm py-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-purple-400">Controls</h2>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl sm:text-2xl p-1"
                aria-label="Close controls"
              >
                ✕
              </button>
            </div>
            {controls}
          </div>
        </div>
      )}

      {/* Data Panel - Responsive Position */}
      {dataPanel && showData && (
        <div className={`
          absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20
          bg-gradient-to-br from-gray-900/95 to-blue-900/90 backdrop-blur-xl
          border border-blue-500/30 rounded-xl shadow-2xl
          p-2 sm:p-4 max-w-full sm:max-w-sm transition-all duration-300
          ${isMobile ? "max-h-[40vh] overflow-y-auto" : ""}
        `}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-blue-500/30">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-semibold text-blue-400">Real-time Data</h3>
          </div>
          {dataPanel}
        </div>
      )}

      {/* Details Panel - Floating Draggable Window */}
      {details && (
        <div className={`
          absolute z-40 bg-white border border-gray-200 rounded-xl shadow-2xl
          ${showDetails ? "top-20 right-4 w-80 sm:w-96 max-h-[70vh]" : "top-20 right-4 w-12 h-12"}
          transition-all duration-300 overflow-hidden
        `}>
          {/* Toggle Button (when minimized) */}
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              aria-label="Show details"
            >
              <span className="text-2xl">ℹ</span>
            </button>
          )}
          
          {/* Full Window (when expanded) */}
          {showDetails && (
            <>
              {/* Header with gradient */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-white">Experiment Details</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-white hover:text-gray-200 text-lg transition-colors p-1 bg-white/20 rounded-lg hover:bg-white/30"
                      aria-label="Minimize details"
                      title="Minimize"
                    >
                      −
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-white hover:text-gray-200 text-lg transition-colors p-1 bg-white/20 rounded-lg hover:bg-white/30"
                      aria-label="Close details"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              {/* Content with light background */}
              <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(70vh-60px)] text-sm sm:text-base bg-gray-50 text-gray-800">
                {details}
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions hint - Responsive */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 text-[10px] sm:text-xs text-gray-500 bg-black/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm hidden xs:block">
        <span className="hidden sm:inline">🖱️ Drag to rotate • Scroll to zoom • Right-click to pan</span>
        <span className="sm:hidden">👆 Drag to rotate • Pinch to zoom</span>
      </div>
    </div>
  );
}

export default ExperimentContainer;
