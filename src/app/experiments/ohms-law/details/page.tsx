"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function OhmsLawDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-amber-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Ohm's Law</h1>
              <p className="text-sm text-gray-400">Physics Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/ohms-law"
            className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg transition-all border border-amber-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Ohm's Law is a fundamental principle in electrical engineering that describes the relationship
            between voltage, current, and resistance in an electrical circuit. This experiment visualizes
            electron flow through a simple circuit with adjustable voltage and resistance.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Voltage (V):</strong> Electrical potential difference, measured in Volts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Current (I):</strong> Flow of electric charge, measured in Amperes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Resistance (R):</strong> Opposition to current flow, measured in Ohms (Ω)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Power (P):</strong> Rate of energy transfer, measured in Watts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span><strong className="text-amber-300">Electron Flow:</strong> Moves from negative to positive terminal</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Ohm's Law</div>
              <div className="text-white text-lg">V = I × R</div>
              <div className="text-gray-400 text-xs mt-2">I = V / R &nbsp;|&nbsp; R = V / I</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Power Law</div>
              <div className="text-white text-lg">P = V × I</div>
              <div className="text-gray-400 text-xs mt-2">P = I²R &nbsp;|&nbsp; P = V²/R</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-amber-300 mb-2">Electrical Energy</div>
              <div className="text-white text-lg">E = P × t = V × I × t</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-amber-400">1.</span>
              <span><strong className="text-amber-300">Circuit Design:</strong> Calculating component values for electronic devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">2.</span>
              <span><strong className="text-amber-300">Power Distribution:</strong> Designing electrical grids and wiring</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">3.</span>
              <span><strong className="text-amber-300">Battery Life:</strong> Estimating device runtime</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">4.</span>
              <span><strong className="text-amber-300">Heating Elements:</strong> Designing resistive heaters</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400">5.</span>
              <span><strong className="text-amber-300">LED Circuits:</strong> Calculating current-limiting resistors</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 text-sm flex items-center justify-center">1</span>
              <span>Adjust the <strong className="text-amber-300">Voltage (V)</strong> slider to change the electrical potential</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 text-sm flex items-center justify-center">2</span>
              <span>Adjust the <strong className="text-amber-300">Resistance (R)</strong> slider to change opposition to flow</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 text-sm flex items-center justify-center">3</span>
              <span>Observe the <strong className="text-amber-300">electron flow speed</strong> changing with current</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 text-sm flex items-center justify-center">4</span>
              <span>Watch the <strong className="text-amber-300">ammeter needle</strong> deflect based on current</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 text-sm flex items-center justify-center">5</span>
              <span>Use <strong className="text-amber-300">Quick Presets</strong> for common circuit configurations</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/ohms-law"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            🚀 Launch Ohm's Law Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
