import type { Metadata } from "next";
import Research from "@/components/sections/Research";

export const metadata: Metadata = {
  title: "Research",
  description: "Research questions, methods and findings. Currently a working thesis proposal; no results are claimed.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  return <Research />;
}
