"use client";

import Link from "next/link";

export default function WaveInterferenceDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-blue-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-400">
              🌊 Wave Interference
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Experiment Details
            </p>
          </div>
          <Link
            href="/experiments/wave-interference"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* About Section */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            📖 About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Wave interference occurs when two or more waves overlap in space. The resulting wave
            is the sum of the individual waves (superposition principle). This experiment
            demonstrates the interference pattern created by two coherent point sources in a water tank.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Where the waves meet in phase (crests align with crests), they create constructive
            interference with larger amplitude. Where they meet out of phase (crests align with
            troughs), they create destructive interference and cancel each other out.
          </p>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            📐 Key Formulas
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Wave Equation:</span>
                <code className="text-cyan-300 font-mono">y = A·sin(kr - ωt)</code>
              </div>
              <p className="text-xs text-gray-400">Displacement of a wave at distance r and time t</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Wavelength:</span>
                <code className="text-cyan-300 font-mono">λ = v/f</code>
              </div>
              <p className="text-xs text-gray-400">Distance between consecutive wave crests</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Wave Number:</span>
                <code className="text-cyan-300 font-mono">k = 2π/λ</code>
              </div>
              <p className="text-xs text-gray-400">Spatial frequency of the wave</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Angular Frequency:</span>
                <code className="text-cyan-300 font-mono">ω = 2πf</code>
              </div>
              <p className="text-xs text-gray-400">Rate of change of the wave phase</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Path Difference (Constructive):</span>
                <code className="text-cyan-300 font-mono">Δr = mλ</code>
              </div>
              <p className="text-xs text-gray-400">m = 0, 1, 2, ... (antinodes)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold">Path Difference (Destructive):</span>
                <code className="text-cyan-300 font-mono">Δr = (m + ½)λ</code>
              </div>
              <p className="text-xs text-gray-400">m = 0, 1, 2, ... (nodes)</p>
            </div>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            💡 Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-400 text-xl">•</span>
              <div>
                <strong className="text-white">Superposition Principle:</strong> When waves overlap,
                their displacements add algebraically at each point.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 text-xl">•</span>
              <div>
                <strong className="text-white">Constructive Interference:</strong> Waves in phase
                create larger amplitude (antinodes). Green circles mark these points.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 text-xl">•</span>
              <div>
                <strong className="text-white">Destructive Interference:</strong> Waves out of phase
                cancel each other (nodes). Red X marks these points.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 text-xl">•</span>
              <div>
                <strong className="text-white">Coherence:</strong> Sources must have a constant
                phase relationship to produce stable interference patterns.
              </div>
            </li>
          </ul>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            🔬 Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Noise Cancellation:</strong> Headphones use destructive interference to block ambient sound.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Thin Film Interference:</strong> Soap bubbles and oil slicks show colorful patterns.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Radio Antennas:</strong> Phased arrays use interference for directional transmission.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Medical Imaging:</strong> Ultrasound and MRI use wave interference principles.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">▸</span>
              <span><strong className="text-white">Quantum Mechanics:</strong> Electron double-slit experiment shows wave-particle duality.</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            🎮 How to Use This Experiment
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-cyan-400">1.</span>
              <span>Adjust <strong className="text-blue-400">Frequency</strong> to change wave oscillation rate.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">2.</span>
              <span>Change <strong className="text-purple-400">Amplitude</strong> to modify wave height.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">3.</span>
              <span>Move <strong className="text-cyan-400">Source Separation</strong> to see pattern changes.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">4.</span>
              <span>Use <strong className="text-green-400">Play/Pause</strong> to freeze and analyze the pattern.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">5.</span>
              <span>Green circles = antinodes (constructive), Red X = nodes (destructive).</span>
            </li>
          </ul>
        </section>

        {/* Launch Button */}
        <div className="flex justify-center pt-4 pb-8">
          <Link
            href="/experiments/wave-interference"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 text-lg"
          >
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
