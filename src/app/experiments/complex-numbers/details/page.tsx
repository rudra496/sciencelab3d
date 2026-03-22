"use client";

import Link from "next/link";

export default function ComplexNumbersDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-rose-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">ℂ</span>
            <div>
              <h1 className="text-2xl font-bold text-rose-400">Complex Numbers</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/complex-numbers" className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg transition-all border border-rose-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-rose-500/20">
          <h2 className="text-xl font-semibold text-rose-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Complex numbers extend the real number system by including imaginary numbers. Visualize them on the
            Argand plane (complex plane) where the x-axis represents real parts and the y-axis represents imaginary parts.
            Explore rectangular form (a + bi) and polar form (r∠θ).
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-rose-500/20">
          <h2 className="text-xl font-semibold text-rose-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-rose-400 mt-1">•</span>
              <span><strong className="text-rose-300">Real Part:</strong> Horizontal component on Argand plane</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-400 mt-1">•</span>
              <span><strong className="text-rose-300">Imaginary Part:</strong> Vertical component (multiplied by i)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-400 mt-1">•</span>
              <span><strong className="text-rose-300">Magnitude (Modulus):</strong> Distance from origin</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-400 mt-1">•</span>
              <span><strong className="text-rose-300">Argument (Angle):</strong> Angle from positive real axis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-400 mt-1">•</span>
              <span><strong className="text-rose-300">i² = -1:</strong> Fundamental imaginary unit</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-rose-500/20">
          <h2 className="text-xl font-semibold text-rose-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-rose-300 mb-2">Rectangular Form</div>
              <div className="text-white text-lg">z = a + bi</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-rose-300 mb-2">Polar Form</div>
              <div className="text-white text-lg">z = r(cos(θ) + i·sin(θ)) = re^(iθ)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-rose-300 mb-2">Modulus & Argument</div>
              <div className="text-white">|z| = √(a² + b²)</div>
              <div className="text-white">arg(z) = arctan(b/a)</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/complex-numbers" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/20">
            🚀 Launch Complex Numbers
          </Link>
        </div>
      </div>
    </div>
  );
}
