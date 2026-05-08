import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://seoreportpad.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog/automated-seo-reporting`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog/white-label-seo-reports`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog/client-seo-dashboards`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog/seo-audit-competitor-reporting`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog/scaling-seo-agency`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];
}
