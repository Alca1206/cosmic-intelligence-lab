import { decodePixels, IMAGE_SIDE, MAX_PIXEL } from "@/lib/ml/dataset";

// Draws an 8x8 digit as SVG squares. Decorative: the parent supplies the text label.
export default function DigitImage({ pixels, className = "" }: { pixels: string; className?: string }) {
  const values = decodePixels(pixels);
  return (
    <svg
      viewBox={`0 0 ${IMAGE_SIDE} ${IMAGE_SIDE}`}
      className={`block rounded-sm bg-black ${className}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {values.map((v, i) => {
        const level = Math.round((v / MAX_PIXEL) * 255);
        return (
          <rect
            key={i}
            x={i % IMAGE_SIDE}
            y={Math.floor(i / IMAGE_SIDE)}
            width="1"
            height="1"
            fill={`rgb(${level} ${level} ${level})`}
          />
        );
      })}
    </svg>
  );
}
