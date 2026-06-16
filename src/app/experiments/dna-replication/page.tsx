import DNAReplicationPage from '@/experiments/dna-replication-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <DNAReplicationPage />;
}

export const metadata = {
  title: "DNA Replication - Interactive 3D Biology Lab",
  description: "Watch the double helix unzip and replicate step-by-step. See helicase, polymerase, and primase in action. Free virtual biology simulation.",
};
