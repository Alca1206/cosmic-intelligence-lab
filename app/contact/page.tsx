import type { Metadata } from "next";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to get in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <Contact />;
}
