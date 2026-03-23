import EcosystemPage from '@/experiments/ecosystem-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <EcosystemPage />;
}

export const metadata = {
  title: "Ecosystem Food Web - Interactive Biology Simulation",
  description: "Build and explore food webs in 3D. Add/remove species and watch population dynamics change in real-time. Free online ecology lab.",
};
