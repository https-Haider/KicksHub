"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-context";
import type { Order } from "@/lib/orders";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [edits, setEdits] = useState<
    Record<string, { selected?: string; carrier?: string; tracking?: string }>
  >({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setOrders(data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const haystack = `${order.id} ${order.customerName} ${order.email}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase().trim());
  });

  return (
    <main>
      {/* Orders Content */}
      <div>
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-rust">Fulfillment</p>
          <h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">
            Orders
          </h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-black/8 bg-[#fbf9f4] p-3 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, or email…" className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-rust focus:ring-4 focus:ring-rust/10" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:border-rust">
            <option value="all">All statuses</option><option value="confirmed">Confirmed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/">
              <Button>Back to Store</Button>
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-[1.5rem] border-black/8 bg-[#fbf9f4] shadow-[0_12px_35px_rgba(31,33,29,.05)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-[150px] px-5 py-4 text-left font-semibold text-foreground">
                      Order ID
                    </th>
                    <th className="w-[210px] px-5 py-4 text-left font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="w-[90px] px-4 py-4 text-left font-semibold text-foreground">
                      Items
                    </th>
                    <th className="w-[120px] px-4 py-4 text-left font-semibold text-foreground">
                      Total
                    </th>
                    <th className="w-[310px] px-5 py-4 text-left font-semibold text-foreground">
                      Status
                    </th>
                    <th className="w-[120px] px-4 py-4 text-left font-semibold text-foreground">
                      Date
                    </th>
                    <th className="w-[100px] px-4 py-4 text-left font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-sm text-foreground">
                        {order.id.slice(0, 12)}...
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        {order.items.length} item(s)
                      </td>
                      <td className="px-4 py-4 font-semibold text-primary">
                        PKR {Math.round(order.total)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-2">
                          {/* colored badge */}
                          <span
                            className={`mr-2 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "confirmed"
                                ? "bg-sky-100 text-sky-800"
                                : order.status === "shipped"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status}
                          </span>

                          {/* status selector and inline ship form */}
                          <div className="inline-block align-middle">
                            {(() => {
                              const states = [
                                "confirmed",
                                "shipped",
                                "delivered",
                              ];
                              const currentIndex = states.indexOf(order.status);
                              const existingEdit = edits[order.id];
                              const isEditing = Boolean(existingEdit);
                              const edit = {
                                selected:
                                  existingEdit?.selected ?? order.status,
                                carrier:
                                  existingEdit?.carrier ?? order.carrier ?? "",
                                tracking:
                                  existingEdit?.tracking ??
                                  order.trackingNumber ??
                                  "",
                              };
                              return (
                                <div className="flex flex-col items-start gap-2">
                                  <select
                                    value={edit.selected}
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      setEdits((prev) => ({
                                        ...prev,
                                        [order.id]: {
                                          ...(prev[order.id] || {}),
                                          selected: newStatus,
                                        },
                                      }));
                                      // If switching to non-shipped (confirmed/delivered), submit immediately
                                      if (newStatus !== "shipped") {
                                        (async () => {
                                          try {
                                            const res = await fetch(
                                              `/api/orders/${order.id}`,
                                              {
                                                method: "PATCH",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  status: newStatus,
                                                }),
                                              }
                                            );
                                            if (res.ok) {
                                              const updated = await res.json();
                                              setOrders((prev) =>
                                                prev.map((o) =>
                                                  o.id === updated.id
                                                    ? updated
                                                    : o
                                                )
                                              );
                                              setEdits((prev) => {
                                                const copy = { ...prev };
                                                delete copy[order.id];
                                                return copy;
                                              });
                                            } else {
                                              const err = await res.json();
                                              alert(
                                                err?.error ||
                                                  "Failed to update status"
                                              );
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert("Network error");
                                          }
                                        })();
                                      }
                                    }}
                                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                                  >
                                    {states.map((s, idx) => (
                                      <option
                                        key={s}
                                        value={s}
                                        disabled={idx < currentIndex}
                                      >
                                        {s}
                                      </option>
                                    ))}
                                  </select>

                                  {isEditing && edit.selected === "shipped" && (
                                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/[.025] p-2">
                                      <input
                                        type="text"
                                        placeholder="Carrier"
                                        value={edit.carrier ?? ""}
                                        onChange={(e) =>
                                          setEdits((prev) => ({
                                            ...prev,
                                            [order.id]: {
                                              ...(prev[order.id] || {}),
                                              carrier: e.target.value,
                                            },
                                          }))
                                        }
                                        className="h-8 w-full rounded-lg border border-border bg-white px-2 text-xs"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Tracking #"
                                        value={edit.tracking ?? ""}
                                        onChange={(e) =>
                                          setEdits((prev) => ({
                                            ...prev,
                                            [order.id]: {
                                              ...(prev[order.id] || {}),
                                              tracking: e.target.value,
                                            },
                                          }))
                                        }
                                        className="h-8 w-full rounded-lg border border-border bg-white px-2 text-xs"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          const data = edits[order.id] || {};
                                          if (!data.carrier || !data.tracking) {
                                            alert(
                                              "Enter carrier and tracking number"
                                            );
                                            return;
                                          }
                                          try {
                                            const res = await fetch(
                                              `/api/orders/${order.id}`,
                                              {
                                                method: "PATCH",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  status: "shipped",
                                                  carrier: data.carrier,
                                                  trackingNumber: data.tracking,
                                                }),
                                              }
                                            );
                                            if (res.ok) {
                                              const updated = await res.json();
                                              setOrders((prev) =>
                                                prev.map((o) =>
                                                  o.id === updated.id
                                                    ? updated
                                                    : o
                                                )
                                              );
                                              setEdits((prev) => {
                                                const c = { ...prev };
                                                delete c[order.id];
                                                return c;
                                              });
                                            } else {
                                              const err = await res.json();
                                              alert(
                                                err?.error || "Failed to ship"
                                              );
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert("Network error");
                                          }
                                        }}
                                      >
                                        Ship
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setEdits((prev) => {
                                            const c = { ...prev };
                                            delete c[order.id];
                                            return c;
                                          })
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          {order.trackingNumber && (
                            <div className="text-xs leading-5 text-muted-foreground">
                              <strong>Carrier:</strong> {order.carrier} •{" "}
                              <strong>Tracking:</strong> {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="bg-background border border-border rounded-lg p-6 z-10 max-w-3xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Order {selectedOrder.id}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <strong>Customer:</strong> {selectedOrder.customerName} •{" "}
                  {selectedOrder.email}
                </div>
                <div>
                  <strong>Total:</strong> PKR {Math.round(selectedOrder.total)}
                </div>
                <div>
                  <h3 className="font-medium mt-3 mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((it, idx) => (
                      <div
                        key={`${it.productId}-${it.productName}-${idx}`}
                        className="border p-3 rounded"
                      >
                        <div className="text-sm">
                          <strong>{it.productName}</strong>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {it.productId} • Qty: {it.quantity} • PKR{" "}
                          {Math.round(it.price)}
                          {it.selectedSize && (
                            <>
                              {" "}
                              •{" "}
                              <span className="font-medium text-foreground">
                                Size: EU {it.selectedSize}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <strong>Address:</strong>
                  <div className="text-sm text-muted-foreground">
                    {selectedOrder.address}, {selectedOrder.city}{" "}
                    {selectedOrder.zipCode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
