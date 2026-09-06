export const siteSocial = {
  title: "dimasc.tf — Dimas Maulana",
  description:
    "Step inside my digital room. Security research, open-source projects, field notes, and the stories behind what I build.",
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
