import type { Metadata } from "next";
import Skills from "@/components/sections/Skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Tools and methods, grouped by area.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return <Skills />;
}
