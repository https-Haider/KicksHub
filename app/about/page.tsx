import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "About", description: "Learn how KicksHub presents pre-owned footwear and product condition details.", alternates:{canonical:"/about"} };
export default function AboutPage(){return <main className="min-h-screen bg-background"><SiteHeader /><section className="mx-auto max-w-3xl px-4 py-20"><h1 className="text-4xl font-bold">About KicksHub</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">KicksHub is an online catalogue for pre-owned footwear in Pakistan. Each listing shows the product information currently held in our inventory, including available photos, size, condition, price and stock.</p><p className="mt-5 leading-7 text-muted-foreground">Because every pre-owned pair can be different, review the listing photos and condition description before ordering. Questions about a specific pair can be sent through our contact form.</p><div className="mt-8 flex gap-3"><Button asChild><Link href="/products">Shop products</Link></Button><Button asChild variant="outline"><Link href="/contact">Contact us</Link></Button></div></section><SiteFooter /></main>}
