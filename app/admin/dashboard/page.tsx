"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Box, CircleDollarSign, PackageCheck, ShoppingBag, TriangleAlert } from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import type { Order } from "@/lib/orders";

const money = (value: number) => `PKR ${Math.round(value).toLocaleString("en-PK")}`;
const statusStyle: Record<string, string> = { delivered: "bg-emerald-100 text-emerald-800", shipped: "bg-amber-100 text-amber-800", confirmed: "bg-sky-100 text-sky-800", otp_sent: "bg-stone-200 text-stone-700" };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/admin/login");
    if (isLoading || !isAuthenticated) return;
    let active = true;
    Promise.all([fetch("/api/orders", { cache: "no-store" }), fetch("/api/products", { cache: "no-store" })])
      .then(async ([ordersResponse, productsResponse]) => {
        if (!ordersResponse.ok || !productsResponse.ok) throw new Error();
        const [orderData, productData] = await Promise.all([ordersResponse.json(), productsResponse.json()]);
        if (active) { setOrders(Array.isArray(orderData) ? orderData : []); setProductCount(Array.isArray(productData) ? productData.length : 0); }
      })
      .catch(() => active && setError("Store data could not be loaded. Refresh to try again."))
      .finally(() => active && setLoadingData(false));
    return () => { active = false; };
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-ink/50">Securing your workspace…</div>;
  const deliveredRevenue = orders.filter((order) => order.status === "delivered").reduce((sum, order) => sum + order.total, 0);
  const openOrders = orders.filter((order) => order.status !== "delivered").length;
  const awaitingShipment = orders.filter((order) => order.status === "confirmed").length;
  const recentOrders = [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 6);
  const stats = [
    { label: "Delivered revenue", value: money(deliveredRevenue), note: "Realized from fulfilled orders", icon: CircleDollarSign, tone: "bg-rust text-white" },
    { label: "Open orders", value: String(openOrders), note: `${awaitingShipment} ready to prepare`, icon: PackageCheck, tone: "bg-olive text-white" },
    { label: "Catalog size", value: String(productCount), note: "Active product records", icon: Box, tone: "bg-sand text-ink" },
  ];

  return <main>
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-rust">Operations overview</p><h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">Good to see you.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">A focused view of sales, fulfillment, and inventory across KicksHub.</p></div>
      <Link href="/admin/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rust px-5 text-sm font-bold text-white shadow-lg shadow-rust/15 transition hover:-translate-y-0.5"><ShoppingBag className="size-4" /> Add a new pair</Link>
    </div>
    {error && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900"><TriangleAlert className="size-5" />{error}</div>}
    <section className="grid gap-4 lg:grid-cols-3" aria-label="Store summary">
      {stats.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="rounded-[1.5rem] border border-black/8 bg-[#fbf9f4] p-6 shadow-[0_12px_35px_rgba(31,33,29,.05)]"><div className="flex items-start justify-between gap-4"><p className="text-sm font-bold text-ink/55">{label}</p><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span></div><p className="mt-6 text-3xl font-black tracking-tight">{loadingData ? "—" : value}</p><p className="mt-1 text-xs text-ink/45">{note}</p></article>)}
    </section>
    <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/8 bg-[#fbf9f4] shadow-[0_12px_35px_rgba(31,33,29,.05)]">
      <div className="flex items-center justify-between border-b border-black/8 px-5 py-5 sm:px-7"><div><h2 className="text-lg font-black">Recent orders</h2><p className="mt-1 text-xs text-ink/50">Newest customer activity and fulfillment status</p></div><Link href="/admin/orders" className="flex items-center gap-1.5 text-xs font-black text-rust">View all <ArrowRight className="size-3.5" /></Link></div>
      {loadingData ? <div className="grid min-h-52 place-items-center text-sm text-ink/45">Loading orders…</div> : recentOrders.length === 0 ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><PackageCheck className="mx-auto mb-3 size-8 text-ink/25"/><p className="font-bold">No orders yet</p><p className="mt-1 text-sm text-ink/50">New purchases will appear here.</p></div></div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-black/[.025] text-left text-[11px] uppercase tracking-wider text-ink/45"><tr><th className="px-7 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Placed</th><th className="px-4 py-3">Status</th><th className="px-7 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-black/5">{recentOrders.map((order) => <tr key={order.id} className="transition hover:bg-black/[.018]"><td className="px-7 py-4 font-mono text-xs font-semibold">{order.id.slice(0, 14)}</td><td className="px-4 py-4"><p className="font-bold">{order.customerName}</p><p className="mt-0.5 text-xs text-ink/45">{order.email}</p></td><td className="px-4 py-4 text-ink/55">{new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(new Date(order.createdAt))}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${statusStyle[order.status] || "bg-stone-200 text-stone-700"}`}>{order.status.replace("_", " ")}</span></td><td className="px-7 py-4 text-right font-black">{money(order.total)}</td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
