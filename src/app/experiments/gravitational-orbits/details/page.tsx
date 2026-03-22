"use client";

import Link from "next/link";

export default function GravitationalOrbitsDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-indigo-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-400">
              🪐 Gravitational Orbits
            </h1>
            <p className="text-sm text-gray-400 mt-1">Experiment Details</p>
          </div>
          <Link href="/experiments/gravitational-orbits" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">📖 About This Experiment</h2>
          <p className="text-gray-300 leading-relaxed">
            Orbits are the result of the balance between gravitational attraction and orbital velocity.
            This simulation demonstrates Kepler&apos;s laws and Newton&apos;s law of universal gravitation.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">📐 Key Formulas</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">F = G(Mm)/r²</code></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">v = √(GM/r) (circular)</code></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">T = 2π√(r³/GM)</code></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">v_escape = √(2GM/r)</code></div>
          </div>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">🌍 Kepler&apos;s Laws</h2>
          <ul className="space-y-3 text-gray-300">
            <li>1. Orbits are ellipses with the star at one focus</li>
            <li>2. Equal areas are swept in equal times</li>
            <li>3. T² ∝ r³</li>
          </ul>
        </section>

        <div className="flex justify-center pt-4 pb-8">
          <Link href="/experiments/gravitational-orbits" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg">
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
