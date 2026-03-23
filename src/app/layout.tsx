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

const SITE_URL = "https://science-lab-3d.vercel.app";
const SITE_NAME = "ScienceLab 3D";
const SITE_TITLE = "ScienceLab 3D — Interactive 3D Science Experiments | Physics, Chemistry, Biology, Math";
const SITE_DESCRIPTION =
  "Explore 40+ free interactive 3D science experiments in Physics, Chemistry, Biology, and Mathematics. Control variables, watch real-time simulations, and learn STEM like never before. No download required.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "science education",
    "3D science experiments",
    "interactive learning",
    "physics simulations",
    "chemistry experiments",
    "biology education",
    "mathematics visualization",
    "STEM education",
    "virtual science lab",
    "online science lab",
    "free science experiments",
    "interactive 3D simulations",
    "pendulum simulation",
    "projectile motion",
    "DNA replication",
    "periodic table",
    "gas laws",
    "cell structure",
    "Mandelbrot fractal",
    "Fourier transform",
    "science for students",
    "high school physics",
    "college chemistry",
    "biology visualization",
    "math explorer",
    "Rudra Sarker",
    "sciencelab3d",
  ],
  authors: [{ name: "Rudra Sarker", url: "https://rudra496.github.io/site" }],
  creator: "Rudra Sarker",
  publisher: "Rudra Sarker",
  category: "Education",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScienceLab 3D — Interactive 3D Science Experiments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@rudra496",
    site: "@rudra496",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Replace with actual Google Search Console verification code when available
    // google: "your-actual-google-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: "Rudra Sarker",
        url: "https://rudra496.github.io/site",
        sameAs: [
          "https://rudra496.github.io/site",
          "https://www.linkedin.com/in/rudrasarker",
          "https://www.facebook.com/share/1AHSdHLeoz/",
          "https://github.com/rudra496",
          "mailto:rudrasarker125@gmail.com",
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      founder: {
        "@type": "Person",
        name: "Rudra Sarker",
        url: "https://rudra496.github.io/site",
      },
    },
  ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="m-0 p-0">{children}</body>
    </html>
  );
}
