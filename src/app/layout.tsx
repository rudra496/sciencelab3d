import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ScienceLab 3D — Interactive Science Experiments",
  description:
    "Explore 40+ interactive 3D science experiments in Physics, Chemistry, Biology, and Mathematics. Control variables, watch simulations, and learn science like never before.",
  keywords: [
    "science education",
    "3D experiments",
    "interactive learning",
    "physics simulations",
    "chemistry experiments",
    "biology education",
    "mathematics visualization",
    "STEM education",
    "virtual lab",
    "science lab",
  ],
  authors: [{ name: "Rudra Sarker", url: "https://rudra496.github.io/site" }],
  creator: "Rudra Sarker",
  publisher: "Rudra Sarker",
  metadataBase: new URL("https://science-lab-3d.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://science-lab-3d.vercel.app",
    title: "ScienceLab 3D — Interactive Science Experiments",
    description:
      "Explore 40+ interactive 3D science experiments in Physics, Chemistry, Biology, and Mathematics. Control variables, watch simulations, and learn science like never before.",
    siteName: "ScienceLab 3D",
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScienceLab 3D — Interactive Science Experiments",
    description:
      "Explore 40+ interactive 3D science experiments in Physics, Chemistry, Biology, and Mathematics.",
    images: [],
    creator: "@rudra496",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="m-0 p-0">{children}</body>
    </html>
  );
}
