import { experiments } from "@/data/experiments";
import ExperimentRedirectClient from "./ExperimentRedirectClient";

export function generateStaticParams() {
  return experiments.map((exp) => ({
    id: exp.id,
  }));
}

export default function ExperimentRedirectPage() {
  return <ExperimentRedirectClient />;
}
