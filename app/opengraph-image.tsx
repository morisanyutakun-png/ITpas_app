import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ITpass";
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
          ITpass
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -1,
          }}
        >
          カリキュラム地図で現在地を見て、過去問で攻める。
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#cbd5e1" }}>
          ITパスポート学習の地図と現在地を、ひとつのアプリで。
        </div>
      </div>
    ),
    { ...size }
  );
}
