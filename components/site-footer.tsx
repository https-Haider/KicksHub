import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { getWhatsAppLink, siteConfig } from "@/lib/config";

const shop = [["Latest drop", "/products?sort=newest"], ["All pairs", "/products"], ["Best price first", "/products?sort=price-low"]] as const;
const help = [["Our process", "/about"], ["FAQ", "/contact#faq"], ["Shipping", "/policies/shipping"], ["Returns", "/policies/returns"], ["Contact", "/contact"]] as const;

export function SiteFooter() {
  return <footer className="bg-ink text-cream">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
      <div><Link href="/" className="font-display text-4xl font-black tracking-[-.06em]">KicksHub<span className="text-rust">.</span></Link><p className="mt-5 max-w-sm text-sm leading-6 text-cream/65">Pre-loved sneakers, selected pair by pair. Honest condition notes, real photos, and no endless warehouse inventory.</p><div className="mt-6 flex gap-3"><a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" aria-label="KicksHub on Instagram" className="social-button"><Instagram /></a><a href={getWhatsAppLink("Hi KicksHub, I have a question about a pair.")} target="_blank" rel="noreferrer" aria-label="Chat with KicksHub on WhatsApp" className="social-button"><MessageCircle /></a></div></div>
      <FooterColumn title="Shop" links={shop} /><FooterColumn title="Need help?" links={help} />
    </div>
    <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream/45">© {new Date().getFullYear()} KicksHub · Curated in Pakistan · <Link href="/policies/privacy" className="hover:text-cream">Privacy</Link> · <Link href="/policies/terms" className="hover:text-cream">Terms</Link></div>
  </footer>;
}
function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) { return <div><h2 className="text-xs font-bold uppercase tracking-[.2em] text-rust">{title}</h2><nav className="mt-5 grid gap-3">{links.map(([label, href]) => <Link key={label} href={href} className="w-fit text-sm text-cream/70 transition-colors hover:text-cream">{label}</Link>)}</nav></div>; }
