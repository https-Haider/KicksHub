"use client";
import { Button } from "@/components/ui/button";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="flex min-h-[70vh] items-center justify-center px-4 text-center"><div><h1 className="text-3xl font-bold">Something went wrong</h1><p className="mt-3 text-muted-foreground">The page could not be loaded. Your cart has not been cleared.</p><Button className="mt-6" onClick={reset}>Try again</Button></div></main>; }
