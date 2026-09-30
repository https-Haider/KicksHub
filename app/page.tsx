import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, RefreshCw, Search, ShieldCheck, Sparkles } from "lucide-react";
import { getAllProducts } from "@/lib/products.server";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LandingReviewsWrapper } from "@/components/landing-reviews-wrapper";

export const dynamic = "force-dynamic";

export default async function Home() {
  let all: any[] = [];
  try { all = await getAllProducts(); } catch { all = []; }
  const featured = all.filter((product) => product.inStock !== false && (product.stockQuantity ?? 1) > 0).slice(0, 4);

  return <main className="min-h-screen overflow-hidden bg-cream text-ink">
    <SiteHeader />
    <section className="relative min-h-[680px] border-b border-black/10 lg:min-h-[760px]">
      <Image src="/editorial/thrifted-sneaker-wall.jpg" alt="A curated collection of gently worn vintage sneakers in the KicksHub studio" fill priority sizes="100vw" className="object-cover object-[67%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#ede6d9] via-[#ede6d9]/90 to-transparent lg:via-[#ede6d9]/55" />
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:min-h-[760px] lg:px-8">
        <div className="animate-rise max-w-2xl">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-rust"><Sparkles className="size-4" /> Freshly curated · Drop 09</div>
          <h1 className="font-display text-[clamp(3.7rem,8vw,7.8rem)] font-black leading-[.82] tracking-[-.075em]">Worn in.<br/><span className="text-rust">Never worn out.</span></h1>
          <p className="mt-8 max-w-lg text-lg leading-7 text-ink/70">Distinctive pre-loved sneakers with history, character, and plenty of miles left. Every pair is photographed and graded individually.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/products" className="cta-primary">Shop the latest drop <ArrowRight /></Link><Link href="/about" className="cta-secondary">How we pick each pair</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-ink/65"><span className="flex items-center gap-2"><Check className="size-4 text-rust"/>Real pair photos</span><span className="flex items-center gap-2"><Check className="size-4 text-rust"/>Condition checked</span><span className="flex items-center gap-2"><Check className="size-4 text-rust"/>Pakistan-wide delivery</span></div>
        </div>
      </div>
      <span className="absolute bottom-5 right-6 hidden rotate-3 rounded-full bg-cream/90 px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-lg md:block">Pre-loved, not pre-forgotten</span>
    </section>

    <section className="border-b border-black/10 bg-rust py-4 text-white" aria-label="Store benefits"><div className="ticker-track flex min-w-max items-center gap-12 text-sm font-bold uppercase tracking-[.16em]">{["One-of-one inventory","New pairs added regularly","Honest condition grading","Style with a smaller footprint","One-of-one inventory","New pairs added regularly","Honest condition grading","Style with a smaller footprint"].map((item, i)=><span key={`${item}-${i}`} className="flex items-center gap-12">{item}<span>✦</span></span>)}</div></section>

    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Just landed</p><h2 className="section-title">Pairs worth a second look.</h2></div><Link href="/products" className="text-link">See the whole rack <ArrowRight /></Link></div>
      {featured.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[2rem] border border-dashed border-black/20 p-12 text-center"><h3 className="font-display text-3xl font-bold">The next drop is being laced up.</h3><p className="mt-3 text-ink/60">Check back soon or message us to find a specific pair.</p></div>}
    </section>

    <section className="bg-olive px-4 py-24 text-cream sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="eyebrow text-sand">Why thrift KicksHub?</p><h2 className="section-title max-w-lg text-cream">No stock photos. No mystery pairs.</h2><p className="mt-6 max-w-md leading-7 text-cream/65">The shoes you see are the shoes you get. We show the wear, note the condition, and keep each listing tied to the individual pair.</p><Link href="/about" className="mt-8 inline-flex items-center gap-2 border-b border-rust pb-1 text-sm font-bold">Meet our process <ArrowRight className="size-4"/></Link></div>
        <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/15 sm:grid-cols-3">{[
          [Search,"01","Inspect","We check uppers, soles, lining, shape, and the details that matter."],
          [RefreshCw,"02","Refresh","Each pair gets a careful clean without hiding its honest character."],
          [ShieldCheck,"03","Describe","Clear photos and condition notes help you buy with confidence."],
        ].map(([Icon,n,title,text]: any)=><div key={n} className="bg-[#27372d] p-8 transition-colors hover:bg-[#304438]"><Icon className="size-7 text-rust"/><span className="mt-14 block text-xs text-cream/40">{n}</span><h3 className="mt-3 font-display text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-cream/60">{text}</p></div>)}</div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-24 sm:px-6 md:grid-cols-2 lg:px-8">
      <Link href="/products?condition=excellent" className="category-tile group bg-sand"><div><span className="eyebrow">Clean finds</span><h2 className="font-display text-4xl font-black tracking-tight">Excellent condition</h2><p className="mt-3 text-sm text-ink/60">Light wear. Big main-character energy.</p></div><ArrowRight className="size-8 transition-transform group-hover:translate-x-2"/></Link>
      <Link href="/products?sort=price-low" className="category-tile group bg-[#dad8c7]"><div><span className="eyebrow">Budget gems</span><h2 className="font-display text-4xl font-black tracking-tight">Best price first</h2><p className="mt-3 text-sm text-ink/60">Good shoes don’t need brand-new prices.</p></div><ArrowRight className="size-8 transition-transform group-hover:translate-x-2"/></Link>
    </section>

    <LandingReviewsWrapper />
    <section className="px-4 py-24 sm:px-6"><div className="mx-auto max-w-5xl rounded-[2.5rem] bg-rust px-6 py-16 text-center text-white sm:px-12"><p className="eyebrow text-white/65">Need a size or silhouette?</p><h2 className="font-display text-4xl font-black tracking-tight sm:text-6xl">Let us hunt the pair.</h2><p className="mx-auto mt-4 max-w-xl text-white/75">Tell us what you’re after. If it crosses our rack, you’ll be the first to know.</p><Link href="/contact" className="mt-8 inline-flex rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-1">Send us your wishlist</Link></div></section>
    <SiteFooter />
  </main>;
}
