import { IBM_Plex_Mono } from "next/font/google";
import { roomSans as sans, roomHeading as serif } from "@/lib/site-fonts";
import { RoomEnhancer } from "@/components/room-enhancer";
import { cornerTour } from "@/lib/room/tour.js";
import { createSceneSummary } from "@/lib/room/content.js";
import { getRoomPortfolio } from "@/lib/room/portfolio";
import "@/lib/room/room.css";
import "@/lib/room/mobile.css";
import "@/lib/room/story.css";

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
