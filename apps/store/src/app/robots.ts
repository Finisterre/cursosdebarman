import { getBaseUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/checkout", "/checkout/", "/api", "/api/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
