import TitrationPage from "@/experiments/titration-page";
export const dynamic = 'force-dynamic';
export default function TitrationRoute() { return <TitrationPage />; }

export const metadata = {
  title: "Acid-Base Titration - Interactive Chemistry Lab",
  description: "Perform virtual titration. Control the burette drop-by-drop and watch the pH indicator change color at the equivalence point. Free chemistry lab.",
};
