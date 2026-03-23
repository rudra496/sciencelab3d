import ProbabilityDistributionsPage from "@/experiments/probability-distributions-page";
export const dynamic = 'force-dynamic';
export default function ProbabilityDistributionsRoute() { return <ProbabilityDistributionsPage />; }

export const metadata = {
  title: "Probability Distributions - Interactive Statistics Tool",
  description: "Generate random data and watch distributions form. Compare Normal, Binomial, Poisson, and Uniform distributions in 3D. Free statistics tool.",
};
