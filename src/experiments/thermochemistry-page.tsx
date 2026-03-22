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

  const [reactionType, setReactionType] = useState<'exothermic' | 'endothermic'>('exothermic');
  const [activationEnergy, setActivationEnergy] = useState(50);
  const [energyReleased, setEnergyReleased] = useState(40);
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const [data, setData] = useState<ThermochemistryData>({
    reactantEnergy: 80,
    activationEnergy: 50,
    productEnergy: 40,
    netEnergyChange: -40,
    temperatureChange: 0,
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
      <ControlGroup title="Reaction Type">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setReactionType('exothermic'); setCurrentStep(1); setProgress(0); }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              reactionType === 'exothermic'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            🔥 Exothermic
          </button>
          <button
            onClick={() => { setReactionType('endothermic'); setCurrentStep(1); setProgress(0); }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              reactionType === 'endothermic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            ❄️ Endothermic
          </button>
        </div>
      </ControlGroup>

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
          label="Energy Released/Absorbed"
          value={energyReleased}
          unit="kJ/mol"
          min={10}
          max={80}
          step={5}
          color={reactionType === 'exothermic' ? '#ef4444' : '#3b82f6'}
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
    reactionType === 'exothermic' ? 'Energy Released' : 'Energy Absorbed',
  ];

  const dataPanelContent = (
    <>
      <DataGrid
        data={{
          reactantEnergy: { value: data.reactantEnergy, unit: 'kJ/mol', color: '#ff6b35', decimals: 0 },
          productEnergy: { value: data.productEnergy, unit: 'kJ/mol', color: '#06d6a0', decimals: 0 },
          activationEnergy: { value: data.activationEnergy, unit: 'kJ/mol', color: '#f59e0b', decimals: 0 },
          netEnergyChange: { value: Math.abs(data.netEnergyChange), unit: 'kJ/mol', color: reactionType === 'exothermic' ? '#ef4444' : '#3b82f6', decimals: 0 },
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
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Temp Change:</span>
          <span className={`font-mono ${data.temperatureChange > 0 ? 'text-red-400' : 'text-blue-400'}`}>
            {data.temperatureChange > 0 ? '+' : ''}{data.temperatureChange.toFixed(1)} K
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Thermochemistry"
        description={`Energy changes in ${reactionType} reactions`}
        cameraPosition={[8, 6, 8]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ThermochemistrySceneComponent
          onDataChange={handleDataChange}
          onProgressChange={handleProgressChange}
          reactionType={reactionType}
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
