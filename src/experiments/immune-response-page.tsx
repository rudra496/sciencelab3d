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
import ImmuneResponseSceneComponent, { ImmuneResponseData } from './immune-response-scene';

export default function ImmuneResponsePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [virusLevel, setVirusLevel] = useState(1);
  const [antibodyRate, setAntibodyRate] = useState(1);
  const [speed, setSpeed] = useState(1);

  const [immuneData, setImmuneData] = useState<ImmuneResponseData>({
    virusCount: 10,
    antibodyCount: 0,
    tCellCount: 2,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setVirusLevel(1);
    setAntibodyRate(1);
    setSpeed(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: ImmuneResponseData) => {
    setImmuneData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Infection Control">
          <ControlSlider
            label="Virus Level"
            value={virusLevel}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setVirusLevel}
              />
          <ControlSlider
            label="Antibody Rate"
            value={antibodyRate}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setAntibodyRate}
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
          onClick={() => router.push('/experiments/immune-response/details')}
          className="w-full mt-4 px-4 py-2 bg-[#f97316]/20 hover:bg-[#f97316]/30 text-[#f97316] rounded-lg border border-[#f97316]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [virusLevel, antibodyRate, speed, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          viruses: { value: immuneData.virusCount, unit: "particles", color: "#ef4444", decimals: 0 },
          antibodies: { value: immuneData.antibodyCount, unit: "proteins", color: "#3b82f6", decimals: 0 },
          tCells: { value: immuneData.tCellCount, unit: "cells", color: "#f97316", decimals: 0 },
        }}
        columns={1}
      />
    ),
    [immuneData]
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
        title="Immune System Response"
        description="Watch immune cells fight viral infection"
        cameraPosition={[0, 5, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <ImmuneResponseSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          virusLevel={virusLevel}
          antibodyRate={antibodyRate}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#f97316]/20 hover:bg-[#f97316]/30 text-[#f97316] rounded-lg border border-[#f97316]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
