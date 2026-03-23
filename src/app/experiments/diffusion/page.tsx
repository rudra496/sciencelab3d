import DiffusionPage from '@/experiments/diffusion-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <DiffusionPage />;
}

export const metadata = {
  title: "Molecular Diffusion - Interactive Chemistry Simulation",
  description: "Watch particles diffuse through a membrane between two gases. Control temperature and concentration gradients in 3D. Free virtual chemistry lab.",
};
