import { readFile } from "node:fs/promises";
import path from "node:path";
import records from "@/lib/portfolio-data.json";
import { faqs } from "@/lib/services-data";
import { roomAsset } from "./assets.js";
import {
  projectStories,
  researchEvidence,
  resultEvidence,
} from "../portfolio-stories";
import deskUpdate from "../desk-update.json";

export interface WritingEntry {
  title: string;
  slug: string;
  date: string;
  categories: string[];
  minutes: number | null;
  href: string;
}

interface IndexEntry {
  title?: string;
  slug?: string;
  created_time?: string;
  categories?: string[];
  reading_time?: number;
  archived?: boolean;
  properties?: { published?: boolean };
}

// Read only public metadata produced by the existing hourly content workflow.
// Article bodies and Notion credentials never enter the room's client bundle.
export function writingFromIndex(
  index: { posts?: { all?: IndexEntry[] } },
  kind: "posts" | "notes",
  basePath = "",
): WritingEntry[] {
  return (index.posts?.all || [])
    .filter(
      (entry) =>
        entry.properties?.published === true &&
        !entry.archived &&
        entry.slug &&
        entry.title,
    )
    .map((entry) => ({
      title: entry.title!,
      slug: entry.slug!,
      date: entry.created_time || "1970-01-01T00:00:00Z",
      categories: entry.categories || [],
      minutes: entry.reading_time || null,
      href: `${basePath}/${kind}/${encodeURIComponent(entry.slug!)}/`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function assembleRoomPortfolio(
  posts: WritingEntry[],
  notes: WritingEntry[],
  assetBase: string,
) {
  return {
    ...records,
    projectStories,
    researchEvidence,
    resultEvidence,
    deskUpdate,
    photos: records.photos.map((photo) => ({
      ...photo,
      src: roomAsset(assetBase, photo.src),
    })),
    services: { ...records.services, faqs },
    posts,
    notes,
  };
}

export async function getRoomPortfolio(basePath: string, assetBase: string) {
  const indexes = await Promise.all(
    ["blog", "notes"].map(async (name) => {
      try {
        return JSON.parse(
          await readFile(
            path.join(process.cwd(), "public", `${name}-index.json`),
            "utf8",
          ),
        );
      } catch (error) {
        // A local clean checkout can still render the portfolio before content is
        // refreshed. CI validates its indexes before the production build.
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return { posts: { all: [] } };
        }
        throw error;
      }
    }),
  );
  return assembleRoomPortfolio(
    writingFromIndex(indexes[0], "posts", basePath),
    writingFromIndex(indexes[1], "notes", basePath),
    assetBase,
  );
}

export type RoomPortfolio = ReturnType<typeof assembleRoomPortfolio>;
