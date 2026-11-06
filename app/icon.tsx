
import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 4 L61 38 L96 50 L61 62 L50 96 L39 62 L4 50 L39 38 Z"
            fill="#a78bfa"
          />
          <circle cx="50" cy="50" r="9" fill="#ffffff" />
        </svg>
      </div>
    ),
    size
  );
}

// Needed for the static export: this file is turned into a plain file at build time.
export const dynamic = "force-static";
