"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartButton } from "@/components/cart-button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "New drop", href: "/products?sort=newest" },
  { label: "Shop all", href: "/products" },
  { label: "Our process", href: "/about" },
  { label: "FAQ", href: "/contact#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(246,242,234,.92)] backdrop-blur-xl">
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[.18em] text-cream">One pair per listing · Nationwide delivery across Pakistan</div>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-9 rotate-[-4deg] place-items-center rounded-full bg-rust text-sm font-black text-white transition-transform group-hover:rotate-0">KH</span>
          <span className="font-display text-2xl font-black tracking-[-.05em] text-ink">KicksHub<span className="text-rust">.</span></span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => <Link key={item.label} href={item.href} className={`nav-link ${pathname === item.href ? "text-rust" : "text-ink"}`}>{item.label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <CartButton />
          <button type="button" className="grid size-9 place-items-center rounded-full border border-black/15 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </div>
      </nav>
      {open && <div id="mobile-menu" className="animate-menu border-t border-black/10 bg-cream px-4 py-5 md:hidden"><div className="mx-auto grid max-w-7xl gap-1">
        {navigation.map((item, index) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-lg font-semibold hover:bg-black/5"><span>{item.label}</span><span className="text-xs text-muted-foreground">0{index + 1}</span></Link>)}
        <Link href="/contact" onClick={() => setOpen(false)} className="mt-3 rounded-full bg-rust px-5 py-3 text-center text-sm font-bold text-white">Ask us about a pair</Link>
      </div></div>}
    </header>
  );
}
