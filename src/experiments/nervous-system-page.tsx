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
import NervousSystemSceneComponent, { NervousSystemData } from './nervous-system-scene';

export default function NervousSystemPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [stimulus, setStimulus] = useState(1);
  const [myelin, setMyelin] = useState(true);
  const [speed, setSpeed] = useState(1);

  const [nervousData, setNervousData] = useState<NervousSystemData>({
    membranePotential: -70,
    signalSpeed: 120,
    impulseCount: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setStimulus(1);
    setMyelin(true);
    setSpeed(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: NervousSystemData) => {
    setNervousData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Neuron Properties">
          <ControlSlider
            label="Stimulus Intensity"
            value={stimulus}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setStimulus}
              />
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setSpeed}
              />
          <label className="flex items-center gap-2 text-sm mt-3">
            <input
              type="checkbox"
              checked={myelin}
              onChange={(e) => setMyelin(e.target.checked)}
              className="w-4 h-4 accent-[#ec4899]"
            />
            <span className="text-gray-300">Myelin Sheath</span>
          </label>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/nervous-system/details')}
          className="w-full mt-4 px-4 py-2 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899] rounded-lg border border-[#ec4899]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [stimulus, myelin, speed, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          membranePotential: { value: nervousData.membranePotential, unit: "mV", color: "#ec4899", decimals: 0 },
          signalSpeed: { value: nervousData.signalSpeed, unit: "m/s", color: "#f472b6", decimals: 0 },
          impulses: { value: nervousData.impulseCount, unit: "signals", color: "#fb7185", decimals: 0 },
        }}
        columns={1}
      />
    ),
    [nervousData]
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
        title="Neuron & Synapse"
        description="Visualize action potentials traveling along a neuron"
        cameraPosition={[0, 5, 25]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <NervousSystemSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          stimulus={stimulus}
          myelin={myelin}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899] rounded-lg border border-[#ec4899]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
