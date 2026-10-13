import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, signed-in conversations.
      disallow: "/chat/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
