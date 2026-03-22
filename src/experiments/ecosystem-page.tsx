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
import EcosystemSceneComponent, { EcosystemData } from './ecosystem-scene';

export default function EcosystemPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [producerPop, setProducerPop] = useState(1);
  const [primaryPop, setPrimaryPop] = useState(1);
  const [secondaryPop, setSecondaryPop] = useState(1);
  const [speed, setSpeed] = useState(1);

  const [ecosystemData, setEcosystemData] = useState<EcosystemData>({
    primaryConsumers: 10,
    secondaryConsumers: 5,
    tertiaryConsumers: 2,
    energyFlow: 100,
    producerCount: 20,
    primaryCount: 10,
    secondaryCount: 5,
    tertiaryCount: 2,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setProducerPop(1);
    setPrimaryPop(1);
    setSecondaryPop(1);
    setSpeed(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: EcosystemData) => {
    setEcosystemData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Population Levels">
          <ControlSlider
            label="Producers"
            value={producerPop}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setProducerPop}
            color="#22c55e"
            decimals={1}
          />
          <ControlSlider
            label="Primary Consumers"
            value={primaryPop}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setPrimaryPop}
            color="#3b82f6"
            decimals={1}
          />
          <ControlSlider
            label="Secondary Consumers"
            value={secondaryPop}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setSecondaryPop}
            color="#f59e0b"
            decimals={1}
          />
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setSpeed}
            color="#14b8a6"
            decimals={1}
          />
        </ControlGroup>

        <div className="bg-teal-50/50 rounded-lg p-3 border border-teal-200/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">Ecosystem Info</div>
          <div className="text-xs text-gray-500">
            Energy flows from producers → consumers.<br />
            Only ~10% of energy transfers between trophic levels.
          </div>
        </div>

        <button
          onClick={() => router.push('/experiments/ecosystem/details')}
          className="w-full mt-4 px-4 py-2 bg-[#14b8a6]/20 hover:bg-[#14b8a6]/30 text-[#14b8a6] rounded-lg border border-[#14b8a6]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [producerPop, primaryPop, secondaryPop, speed, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          producers: { value: ecosystemData.producerCount, unit: "plants", color: "#22c55e", decimals: 0 },
          primary: { value: ecosystemData.primaryCount, unit: "herbivores", color: "#3b82f6", decimals: 0 },
          secondary: { value: ecosystemData.secondaryCount, unit: "carnivores", color: "#f59e0b", decimals: 0 },
          tertiary: { value: ecosystemData.tertiaryCount, unit: "apex", color: "#ef4444", decimals: 0 },
        }}
        columns={2}
      />
    ),
    [ecosystemData]
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
        title="Ecosystem Food Web"
        description="Explore food webs, energy flow, and Lotka-Volterra population dynamics"
        cameraPosition={[0, 5, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <EcosystemSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          producerPop={producerPop}
          primaryPop={primaryPop}
          secondaryPop={secondaryPop}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#14b8a6]/20 hover:bg-[#14b8a6]/30 text-[#14b8a6] rounded-lg border border-[#14b8a6]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
