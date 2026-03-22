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
import NaturalSelectionSceneComponent, { NaturalSelectionData } from './natural-selection-scene';

export default function NaturalSelectionPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [mutationRate, setMutationRate] = useState(0.1);
  const [selectionPressure, setSelectionPressure] = useState(0.5);
  const [speed, setSpeed] = useState(1);

  const [selectionData, setSelectionData] = useState<NaturalSelectionData>({
    populationSize: 30,
    avgFitness: 50,
    generation: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setMutationRate(0.1);
    setSelectionPressure(0.5);
    setSpeed(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: NaturalSelectionData) => {
    setSelectionData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Evolution Parameters">
          <ControlSlider
            label="Mutation Rate"
            value={mutationRate}
            min={0}
            max={0.5}
            step={0.05}
            onChange={setMutationRate}
              />
          <ControlSlider
            label="Selection Pressure"
            value={selectionPressure}
            min={0}
            max={1}
            step={0.1}
            onChange={setSelectionPressure}
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
          onClick={() => router.push('/experiments/natural-selection/details')}
          className="w-full mt-4 px-4 py-2 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded-lg border border-[#10b981]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [mutationRate, selectionPressure, speed, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          generation: { value: selectionData.generation, unit: "gen", color: "#10b981", decimals: 0 },
          population: { value: selectionData.populationSize, unit: "individuals", color: "#34d399", decimals: 0 },
          avgFitness: { value: selectionData.avgFitness, unit: "%", color: "#6ee7b7", decimals: 1 },
        }}
        columns={1}
      />
    ),
    [selectionData]
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
        title="Natural Selection Simulator"
        description="Watch evolution in action - population adaptation over generations"
        cameraPosition={[0, 2, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <NaturalSelectionSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          mutationRate={mutationRate}
          selectionPressure={selectionPressure}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded-lg border border-[#10b981]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
