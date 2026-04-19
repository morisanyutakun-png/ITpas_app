import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ITパス理解ノート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#fbbf24", marginBottom: 24 }}>
          ITパス理解ノート
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -1,
          }}
        >
          「過去問は解けるけど、なぜ間違えたかは説明できない」
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#cbd5e1" }}>
          を終わらせる、理解特化型の学習ノート。
        </div>
      </div>
    ),
    { ...size }
  );
}
