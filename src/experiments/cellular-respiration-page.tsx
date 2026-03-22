'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import CellularRespirationSceneComponent, { CellularRespirationData } from './cellular-respiration-scene';

export default function CellularRespirationPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [stage, setStage] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  const [respirationData, setRespirationData] = useState<CellularRespirationData>({
    stage: 'Glycolysis',
    atpProduced: 0,
    glucoseRemaining: 100,
    co2Produced: 0,
    nadhCount: 0,
    description: 'Glucose splits into 2 pyruvate molecules in the cytoplasm.',
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
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
        <ControlGroup title="Stages">
          {['Glycolysis', 'Krebs Cycle', 'Electron Transport Chain'].map((s, i) => (
            <button
              key={s}
              onClick={() => setStage(i)}
              className={`w-full px-3 py-2 rounded text-sm transition-colors mb-2 ${
                stage === i
                  ? 'bg-[#ef4444] text-white font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </ControlGroup>

        <ControlGroup title="Display">
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Show Labels
          </label>
        </ControlGroup>

        <ControlGroup title="Stage Breakdown">
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Glycolysis:</span>
              <span className="text-blue-400">2 ATP</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Krebs Cycle:</span>
              <span className="text-orange-400">2 ATP</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>ETC:</span>
              <span className="text-cyan-400">34 ATP</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between text-gray-300 font-bold">
              <span>Total:</span>
              <span className="text-green-400">38 ATP</span>
            </div>
          </div>
        </ControlGroup>
      </>
    ),
    [stage, showLabels]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          stage: { value: 0, unit: respirationData.stage, color: '#ef4444', decimals: 0 },
          atpProduced: { value: respirationData.atpProduced, unit: '/38', color: '#22c55e', decimals: 0 },
          glucose: { value: respirationData.glucoseRemaining, unit: '%', color: '#3b82f6', decimals: 0 },
          co2: { value: respirationData.co2Produced, unit: 'molecules', color: '#6b7280', decimals: 0 },
          nadh: { value: respirationData.nadhCount, unit: 'NADH', color: '#f59e0b', decimals: 0 },
        }}
        columns={2}
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
        description="ATP production: Glycolysis → Krebs Cycle → Electron Transport Chain"
        cameraPosition={[0, 0, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
        simulationBar={{
          isPlaying,
          onPlayPause: handlePlayPause,
          onReset: handleReset,
          speed: simulationSpeed,
          onSpeedChange: handleSpeedChange,
        }}
      >
        <CellularRespirationSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          stage={stage}
          showLabels={showLabels}
        />
      </ExperimentContainer>

      {showControls && (
        <FloatingControlPanel initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 340 : 1260, y: 80 }}>
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
