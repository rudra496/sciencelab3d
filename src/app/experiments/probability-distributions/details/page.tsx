"use client";

import Link from "next/link";

export default function ProbabilityDistributionsDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-cyan-950/20 to-gray-950 text-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Probability Distributions</h1>
              <p className="text-sm text-gray-400">Math Experiment Details</p>
            </div>
          </div>
          <Link href="/experiments/probability-distributions" className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-all border border-cyan-500/30 flex items-center gap-2">
            ← Back to Experiment
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Explore three fundamental probability distributions: Normal (bell curve), Binomial (success/failure trials),
            and Poisson (rare events). Visualize how changing parameters affects the shape and spread of these distributions.
          </p>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Mean (μ):</strong> Average or expected value</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Standard Deviation (σ):</strong> Measure of spread</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">PDF/PMF:</strong> Probability density/mass function</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-cyan-300">Central Limit Theorem:</strong> Sums approach normal distribution</span>
            </li>
          </ul>
        </section>

        <section className="bg-gray-900/50 rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Normal Distribution</div>
              <div className="text-white text-lg">f(x) = (1/σ√2π) × e^(-½((x-μ)/σ)²)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Binomial Distribution</div>
              <div className="text-white text-lg">P(X=k) = C(n,k) × p^k × (1-p)^(n-k)</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-cyan-300 mb-2">Poisson Distribution</div>
              <div className="text-white text-lg">P(X=k) = (λ^k × e^(-λ)) / k!</div>
            </div>
          </div>
        </section>

        <div className="text-center py-8">
          <Link href="/experiments/probability-distributions" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
            🚀 Launch Probability Distributions
          </Link>
        </div>
      </div>
    </div>
  );
}
