import type { Metadata } from "next";

export const SITE_URL = new URL(
  process.env.SITE_URL || "https://www.kickshub.site",
).origin;
export const SOCIAL_IMAGE = "/editorial/thrifted-sneaker-wall.jpg";

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

// Prevent database content from ending an inline JSON-LD script element.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | KicksHub`,
      description,
      url,
      type: "website",
      siteName: "KicksHub",
      images: [{ url: absoluteUrl(SOCIAL_IMAGE), alt: "Pre-loved sneakers at KicksHub" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KicksHub`,
      description,
      images: [absoluteUrl(SOCIAL_IMAGE)],
    },
  };
}
