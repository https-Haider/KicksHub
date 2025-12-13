import { NextResponse } from "next/server";

/** Redirect /sitemap.xml to /sitemap for better compatibility with search engines */
export async function GET() {
  return NextResponse.redirect(
    new URL("/sitemap", process.env.SITE_URL || "https://www.kickshub.site"),
    301
  );
}
