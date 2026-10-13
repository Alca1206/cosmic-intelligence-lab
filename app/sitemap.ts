import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { projectDetails } from "@/data/project-details";
import { projects } from "@/data/projects";

// Tells search engines which pages exist.
export default function sitemap(): MetadataRoute.Sitemap {
  const detailPages = projects
    .filter((p) => projectDetails[p.slug])
    .map((p) => ({
      url: `${siteConfig.url}/projects/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  return [{ url: siteConfig.url, changeFrequency: "monthly", priority: 1 }, ...detailPages];
}