import { ImageResponse } from "next/og";

export const alt = "LI YONGJIE — Senior DevOps / Platform Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#f1efea", color: "#111111", padding: "64px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", opacity: 0.5 }}>
          <span>winson.dev</span>
          <span>Tokyo, Japan</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>LI YONGJIE</div>
          <div style={{ fontSize: 34, marginTop: 20, opacity: 0.75 }}>Senior DevOps / Platform Engineer</div>
          <div style={{ fontSize: 22, marginTop: 28, opacity: 0.55 }}>
            Cloud-native architecture · CI/CD automation · AI-powered operations
          </div>
        </div>
        <div style={{ display: "flex", height: 4, width: 160, backgroundColor: "#111111" }} />
      </div>
    ),
    size
  );
}
