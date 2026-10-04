"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Box, ExternalLink, LogOut, PackageCheck, Store } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdmin();

  if (pathname === "/admin/login") return children;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f3efe7] text-ink lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-black/10 bg-olive text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-20 items-center justify-between px-5 lg:h-auto lg:px-7 lg:pb-8 lg:pt-8">
          <Link href="/admin/dashboard" className="group">
            <span className="block text-[10px] font-bold uppercase tracking-[.28em] text-sand/70">KicksHub</span>
            <span className="mt-1 block text-xl font-black tracking-tight">Store desk</span>
          </Link>
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:hidden">Admin</span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-4" aria-label="Admin navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  active ? "bg-rust text-white shadow-lg shadow-black/10" : "text-white/65 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:absolute lg:bottom-0 lg:block lg:w-[248px]">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/65 hover:bg-white/10 hover:text-white">
            <Store className="size-4" /> View storefront <ExternalLink className="ml-auto size-3" />
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/65 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="hidden h-16 items-center justify-end border-b border-black/10 bg-[#f8f5ee]/90 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/55"><span className="size-2 rounded-full bg-emerald-500" /> Store operations online</div>
        </header>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
      </div>
    </div>
  );
}
