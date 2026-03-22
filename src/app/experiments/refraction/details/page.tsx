"use client";

import Link from "next/link";

export default function RefractionDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-teal-950">
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-teal-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-teal-400">
              💧 Refraction & Reflection
            </h1>
            <p className="text-sm text-gray-400 mt-1">Experiment Details</p>
          </div>
          <Link href="/experiments/refraction" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-all flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">📖 About This Experiment</h2>
          <p className="text-gray-300 leading-relaxed">
            When light passes from one medium to another, it bends according to Snell&apos;s Law.
            Total internal reflection occurs when light travels from a denser to a rarer medium beyond the critical angle.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">📐 Key Formulas</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">n₁sin(θ₁) = n₂sin(θ₂)</code><p className="text-xs text-gray-400 mt-2">Snell&apos;s Law</p></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">θc = asin(n₂/n₁)</code><p className="text-xs text-gray-400 mt-2">Critical Angle</p></div>
            <div className="bg-gray-800/50 rounded-lg p-4"><code className="text-cyan-300 font-mono">R = ((n₁-n₂)/(n₁+n₂))²</code><p className="text-xs text-gray-400 mt-2">Reflectance (Fresnel)</p></div>
          </div>
        </section>

        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">🔬 Applications</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Fiber optics communications</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Camera lenses and glasses</span></li>
            <li className="flex gap-3"><span className="text-green-400">▸</span><span>Prisms and binoculars</span></li>
          </ul>
        </section>

        <div className="flex justify-center pt-4 pb-8">
          <Link href="/experiments/refraction" className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg">
            🚀 Launch Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
