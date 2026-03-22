"use client";

import Link from "next/link";

export default function MandelbrotDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌀</span>
            <div>
              <h1 className="text-2xl font-bold text-purple-400">Mandelbrot Set</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/mandelbrot" className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all border border-purple-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            The Mandelbrot set is a famous fractal defined by the iterative formula z = z² + c.
            Points that remain bounded under iteration belong to the set. This experiment visualizes
            the set in 3D, where height represents how quickly points escape to infinity.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Complex Numbers:</strong> Numbers with real and imaginary parts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Iteration:</strong> Repeatedly applying a function</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Self-Similarity:</strong> Patterns repeat at different scales</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Fractal Dimension:</strong> Non-integer measure of complexity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong className="text-purple-300">Escape Time:</strong> How fast values diverge to infinity</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Mandelbrot Iteration</div>
              <div className="text-white text-lg">z(n+1) = z(n)² + c</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Complex Number</div>
              <div className="text-white text-lg">c = a + bi</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-purple-300 mb-2">Escape Condition</div>
              <div className="text-white text-lg">|z| {'>'} 2 (diverges)</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/mandelbrot" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20">
            🚀 Launch Mandelbrot Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
