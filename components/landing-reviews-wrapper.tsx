"use client";

import dynamic from "next/dynamic";

// Lazy load the heavy reviews component
const LandingReviews = dynamic(
  () => import("@/components/reviews/landing-reviews").then((mod) => mod.LandingReviews),
  { 
    ssr: false,
    loading: () => (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    )
  }
);

export function LandingReviewsWrapper() {
  return <LandingReviews />;
}
