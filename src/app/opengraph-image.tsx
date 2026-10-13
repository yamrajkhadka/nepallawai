import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Nepal Law AI — Ask anything about Nepali law";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "src/assets/fonts");
const sans = await readFile(join(fonts, "Geist-Regular.ttf"));
const serif = await readFile(join(fonts, "InstrumentSerif-Regular.ttf"));
const serifItalic = await readFile(join(fonts, "InstrumentSerif-Italic.ttf"));

const CRIMSON = "#E5384F";
const PAPER = "#f4f1ea";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px 56px",
          fontFamily: "Sans",
          borderTop: "8px solid #3b6cf6",
          backgroundColor: "#09090b",
          color: PAPER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              backgroundImage: "linear-gradient(135deg, #3b6cf6, #1d3fd1)",
            }}
          >
            <svg width="64" height="64" viewBox="-6 -6 36 36" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="m19 8 3 8a5 5 0 0 1-6 0zV7" />
              <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" />
              <path d="m5 8 3 8a5 5 0 0 1-6 0zV7" />
              <path d="M7 21h10" />
            </svg>
          </div>
          <div style={{ display: "flex", fontFamily: "Serif", fontSize: 44, letterSpacing: -0.5 }}>
            Nepal Law&nbsp;
            <span style={{ color: CRIMSON }}>AI</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Serif", fontSize: 88, lineHeight: 1.05, letterSpacing: -1.5 }}>Research Nepali law,</div>
          <div style={{ fontFamily: "Serif", fontSize: 88, lineHeight: 1.05, letterSpacing: -1.5 }}>
            with the section cited.
          </div>
          <div style={{ marginTop: 24, fontSize: 27, color: "rgba(244,241,234,0.7)", maxWidth: 860, lineHeight: 1.4 }}>
            Plain-language answers grounded in the Constitution, the Civil Code and the Penal Code — with the exact section
            cited.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 22px 14px 14px",
              borderRadius: 20,
              backgroundColor: "rgba(229,56,79,0.14)",
              border: "1px solid rgba(229,56,79,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 12,
                backgroundColor: "rgba(12,15,26,0.7)",
                fontSize: 26,
              }}
            >
              <span style={{ fontFamily: "Serif", color: CRIMSON }}>§</span>
              <span>241</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Serif", fontSize: 30 }}>Prohibition of theft</span>
              <span style={{ fontSize: 20, color: "rgba(244,241,234,0.6)" }}>National Penal Code 2017</span>
            </div>
          </div>
          <div style={{ fontSize: 24, color: "rgba(244,241,234,0.55)" }}>{new URL(siteConfig.url).host}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sans", data: sans, style: "normal", weight: 400 },
        { name: "Serif", data: serif, style: "normal", weight: 400 },
        { name: "Serif Italic", data: serifItalic, style: "italic", weight: 400 },
      ],
    },
  );
}
