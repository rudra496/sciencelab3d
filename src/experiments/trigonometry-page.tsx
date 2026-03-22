"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrigonometrySceneComponent, TrigonometryData } from "@/experiments/trigonometry-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function TrigonometryPage() {
  const router = useRouter();
  const [data, setData] = useState<TrigonometryData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [angle, setAngle] = useState(45);
  const [showUnitCircle, setShowUnitCircle] = useState(true);
  const [showWave, setShowWave] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setAngle(45);
    setAnimationSpeed(1);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Angle">
        <ControlSlider
          label="Angle"
          value={angle}
          unit="°"
          min={0}
          max={360}
          step={1}
          color="#8b5cf6"
          onChange={setAngle}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Display">
        {[
          { label: "Unit Circle", checked: showUnitCircle, onChange: setShowUnitCircle },
          { label: "Sine Wave", checked: showWave, onChange: setShowWave },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-4 h-4 rounded accent-violet-500" />
          </label>
        ))}
        <ControlSlider
          label="Animation Speed"
          value={animationSpeed}
          unit=""
          min={0.1}
          max={2}
          step={0.1}
          color="#a78bfa"
          onChange={setAnimationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/trigonometry/details")}
        className="w-full py-2.5 bg-gradient-to-r from-violet-100 to-violet-200 hover:from-violet-200 hover:to-violet-300 text-violet-700 font-medium text-sm rounded-lg transition-all border border-violet-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          angle: { value: data.angle, unit: "°", color: "#8b5cf6", decimals: 0 },
          radians: { value: data.radianValue, unit: "rad", color: "#a78bfa", decimals: 2 },
          sin: { value: data.sin, unit: "sin", color: "#22c55e", decimals: 3 },
          cos: { value: data.cos, unit: "cos", color: "#3b82f6", decimals: 3 },
          tan: { value: Math.abs(data.tan) > 100 ? 0 : data.tan, unit: "tan", color: "#fbbf24", decimals: 3 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-violet-400 text-sm">
          sin²(θ) + cos²(θ) = 1
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
        title="Trigonometry"
        description="Explore the unit circle and trigonometric functions"
        cameraPosition={[8, 6, 8]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TrigonometrySceneComponent
          onDataChange={setData}
          angle={angle}
          showUnitCircle={showUnitCircle}
          showWave={showWave}
          animationSpeed={animationSpeed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Trig Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
