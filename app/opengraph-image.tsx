import { ImageResponse } from "next/og";
import LogoMark from "@/lib/logo-mark";
import { profile } from "@/data/profile";

export const alt = `${profile.name} | ${profile.brand}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview card shown when the link is shared on LinkedIn, Slack, email, etc.
// Text comes from data/profile.ts, so it stays in sync with the site.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#080b14",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(155,140,255,0.30), rgba(8,11,20,0) 55%)",
          color: "#f3f5fa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <LogoMark size={56} />
          <div style={{ display: "flex", fontSize: 30, color: "#a1a9bc" }}>
            {profile.brand}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {profile.heroHeadline.first}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#9b8cff",
            }}
          >
            {profile.heroHeadline.second}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <div style={{ display: "flex", color: "#f3f5fa" }}>{profile.name}</div>
          <div style={{ display: "flex", color: "#a1a9bc" }}>{profile.role}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}