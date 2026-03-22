'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import EcosystemSceneComponent, { EcosystemData } from './ecosystem-scene';

export default function EcosystemPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [initialProducerPop, setInitialProducerPop] = useState(30);
  const [initialPrimaryPop, setInitialPrimaryPop] = useState(15);
  const [initialSecondaryPop, setInitialSecondaryPop] = useState(6);
  const [initialApexPop, setInitialApexPop] = useState(2);
  const [reproductionRate, setReproductionRate] = useState(0.5);
  const [predationRate, setPredationRate] = useState(0.3);
  const [speed, setSpeed] = useState(1);

  const [ecosystemData, setEcosystemData] = useState<EcosystemData>({
    producerCount: 30,
    primaryCount: 15,
    secondaryCount: 6,
    apexCount: 2,
    totalEnergy: 1000,
    generation: 0,
    biodiversityIndex: 1.5,
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

  const handleDataChange = useCallback((data: EcosystemData) => {
    setEcosystemData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Initial Populations">
          <ControlSlider
            label="Producers"
            value={initialProducerPop}
            min={10}
            max={60}
            step={5}
            onChange={setInitialProducerPop}
            color="#22c55e"
            decimals={0}
          />
          <ControlSlider
            label="Primary (Herbivores)"
            value={initialPrimaryPop}
            min={5}
            max={30}
            step={2}
            onChange={setInitialPrimaryPop}
            color="#3b82f6"
            decimals={0}
          />
          <ControlSlider
            label="Secondary (Predators)"
            value={initialSecondaryPop}
            min={2}
            max={15}
            step={1}
            onChange={setInitialSecondaryPop}
            color="#f59e0b"
            decimals={0}
          />
          <ControlSlider
            label="Apex Predators"
            value={initialApexPop}
            min={1}
            max={5}
            step={1}
            onChange={setInitialApexPop}
            color="#ef4444"
            decimals={0}
          />
        </ControlGroup>

        <ControlGroup title="Dynamics">
          <ControlSlider
            label="Reproduction Rate"
            value={reproductionRate}
            min={0.1}
            max={1}
            step={0.1}
            onChange={setReproductionRate}
            color="#14b8a6"
            decimals={1}
          />
          <ControlSlider
            label="Predation Rate"
            value={predationRate}
            min={0.1}
            max={0.8}
            step={0.05}
            onChange={setPredationRate}
            color="#f97316"
            decimals={2}
          />
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setSpeed}
            color="#a855f7"
            decimals={1}
          />
        </ControlGroup>

        <div className="bg-teal-50/50 rounded-lg p-3 border border-teal-200/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">Ecosystem Dynamics</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• ~90% energy lost at each level</div>
            <div>• Lotka-Volterra cycles emerge</div>
            <div>• Balance of predator/prey</div>
            <div>• Biodiversity indicates stability</div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full mt-4 px-4 py-2 bg-[#14b8a6]/20 hover:bg-[#14b8a6]/30 text-[#14b8a6] rounded-lg border border-[#14b8a6]/50 transition-colors text-sm font-medium"
        >
          Reset Simulation
        </button>
      </>
    ),
    [initialProducerPop, initialPrimaryPop, initialSecondaryPop, initialApexPop, reproductionRate, predationRate, speed, handleReset]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          producers: { value: ecosystemData.producerCount, unit: "plants", color: "#22c55e", decimals: 0 },
          primary: { value: ecosystemData.primaryCount, unit: "herbivores", color: "#3b82f6", decimals: 0 },
          secondary: { value: ecosystemData.secondaryCount, unit: "predators", color: "#f59e0b", decimals: 0 },
          apex: { value: ecosystemData.apexCount, unit: "apex", color: "#ef4444", decimals: 0 },
          energy: { value: ecosystemData.totalEnergy, unit: "units", color: "#fbbf24", decimals: 0 },
          biodiversity: { value: ecosystemData.biodiversityIndex, unit: "index", color: "#a855f7", decimals: 2 },
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
        description="Explore trophic levels, energy flow (10% rule), and Lotka-Volterra population dynamics"
        cameraPosition={[0, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <EcosystemSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          initialProducerPop={initialProducerPop}
          initialPrimaryPop={initialPrimaryPop}
          initialSecondaryPop={initialSecondaryPop}
          initialApexPop={initialApexPop}
          reproductionRate={reproductionRate}
          predationRate={predationRate}
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
