'use client';

import Link from 'next/link';

export default function DNAReplicationDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#3b82f6]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#3b82f6]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            <h1 className="text-2xl font-bold text-[#3b82f6]">DNA Replication</h1>
          </div>
          <Link
            href="/experiments/dna-replication"
            className="px-4 py-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-lg border border-[#3b82f6]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#3b82f6]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            DNA replication is the biological process of producing two identical replicas of DNA from one
            original DNA molecule. This process is fundamental to cell division and the transmission of genetic
            information from one generation to the next.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#3b82f6]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Helicase</h3>
              <p className="text-gray-300">
                An enzyme that unwinds the DNA double helix at the replication fork, separating the two strands
                to create single-stranded DNA templates.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">DNA Polymerase</h3>
              <p className="text-gray-300">
                Adds nucleotides to the growing DNA strand, complementary to the template strand. It also
                proofreads and corrects errors.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Primase</h3>
              <p className="text-gray-300">
                Synthesizes short RNA primers that provide a starting point for DNA polymerase to begin
                adding nucleotides.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Semi-Conservative</h3>
              <p className="text-gray-300">
                Each new DNA molecule consists of one original (conserved) strand and one newly synthesized
                strand.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#3b82f6]">Stages of Replication</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#3b82f6]">1. Initiation</h3>
              <p className="text-gray-300">
                Origin of replication is recognized, helicase binds and begins unwinding the DNA.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#3b82f6]">2. Elongation</h3>
              <p className="text-gray-300">
                Primase lays down RNA primers, DNA polymerase extends new strands in 5' to 3' direction.
                Leading strand synthesizes continuously; lagging strand synthesizes in Okazaki fragments.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#3b82f6]">3. Termination</h3>
              <p className="text-gray-300">
                Replication forks meet, RNA primers are replaced with DNA, fragments are joined by ligase.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#3b82f6]">How to Use</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#3b82f6] mt-1">•</span>
              <span>Select different stages to see the replication process step by step</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3b82f6] mt-1">•</span>
              <span>Toggle enzyme visibility to focus on specific enzymes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3b82f6] mt-1">•</span>
              <span>Adjust speed to control the animation rate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3b82f6] mt-1">•</span>
              <span>Use mouse to rotate and zoom the 3D double helix</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#3b82f6]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="font-semibold mb-2 text-[#3b82f6]">PCR Technology</h3>
              <p className="text-gray-300 text-sm">
                Polymerase Chain Reaction uses DNA replication principles to amplify DNA for research and
                diagnostics.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="font-semibold mb-2 text-[#3b82f6]">Cancer Research</h3>
              <p className="text-gray-300 text-sm">
                Understanding replication errors helps explain mutations and develop targeted cancer therapies.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="font-semibold mb-2 text-[#3b82f6]">Genetic Engineering</h3>
              <p className="text-gray-300 text-sm">
                Manipulating DNA replication enables gene editing, cloning, and biotechnology applications.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#3b82f6]/20">
              <h3 className="font-semibold mb-2 text-[#3b82f6]">Forensics</h3>
              <p className="text-gray-300 text-sm">
                DNA replication techniques allow analysis of tiny samples for identification purposes.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/dna-replication"
            className="inline-block px-8 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
