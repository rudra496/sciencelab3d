'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
} from '@/components/experiment-ui';
import ThermochemistrySceneComponent, { ThermochemistryData } from './thermochemistry-scene';

export default function ThermochemistryPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [activationEnergy, setActivationEnergy] = useState(50);
  const [energyReleased, setEnergyReleased] = useState(40);
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const [data, setData] = useState<ThermochemistryData>({
    exothermicTemp: 298,
    endothermicTemp: 298,
    exothermicEnergy: 80,
    endothermicEnergy: 80,
    progress: 0,
    currentStep: 1,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((n) => n + 1);
    setProgress(0);
    setCurrentStep(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleProgressChange = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleDataChange = useCallback((newData: ThermochemistryData) => {
    setData(newData);
  }, []);

  const handleStartReaction = useCallback(() => {
    if (stepMode && currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  }, [stepMode, currentStep]);

  const parameterControls = (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-3 border border-red-200/50">
        <div className="text-sm font-semibold text-gray-800 mb-1">Side-by-Side Comparison</div>
        <div className="text-xs text-gray-600">
          Comparing exothermic (releases heat) and endothermic (absorbs heat) reactions simultaneously
        </div>
      </div>

      <ControlGroup title="Energy Parameters">
        <ControlSlider
          label="Activation Energy"
          value={activationEnergy}
          unit="kJ/mol"
          min={10}
          max={100}
          step={5}
          color="#f59e0b"
          onChange={setActivationEnergy}
          decimals={0}
        />
        <ControlSlider
          label="Energy Change"
          value={energyReleased}
          unit="kJ/mol"
          min={10}
          max={80}
          step={5}
          color="#8b5cf6"
          onChange={setEnergyReleased}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Mode">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setStepMode(false); setCurrentStep(1); setProgress(0); }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              !stepMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => { setStepMode(true); setCurrentStep(1); setProgress(0); }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              stepMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            Step
          </button>
        </div>
      </ControlGroup>

      {stepMode && (
        <button
          onClick={handleStartReaction}
          disabled={currentStep >= 5}
          className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {currentStep >= 5 ? '✓ Complete' : `Step ${currentStep}/5 - Next`}
        </button>
      )}

      <button
        onClick={() => router.push('/experiments/thermochemistry/details')}
        className="w-full py-2.5 bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-700 font-medium text-sm rounded-lg transition-all border border-orange-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const stepNames = [
    'Reactants',
    'Activation Energy',
    'Transition State',
    'Products Formed',
    'Energy Transferred',
  ];

  const dataPanelContent = (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-red-900/30 rounded-lg p-2 border border-red-500/30">
          <div className="text-xs text-red-400 mb-1">Exothermic</div>
          <div className="text-sm font-bold text-red-300">{data.exothermicTemp.toFixed(0)} K</div>
          <div className="text-xs text-gray-400">-{energyReleased} kJ/mol</div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30">
          <div className="text-xs text-blue-400 mb-1">Endothermic</div>
          <div className="text-sm font-bold text-blue-300">{data.endothermicTemp.toFixed(0)} K</div>
          <div className="text-xs text-gray-400">+{energyReleased} kJ/mol</div>
        </div>
      </div>

      <DataGrid
        data={{
          exoTemp: { value: data.exothermicTemp, unit: 'K (exo)', color: '#ef4444', decimals: 0 },
          endoTemp: { value: data.endothermicTemp, unit: 'K (endo)', color: '#3b82f6', decimals: 0 },
          exoEnergy: { value: data.exothermicEnergy, unit: 'kJ (exo)', color: '#f59e0b', decimals: 0 },
          endoEnergy: { value: data.endothermicEnergy, unit: 'kJ (endo)', color: '#8b5cf6', decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Progress:</span>
          <span className="font-mono text-purple-400">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Step:</span>
          <span className="font-mono text-orange-400 text-sm">
            {stepMode ? `${currentStep}/5` : 'Auto'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className="font-mono text-green-400 text-sm">
            {stepNames[currentStep - 1] || stepNames[Math.floor(progress * 4.9)]}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Thermochemistry"
        description="Compare energy changes in exothermic and endothermic reactions"
        cameraPosition={[8, 6, 8]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ThermochemistrySceneComponent
          onDataChange={handleDataChange}
          onProgressChange={handleProgressChange}
          activationEnergy={activationEnergy}
          energyReleased={energyReleased}
          isPlaying={isPlaying}
          stepMode={stepMode}
          currentStep={currentStep}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
      />

      <FloatingControlPanel
        title="⚙️ Reaction Parameters"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
