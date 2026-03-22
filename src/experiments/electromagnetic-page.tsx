"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  ElectromagneticSceneComponent,
  EMFieldData,
} from "@/experiments/electromagnetic-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

interface Charge {
  id: string;
  position: THREE.Vector3;
  magnitude: number;
}

export default function ElectromagneticPage() {
  const router = useRouter();
  const [data, setData] = useState<EMFieldData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Display options
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showEquipotential, setShowEquipotential] = useState(true);
  const [showForceVectors, setShowForceVectors] = useState(true);

  // Cursor position for field measurement
  const [cursorPosition, setCursorPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));

  // Dynamic charges state
  const [charges, setCharges] = useState<Charge[]>([
    { id: "1", position: new THREE.Vector3(-6, 0, 0), magnitude: 8 },
    { id: "2", position: new THREE.Vector3(6, 0, 0), magnitude: -8 },
    { id: "3", position: new THREE.Vector3(0, 6, 0), magnitude: 5 },
  ]);

  // Track which charge is being edited
  const [selectedChargeId, setSelectedChargeId] = useState<string>("1");

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setIsPlaying(true);
    setSimulationSpeed(1);
    setTimeElapsed(0);
    setCursorPosition(new THREE.Vector3(0, 5, 0));
  };

  // Add a new charge
  const addCharge = useCallback(() => {
    const newId = Date.now().toString();
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 4;
    setCharges((prev) => [
      ...prev,
      {
        id: newId,
        position: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
        magnitude: 5,
      },
    ]);
    setSelectedChargeId(newId);
  }, []);

  // Remove a charge
  const removeCharge = useCallback((id: string) => {
    setCharges((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // Select another charge if available
      if (selectedChargeId === id && filtered.length > 0) {
        setSelectedChargeId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedChargeId]);

  // Update charge magnitude
  const updateChargeMagnitude = useCallback((id: string, magnitude: number) => {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, magnitude } : c))
    );
  }, []);

  // Toggle charge sign
  const toggleChargeSign = useCallback((id: string) => {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, magnitude: -c.magnitude } : c))
    );
  }, []);

  // Update charge position
  const updateChargePosition = useCallback((id: string, axis: 'x' | 'y', value: number) => {
    setCharges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, position: new THREE.Vector3(
              axis === 'x' ? value : c.position.x,
              axis === 'y' ? value : c.position.y,
              c.position.z
            )}
          : c
      )
    );
  }, []);

  // Selected charge for editing
  const selectedCharge = useMemo(
    () => charges.find((c) => c.id === selectedChargeId) || charges[0],
    [charges, selectedChargeId]
  );

  // Update cursor position (simulate mouse tracking)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCursorPosition((prev) => {
        // Slow orbit around center for demo
        const time = Date.now() * 0.0003;
        return new THREE.Vector3(
          Math.cos(time) * 5,
          Math.sin(time) * 5,
          0
        );
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Charge Management */}
      <ControlGroup title="Charges">
        <div className="space-y-2">
          {/* Charge selector */}
          <div className="flex gap-1 flex-wrap">
            {charges.map((charge, index) => (
              <button
                key={charge.id}
                onClick={() => setSelectedChargeId(charge.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedChargeId === charge.id
                    ? charge.magnitude >= 0
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                    : charge.magnitude >= 0
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Q{index + 1}: {charge.magnitude > 0 ? "+" : ""}{charge.magnitude.toFixed(0)}µC
              </button>
            ))}
          </div>

          {/* Add/Remove buttons */}
          <div className="flex gap-2">
            <button
              onClick={addCharge}
              disabled={charges.length >= 6}
              className="flex-1 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium text-xs rounded-lg transition-all border border-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add Charge
            </button>
            <button
              onClick={() => removeCharge(selectedChargeId)}
              disabled={charges.length <= 2}
              className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium text-xs rounded-lg transition-all border border-red-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➖ Remove
            </button>
          </div>
        </div>

        {/* Selected charge controls */}
        {selectedCharge && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Edit Q{charges.findIndex(c => c.id === selectedCharge.id) + 1}
            </div>

            {/* Magnitude slider */}
            <ControlSlider
              label="Magnitude"
              value={Math.abs(selectedCharge.magnitude)}
              unit="µC"
              min={1}
              max={15}
              step={1}
              color={selectedCharge.magnitude >= 0 ? "#ef4444" : "#3b82f6"}
              onChange={(val) => updateChargeMagnitude(selectedCharge.id, selectedCharge.magnitude >= 0 ? val : -val)}
              decimals={0}
            />

            {/* Position controls */}
            <ControlSlider
              label="Position X"
              value={selectedCharge.position.x}
              unit="m"
              min={-12}
              max={12}
              step={0.5}
              color="#8b5cf6"
              onChange={(val) => updateChargePosition(selectedCharge.id, 'x', val)}
              decimals={1}
            />
            <ControlSlider
              label="Position Y"
              value={selectedCharge.position.y}
              unit="m"
              min={-12}
              max={12}
              step={0.5}
              color="#8b5cf6"
              onChange={(val) => updateChargePosition(selectedCharge.id, 'y', val)}
              decimals={1}
            />

            {/* Sign toggle button */}
            <button
              onClick={() => toggleChargeSign(selectedCharge.id)}
              className={`w-full py-2 font-medium text-xs rounded-lg transition-all ${
                selectedCharge.magnitude >= 0
                  ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
            >
              {selectedCharge.magnitude >= 0 ? "🔄 Switch to Negative" : "🔄 Switch to Positive"}
            </button>
          </div>
        )}
      </ControlGroup>

      {/* Cursor position for measurement */}
      <ControlGroup title="Measurement Position">
        <ControlSlider
          label="Cursor X"
          value={cursorPosition.x}
          unit="m"
          min={-10}
          max={10}
          step={0.5}
          color="#f59e0b"
          onChange={(val) => setCursorPosition(new THREE.Vector3(val, cursorPosition.y, cursorPosition.z))}
          decimals={1}
        />
        <ControlSlider
          label="Cursor Y"
          value={cursorPosition.y}
          unit="m"
          min={-10}
          max={10}
          step={0.5}
          color="#f59e0b"
          onChange={(val) => setCursorPosition(new THREE.Vector3(cursorPosition.x, val, cursorPosition.z))}
          decimals={1}
        />
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup title="Display Options">
        {[
          { label: "Electric Field Lines", checked: showFieldLines, onChange: setShowFieldLines, color: "text-yellow-500" },
          { label: "Field Vectors Grid", checked: showVectors, onChange: setShowVectors, color: "text-cyan-500" },
          { label: "Equipotential Surfaces", checked: showEquipotential, onChange: setShowEquipotential, color: "text-purple-500" },
          { label: "Force Vectors", checked: showForceVectors, onChange: setShowForceVectors, color: "text-green-500" },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50 hover:bg-gray-200/50 transition-colors">
            <span className={opt.color}>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/electromagnetic/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 View Experiment Details
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <div className="space-y-4">
      {/* Field at measurement point */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Field at Measurement Point
        </div>
        <DataGrid
          data={{
            electricField: { value: data.electricField, unit: "N/C", color: "#f59e0b", decimals: 2 },
            potential: { value: data.potential, unit: "V", color: "#8b5cf6", decimals: 2 },
            fieldX: { value: data.fieldX, unit: "N/C", color: "#ef4444", decimals: 2 },
            fieldY: { value: data.fieldY, unit: "N/C", color: "#22c55e", decimals: 2 },
          }}
          columns={2}
        />
      </div>

      {/* Forces between charges */}
      {data.forcesBetweenCharges.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Forces Between Charges
          </div>
          <div className="space-y-2">
            {data.forcesBetweenCharges.map((force, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-2 text-sm"
              >
                <span className="text-gray-600">
                  {force.charge1} ↔ {force.charge2}
                </span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: "#ec4899" }}>
                    F = {force.force.toFixed(3)} N
                  </div>
                  <div className="text-xs text-gray-500">
                    d = {force.distance.toFixed(2)} m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Waiting for simulation data...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Electromagnetic Field"
        description="Visualize electric fields, forces, and equipotential surfaces"
        cameraPosition={[0, 0, 45]}
        backgroundColor="#030312"
        controls={null}
        dataPanel={null}
      >
        <ElectromagneticSceneComponent
          onDataChange={setData}
          charges={charges}
          showFieldLines={showFieldLines}
          showVectors={showVectors}
          showEquipotential={showEquipotential}
          showForceVectors={showForceVectors}
          cursorPosition={cursorPosition}
        />
      </ExperimentContainer>

      {/* Simulation Controller - Always Visible */}
      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={timeElapsed}
      />

      {/* Parameter Controls - Toggleable */}
      <FloatingControlPanel
        title="⚡ Electric Field Controls"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      {/* Data Panel - Floating Toggleable */}
      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
