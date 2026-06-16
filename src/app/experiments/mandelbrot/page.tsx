import MandelbrotPage from "@/experiments/mandelbrot-page";
export const dynamic = 'force-dynamic';
export default function MandelbrotRoute() { return <MandelbrotPage />; }

export const metadata = {
  title: "Mandelbrot Fractal - Interactive 3D Math Explorer",
  description: "Dive into the infinite Mandelbrot set in 3D. Zoom into regions and watch fractal detail emerge at every scale. Free fractal explorer.",
};
