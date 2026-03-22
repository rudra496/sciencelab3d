"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PeriodicTrendsSceneComponent, PeriodicTrendsData } from "@/experiments/periodic-trends-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const TRENDS = ["atomicRadius", "electronegativity", "ionization"] as const;

export default function PeriodicTrendsPage() {
  const router = useRouter();
  const [data, setData] = useState<PeriodicTrendsData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [trendType, setTrendType] = useState<typeof TRENDS[number]>("atomicRadius");
  const [view3D, setView3D] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setTrendType("atomicRadius");
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Trend Type">
        <div className="grid grid-cols-1 gap-2">
          {TRENDS.map((trend) => (
            <button
              key={trend}
              onClick={() => setTrendType(trend)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                trendType === trend
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {trend === "atomicRadius" && "Atomic Radius"}
              {trend === "electronegativity" && "Electronegativity"}
              {trend === "ionization" && "Ionization Energy"}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Display">
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>3D View</span>
          <input type="checkbox" checked={view3D} onChange={(e) => setView3D(e.target.checked)} className="w-4 h-4 rounded accent-cyan-500" />
        </label>
        <ControlSlider
          label="Rotation Speed"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#06b6d4"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/periodic-trends/details")}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300 text-cyan-700 font-medium text-sm rounded-lg transition-all border border-cyan-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          element: { value: 0, unit: data.selectedElement, color: "#06b6d4", decimals: 0 },
          atomicNumber: { value: data.atomicNumber, unit: "Z", color: "#0891b2", decimals: 0 },
          atomicMass: { value: data.atomicMass, unit: "amu", color: "#0e7490", decimals: 2 },
          trendValue: { value: data.trendValue, unit: "", color: "#22d3ee", decimals: 2 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Trend</div>
        <div className="text-cyan-400 text-sm font-medium">{data.trendName}</div>
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
        title="Periodic Trends"
        description="Interactive 3D periodic table with trend visualizations"
        cameraPosition={[15, 12, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <PeriodicTrendsSceneComponent
          onDataChange={setData}
          trendType={trendType}
          view3D={view3D}
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
        title="⚙️ Periodic Table Settings"
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
