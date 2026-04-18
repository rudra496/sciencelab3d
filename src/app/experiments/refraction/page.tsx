import RefractionPage from "@/experiments/refraction-page";

export const dynamic = 'force-dynamic';

export default function RefractionRoute() { return <RefractionPage />; }

export const metadata = { title: "Refraction - Interactive Physics Lab", description: "Interactive 3D refraction and reflection simulation with Snell's law and total internal reflection." };
