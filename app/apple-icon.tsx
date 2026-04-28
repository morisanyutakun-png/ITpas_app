import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    {
      id: "itpass-v2",
      contentType,
      size,
    },
  ];
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FAFAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 86,
          fontWeight: 800,
          letterSpacing: -3,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          borderRadius: 36,
        }}
      >
        iP
      </div>
    ),
    { ...size }
  );
}
