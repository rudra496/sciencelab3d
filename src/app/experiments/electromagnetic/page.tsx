import ElectromagneticPage from "@/experiments/electromagnetic-page";

export const dynamic = 'force-static';

export default function ElectromagneticRoute() { return <ElectromagneticPage />; }

export const metadata = { title: "Electromagnetic Field - Interactive Physics Lab", description: "Interactive 3D electromagnetic field visualization with field lines, equipotential surfaces, and force vectors." };
