"use client";

import Link from "next/link";

export default function GasLawsDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950">
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
              🎈 Gas Laws (Ideal Gas)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Experiment Details</p>
          </div>
          <Link href="/experiments/gas-laws" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">📖 About This Experiment</h2>
          <p className="text-gray-300 leading-relaxed">
            The Ideal Gas Law describes the relationship between pressure, volume, temperature, and amount of gas: PV = nRT.
            This simulation visualizes gas particles and how their motion changes with temperature and volume.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">📐 Key Formulas</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">PV = nRT</code><p className="text-xs text-gray-400 mt-2">Ideal Gas Law</p></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">P₁V₁ = P₂V₂</code><p className="text-xs text-gray-400 mt-2">Boyle&apos;s Law (constant T)</p></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">V₁/T₁ = V₂/T₂</code><p className="text-xs text-gray-400 mt-2">Charles&apos;s Law (constant P)</p></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">P₁/T₁ = P₂/T₂</code><p className="text-xs text-gray-400 mt-2">Gay-Lussac&apos;s Law (constant V)</p></div>
          </div>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">🔬 Applications</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Internal combustion engines</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Weather systems and atmospheric pressure</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Scuba diving calculations</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Industrial gas storage</span></li>
          </ul>
        </section>

        <div className="flex justify-center pt-4 pb-8">
          <Link href="/experiments/gas-laws" className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg">
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
