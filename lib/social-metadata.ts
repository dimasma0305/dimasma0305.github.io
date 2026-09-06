export const siteSocial = {
  title: "dimasc.tf — Dimas Maulana",
  description:
    "Dimas Maulana’s digital room: security research, CTF writeups, open-source projects, technical notes, and source code security reviews.",
  image: "/social/room-v1.jpg",
  imageAlt:
    "dimasc.tf — Dimas Maulana’s warmly lit 3D room, DM monogram, and the words ‘A room for curiosity.’",
  width: 1200,
  height: 630,
} as const;

export function socialImage(baseUrl: string) {
  return {
    url: `${baseUrl.replace(/\/$/, "")}${siteSocial.image}`,
    width: siteSocial.width,
    height: siteSocial.height,
    alt: siteSocial.imageAlt,
    type: "image/jpeg",
  };
}
