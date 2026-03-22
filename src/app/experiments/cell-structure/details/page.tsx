'use client';

import Link from 'next/link';

export default function CellStructureDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#06d6a0]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#06d6a0]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            <h1 className="text-2xl font-bold text-[#06d6a0]">Cell Structure</h1>
          </div>
          <Link
            href="/experiments/cell-structure"
            className="px-4 py-2 bg-[#06d6a0]/20 hover:bg-[#06d6a0]/30 text-[#06d6a0] rounded-lg border border-[#06d6a0]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#06d6a0]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Cells are the fundamental building blocks of all living organisms. Animal cells are eukaryotic,
            meaning they have a nucleus and membrane-bound organelles. Each organelle has a specific function
            that contributes to the cell's survival and overall organism health.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#06d6a0]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Nucleus</h3>
              <p className="text-gray-300">
                The control center of the cell containing DNA. It directs all cellular activities and stores
                genetic information.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Mitochondria</h3>
              <p className="text-gray-300">
                The powerhouse of the cell. They generate ATP through cellular respiration, providing energy
                for cellular processes.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Endoplasmic Reticulum (ER)</h3>
              <p className="text-gray-300">
                A network of membranes involved in protein and lipid synthesis. Rough ER has ribosomes attached,
                while smooth ER does not.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Golgi Apparatus</h3>
              <p className="text-gray-300">
                Processes, packages, and ships proteins and lipids to their destinations. It modifies molecules
                received from the ER.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Ribosomes</h3>
              <p className="text-gray-300">
                Small organelles that synthesize proteins using instructions from mRNA. They can be free in
                the cytoplasm or attached to the ER.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">Lysosomes</h3>
              <p className="text-gray-300">
                Contain digestive enzymes to break down waste, cellular debris, and foreign invaders. They
                recycle cellular components.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#06d6a0]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#06d6a0] mt-1">•</span>
              <span>Click on organelles to select them (coming soon)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06d6a0] mt-1">•</span>
              <span>Toggle labels on/off to see the cell structure clearly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06d6a0] mt-1">•</span>
              <span>Show/hide individual organelles to study them separately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#06d6a0] mt-1">•</span>
              <span>Use mouse to rotate, zoom, and pan the 3D view</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#06d6a0]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="font-semibold mb-2 text-[#06d6a0]">Medical Research</h3>
              <p className="text-gray-300 text-sm">
                Understanding cell structure helps in developing treatments for diseases like cancer,
                where cellular processes malfunction.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="font-semibold mb-2 text-[#06d6a0]">Drug Development</h3>
              <p className="text-gray-300 text-sm">
                Knowledge of organelle functions aids in designing drugs that target specific cellular
                components.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="font-semibold mb-2 text-[#06d6a0]">Biotechnology</h3>
              <p className="text-gray-300 text-sm">
                Cell engineering for production of proteins, vaccines, and other therapeutic compounds.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#06d6a0]/20">
              <h3 className="font-semibold mb-2 text-[#06d6a0]">Education</h3>
              <p className="text-gray-300 text-sm">
                Essential foundation for biology students to understand life at the microscopic level.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/cell-structure"
            className="inline-block px-8 py-3 bg-[#06d6a0] hover:bg-[#05b38a] text-gray-950 font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
