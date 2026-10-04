"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-context";
import type { Order } from "@/lib/orders";
import { toast } from "sonner";

const COURIERS = ["TCS", "Leopards Courier", "M&P Courier", "Trax", "Call Courier", "BlueEX", "PostEx", "Rider", "Pakistan Post", "DHL", "FedEx", "Other"];
const STATUSES = ["confirmed", "shipped", "delivered"] as const;
type Edit = { selected?: string; carrier?: string; tracking?: string };

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.replace("/admin/login"); return; }
    if (isLoading || !isAuthenticated) return;
    let active = true;
    fetch("/api/orders", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => active && setOrders(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Orders could not be loaded"));
    return () => { active = false; };
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-ink/50">Loading orders…</div>;

  const setEdit = (id: string, patch: Edit) => setEdits((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  const replaceOrder = (updated: Order) => setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));

  async function patchOrder(orderId: string, body: Record<string, string>) {
    setSavingId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Order could not be updated");
      replaceOrder(data);
      setEdits((current) => { const next = { ...current }; delete next[orderId]; return next; });
      toast.success("Order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order could not be updated");
    } finally { setSavingId(null); }
  }

  function changeStatus(order: Order, status: string) {
    setEdit(order.id, { selected: status });
    if (status !== "shipped") void patchOrder(order.id, { status });
  }

  function markShipped(order: Order) {
    const edit = edits[order.id] || {};
    const carrier = edit.carrier ?? order.carrier ?? "";
    const trackingNumber = edit.tracking ?? order.trackingNumber ?? "";
    if (!carrier) { toast.error("Choose a courier first"); return; }
    if (!trackingNumber.trim()) { toast.error("Enter a tracking number"); return; }
    void patchOrder(order.id, { status: "shipped", carrier, trackingNumber: trackingNumber.trim() });
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesStatus && `${order.id} ${order.customerName} ${order.email}`.toLowerCase().includes(query.toLowerCase().trim());
  });

  return <main>
    <div className="mb-8"><p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-rust">Fulfillment</p><h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">Orders</h1><p className="mt-2 text-sm text-muted-foreground">Manage order progress, couriers, and tracking in one consistent view.</p></div>
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-black/8 bg-[#fbf9f4] p-3 sm:flex-row">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, or email…" className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-rust focus:ring-4 focus:ring-rust/10" />
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:border-rust"><option value="all">All statuses</option><option value="confirmed">Confirmed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select>
    </div>

    <Card className="overflow-hidden rounded-[1.5rem] border-black/8 bg-[#fbf9f4] shadow-[0_12px_35px_rgba(31,33,29,.05)]">
      {filteredOrders.length === 0 ? <div className="grid min-h-56 place-items-center text-center"><div><p className="font-bold">No matching orders</p><p className="mt-1 text-sm text-ink/45">Try changing the search or status filter.</p></div></div> : <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] table-fixed text-sm">
          <thead className="border-b border-black/8 bg-black/[.025] text-left text-[11px] uppercase tracking-wider text-ink/50"><tr><th className="w-[150px] px-5 py-4">Order</th><th className="w-[210px] px-5 py-4">Customer</th><th className="w-[80px] px-4 py-4">Items</th><th className="w-[120px] px-4 py-4">Total</th><th className="w-[140px] px-4 py-4">Status</th><th className="w-[190px] px-4 py-4">Courier</th><th className="w-[240px] px-4 py-4">Tracking</th><th className="w-[110px] px-4 py-4">Date</th><th className="w-[80px] px-4 py-4">Details</th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {filteredOrders.map((order) => {
              const edit = edits[order.id] || {};
              const selectedStatus = edit.selected ?? order.status;
              const carrier = edit.carrier ?? order.carrier ?? "";
              const tracking = edit.tracking ?? order.trackingNumber ?? "";
              const isShipping = selectedStatus === "shipped" && order.status !== "shipped";
              const currentIndex = STATUSES.indexOf(order.status as (typeof STATUSES)[number]);
              return <tr key={order.id} className="align-middle transition hover:bg-black/[.018]">
                <td className="px-5 py-4 font-mono text-xs font-semibold">{order.id.slice(0, 13)}…</td>
                <td className="px-5 py-4"><p className="truncate font-bold">{order.customerName}</p><p className="mt-0.5 truncate text-xs text-ink/45">{order.email}</p></td>
                <td className="px-4 py-4">{order.items.length}</td>
                <td className="px-4 py-4 font-black text-rust">PKR {Math.round(order.total).toLocaleString("en-PK")}</td>
                <td className="px-4 py-4"><select aria-label={`Status for ${order.id}`} value={selectedStatus} disabled={savingId === order.id} onChange={(event) => changeStatus(order, event.target.value)} className="h-9 w-full rounded-lg border border-black/10 bg-white px-2 text-xs font-bold capitalize outline-none focus:border-rust">{STATUSES.map((status, index) => <option key={status} value={status} disabled={index < currentIndex}>{status}</option>)}</select></td>
                <td className="px-4 py-4"><select aria-label={`Courier for ${order.id}`} value={carrier} disabled={order.status === "delivered" || savingId === order.id} onChange={(event) => setEdit(order.id, { carrier: event.target.value })} className="h-9 w-full rounded-lg border border-black/10 bg-white px-2 text-xs font-semibold outline-none focus:border-rust"><option value="">Select courier</option>{COURIERS.map((courier) => <option key={courier} value={courier}>{courier}</option>)}</select></td>
                <td className="px-4 py-4"><div className="flex gap-2"><input aria-label={`Tracking number for ${order.id}`} value={tracking} disabled={order.status === "delivered" || savingId === order.id} onChange={(event) => setEdit(order.id, { tracking: event.target.value })} placeholder="Enter tracking number" className="h-9 min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 text-xs outline-none focus:border-rust" />{isShipping && <Button size="sm" disabled={savingId === order.id} onClick={() => markShipped(order)} className="h-9 rounded-lg px-3 text-xs">Ship</Button>}</div></td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-ink/55">{new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "2-digit" }).format(new Date(order.createdAt))}</td>
                <td className="px-4 py-4"><Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="h-9 bg-transparent text-xs">View</Button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>}
    </Card>

    {selectedOrder && <div className="fixed inset-0 z-50 grid place-items-center p-4"><button aria-label="Close order details" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} /><section role="dialog" aria-modal="true" className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#fbf9f4] p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-rust">Order details</p><h2 className="mt-1 font-mono text-xl font-black">{selectedOrder.id}</h2></div><Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button></div><div className="grid gap-4 rounded-2xl bg-black/[.035] p-4 text-sm sm:grid-cols-2"><div><span className="text-ink/45">Customer</span><p className="mt-1 font-bold">{selectedOrder.customerName}</p><p className="text-xs text-ink/55">{selectedOrder.email}</p></div><div><span className="text-ink/45">Delivery address</span><p className="mt-1 font-bold">{selectedOrder.address}</p><p className="text-xs text-ink/55">{selectedOrder.city} {selectedOrder.zipCode}</p></div></div><h3 className="mb-3 mt-6 font-black">Items</h3><div className="space-y-2">{selectedOrder.items.map((item, index) => <div key={`${item.productId}-${index}`} className="flex justify-between gap-4 rounded-xl border border-black/8 bg-white p-4 text-sm"><div><p className="font-bold">{item.productName}</p><p className="mt-1 text-xs text-ink/50">Qty {item.quantity}{item.selectedSize ? ` · EU ${item.selectedSize}` : ""}</p></div><p className="font-black">PKR {Math.round(item.price * item.quantity).toLocaleString("en-PK")}</p></div>)}</div><div className="mt-6 flex justify-between border-t border-black/10 pt-5"><span className="font-bold text-ink/55">Order total</span><span className="text-xl font-black text-rust">PKR {Math.round(selectedOrder.total).toLocaleString("en-PK")}</span></div></section></div>}
  </main>;
}
