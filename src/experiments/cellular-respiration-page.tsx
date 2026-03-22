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
import CellularRespirationSceneComponent, { CellularRespirationData } from './cellular-respiration-scene';

export default function CellularRespirationPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [glucoseLevel, setGlucoseLevel] = useState(1);
  const [oxygenLevel, setOxygenLevel] = useState(1);
  const [stage, setStage] = useState(0);

  const [respirationData, setRespirationData] = useState<CellularRespirationData>({
    atpProduced: 0,
    stage: 'Glycolysis',
    efficiency: 100,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setGlucoseLevel(1);
    setOxygenLevel(1);
    setStage(0);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  const handleDataChange = useCallback((data: CellularRespirationData) => {
    setRespirationData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Inputs">
          <ControlSlider
            label="Glucose"
            value={glucoseLevel}
            min={0}
            max={2}
            step={0.1}
            onChange={setGlucoseLevel}
              />
          <ControlSlider
            label="Oxygen"
            value={oxygenLevel}
            min={0}
            max={2}
            step={0.1}
            onChange={setOxygenLevel}
              />
        </ControlGroup>

        <ControlGroup title="Stage">
          {['Glycolysis', 'Krebs Cycle', 'ETC'].map((s, i) => (
            <button
              key={s}
              onClick={() => setStage(i)}
              className={`w-full px-3 py-2 rounded text-sm transition-colors mb-2 ${
                stage === i
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/cellular-respiration/details')}
          className="w-full mt-4 px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded-lg border border-[#ef4444]/50 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </>
    ),
    [glucoseLevel, oxygenLevel, stage, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          stage: { value: 0, unit: respirationData.stage, color: "#ef4444", decimals: 0 },
          atpProduced: { value: respirationData.atpProduced, unit: "/38", color: "#f97316", decimals: 0 },
          efficiency: { value: respirationData.efficiency, unit: "%", color: "#22c55e", decimals: 0 },
        }}
        columns={1}
      />
    ),
    [respirationData]
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
        title="Cellular Respiration"
        description="Explore ATP production in mitochondria"
        cameraPosition={[0, 0, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <CellularRespirationSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          glucoseLevel={glucoseLevel}
          oxygenLevel={oxygenLevel}
          stage={stage}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded-lg border border-[#ef4444]/50 transition-colors text-sm font-medium"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
