'use client';

import Link from 'next/link';

export default function NaturalSelectionDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#10b981]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#10b981]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            <h1 className="text-2xl font-bold text-[#10b981]">Natural Selection</h1>
          </div>
          <Link
            href="/experiments/natural-selection"
            className="px-4 py-2 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] rounded-lg border border-[#10b981]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#10b981]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Natural selection is the mechanism through which populations of organisms evolve over generations.
            Individuals with traits better suited to their environment tend to survive and reproduce more,
            passing those advantageous traits to offspring. This process leads to adaptation and speciation.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#10b981]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Variation</h3>
              <p className="text-gray-300">
                Individuals in a population vary in their traits due to genetic mutations and recombination.
                This variation is the raw material for evolution.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Differential Survival</h3>
              <p className="text-gray-300">
                Some traits confer advantages in survival and reproduction. Selection pressure determines
                how strongly the environment favors certain traits.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Heredity</h3>
              <p className="text-gray-300">
                Advantageous traits are passed to offspring. Over many generations, beneficial traits become
                more common in the population.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Mutation</h3>
              <p className="text-gray-300">
                Random changes in DNA create new variations. Most are neutral or harmful, but occasionally
                produce beneficial traits.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#10b981]">Types of Selection</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Directional</h3>
              <p className="text-gray-300 text-sm">
                Favors one extreme of a trait distribution.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Stabilizing</h3>
              <p className="text-gray-300 text-sm">
                Favors intermediate values, reduces variation.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Disruptive</h3>
              <p className="text-gray-300 text-sm">
                Favors both extremes over intermediates.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Sexual</h3>
              <p className="text-gray-300 text-sm">
                Traits that increase mating success.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#10b981]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#10b981] mt-1">•</span>
              <span>Adjust mutation rate to control genetic variation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#10b981] mt-1">•</span>
              <span>Change selection pressure to see how environment affects survival</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#10b981] mt-1">•</span>
              <span>Watch generations evolve - fitter organisms grow larger and brighter</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#10b981]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Medicine</h3>
              <p className="text-gray-300 text-sm">
                Antibiotic resistance evolves through natural selection in bacteria.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Conservation</h3>
              <p className="text-gray-300 text-sm">
                Understanding adaptation helps protect endangered species.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Agriculture</h3>
              <p className="text-gray-300 text-sm">
                Selective breeding uses artificial selection principles.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#10b981]/20">
              <h3 className="font-semibold mb-2 text-[#10b981]">Genetic Algorithms</h3>
              <p className="text-gray-300 text-sm">
                Computer science uses evolutionary principles for optimization.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/natural-selection"
            className="inline-block px-8 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
