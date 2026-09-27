import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ProductNotFound() {
  return <main className="min-h-screen bg-background"><SiteHeader /><section className="mx-auto max-w-xl px-4 py-24 text-center"><p className="text-sm font-semibold text-primary">404</p><h1 className="mt-2 text-4xl font-bold">Product not found</h1><p className="mt-4 text-muted-foreground">This pair may have been removed, sold, or its address may be incorrect.</p><Button asChild className="mt-8"><Link href="/products">Browse available products</Link></Button></section><SiteFooter /></main>;
}
