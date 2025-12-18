import { NextResponse } from "next/server";
import {
  GenerateSeoRequestSchema,
  generateSeoWithAI,
  type GenerateSeoResponse,
} from "@/lib/ai/seo";

// Rate limit configuration (for future use)
// const RATE_LIMIT = 50;
// const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    // 1. Admin authentication check
    const authHeader = req.headers.get("x-admin-password");
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error(
        "[AI-SEO] ADMIN_PASSWORD environment variable is not configured"
      );
      return NextResponse.json(
        { error: "Server configuration error. Contact administrator." },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== adminPassword) {
      console.log(
        `[AI-SEO] Unauthorized access attempt at ${new Date().toISOString()}`
      );
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Use a simple admin identifier for rate limiting
    const adminUserId = "admin";

    // 2. Rate limit check (disabled during development - uncomment for production)
    // const rateLimitResult = await checkMongoRateLimit({
    //   userId: adminUserId,
    //   endpoint: "generate-seo",
    //   limit: RATE_LIMIT,
    //   windowMs: RATE_LIMIT_WINDOW_MS,
    // });

    // if (!rateLimitResult.allowed) {
    //   console.log(
    //     `[AI-SEO] Rate limit exceeded for admin at ${new Date().toISOString()}`
    //   );
    //   return NextResponse.json(
    //     {
    //       error: "Rate limit exceeded. Maximum 50 requests per hour.",
    //       resetAt: rateLimitResult.resetAt.toISOString(),
    //     },
    //     {
    //       status: 429,
    //       headers: {
    //         "X-RateLimit-Remaining": "0",
    //         "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
    //       },
    //     }
    //   );
    // }

    // 3. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = GenerateSeoRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // 4. Log request metadata (no sensitive data)
    console.log(
      `[AI-SEO] Request from admin at ${new Date().toISOString()} - title length: ${
        input.title.length
      }, has category: ${!!input.category}, has brand: ${!!input.brand}`
    );

    // 5. Call AI to generate SEO
    let seoData: GenerateSeoResponse;
    try {
      seoData = await generateSeoWithAI(input);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[AI-SEO] AI generation failed at ${new Date().toISOString()}:`,
        errorMessage
      );

      // Pass through meaningful error messages
      const isApiKeyError =
        errorMessage.toLowerCase().includes("api key") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("invalid");

      return NextResponse.json(
        {
          error: isApiKeyError
            ? "AI API key is invalid or expired. Please check your configuration."
            : `AI service error: ${errorMessage}`,
        },
        { status: 502 }
      );
    }

    // 6. Log success
    console.log(
      `[AI-SEO] Success at ${new Date().toISOString()} - metaTitle: ${
        seoData.metaTitle.length
      } chars, keywords: ${seoData.keywords.length}`
    );

    // 7. Return response
    return NextResponse.json(seoData);
  } catch (error) {
    console.error(
      `[AI-SEO] Unexpected error at ${new Date().toISOString()}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
