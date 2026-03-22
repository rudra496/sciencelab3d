"use client";

import Link from "next/link";

export default function PendulumDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Simple Pendulum</h1>
          </div>
          <Link
            href="/experiments/pendulum"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-purple-500/20"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back to Experiment</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* About */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>🎯</span> About Simple Pendulum
          </h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            A simple pendulum is a mass (bob) suspended from a fixed point by a massless, inextensible string.
            When displaced from its equilibrium position and released, it oscillates under the influence of gravity.
            This is one of the most fundamental systems in classical mechanics and demonstrates simple harmonic motion for small angles.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Physics Concepts
          </h2>
          <ul className="space-y-4 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-purple-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Restoring Force:</strong> F = -mg sin(θ), always directed toward equilibrium
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Simple Harmonic Motion:</strong> For small angles (θ &lt; 15°), sin(θ) ≈ θ, giving SHM
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Isochronism:</strong> Period is independent of mass and amplitude (for small angles)
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Energy Conservation:</strong> KE + PE = constant (without damping)
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 mt-0.5 font-bold">•</span>
              <div>
                <strong className="text-white">Large-Angle Correction:</strong> For large angles, T increases as θ₀²/16
              </div>
            </li>
          </ul>
        </section>

        {/* Formulas */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>📐</span> Formulas
          </h2>
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-5 sm:p-6 font-mono text-sm space-y-5">
            <div>
              <span className="text-gray-500 text-xs block mb-1">Equation of motion:</span>
              <span className="text-purple-300 text-base">θ̈ = -(g/L)sin(θ) - b·θ̇</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Period (small angle):</span>
              <span className="text-pink-300 text-base">T = 2π√(L/g)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Period (large angle correction):</span>
              <span className="text-pink-300 text-base">T ≈ T₀(1 + θ₀²/16 + 11θ₀⁴/3072)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Angular frequency:</span>
              <span className="text-green-300 text-base">ω = √(g/L)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Kinetic energy:</span>
              <span className="text-blue-300 text-base">KE = ½mL²(dθ/dt)²</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Potential energy:</span>
              <span className="text-yellow-300 text-base">PE = mgL(1 - cosθ)</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block mb-1">Total energy:</span>
              <span className="text-green-300 text-base">E = KE + PE = constant</span>
            </div>
          </div>
        </section>

        {/* Real-World Applications */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Grandfather clocks</strong> — Pendulum regulates timekeeping</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Foucault pendulum</strong> — Demonstrates Earth&apos;s rotation (1851)</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Seismographs</strong> — Detect and measure earthquakes</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Metronomes</strong> — Keep musical tempo</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Torsion pendulum</strong> — Measures gravitational constant (Cavendish experiment)</div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">→</span>
              <div><strong className="text-white">Pendulum waves</strong> — Visual demonstration of wave mechanics</div>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>🎮</span> How to Use the Simulation
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">1.</span>
              <div>Adjust <strong className="text-purple-400">Length</strong> — longer pendulum = longer period</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <div>Try <strong className="text-pink-400">gravity presets</strong> — see how pendulum behaves on Moon vs Jupiter</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <div><strong className="text-green-400">Mass</strong> doesn&apos;t affect period (Galileo&apos;s discovery!)</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">4.</span>
              <div>Large <strong className="text-blue-400">angles</strong> break the small-angle approximation</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">5.</span>
              <div>Enable <strong className="text-orange-400">Force Vectors</strong> to see gravity, tension, and net force</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">6.</span>
              <div>Watch the <strong className="text-yellow-400">energy bars</strong> — KE↔PE exchange in real time</div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">7.</span>
              <div>Use <strong className="text-purple-400">Speed</strong> slider for slow-motion analysis</div>
            </li>
          </ul>
        </section>

        {/* Interesting Facts */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>🧠</span> Interesting Facts
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-gray-300">
            <li className="flex gap-3">
              <span className="text-cyan-400">✦</span>
              <div>Galileo discovered pendulum isochronism by watching a chandelier swing in Pisa Cathedral (1582)</div>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">✦</span>
              <div>A pendulum 1 meter long has a period of approximately 2 seconds</div>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">✦</span>
              <div>The Foucault pendulum at the Panthéon in Paris takes ~32 hours to complete a full rotation</div>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400">✦</span>
              <div>On the ISS (microgravity), a pendulum simply won&apos;t oscillate — try the ISS preset!</div>
            </li>
          </ul>
        </section>

        {/* Back Button */}
        <div className="text-center pb-8">
          <Link
            href="/experiments/pendulum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-purple-500/30 text-sm"
          >
            <span>🔄</span>
            Launch the Pendulum Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
