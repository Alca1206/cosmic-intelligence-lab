import type { Metadata } from "next";
import Playground from "@/components/playground/Playground";

export const metadata: Metadata = {
  title: "ML Playground",
  description:
    "An interactive confidence calibration experiment: a real trained model, real held-out predictions, and metrics computed live in your browser.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return <Playground />;
}
