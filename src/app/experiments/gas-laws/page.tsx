import GasLawsPage from "@/experiments/gas-laws-page";

export const dynamic = 'force-dynamic';

export default function GasLawsRoute() { return <GasLawsPage />; }

export const metadata = {
  title: "Gas Laws - World Class Physics Lab",
  description: "Interactive 3D ideal gas law simulation with pressure gauge, particle physics, and PV diagram.",
};
