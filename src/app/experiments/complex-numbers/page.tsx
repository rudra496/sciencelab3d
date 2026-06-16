import ComplexNumbersPage from "@/experiments/complex-numbers-page";
export const dynamic = 'force-dynamic';
export default function ComplexNumbersRoute() { return <ComplexNumbersPage />; }

export const metadata = {
  title: "Complex Number Plane - Interactive Math Visualization",
  description: "Visualize complex numbers on the Argand plane. Perform arithmetic operations and see geometric interpretations in 3D. Free math explorer.",
};
