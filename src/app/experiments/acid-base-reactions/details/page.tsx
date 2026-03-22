"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function AcidBaseReactionsDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-pink-950/20 to-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-pink-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h1 className="text-2xl font-bold text-pink-400">Acid-Base Reactions</h1>
              <p className="text-sm text-gray-400">Chemistry Experiment Details</p>
            </div>
          </div>
          <Link
            href="/experiments/acid-base-reactions"
            className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-lg transition-all border border-pink-500/30 flex items-center gap-2"
          >
            ← Back to Experiment
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>📖</span> About This Experiment
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Acid-base reactions are fundamental chemical processes where acids and bases interact to form
            water and salts. This experiment visualizes the molecular-level interactions during
            neutralization reactions, showing how hydrogen ions (H⁺) from acids react with hydroxide
            ions (OH⁻) from bases to form water molecules.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>💡</span> Key Concepts
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Acids:</strong> Substances that donate H⁺ ions (protons) in solution</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Bases:</strong> Substances that accept H⁺ ions or donate OH⁻ ions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">pH Scale:</strong> Measures acidity/basicity from 0 (acidic) to 14 (basic), with 7 as neutral</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Neutralization:</strong> When acids and bases react to form water and a salt</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-1">•</span>
              <span><strong className="text-pink-300">Temperature Effect:</strong> Higher temperatures increase molecular motion and reaction rates</span>
            </li>
          </ul>
        </section>

        {/* Key Formulas */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>🔢</span> Key Formulas
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">pH Calculation</div>
              <div className="text-white text-lg">pH = -log₁₀[H⁺]</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">Ion Product of Water</div>
              <div className="text-white text-lg">Kw = [H⁺][OH⁻] = 1×10⁻¹⁴</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">Neutralization Reaction</div>
              <div className="text-white text-lg">H⁺ + OH⁻ → H₂O</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-pink-300 mb-2">General Reaction</div>
              <div className="text-white text-lg">Acid + Base → Salt + Water</div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>🔬</span> Real-World Applications
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-pink-400">1.</span>
              <span><strong className="text-pink-300">Medicine:</strong> Antacids neutralize excess stomach acid to relieve heartburn</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400">2.</span>
              <span><strong className="text-pink-300">Agriculture:</strong> Soil pH adjustment for optimal crop growth</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400">3.</span>
              <span><strong className="text-pink-300">Industry:</strong> Chemical manufacturing and waste treatment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400">4.</span>
              <span><strong className="text-pink-300">Food Science:</strong> Fermentation, preservation, and flavor development</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400">5.</span>
              <span><strong className="text-pink-300">Environmental Science:</strong> Acid rain mitigation and water treatment</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section className="bg-gray-900/50 rounded-2xl p-8 border border-pink-500/20">
          <h2 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> How to Use This Experiment
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600/30 text-pink-400 text-sm flex items-center justify-center">1</span>
              <span>Adjust the <strong className="text-pink-300">Acid Strength</strong> slider to change the concentration of acid molecules</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600/30 text-pink-400 text-sm flex items-center justify-center">2</span>
              <span>Adjust the <strong className="text-pink-300">Base Strength</strong> slider to change the concentration of base molecules</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600/30 text-pink-400 text-sm flex items-center justify-center">3</span>
              <span>Change <strong className="text-pink-300">Temperature</strong> to see how heat affects molecular motion and reaction rates</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600/30 text-pink-400 text-sm flex items-center justify-center">4</span>
              <span>Observe the <strong className="text-pink-300">pH value</strong> changing as acid and base molecules react</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600/30 text-pink-400 text-sm flex items-center justify-center">5</span>
              <span>Watch the <strong className="text-pink-300">molecular visualization</strong> to see acids (red), bases (blue), and products (green)</span>
            </li>
          </ol>
        </section>

        {/* Launch Button */}
        <div className="text-center py-8">
          <Link
            href="/experiments/acid-base-reactions"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/20"
          >
            🚀 Launch Acid-Base Reactions Experiment
          </Link>
        </div>
      </div>
    </div>
  );
}
