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
              />
          <ControlSlider
            label="Primary Consumers"
            value={primaryPop}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setPrimaryPop}
              />
          <ControlSlider
            label="Secondary Consumers"
            value={secondaryPop}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setSecondaryPop}
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
          primary: { value: ecosystemData.primaryConsumers, unit: "consumers", color: "#14b8a6", decimals: 0 },
          secondary: { value: ecosystemData.secondaryConsumers, unit: "consumers", color: "#22c55e", decimals: 0 },
          tertiary: { value: ecosystemData.tertiaryConsumers, unit: "consumers", color: "#eab308", decimals: 0 },
          energyFlow: { value: ecosystemData.energyFlow, unit: "%", color: "#f97316", decimals: 0 },
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
        description="Explore food webs and energy flow through trophic levels"
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
