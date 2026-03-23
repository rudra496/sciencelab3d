"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TrigonometrySceneComponent, { TrigonometryData } from "@/experiments/trigonometry-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
  ControlCheckbox,
} from "@/components/experiment-ui";

export default function TrigonometryPage() {
  const router = useRouter();
  const [data, setData] = useState<TrigonometryData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [angle, setAngle] = useState(45);
  const [useRadians, setUseRadians] = useState(false);
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [showTan, setShowTan] = useState(true);
  const [showCot, setShowCot] = useState(false);
  const [showSec, setShowSec] = useState(false);
  const [showCsc, setShowCsc] = useState(false);
  const [showWaves, setShowWaves] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setAngle(45);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Angle Control">
        <ControlSlider
          label={useRadians ? "Angle (rad)" : "Angle (deg)"}
          value={angle}
          unit={useRadians ? "rad" : "°"}
          min={0}
          max={useRadians ? 6.28 : 360}
          step={useRadians ? 0.1 : 1}
          color="#8b5cf6"
          onChange={setAngle}
          decimals={useRadians ? 2 : 0}
        />
      </ControlGroup>

      <ControlGroup title="Display Options">
        <ControlCheckbox label="Use Radians" checked={useRadians} onChange={setUseRadians} color="#8b5cf6" />
        <ControlCheckbox label="Show Sin" checked={showSin} onChange={setShowSin} color="#3b82f6" />
        <ControlCheckbox label="Show Cos" checked={showCos} onChange={setShowCos} color="#22c55e" />
        <ControlCheckbox label="Show Tan" checked={showTan} onChange={setShowTan} color="#ef4444" />
        <ControlCheckbox label="Show Cot" checked={showCot} onChange={setShowCot} color="#f97316" />
        <ControlCheckbox label="Show Sec" checked={showSec} onChange={setShowSec} color="#a855f7" />
        <ControlCheckbox label="Show Csc" checked={showCsc} onChange={setShowCsc} color="#ec4899" />
        <ControlCheckbox label="Show Graph" checked={showWaves} onChange={setShowWaves} color="#06b6d4" />
      </ControlGroup>

      <div className="bg-violet-50/50 rounded-lg p-3 border border-violet-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Trigonometric Relationships</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>• sin²(θ) + cos²(θ) = 1</div>
          <div>• tan(θ) = sin(θ) / cos(θ)</div>
          <div>• Click and drag to rotate view</div>
          <div>• Animation shows wave tracing</div>
        </div>
      </div>

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
          angle: {
            value: useRadians ? data.radians : data.angle,
            unit: useRadians ? "rad" : "deg",
            color: "#8b5cf6",
            decimals: useRadians ? 3 : 0,
          },
          sin: { value: data.sin, unit: "", color: "#22c55e", decimals: 4 },
          cos: { value: data.cos, unit: "", color: "#3b82f6", decimals: 4 },
          tan: {
            value: Math.abs(data.tan) > 100 ? 0 : data.tan,
            unit: "",
            color: "#ef4444",
            decimals: 4,
          },
        }}
        columns={2}
      />

      <div className="mt-3 space-y-2">
        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400">Quadrant</div>
          <div className="text-sm font-bold text-violet-400">{data.quadrant}</div>
        </div>

        {data.exactValue && (
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400">Special Angle</div>
            <div className="text-xs font-mono text-green-400">{data.exactValue}</div>
            <div className="mt-1 text-xs text-gray-400">sin: {data.sinValue}</div>
            <div className="text-xs text-gray-400">cos: {data.cosValue}</div>
            <div className="text-xs text-gray-400">tan: {data.tanValue}</div>
          </div>
        )}

        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-center font-mono text-violet-400 text-sm">
            sin²(θ) + cos²(θ) = 1
          </div>
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
        title="Trigonometry Explorer"
        description="Interactive 3D unit circle with all 6 trig functions, real-time graphing, and special angles reference"
        cameraPosition={[0, 0, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TrigonometrySceneComponent
          onDataChange={setData}
          angle={angle}
          useRadians={useRadians}
          showSin={showSin}
          showCos={showCos}
          showTan={showTan}
          showCot={showCot}
          showSec={showSec}
          showCsc={showCsc}
          showGraph={showWaves}
          animationSpeed={simulationSpeed}
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

      <FloatingControlPanel title="📐 Trig Controls" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
