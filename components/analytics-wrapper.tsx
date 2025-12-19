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
    // Defer loading until browser is idle for better performance
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setMounted(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;
  return <Analytics />;
}
