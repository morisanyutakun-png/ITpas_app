import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          fontWeight: 900,
          fontFamily:
            "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', system-ui, sans-serif",
        }}
      >
        理
      </div>
    ),
    { ...size }
  );
}
