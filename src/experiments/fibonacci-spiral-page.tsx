"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FibonacciSpiralSceneComponent, FibonacciSpiralData } from "@/experiments/fibonacci-spiral-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function FibonacciSpiralPage() {
  const router = useRouter();
  const [data, setData] = useState<FibonacciSpiralData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Parameters
  const [pointsCount, setPointsCount] = useState(100);
  const [scale, setScale] = useState(1);
  const [showSpheres, setShowSpheres] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setPointsCount(100);
    setScale(1);
    setRotationSpeed(0.5);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Spiral Parameters">
        <ControlSlider
          label="Points Count"
          value={pointsCount}
          unit="pts"
          min={20}
          max={500}
          step={10}
          color="#fbbf24"
          onChange={setPointsCount}
          decimals={0}
        />
        <ControlSlider
          label="Scale"
          value={scale}
          unit=""
          min={0.5}
          max={2}
          step={0.1}
          color="#f59e0b"
          onChange={setScale}
          decimals={1}
        />
        <ControlSlider
          label="Rotation Speed"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#d97706"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Show Spheres</span>
          <input
            type="checkbox"
            checked={showSpheres}
            onChange={(e) => setShowSpheres(e.target.checked)}
            className="w-4 h-4 rounded accent-amber-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Show Lines</span>
          <input
            type="checkbox"
            checked={showLines}
            onChange={(e) => setShowLines(e.target.checked)}
            className="w-4 h-4 rounded accent-amber-500"
          />
        </label>
      </ControlGroup>

      <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Golden Ratio: φ = 1.618...</div>
        <div className="text-xs text-gray-500">
          Found throughout nature: shells, flowers, galaxies
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/fibonacci-spiral/details")}
        className="w-full py-2.5 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 font-medium text-sm rounded-lg transition-all border border-amber-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          angle: { value: (data.currentAngle * 180 / Math.PI) % 360, unit: "°", color: "#fbbf24", decimals: 0 },
          points: { value: data.pointsCount, unit: "seeds", color: "#f59e0b", decimals: 0 },
          goldenRatio: { value: data.goldenRatio, unit: "φ", color: "#d97706", decimals: 3 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-amber-400 text-sm">
          φ = (1 + √5) / 2 ≈ 1.618
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
        title="Fibonacci Spiral"
        description="Explore the golden ratio and Fibonacci sequence in 3D"
        cameraPosition={[20, 15, 20]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <FibonacciSpiralSceneComponent
          onDataChange={setData}
          pointsCount={pointsCount}
          scale={scale}
          showSpheres={showSpheres}
          showLines={showLines}
          rotationSpeed={rotationSpeed}
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

      <FloatingControlPanel
        title="⚙️ Spiral Parameters"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
