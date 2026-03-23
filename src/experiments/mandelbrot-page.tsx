"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MandelbrotSceneComponent, MandelbrotData } from "@/experiments/mandelbrot-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const COLOR_SCHEMES = ["rainbow", "fire", "grayscale", "electric", "ocean"] as const;
const DEFAULT_ITERATIONS = 100;
const DEFAULT_ZOOM = 1.0;
const DEFAULT_CENTER_X = -0.5;
const DEFAULT_CENTER_Y = 0.0;

export default function MandelbrotPage() {
  const router = useRouter();
  const [data, setData] = useState<MandelbrotData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Fractal parameters
  const [maxIterations, setMaxIterations] = useState(DEFAULT_ITERATIONS);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [centerX, setCenterX] = useState(DEFAULT_CENTER_X);
  const [centerY, setCenterY] = useState(DEFAULT_CENTER_Y);
  const [colorScheme, setColorScheme] = useState<typeof COLOR_SCHEMES[number]>("electric");

  // Handle data updates from scene (throttled to every 8 frames)
  const handleDataChange = useCallback((newData: MandelbrotData) => {
    setData(newData);
  }, []);

  // Handle center change from click
  const handleCenterChange = useCallback((x: number, y: number) => {
    setCenterX(x);
    setCenterY(y);
  }, []);

  // Handle zoom change from animation
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setMaxIterations(DEFAULT_ITERATIONS);
    setZoom(DEFAULT_ZOOM);
    setCenterX(DEFAULT_CENTER_X);
    setCenterY(DEFAULT_CENTER_Y);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z * 2, 100000));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z / 2, 0.5));
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Fractal Parameters">
        <ControlSlider
          label="Max Iterations"
          value={maxIterations}
          unit=""
          min={50}
          max={500}
          step={10}
          color="#a855f7"
          onChange={setMaxIterations}
          decimals={0}
        />
        <ControlSlider
          label="Zoom Level"
          value={Math.log10(zoom)}
          unit="log₁₀"
          min={Math.log10(0.5)}
          max={Math.log10(100000)}
          step={0.1}
          color="#8b5cf6"
          onChange={(v) => setZoom(Math.pow(10, v))}
          decimals={2}
        />
      </ControlGroup>

      <ControlGroup title="Navigation">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleZoomIn}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium text-sm"
          >
            🔍+ Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium text-sm"
          >
            🔍- Zoom Out
          </button>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium text-sm"
        >
          🔄 Reset View
        </button>
      </ControlGroup>

      <ControlGroup title="Color Scheme">
        <div className="grid grid-cols-2 gap-2">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme}
              onClick={() => setColorScheme(scheme)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                colorScheme === scheme
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
      </ControlGroup>

      <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Mandelbrot Set</div>
        <div className="text-xs text-gray-500 font-mono">
          zₙ₊₁ = zₙ² + c
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Click on the fractal to zoom into that region
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/mandelbrot/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          zoom: { value: Math.log10(data.zoom), unit: "log₁₀", color: "#8b5cf6", decimals: 2 },
          real: { value: data.centerX, unit: "Re", color: "#7c3aed", decimals: 6 },
          imaginary: { value: data.centerY, unit: "Im", color: "#6d28d9", decimals: 6 },
          iterations: { value: data.maxIterations, unit: "max", color: "#a855f7", decimals: 0 },
          escapeRadius: { value: data.escapeRadius, unit: "R", color: "#5b21b6", decimals: 1 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-purple-400 text-sm">
          zₙ₊₁ = zₙ² + c
        </div>
      </div>
      {data.zoom > 10 && (
        <div className="mt-2 p-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <div className="text-xs text-purple-300 text-center">
            Deep zoom: {data.zoom < 1000 ? `${data.zoom.toFixed(1)}×` : `${data.zoom.toExponential(2)}×`}
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Mandelbrot Fractal"
        description="Explore the infinite complexity of the Mandelbrot set"
        cameraPosition={[0, 15, 0]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <MandelbrotSceneComponent
          onDataChange={handleDataChange}
          onCenterChange={handleCenterChange}
          onZoomChange={handleZoomChange}
          maxIterations={maxIterations}
          zoom={zoom}
          centerX={centerX}
          centerY={centerY}
          colorScheme={colorScheme}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      <FloatingControlPanel title="⚙️ Fractal Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
