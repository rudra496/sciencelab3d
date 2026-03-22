"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ElectrolysisDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-blue-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold text-blue-400">Electrolysis</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/electrolysis"
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Electrolysis is a chemical process that uses electrical energy to drive a non-spontaneous reaction.
            It involves passing an electric current through an electrolyte to cause a chemical change.
            This experiment demonstrates the electrolysis of water and copper sulfate solution.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Electrolyte:</strong> A substance containing ions that conducts electricity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Anode (+):</strong> Positive electrode where oxidation occurs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Cathode (-):</strong> Negative electrode where reduction occurs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Faraday's Laws:</strong> The amount of substance produced is proportional to the electric charge</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong className="text-blue-300">Gas Ratio:</strong> Water electrolysis produces H₂ and O₂ in a 2:1 ratio</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Water Electrolysis</div>
              <div className="text-white text-lg">2H₂O(l) → 2H₂(g) + O₂(g)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Cathode (Reduction)</div>
              <div className="text-white text-lg">2H⁺ + 2e⁻ → H₂</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Anode (Oxidation)</div>
              <div className="text-white text-lg">2H₂O → O₂ + 4H⁺ + 4e⁻</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Faraday's First Law</div>
              <div className="text-white text-lg">m = (M × I × t) / (n × F)</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400">1.</span>
              <span><strong className="text-blue-300">Hydrogen Production:</strong> Clean fuel for fuel cells and energy storage</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">2.</span>
              <span><strong className="text-blue-300">Metal Refining:</strong> Purifying copper, aluminum, and other metals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">3.</span>
              <span><strong className="text-blue-300">Electroplating:</strong> Coating objects with thin metal layers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">4.</span>
              <span><strong className="text-blue-300">Chlorine Production:</strong> Industrial chemical manufacturing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">5.</span>
              <span><strong className="text-blue-300">Water Treatment:</strong> Removing contaminants from wastewater</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-sm flex items-center justify-center">1</span>
              <span>Adjust the <strong className="text-blue-300">Voltage</strong> slider to control the rate of electrolysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-sm flex items-center justify-center">2</span>
              <span>Select the <strong className="text-blue-300">Electrolyte Type</strong> (Water or Copper Sulfate)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-sm flex items-center justify-center">3</span>
              <span>Press <strong className="text-blue-300">Play</strong> to start the electrolysis process</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-sm flex items-center justify-center">4</span>
              <span>Observe <strong className="text-blue-300">bubbles forming</strong> at the electrodes (H₂ at cathode, O₂ at anode)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-sm flex items-center justify-center">5</span>
              <span>Monitor the <strong className="text-blue-300">gas production ratio</strong> (should be approximately 2:1 for water)</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/electrolysis"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            🚀 Launch Electrolysis Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
