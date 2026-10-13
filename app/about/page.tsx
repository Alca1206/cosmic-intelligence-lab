import type { Metadata } from "next";
import About from "@/components/sections/About";

export const metadata: Metadata = {
  title: "About",
  description: "Background, education and what I am looking for.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <About />;
}
