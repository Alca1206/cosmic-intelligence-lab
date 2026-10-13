import { profile } from "@/data/profile";

// The public address of the site. We don't have a domain yet, so this reads an
// environment variable you set when deploying (NEXT_PUBLIC_SITE_URL).
// Until then it falls back to the local dev address.
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  url: rawUrl.replace(/\/$/, ""), // no trailing slash
  title: `${profile.name} | ${profile.brand}`,
  description: `Portfolio of ${profile.name}, a ${profile.role} working on machine learning, deep learning, and applied AI.`,
};