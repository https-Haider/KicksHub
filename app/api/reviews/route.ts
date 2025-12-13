import { NextResponse } from "next/server";
import { getAllReviews, getReviewStats, addReview } from "@/lib/reviews.server";

// GET /api/reviews?sort=newest&limit=10&offset=0
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") as
      | "newest"
      | "oldest"
      | "highest"
      | "lowest"
      | "most-helpful"
      | null;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const statsOnly = searchParams.get("statsOnly") === "true";

    // If only stats are requested
    if (statsOnly) {
      const stats = await getReviewStats();
      return NextResponse.json({ stats });
    }

    // Get all site-wide reviews and stats together
    const [reviews, stats] = await Promise.all([
      getAllReviews({
        sort: sort || "newest",
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }),
      getReviewStats(),
    ]);

    return NextResponse.json({ reviews, stats });
  } catch (err: unknown) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new site-wide review
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "rating is required and must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!body.authorName || typeof body.authorName !== "string") {
      return NextResponse.json(
        { error: "authorName is required" },
        { status: 400 }
      );
    }

    // Validate image URLs - only allow Cloudinary URLs
    let validatedImages: string[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      validatedImages = body.images.filter((url: unknown) => {
        if (typeof url !== "string") return false;
        try {
          const parsed = new URL(url);
          return (
            parsed.protocol === "https:" &&
            (parsed.hostname === "res.cloudinary.com" ||
              parsed.hostname.endsWith(".cloudinary.com"))
          );
        } catch {
          return false;
        }
      });
      // If some images were filtered out, log it
      if (validatedImages.length !== body.images.length) {
        console.warn(
          `Filtered ${
            body.images.length - validatedImages.length
          } invalid image URLs from review submission`
        );
      }
    }

    // Sanitize inputs - productId is optional for site-wide reviews
    const review = await addReview({
      productId: body.productId || undefined,
      rating: Math.round(body.rating),
      content: body.content?.trim() || undefined,
      images: validatedImages.length > 0 ? validatedImages : undefined,
      authorName: body.authorName.trim(),
      authorEmail: body.authorEmail?.trim() || undefined,
      verified: body.verified || false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
