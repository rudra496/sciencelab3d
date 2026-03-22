"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ThermochemistryDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-red-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="text-2xl font-bold text-red-400">Thermochemistry</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/thermochemistry"
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Thermochemistry is the study of energy changes during chemical reactions. This experiment visualizes
            exothermic reactions (which release energy, often as heat) and endothermic reactions (which absorb
            energy from surroundings). The energy diagram shows the activation energy barrier and enthalpy change.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span><strong className="text-red-300">Exothermic:</strong> Releases energy to surroundings (ΔH &lt; 0)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span><strong className="text-red-300">Endothermic:</strong> Absorbs energy from surroundings (ΔH &gt; 0)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span><strong className="text-red-300">Activation Energy (Ea):</strong> Minimum energy required for reaction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span><strong className="text-red-300">Enthalpy Change (ΔH):</strong> Heat energy change at constant pressure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span><strong className="text-red-300">Transition State:</strong> High-energy intermediate state during reaction</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-red-300 mb-2">Enthalpy Change</div>
              <div className="text-white text-lg">ΔH = H(products) - H(reactants)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-red-300 mb-2">Exothermic Reaction</div>
              <div className="text-white text-lg">ΔH &lt; 0 (releases heat)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-red-300 mb-2">Endothermic Reaction</div>
              <div className="text-white text-lg">ΔH &gt; 0 (absorbs heat)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-red-300 mb-2">Activation Energy</div>
              <div className="text-white text-lg">Ea = H(transition) - H(reactants)</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-red-400">1.</span>
              <span><strong className="text-red-300">Combustion:</strong> Burning fuels for energy (exothermic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400">2.</span>
              <span><strong className="text-red-300">Respiration:</strong> Cellular energy production (exothermic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400">3.</span>
              <span><strong className="text-red-300">Photosynthesis:</strong> Plants converting sunlight (endothermic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400">4.</span>
              <span><strong className="text-red-300">Cold Packs:</strong> Instant cold therapy (endothermic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400">5.</span>
              <span><strong className="text-red-300">Hand Warmers:</strong> Self-heating packs (exothermic)</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/30 text-red-400 text-sm flex items-center justify-center">1</span>
              <span>Select the <strong className="text-red-300">Reaction Type</strong> (Exothermic or Endothermic)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/30 text-red-400 text-sm flex items-center justify-center">2</span>
              <span>Adjust the <strong className="text-red-300">Activation Energy</strong> (energy barrier height)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/30 text-red-400 text-sm flex items-center justify-center">3</span>
              <span>Adjust the <strong className="text-red-300">Enthalpy Change</strong> (energy difference)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/30 text-red-400 text-sm flex items-center justify-center">4</span>
              <span>Click <strong className="text-red-300">"Start Reaction"</strong> to see the animation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/30 text-red-400 text-sm flex items-center justify-center">5</span>
              <span>Watch the <strong className="text-red-300">energy diagram</strong> to visualize the reaction progress</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/thermochemistry"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            🚀 Launch Thermochemistry Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
