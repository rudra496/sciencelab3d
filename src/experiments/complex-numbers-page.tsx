"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComplexNumbersSceneComponent, ComplexNumbersData } from "@/experiments/complex-numbers-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ComplexNumbersPage() {
  const router = useRouter();
  const [data, setData] = useState<ComplexNumbersData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [real, setReal] = useState(2);
  const [imaginary, setImaginary] = useState(1.5);
  const [showPlane, setShowPlane] = useState(true);
  const [showPolar, setShowPolar] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setReal(2);
    setImaginary(1.5);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Complex Number">
        <ControlSlider
          label="Real Part"
          value={real}
          unit=""
          min={-4}
          max={4}
          step={0.1}
          color="#3b82f6"
          onChange={setReal}
          decimals={1}
        />
        <ControlSlider
          label="Imaginary Part"
          value={imaginary}
          unit="i"
          min={-4}
          max={4}
          step={0.1}
          color="#ef4444"
          onChange={setImaginary}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Display">
        {[
          { label: "Show Plane", checked: showPlane, onChange: setShowPlane },
          { label: "Polar Form", checked: showPolar, onChange: setShowPolar },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-4 h-4 rounded accent-rose-500" />
          </label>
        ))}
        <ControlSlider
          label="Rotation Speed"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#fbbf24"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/complex-numbers/details")}
        className="w-full py-2.5 bg-gradient-to-r from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 text-rose-700 font-medium text-sm rounded-lg transition-all border border-rose-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          real: { value: data.real, unit: "Re", color: "#3b82f6", decimals: 2 },
          imaginary: { value: data.imaginary, unit: "Im", color: "#ef4444", decimals: 2 },
          magnitude: { value: data.magnitude, unit: "|z|", color: "#fbbf24", decimals: 2 },
          argument: { value: data.argument, unit: "°", color: "#a855f7", decimals: 1 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-rose-400 text-sm">
          z = {data.real.toFixed(2)} + {data.imaginary.toFixed(2)}i
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
        title="Complex Numbers"
        description="Explore the Argand plane and complex arithmetic"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ComplexNumbersSceneComponent
          onDataChange={setData}
          real={real}
          imaginary={imaginary}
          showPlane={showPlane}
          showPolar={showPolar}
          rotationSpeed={rotationSpeed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Complex Settings" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
