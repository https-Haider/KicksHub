"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy load Analytics after page is interactive
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false }
);

export function AnalyticsWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer loading until after initial render
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  return <Analytics />;
}
