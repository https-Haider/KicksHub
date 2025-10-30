"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAdmin } from "@/lib/admin-context"
import { allProducts } from "@/lib/products"
import { getOrders } from "@/lib/orders"
import type { Order } from "@/lib/orders"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, logout, isLoading } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && mounted) {
      router.push("/admin/login")
    } else if (!isLoading && isAuthenticated && mounted) {
      setOrders(getOrders())
    }
  }, [isAuthenticated, isLoading, mounted, router])

  if (!mounted || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const totalProducts = allProducts.length

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">Admin Panel</div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="bg-transparent">
                  View Store
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  router.push("/admin/login")
                }}
                className="bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your store and view analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-4xl text-primary/20">$</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-primary">{totalOrders}</p>
              </div>
              <div className="text-4xl text-primary/20">📦</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <p className="text-3xl font-bold text-primary">{totalProducts}</p>
              </div>
              <div className="text-4xl text-primary/20">🛍️</div>
            </div>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Products Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Products</h2>
            <p className="text-muted-foreground mb-6">Manage your product catalog</p>
            <Link href="/admin/products">
              <Button className="w-full">Manage Products</Button>
            </Link>
          </Card>

          {/* Orders Management */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Orders</h2>
            <p className="text-muted-foreground mb-6">View and manage customer orders</p>
            <Link href="/admin/orders">
              <Button className="w-full">View Orders</Button>
            </Link>
          </Card>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .slice(-5)
                    .reverse()
                    .map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground">{order.id.slice(0, 12)}...</td>
                        <td className="py-3 px-4 text-foreground">{order.customerName}</td>
                        <td className="py-3 px-4 font-semibold text-primary">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <Link href="/admin/orders">
                <Button variant="outline" className="bg-transparent">
                  View All Orders
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
