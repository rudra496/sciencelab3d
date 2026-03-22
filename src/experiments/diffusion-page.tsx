'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import DiffusionSceneComponent, { DiffusionData } from './diffusion-scene';

export default function DiffusionPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [temperature, setTemperature] = useState(1);
  const [permeability, setPermeability] = useState(1);
  const [concentration, setConcentration] = useState(1);
  const [speed, setSpeed] = useState(1);

  const [diffusionData, setDiffusionData] = useState<DiffusionData>({
    highConcentration: 40,
    lowConcentration: 0,
    equilibrium: 0,
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

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Diffusion Factors">
          <ControlSlider
            label="Temperature"
            value={temperature}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setTemperature}
              />
          <ControlSlider
            label="Membrane Permeability"
            value={permeability}
            min={0.1}
            max={1}
            step={0.1}
            onChange={setPermeability}
              />
          <ControlSlider
            label="Initial Concentration"
            value={concentration}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setConcentration}
              />
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setSpeed}
              />
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/diffusion/details')}
          className="w-full mt-4 px-4 py-2 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg border border-[#6366f1]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [temperature, permeability, concentration, speed, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          left: { value: diffusionData.highConcentration, unit: "particles", color: "#6366f1", decimals: 0 },
          right: { value: diffusionData.lowConcentration, unit: "particles", color: "#8b5cf6", decimals: 0 },
          equilibrium: { value: diffusionData.equilibrium, unit: "%", color: "#06b6d4", decimals: 1 },
        }}
        columns={1}
      />
    ),
    [diffusionData]
  );

  const dataPanel = useMemo(
    () => (
      <DataPanel isVisible={showData} onToggle={() => setShowData((d) => !d)}>
        {dataContent}
      </DataPanel>
    ),
    [showData, dataContent]
  );

  return (
    <div className="w-full h-screen relative">
      <ExperimentContainer
        title="Molecular Diffusion"
        description="Observe particle movement across a semi-permeable membrane"
        cameraPosition={[0, 2, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
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
        timeElapsed={0}
      />

      {showControls && (
        <FloatingControlPanel
            initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 340 : 1260, y: 80 }}
        >
          {parameterControls}
        </FloatingControlPanel>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg border border-[#6366f1]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
