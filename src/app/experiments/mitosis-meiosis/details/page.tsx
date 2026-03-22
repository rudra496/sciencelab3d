'use client';

import Link from 'next/link';

export default function MitosisMeiosisDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#f59e0b]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#f59e0b]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <h1 className="text-2xl font-bold text-[#f59e0b]">Cell Division - Mitosis & Meiosis</h1>
          </div>
          <Link
            href="/experiments/mitosis-meiosis"
            className="px-4 py-2 bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b] rounded-lg border border-[#f59e0b]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f59e0b]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Cell division is essential for growth, repair, and reproduction. Mitosis produces identical somatic
            cells for growth and repair, while meiosis produces unique gametes for sexual reproduction with half
            the chromosome number.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f59e0b]">Mitosis</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Purpose</h3>
              <p className="text-gray-300">
                Asexual reproduction of somatic cells. Produces 2 identical daughter cells with 46 chromosomes
                each in humans.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f59e0b]">Prophase</h3>
              <p className="text-gray-300">
                Chromosomes condense, nuclear envelope breaks down, spindle fibers form.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f59e0b]">Metaphase</h3>
              <p className="text-gray-300">
                Chromosomes align at the metaphase plate (cell equator).
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f59e0b]">Anaphase</h3>
              <p className="text-gray-300">
                Sister chromatids separate and move to opposite poles.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#f59e0b]">Telophase</h3>
              <p className="text-gray-300">
                Nuclear envelopes reform, chromosomes decondense, cell divides (cytokinesis).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#ec4899]">Meiosis</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">Purpose</h3>
              <p className="text-gray-300">
                Produces gametes (sperm/egg) with 23 chromosomes. Creates genetic diversity through crossing
                over and independent assortment.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#ec4899]">Meiosis I</h3>
              <p className="text-gray-300">
                Homologous chromosomes separate. Crossing over occurs in prophase I. Results in 2 haploid cells.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#ec4899]">Meiosis II</h3>
              <p className="text-gray-300">
                Sister chromatids separate (similar to mitosis). Results in 4 unique haploid gametes.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f59e0b]">Key Differences</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="font-semibold mb-2 text-[#f59e0b]">Mitosis</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 2 daughter cells</li>
                <li>• Identical to parent</li>
                <li>• Diploid (2n)</li>
                <li>• 1 division</li>
                <li>• Growth & repair</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#ec4899]/20">
              <h3 className="font-semibold mb-2 text-[#ec4899]">Meiosis</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 4 daughter cells</li>
                <li>• Genetically unique</li>
                <li>• Haploid (n)</li>
                <li>• 2 divisions</li>
                <li>• Sexual reproduction</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f59e0b]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#f59e0b] mt-1">•</span>
              <span>Toggle between Mitosis and Meiosis modes to compare processes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f59e0b] mt-1">•</span>
              <span>Step through each phase to see chromosome behavior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f59e0b] mt-1">•</span>
              <span>Adjust animation speed for detailed observation</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#f59e0b]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="font-semibold mb-2 text-[#f59e0b]">Cancer Research</h3>
              <p className="text-gray-300 text-sm">
                Uncontrolled mitosis leads to tumors. Understanding cell division helps develop treatments.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="font-semibold mb-2 text-[#f59e0b]">Fertility Treatment</h3>
              <p className="text-gray-300 text-sm">
                Meiosis errors cause chromosomal abnormalities. Research helps improve IVF success rates.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="font-semibold mb-2 text-[#f59e0b]">Stem Cells</h3>
              <p className="text-gray-300 text-sm">
                Mitosis in stem cells enables tissue regeneration and therapeutic applications.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#f59e0b]/20">
              <h3 className="font-semibold mb-2 text-[#f59e0b]">Genetic Counseling</h3>
              <p className="text-gray-300 text-sm">
                Understanding meiosis helps assess risks of genetic disorders in offspring.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/mitosis-meiosis"
            className="inline-block px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
