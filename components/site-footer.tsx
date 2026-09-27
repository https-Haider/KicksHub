import Link from "next/link";
import { siteConfig } from "@/lib/config";

const links = [
  ["About", "/about"], ["Contact", "/contact"], ["FAQ", "/contact#faq"],
  ["Privacy", "/policies/privacy"], ["Terms", "/policies/terms"],
  ["Shipping", "/policies/shipping"], ["Returns", "/policies/returns"],
] as const;

export function SiteFooter() {
  const socials = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url));
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {links.map(([label, href]) => <Link key={href} href={href} className="hover:text-foreground">{label}</Link>)}
          {socials.map(([label, url]) => <a key={label} href={url!} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-foreground">{label}</a>)}
        </nav>
        <p className="mt-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} KicksHub. All rights reserved.</p>
      </div>
    </footer>
  );
}
