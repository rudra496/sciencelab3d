'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
} from '@/components/experiment-ui';
import DiffusionSceneComponent, { DiffusionData } from './diffusion-scene';

export default function DiffusionPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [temperature, setTemperature] = useState(1);
  const [permeability, setPermeability] = useState(1);
  const [concentration, setConcentration] = useState(1);
  const [speed, setSpeed] = useState(1);

  const [diffusionData, setDiffusionData] = useState<DiffusionData>({
    highConcentration: 40,
    lowConcentration: 0,
    equilibrium: 0,
    averageSpeed: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setTemperature(1);
    setPermeability(1);
    setConcentration(1);
    setSpeed(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: DiffusionData) => {
    setDiffusionData(data);
  }, []);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Diffusion Factors">
        <ControlSlider
          label="Temperature"
          value={temperature}
          unit=""
          min={0.5}
          max={3}
          step={0.1}
          color="#f59e0b"
          onChange={setTemperature}
          decimals={1}
        />
        <ControlSlider
          label="Membrane Permeability"
          value={permeability}
          unit=""
          min={0.1}
          max={1}
          step={0.1}
          color="#6366f1"
          onChange={setPermeability}
          decimals={1}
        />
        <ControlSlider
          label="Initial Concentration"
          value={concentration}
          unit=""
          min={0.5}
          max={2}
          step={0.1}
          color="#a855f7"
          onChange={setConcentration}
          decimals={1}
        />
        <ControlSlider
          label="Speed"
          value={speed}
          unit=""
          min={0.5}
          max={3}
          step={0.1}
          color="#22c55e"
          onChange={setSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push('/experiments/diffusion/details')}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-700 font-medium text-sm rounded-lg transition-all border border-indigo-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = diffusionData ? (
    <>
      <DataGrid
        data={{
          left: { value: diffusionData.highConcentration, unit: "particles", color: "#6366f1", decimals: 0 },
          right: { value: diffusionData.lowConcentration, unit: "particles", color: "#a855f7", decimals: 0 },
          equilibrium: { value: diffusionData.equilibrium, unit: "%", color: "#06b6d4", decimals: 1 },
          avgSpeed: { value: diffusionData.averageSpeed, unit: "units/s", color: "#f59e0b", decimals: 2 },
        }}
        columns={1}
      />
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Molecular Diffusion"
        description="Observe particle movement across a semi-permeable membrane"
        cameraPosition={[0, 2, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <DiffusionSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          temperature={temperature}
          permeability={permeability}
          concentration={concentration}
          speed={speed}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
      />

      <FloatingControlPanel
        title="⚙️ Diffusion Parameters"
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
