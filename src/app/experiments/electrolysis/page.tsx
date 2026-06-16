import ElectrolysisPage from "@/experiments/electrolysis-page";
export const dynamic = 'force-dynamic';
export default function ElectrolysisRoute() { return <ElectrolysisPage />; }

export const metadata = {
  title: "Electrolysis - Interactive Chemistry Experiment",
  description: "Run electrolysis experiments on water and solutions. See bubbles form at electrodes and understand redox reactions in 3D. Free chemistry lab.",
};
