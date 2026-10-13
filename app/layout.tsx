import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import { siteConfig } from "@/lib/site";
import { profile } from "@/data/profile";

// Self-hosted variable fonts: files live in app/fonts, so the build never
// depends on Google's servers and visitors make no third-party requests.
const displayFace = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  variable: "--font-display-face",
  weight: "200 800",
  display: "swap",
});

const bodyFace = localFont({
  src: "./fonts/HankenGrotesk.woff2",
  variable: "--font-body-face",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: profile.brand,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

// Colors the browser toolbar on phones to match the page.
export const viewport: Viewport = {
  themeColor: "#080b14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFace.variable} ${bodyFace.variable}`}>
      <body className="min-h-screen">
        <CosmicBackground />
        <Navbar />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}