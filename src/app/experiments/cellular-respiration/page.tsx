import CellularRespirationPage from '@/experiments/cellular-respiration-page';

export const dynamic = 'force-dynamic';

export default function Route() {
  return <CellularRespirationPage />;
}

export const metadata = {
  title: "Cellular Respiration - Interactive Biology Simulation",
  description: "Trace glucose through glycolysis, Krebs cycle, and electron transport chain. See ATP production in 3D mitochondria. Free biology visualization.",
};
