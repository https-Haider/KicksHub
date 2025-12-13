import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Trusted domains for user-uploaded images
 */
const TRUSTED_IMAGE_DOMAINS = [
  "res.cloudinary.com",
  "cloudinary.com",
  "localhost",
];

/**
 * Validates if an image URL is from a trusted domain
 * Returns the URL if valid, or a placeholder if not
 */
export function getSafeImageUrl(
  url: string | undefined | null,
  placeholder = "/placeholder-image.png"
): string {
  if (!url) return placeholder;

  try {
    const parsedUrl = new URL(url);

    // Only allow https (and http for localhost in development)
    if (
      parsedUrl.protocol !== "https:" &&
      !(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost")
    ) {
      console.warn(`Blocked non-HTTPS image URL: ${url}`);
      return placeholder;
    }

    // Check if domain is trusted
    const isTrusted = TRUSTED_IMAGE_DOMAINS.some(
      (domain) =>
        parsedUrl.hostname === domain ||
        parsedUrl.hostname.endsWith(`.${domain}`)
    );

    if (!isTrusted) {
      console.warn(
        `Blocked image from untrusted domain: ${parsedUrl.hostname}`
      );
      return placeholder;
    }

    return url;
  } catch {
    // Invalid URL format
    console.warn(`Invalid image URL format: ${url}`);
    return placeholder;
  }
}

/**
 * Validates an array of image URLs, filtering out unsafe ones
 */
export function getSafeImageUrls(urls: string[] | undefined | null): string[] {
  if (!urls || !Array.isArray(urls)) return [];

  return urls
    .map((url) => getSafeImageUrl(url, ""))
    .filter((url) => url !== "");
}
