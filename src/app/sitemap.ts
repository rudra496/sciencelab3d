import { MetadataRoute } from "next";
import { experiments } from "@/data/experiments";

const SITE_URL = "https://science-lab-3d.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // Experiment pages
  const experimentRoutes: MetadataRoute.Sitemap = experiments.flatMap((exp) => [
    {
      url: `${SITE_URL}/experiments/${exp.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/experiments/${exp.id}/details`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...experimentRoutes];
}
