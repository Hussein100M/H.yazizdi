import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // الصفحات الخاصة والمحتوى المدفوع خارج الفهرسة
        disallow: ["/dashboard", "/learn", "/checkout", "/admin", "/api", "/login", "/register"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
