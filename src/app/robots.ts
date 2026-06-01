import type { MetadataRoute } from "next";

// Internal enterprise tool - block all crawlers
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    // No sitemap for public crawlers since this is an internal tool
  };
}
