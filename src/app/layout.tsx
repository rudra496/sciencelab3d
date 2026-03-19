import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScienceLab 3D — Interactive Science Experiments",
  description:
    "Explore 40+ interactive 3D science experiments in Physics, Chemistry, Biology, and Mathematics. Control, simulate, and learn.",
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
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
