"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FourierTransformSceneComponent, FourierTransformData } from "@/experiments/fourier-transform-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function FourierTransformPage() {
  const router = useRouter();
  const [data, setData] = useState<FourierTransformData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Parameters
  const [frequency, setFrequency] = useState(1);
  const [harmonicCount, setHarmonicCount] = useState(3);
  const [waveSpeed, setWaveSpeed] = useState(1);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setFrequency(1);
    setHarmonicCount(3);
    setWaveSpeed(1);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Wave Parameters">
        <ControlSlider
          label="Base Frequency"
          value={frequency}
          unit="Hz"
          min={0.5}
          max={3}
          step={0.1}
          color="#8b5cf6"
          onChange={setFrequency}
          decimals={1}
        />
        <ControlSlider
          label="Harmonics"
          value={harmonicCount}
          unit="n"
          min={1}
          max={10}
          step={1}
          color="#a78bfa"
          onChange={setHarmonicCount}
          decimals={0}
        />
        <ControlSlider
          label="Wave Speed"
          value={waveSpeed}
          unit=""
          min={0.1}
          max={3}
          step={0.1}
          color="#c4b5fd"
          onChange={setWaveSpeed}
          decimals={1}
        />
      </ControlGroup>

      <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Quick Presets</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setFrequency(1); setHarmonicCount(3); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Square Wave
          </button>
          <button
            onClick={() => { setFrequency(1); setHarmonicCount(5); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Triangle
          </button>
          <button
            onClick={() => { setFrequency(1.5); setHarmonicCount(7); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Sawtooth
          </button>
          <button
            onClick={() => { setFrequency(0.5); setHarmonicCount(2); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Simple
          </button>
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/fourier-transform/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
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
          amplitude: { value: Math.abs(data.currentAmplitude), unit: "units", color: "#8b5cf6", decimals: 2 },
          frequency: { value: data.frequency, unit: "Hz", color: "#a78bfa", decimals: 1 },
          harmonics: { value: data.harmonicCount, unit: "waves", color: "#c4b5fd", decimals: 0 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-purple-400 text-sm">
          f(x) = Σ(1/n)·sin(n·ω·x)
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
        title="Fourier Transform"
        description="Build complex waveforms by adding sine waves together"
        cameraPosition={[15, 10, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <FourierTransformSceneComponent
          onDataChange={setData}
          frequency={frequency}
          harmonicCount={harmonicCount}
          waveSpeed={waveSpeed}
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
        title="⚙️ Wave Parameters"
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
