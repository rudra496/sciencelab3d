import ThermochemistryPage from "@/experiments/thermochemistry-page";
export const dynamic = 'force-dynamic';
export default function ThermochemistryRoute() { return <ThermochemistryPage />; }

export const metadata = {
  title: "Thermochemistry - Interactive Chemistry Lab",
  description: "Visualize energy changes during chemical reactions. See bonds break and form with energy diagrams and temperature effects. Free chemistry simulation.",
};
