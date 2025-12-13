import { NextResponse } from "next/server";
import {
  getReviewById,
  updateReview,
  deleteReview,
  voteReviewHelpful,
} from "@/lib/reviews.server";

type Context = { params: { id: string } | Promise<{ id: string }> };

// GET /api/reviews/[id] - Get a single review
export async function GET(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const reviewId = params.id;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (err: unknown) {
    console.error(
      "GET /api/reviews/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Update a review or vote
export async function PATCH(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const reviewId = params.id;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Handle helpful vote
    if (body.action === "vote") {
      const isHelpful = body.isHelpful === true;
      const review = await voteReviewHelpful(reviewId, isHelpful);
      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(review);
    }

    // Handle review update
    const updates: Partial<{ rating: number; title: string; content: string }> =
      {};
    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { error: "rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      updates.rating = Math.round(body.rating);
    }
    if (body.title !== undefined) {
      updates.title = body.title?.trim() || undefined;
    }
    if (body.content !== undefined) {
      updates.content = body.content?.trim() || undefined;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const review = await updateReview(reviewId, updates);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (err: unknown) {
    console.error(
      "PATCH /api/reviews/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const reviewId = params.id;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteReview(reviewId);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(
      "DELETE /api/reviews/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
