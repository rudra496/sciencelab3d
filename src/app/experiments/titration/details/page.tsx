"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function TitrationDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-violet-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h1 className="text-2xl font-bold text-violet-400">Titration</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/titration"
            className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg transition-all border border-violet-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Titration is a common laboratory method of quantitative chemical analysis to determine the
            concentration of an identified analyte. A reagent, called the titrant, is prepared as a standard
            solution of known concentration and volume. The titrant reacts with the analyte to determine
            its concentration.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Titrant:</strong> Solution of known concentration in the burette</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Analyte:</strong> Solution of unknown concentration in the flask</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Equivalence Point:</strong> When moles of titrant equal moles of analyte</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Endpoint:</strong> Point where indicator changes color</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-violet-300">Indicator:</strong> Substance that changes color at specific pH</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-violet-300 mb-2">Titration Formula</div>
              <div className="text-white text-lg">M₁V₁ = M₂V₂</div>
              <div className="text-gray-400 text-xs mt-2">Where M = molarity, V = volume</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-violet-300 mb-2">For Acid-Base Titration</div>
              <div className="text-white text-lg">MₐVₐ = M_bV_b × (nₐ/n_b)</div>
              <div className="text-gray-400 text-xs mt-2">Where n = moles of H⁺ or OH⁻</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-violet-300 mb-2">pH Calculation</div>
              <div className="text-white text-lg">pH = -log₁₀[H⁺]</div>
            </div>
          </div>
        </section>

        {/* Common Indicators */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>🎨</span> Common Indicators
          </h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <span className="font-medium">Phenolphthalein</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-white/20 rounded text-sm">Colorless</span>
                <span>→</span>
                <span className="px-2 py-1 bg-pink-500/50 rounded text-sm">Pink</span>
                <span className="text-xs text-gray-400 ml-2">pH 8.2-10</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <span className="font-medium">Methyl Orange</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-500/50 rounded text-sm">Red</span>
                <span>→</span>
                <span className="px-2 py-1 bg-yellow-500/50 rounded text-sm">Yellow</span>
                <span className="text-xs text-gray-400 ml-2">pH 3.1-4.4</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <span className="font-medium">Bromothymol Blue</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-500/50 rounded text-sm">Yellow</span>
                <span>→</span>
                <span className="px-2 py-1 bg-blue-500/50 rounded text-sm">Blue</span>
                <span className="text-xs text-gray-400 ml-2">pH 6.0-7.6</span>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-violet-400">1.</span>
              <span><strong className="text-violet-300">Quality Control:</strong> Testing product quality in pharmaceutical and food industries</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400">2.</span>
              <span><strong className="text-violet-300">Environmental Testing:</strong> Measuring water acidity and pollution levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400">3.</span>
              <span><strong className="text-violet-300">Medical Diagnostics:</strong> Blood chemistry analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400">4.</span>
              <span><strong className="text-violet-300">Agriculture:</strong> Soil pH and nutrient analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400">5.</span>
              <span><strong className="text-violet-300">Wine Making:</strong> Monitoring acidity during fermentation</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-violet-500/20">
          <h2 className="text-xl font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-sm flex items-center justify-center">1</span>
              <span>Set the <strong className="text-violet-300">Titrant Concentration</strong> (known solution)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-sm flex items-center justify-center">2</span>
              <span>Set the <strong className="text-violet-300">Analyte Volume</strong> (unknown solution)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-sm flex items-center justify-center">3</span>
              <span>Choose an <strong className="text-violet-300">Indicator</strong> appropriate for your reaction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-sm flex items-center justify-center">4</span>
              <span>Click <strong className="text-violet-300">"Add Titrant Drop"</strong> to slowly add titrant to the analyte</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-sm flex items-center justify-center">5</span>
              <span>Watch for the <strong className="text-violet-300">color change</strong> indicating the endpoint</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/titration"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            🚀 Launch Titration Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
