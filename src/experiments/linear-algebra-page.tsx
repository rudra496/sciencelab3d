"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinearAlgebraSceneComponent, LinearAlgebraData } from "@/experiments/linear-algebra-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function LinearAlgebraPage() {
  const router = useRouter();
  const [data, setData] = useState<LinearAlgebraData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [showBasis, setShowBasis] = useState(true);
  const [showTransform, setShowTransform] = useState(true);
  const [rotation, setRotation] = useState(0.5);
  const [scale, setScale] = useState(1);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setRotation(0.5);
    setScale(1);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Display Options">
        {[
          { label: "Show Basis Vectors", checked: showBasis, onChange: setShowBasis },
          { label: "Show Transform", checked: showTransform, onChange: setShowTransform },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-4 h-4 rounded accent-indigo-500" />
          </label>
        ))}
      </ControlGroup>

      <ControlGroup title="Transformation">
        <ControlSlider
          label="Rotation Speed"
          value={rotation}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#6366f1"
          onChange={setRotation}
          decimals={1}
        />
        <ControlSlider
          label="Scale"
          value={scale}
          unit=""
          min={0.5}
          max={2}
          step={0.1}
          color="#818cf8"
          onChange={setScale}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/linear-algebra/details")}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-700 font-medium text-sm rounded-lg transition-all border border-indigo-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          magnitude: { value: data.vectorMagnitude, unit: "||v||", color: "#fbbf24", decimals: 2 },
          dotProduct: { value: data.dotProduct, unit: "v·w", color: "#6366f1", decimals: 2 },
          angle: { value: data.angle, unit: "°", color: "#818cf8", decimals: 1 },
          determinant: { value: data.determinant ?? 1, unit: "det", color: "#22c55e", decimals: 2 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-indigo-400 text-sm">
          ||v|| = √(x² + y² + z²)
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
        title="Linear Algebra"
        description="Explore vectors, matrices, and transformations"
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <LinearAlgebraSceneComponent
          onDataChange={setData}
          showBasis={showBasis}
          showTransform={showTransform}
          rotation={rotation}
          scale={scale}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Vector Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
