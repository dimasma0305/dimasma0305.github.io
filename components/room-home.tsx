import { DM_Sans, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";
import { RoomEnhancer } from "@/components/room-enhancer";
import { cornerTour } from "@/lib/room/tour.js";
import { createSceneSummary } from "@/lib/room/content.js";
import { getRoomPortfolio } from "@/lib/room/portfolio";
import "@/lib/room/room.css";

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-room-sans",
});
const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-room-heading",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-room-mono",
  preload: false,
});

export async function RoomHome() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const assetBase = `${basePath}/room/`;
  const portfolio = await getRoomPortfolio(basePath, assetBase);
  const html = cornerTour({
    portfolio,
    email: portfolio.email,
    site: basePath,
    assetBase,
    production: true,
  });
  return (
    <div
      className={`theme-corner-tour ${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      {/* Only our escaped, local templates and portfolio records supply HTML.
          This emits complete semantic content in the static export, not a
          client-only shell, iframe, or dependency on the preview server. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <RoomEnhancer
        assetBase={assetBase}
        sceneSummary={createSceneSummary(portfolio)}
      />
    </div>
  );
}
