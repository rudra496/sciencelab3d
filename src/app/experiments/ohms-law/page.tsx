import OhmsLawPage from "@/experiments/ohms-law-page";
export const dynamic = 'force-dynamic';
export default function OhmsLawRoute() { return <OhmsLawPage />; }

export const metadata = {
  title: "Ohm's Law Circuit - Interactive Physics Lab",
  description: "Build circuits with resistors, batteries, and LEDs. Adjust voltage and resistance to see current flow with animated electrons. Free physics simulation.",
};
