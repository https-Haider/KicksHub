"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-context";
import type { Product } from "@/lib/products";

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    image: "",
    category: "Casual",
    description: "",
    rating: 4.5,
    reviews: 0,
    inStock: true,
    sku: "",
    sizes: [],
    condition: "good",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // load products from API
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const handleAddProduct = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: 0,
      image: "",
      category: "Casual",
      description: "",
      rating: 4.5,
      reviews: 0,
      inStock: true,
      sku: "",
      sizes: [],
      condition: "good",
      seoTitle: "",
      seoDescription: "",
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      sku: product.sku,
      sizes: product.sizes || [],
      condition: product.condition,
      seoTitle: (product as any).seoTitle || "",
      seoDescription: (product as any).seoDescription || "",
    });
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.sku) {
      alert("Please fill in all required fields");
      return;
    }

    (async () => {
      try {
        if (editingId !== null) {
          const res = await fetch(`/api/products/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (res.ok) {
            const updated = await res.json();
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          } else {
            const err = await res.json();
            alert(err?.error || "Failed to update product");
          }
        } else {
          const res = await fetch(`/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (res.ok) {
            const created = await res.json();
            setProducts((prev) => [created, ...prev]);
          } else {
            const err = await res.json();
            alert(err?.error || "Failed to create product");
          }
        }
        setShowModal(false);
      } catch (e) {
        console.error(e);
        alert("Network error");
      }
    })();
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      (async () => {
        try {
          const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
          if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
          } else {
            const err = await res.json();
            alert(err?.error || "Failed to delete");
          }
        } catch (e) {
          console.error(e);
          alert("Network error");
        }
      })();
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">Admin Panel</div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="bg-transparent">
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Products Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Products
            </h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Product
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Rating
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name || "Product preview"}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {product.category}
                    </td>
                    <td className="py-4 px-6 font-semibold text-primary">
                      PKR {product.price}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {product.rating} ⭐
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="e.g., Nike Air Max 90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="e.g., AM90-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number.parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option>Basketball</option>
                      <option>Casual</option>
                      <option>Running</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: e.target.value as
                            | "like-new"
                            | "excellent"
                            | "good"
                            | "fair",
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="like-new">Like New</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Rating
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: Number.parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    rows={3}
                    placeholder="Product description..."
                  />
                </div>

                {/* SEO fields */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={(formData as any).seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="SEO meta title (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={(formData as any).seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    rows={2}
                    placeholder="SEO meta description (optional)"
                  />
                </div>

                {/* Removed Meta Keywords - keywords are mostly ignored by search engines. Keeping only title + description for SEO. */}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="/shoes/product.jpg or Cloudinary URL"
                    />
                    <div className="inline-flex items-center gap-2">
                      <input
                        ref={(window as any).__cloudinaryInputRef ?? undefined}
                        id="admin-product-image-input"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Try signed upload via server endpoint
                          try {
                            const signRes = await fetch(
                              "/api/cloudinary/sign",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({}),
                              }
                            );
                            if (signRes.ok) {
                              const sign = await signRes.json();
                              const {
                                cloudName,
                                apiKey,
                                timestamp,
                                signature,
                              } = sign;
                              const fd = new FormData();
                              fd.append("file", file);
                              fd.append("api_key", apiKey);
                              fd.append("timestamp", String(timestamp));
                              fd.append("signature", signature);
                              // optional: you can add folder or other params if desired
                              const uploadRes = await fetch(
                                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                                {
                                  method: "POST",
                                  body: fd,
                                }
                              );
                              const data = await uploadRes.json();
                              if (data?.secure_url) {
                                setFormData((prev) => ({
                                  ...prev,
                                  image: data.secure_url,
                                }));
                              } else {
                                console.error(data);
                                alert("Upload failed");
                              }
                              return;
                            }
                          } catch (err) {
                            console.warn(
                              "Signed upload failed, falling back to unsigned if available",
                              err
                            );
                          }

                          // fallback: unsigned preset if provided
                          const cloudNamePublic =
                            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          const preset =
                            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                          if (!cloudNamePublic || !preset) {
                            alert(
                              "Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in env, or configure server-side signing."
                            );
                            return;
                          }
                          const fd2 = new FormData();
                          fd2.append("file", file);
                          fd2.append("upload_preset", preset);
                          try {
                            const res = await fetch(
                              `https://api.cloudinary.com/v1_1/${cloudNamePublic}/image/upload`,
                              {
                                method: "POST",
                                body: fd2,
                              }
                            );
                            const data = await res.json();
                            if (data?.secure_url) {
                              setFormData((prev) => ({
                                ...prev,
                                image: data.secure_url,
                              }));
                            } else {
                              console.error(data);
                              alert("Upload failed");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Upload error");
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "admin-product-image-input"
                          ) as HTMLInputElement | null;
                          input?.click();
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) =>
                      setFormData({ ...formData, inStock: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="inStock"
                    className="text-sm font-medium text-foreground"
                  >
                    In Stock
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-1">
                    {editingId ? "Update Product" : "Add Product"}
                  </Button>
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
