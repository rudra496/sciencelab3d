"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopologySceneComponent, TopologyData } from "@/experiments/topology-surfaces-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const SURFACES = ["mobius", "klein", "torus"] as const;

export default function TopologySurfacesPage() {
  const router = useRouter();
  const [data, setData] = useState<TopologyData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [surfaceType, setSurfaceType] = useState<typeof SURFACES[number]>("torus");
  const [resolution, setResolution] = useState(32);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setResolution(32);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Surface Type">
        <div className="grid grid-cols-3 gap-2">
          {SURFACES.map((surface) => (
            <button
              key={surface}
              onClick={() => setSurfaceType(surface)}
              className={`py-2 px-3 text-sm rounded-lg transition-all capitalize ${
                surfaceType === surface
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {surface}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Parameters">
        <ControlSlider
          label="Resolution"
          value={resolution}
          unit=""
          min={16}
          max={64}
          step={4}
          color="#ec4899"
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
          color="#f472b6"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/topology-surfaces/details")}
        className="w-full py-2.5 bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 text-pink-700 font-medium text-sm rounded-lg transition-all border border-pink-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          surface: { value: 0, unit: data.surfaceType, color: "#ec4899", decimals: 0 },
          genus: { value: data.genus, unit: "holes", color: "#f472b6", decimals: 0 },
          euler: { value: data.eulerCharacteristic, unit: "χ", color: "#fb7185", decimals: 0 },
          boundary: { value: data.boundaryComponents, unit: "∂", color: "#fda4af", decimals: 0 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-pink-400 text-sm">
          χ = V - E + F = 2 - 2g (orientable)
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
        title="Topology Surfaces"
        description="Explore Mobius strip, Klein bottle, and torus"
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TopologySceneComponent
          onDataChange={setData}
          surfaceType={surfaceType}
          resolution={resolution}
          rotationSpeed={rotationSpeed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Surface Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
