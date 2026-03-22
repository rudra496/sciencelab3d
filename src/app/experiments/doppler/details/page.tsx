"use client";

import Link from "next/link";

export default function DopplerDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950">
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-orange-400">
              🔊 Doppler Effect
            </h1>
            <p className="text-sm text-gray-400 mt-1">Experiment Details</p>
          </div>
          <Link href="/experiments/doppler" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">📖 About This Experiment</h2>
          <p className="text-gray-300 leading-relaxed">
            The Doppler effect is the change in frequency of a wave in relation to an observer moving relative to the wave source.
            When the source moves toward the observer, waves are compressed (blueshift). When moving away, waves are stretched (redshift).
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">📐 Key Formula</h2>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <code className="text-cyan-300 font-mono">f&apos; = f × (v / (v ± vₛ))</code>
            <p className="text-xs text-gray-400 mt-2">Moving toward: -, Moving away: +</p>
          </div>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">🔬 Applications</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Police radar guns</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Medical ultrasound</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Astronomical redshift (expanding universe)</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Weather radar</span></li>
          </ul>
        </section>

        <div className="flex justify-center pt-4 pb-8">
          <Link href="/experiments/doppler" className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg">
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
