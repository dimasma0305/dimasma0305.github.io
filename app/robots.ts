import { MetadataRoute } from "next";
import { siteUrls } from "@/lib/site-seo";

// Configure for static export
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrls.asset("/sitemap.xml"),
  };
}
