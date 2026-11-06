import { ImageResponse } from "next/og";
import LogoMark from "@/lib/logo-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The icon iPhones use when someone adds the site to their home screen.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080b14",
        }}
      >
        <LogoMark size={120} />
      </div>
    ),
    { ...size },
  );
}

// Needed for the static export: this file is turned into a plain file at build time.
export const dynamic = "force-static";
