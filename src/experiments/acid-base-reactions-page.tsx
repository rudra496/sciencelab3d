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
import AcidBaseReactionsSceneComponent, { AcidBaseReactionsData } from './acid-base-reactions-scene';

export default function AcidBaseReactionsPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [acidConcentration, setAcidConcentration] = useState(5);
  const [baseConcentration, setBaseConcentration] = useState(5);
  const [acidType, setAcidType] = useState<'HCl' | 'H2SO4' | 'HNO3'>('HCl');
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [data, setData] = useState<AcidBaseReactionsData>({
    pH: 1,
    temperature: 298,
    reactionProgress: 0,
    productsFormed: 0,
    currentStep: 1,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setAcidConcentration(5);
    setBaseConcentration(5);
    setAcidType('HCl');
    setCurrentStep(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((newData: AcidBaseReactionsData) => {
    setData(newData);
  }, []);

  const handleMix = useCallback(() => {
    if (stepMode && currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  }, [stepMode, currentStep]);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Concentrations">
        <ControlSlider
          label="Acid Concentration"
          value={acidConcentration}
          unit="M"
          min={1}
          max={10}
          step={0.5}
          color="#ef4444"
          onChange={setAcidConcentration}
          decimals={1}
        />
        <ControlSlider
          label="Base Concentration"
          value={baseConcentration}
          unit="M"
          min={1}
          max={10}
          step={0.5}
          color="#3b82f6"
          onChange={setBaseConcentration}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Acid Type">
        <div className="grid grid-cols-3 gap-2">
          {(['HCl', 'H2SO4', 'HNO3'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAcidType(type)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                acidType === type
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Mode">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setStepMode(false); setCurrentStep(1); }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              !stepMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => { setStepMode(true); setCurrentStep(1); }}
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
          onClick={handleMix}
          disabled={currentStep >= 5}
          className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {currentStep >= 5 ? '✓ Complete' : `Step ${currentStep}/5 - Mix`}
        </button>
      )}

      <button
        onClick={() => router.push('/experiments/acid-base-reactions/details')}
        className="w-full py-2.5 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 font-medium text-sm rounded-lg transition-all border border-red-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  const dataPanelContent = (
    <>
      <DataGrid
        data={{
          pH: { value: data.pH, unit: '', color: data.pH > 7 ? '#3b82f6' : data.pH < 7 ? '#ef4444' : '#22c55e', decimals: 2 },
          temperature: { value: data.temperature, unit: 'K', color: data.temperature > 310 ? '#ef4444' : '#22c55e', decimals: 1 },
          progress: { value: data.reactionProgress * 100, unit: '%', color: '#8b5cf6', decimals: 1 },
          products: { value: data.productsFormed, unit: 'molecules', color: '#06b6d4', decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Step:</span>
          <span className="font-mono text-purple-400">
            {stepMode ? `${currentStep}/5` : 'Auto'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className="font-mono text-green-400 text-sm">
            {data.currentStep === 1 ? 'Reactants' :
             data.currentStep === 2 ? 'Pouring...' :
             data.currentStep === 3 ? 'Reacting...' :
             data.currentStep === 4 ? 'Products' :
             'NaOH + HCl → NaCl + H₂O'}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Acid-Base Reactions"
        description="Neutralization reaction: HCl + NaOH → NaCl + H₂O"
        cameraPosition={[0, 2, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <AcidBaseReactionsSceneComponent
          onDataChange={handleDataChange}
          acidConcentration={acidConcentration}
          baseConcentration={baseConcentration}
          acidType={acidType}
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
        title="⚙️ Acid-Base Parameters"
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
