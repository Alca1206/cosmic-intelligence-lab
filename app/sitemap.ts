import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { projects } from "@/data/projects";

// Tells search engines which pages exist.
export default function sitemap(): MetadataRoute.Sitemap {
  const detailPages = projects
    .filter((p) => p.detail)
    .map((p) => ({
      url: `${siteConfig.url}/projects/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  const pages = ["", "/projects", "/research", "/playground", "/skills", "/about", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [...pages, ...detailPages];
}