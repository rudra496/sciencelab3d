"use client";

import { useState } from "react";
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

const COLOR_SCHEMES = ["rainbow", "fire", "grayscale"] as const;

export default function MandelbrotPage() {
  const router = useRouter();
  const [data, setData] = useState<MandelbrotData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [maxIterations, setMaxIterations] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [colorScheme, setColorScheme] = useState<typeof COLOR_SCHEMES[number]>("rainbow");
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [resolution, setResolution] = useState(60);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setMaxIterations(50);
    setZoom(1);
    setResolution(60);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Fractal Parameters">
        <ControlSlider
          label="Max Iterations"
          value={maxIterations}
          unit=""
          min={10}
          max={200}
          step={10}
          color="#a855f7"
          onChange={setMaxIterations}
          decimals={0}
        />
        <ControlSlider
          label="Zoom Level"
          value={zoom}
          unit="×"
          min={0.5}
          max={5}
          step={0.1}
          color="#8b5cf6"
          onChange={setZoom}
          decimals={1}
        />
        <ControlSlider
          label="Resolution"
          value={resolution}
          unit="pts"
          min={20}
          max={100}
          step={10}
          color="#7c3aed"
          onChange={setResolution}
          decimals={0}
        />
        <ControlSlider
          label="Rotation Speed"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#6d28d9"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Color Scheme">
        <div className="grid grid-cols-3 gap-2">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme}
              onClick={() => setColorScheme(scheme)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                colorScheme === scheme
                  ? "bg-purple-600 text-white"
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
        <div className="text-xs text-gray-500">
          z = z² + c<br />
          Points that don't escape to infinity
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
          iterations: { value: data.iterations, unit: "max", color: "#a855f7", decimals: 0 },
          zoom: { value: data.zoom, unit: "×", color: "#8b5cf6", decimals: 1 },
          centerX: { value: data.centerX, unit: "Re", color: "#7c3aed", decimals: 2 },
          points: { value: data.pointsRendered, unit: "pts", color: "#6d28d9", decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-purple-400 text-sm">
          z = z² + c
        </div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Mandelbrot Set"
        description="Explore the famous fractal in 3D"
        cameraPosition={[15, 12, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <MandelbrotSceneComponent
          onDataChange={setData}
          maxIterations={maxIterations}
          zoom={zoom}
          colorScheme={colorScheme}
          rotationSpeed={rotationSpeed}
          resolution={resolution}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Fractal Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
