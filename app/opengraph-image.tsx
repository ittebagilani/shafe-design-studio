import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0e8d8",
        }}
      >
        <div style={{ fontSize: 108, color: "#171310", letterSpacing: 12 }}>
          {SITE_NAME.split(" ")[0].toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 28,
            width: 120,
            height: 2,
            background: "#171310",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#000000",
            letterSpacing: 8,
          }}
        >
          DESIGN STUDIO
        </div>
      </div>
    ),
    size,
  );
}
