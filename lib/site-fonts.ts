import { DM_Sans, DM_Serif_Display } from "next/font/google";

// The room and the reading pages share the same self-hosted typefaces.
export const roomSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-room-sans",
});

export const roomHeading = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-room-heading",
});
