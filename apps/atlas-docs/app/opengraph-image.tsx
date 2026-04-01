import { ImageResponse } from "next/og";

export const alt = "Atlas — PayGlocal UI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f6f8fa 0%, #ffffff 50%, #eff4ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0061e3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>
              Atlas
            </span>
            <span style={{ fontSize: 22, color: "#6b7280", marginTop: 4 }}>PayGlocal UI</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#374151",
            maxWidth: 720,
            lineHeight: 1.4,
          }}
        >
          Component library documentation — built like you own the source.
        </div>
      </div>
    ),
    { ...size }
  );
}
