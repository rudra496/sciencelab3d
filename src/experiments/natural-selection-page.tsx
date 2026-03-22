'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import NaturalSelectionSceneComponent, { NaturalSelectionData } from './natural-selection-scene';

export default function NaturalSelectionPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [mutationRate, setMutationRate] = useState(0.15);
  const [predatorSpeed, setPredatorSpeed] = useState(1);
  const [initialPopulation, setInitialPopulation] = useState(40);
  const [generationSpeed, setGenerationSpeed] = useState(1);

  const [selectionData, setSelectionData] = useState<NaturalSelectionData>({
    generation: 0,
    populationCount: 40,
    percentGreen: 50,
    percentRed: 50,
    averageSize: 0.6,
    percentSurviving: 100,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
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
            color="#22c55e"
            decimals={2}
          />
          <ControlSlider
            label="Predator Speed"
            value={predatorSpeed}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setPredatorSpeed}
            color="#ef4444"
            decimals={1}
          />
          <ControlSlider
            label="Initial Population"
            value={initialPopulation}
            min={20}
            max={80}
            step={5}
            onChange={setInitialPopulation}
            color="#3b82f6"
            decimals={0}
          />
          <ControlSlider
            label="Generation Speed"
            value={generationSpeed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setGenerationSpeed}
            color="#fbbf24"
            decimals={1}
          />
        </ControlGroup>

        <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">Natural Selection Info</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Green organisms are camouflaged in grass</div>
            <div>• Red organisms are visible to predators</div>
            <div>• Smaller organisms move faster</div>
            <div>• Survivors reproduce with mutations</div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full mt-4 px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-lg border border-[#22c55e]/50 transition-colors text-sm font-medium"
        >
          Reset Simulation
        </button>
      </>
    ),
    [mutationRate, predatorSpeed, initialPopulation, generationSpeed, handleReset]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          generation: { value: selectionData.generation, unit: "gen", color: "#22c55e", decimals: 0 },
          population: { value: selectionData.populationCount, unit: "organisms", color: "#34d399", decimals: 0 },
          green: { value: selectionData.percentGreen, unit: "camouflaged", color: "#22c55e", decimals: 0 },
          red: { value: selectionData.percentRed, unit: "visible", color: "#ef4444", decimals: 0 },
          avgSize: { value: selectionData.averageSize, unit: "size", color: "#3b82f6", decimals: 2 },
          surviving: { value: selectionData.percentSurviving, unit: "%", color: "#fbbf24", decimals: 0 },
        }}
        columns={2}
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
        title="Natural Selection"
        description="Watch evolution in action: camouflaged organisms survive predators and pass on their traits"
        cameraPosition={[0, 8, 12]}
        backgroundColor="#0a0a0f"
        controls={null}
        dataPanel={dataPanel}
      >
        <NaturalSelectionSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          mutationRate={mutationRate}
          predatorSpeed={predatorSpeed}
          initialPopulation={initialPopulation}
          generationSpeed={generationSpeed}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] rounded-lg border border-[#22c55e]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
