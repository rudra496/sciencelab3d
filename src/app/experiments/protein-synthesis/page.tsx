import ProteinSynthesisPage from '@/experiments/protein-synthesis-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <ProteinSynthesisPage />;
}

export const metadata = {
  title: "Protein Synthesis - Interactive 3D Biology Lab",
  description: "Follow transcription and translation in 3D. Watch mRNA leave the nucleus and ribosomes build proteins codon by codon. Free biology simulation.",
};
