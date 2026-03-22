'use client';

import Link from 'next/link';

export default function ProteinSynthesisDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#8b5cf6]/20 to-gray-950 text-gray-100">
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-[#8b5cf6]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <h1 className="text-2xl font-bold text-[#8b5cf6]">Protein Synthesis</h1>
          </div>
          <Link
            href="/experiments/protein-synthesis"
            className="px-4 py-2 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg border border-[#8b5cf6]/50 transition-colors"
          >
            ← Back to Simulation
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#8b5cf6]">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Protein synthesis is the cellular process of building proteins from genetic information encoded in
            DNA. It occurs in two main stages: transcription (DNA to mRNA in nucleus) and translation (mRNA to
            protein at ribosomes). This fundamental process enables cells to produce the proteins needed for
            structure, function, and regulation.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#8b5cf6]">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Transcription</h3>
              <p className="text-gray-300">
                The first stage where RNA polymerase reads the DNA template and synthesizes a complementary
                mRNA strand. This occurs in the nucleus of eukaryotic cells.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">mRNA Processing</h3>
              <p className="text-gray-300">
                Before leaving the nucleus, pre-mRNA is modified: a 5' cap is added, a poly-A tail is added,
                and introns are removed by splicing.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-xl font-semibold mb-2 text-amber-400">Translation</h3>
              <p className="text-gray-300">
                At the ribosome, mRNA codons are read and matched with tRNA anticodons carrying specific amino
                acids. The ribosome catalyzes peptide bond formation between amino acids.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">The Genetic Code</h3>
              <p className="text-gray-300">
                Triplets of nucleotides (codons) specify amino acids. There are 64 possible codons but only
                20 amino acids, making the code redundant (multiple codons can code for the same amino acid).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#8b5cf6]">Process Steps</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#8b5cf6]">1. Initiation</h3>
              <p className="text-gray-300">
                Ribosome assembles at the start codon (AUG) on mRNA. The first tRNA carrying methionine binds
                to the P site.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#8b5cf6]">2. Elongation</h3>
              <p className="text-gray-300">
                tRNAs bring amino acids to the A site, peptide bonds form, and the ribosome translocates along
                the mRNA.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="text-lg font-semibold mb-2 text-[#8b5cf6]">3. Termination</h3>
              <p className="text-gray-300">
                When a stop codon is reached, release factors bind and the completed polypeptide is released.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#8b5cf6]">Applications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="font-semibold mb-2 text-[#8b5cf6]">Antibiotics</h3>
              <p className="text-gray-300 text-sm">
                Many antibiotics target bacterial protein synthesis without affecting human cells.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="font-semibold mb-2 text-[#8b5cf6]">Genetic Disorders</h3>
              <p className="text-gray-300 text-sm">
                Understanding protein synthesis helps treat diseases caused by protein misfolding or deficiency.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="font-semibold mb-2 text-[#8b5cf6]">Biotechnology</h3>
              <p className="text-gray-300 text-sm">
                Recombinant protein production for therapeutics like insulin and growth hormones.
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-[#8b5cf6]/20">
              <h3 className="font-semibold mb-2 text-[#8b5cf6]">Gene Therapy</h3>
              <p className="text-gray-300 text-sm">
                Delivering functional genes to compensate for defective ones in genetic diseases.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/experiments/protein-synthesis"
            className="inline-block px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold rounded-lg transition-colors"
          >
            Launch Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
