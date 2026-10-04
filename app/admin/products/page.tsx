"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/lib/admin-context";
import type { Product } from "@/lib/products";
import {
  X,
  Plus,
  Sparkles,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Quote,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    image: "",
    images: [],
    category: "Casual",
    description: "",
    rating: 4.5,
    reviews: 0,
    inStock: true,
    stockQuantity: 10,
    sku: "",
    sizes: [],
    condition: "good",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const filteredProducts = products.filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()));

  // Generate SEO using AI
  const generateSeo = async () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required to generate SEO");
      return;
    }

    setIsGeneratingSeo(true);

    try {
      const response = await fetch("/api/admin/ai/generate-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.name,
          shortDescription: formData.description || undefined,
          category: formData.category || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          toast.error("Rate limit exceeded. Max 10 requests per hour.");
          return;
        }
        if (response.status === 403) {
          toast.error("Unauthorized. Please log in again.");
          return;
        }

        throw new Error(errorData.error || "Failed to generate SEO");
      }

      const data = await response.json();

      // Update form with generated SEO data
      setFormData((prev) => ({
        ...prev,
        seoTitle: data.metaTitle,
        seoDescription: data.metaDescription,
      }));
      setSeoKeywords(data.keywords || []);

      toast.success("SEO content generated successfully!");
    } catch (error) {
      console.error("SEO generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate SEO"
      );
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // Add a keyword to the list
  const addKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (trimmed && !seoKeywords.includes(trimmed)) {
      setSeoKeywords((prev) => [...prev, trimmed]);
      setNewKeyword("");
    }
  };

  // Remove a keyword from the list
  const removeKeyword = (keyword: string) => {
    setSeoKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  // Helper function to upload image to Cloudinary
  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    // Try signed upload via server endpoint
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (signRes.ok) {
        const sign = await signRes.json();
        const { cloudName, apiKey, timestamp, signature } = sign;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", apiKey);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );
        const data = await uploadRes.json();
        if (data?.secure_url) {
          return data.secure_url;
        }
      }
    } catch (err) {
      console.warn("Signed upload failed, trying unsigned", err);
    }

    // Fallback: unsigned preset if provided
    const cloudNamePublic = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudNamePublic || !preset) {
      alert("Cloudinary not configured");
      return null;
    }
    const fd2 = new FormData();
    fd2.append("file", file);
    fd2.append("upload_preset", preset);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudNamePublic}/image/upload`,
        { method: "POST", body: fd2 }
      );
      const data = await res.json();
      if (data?.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleAddProduct = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: 0,
      image: "",
      images: [],
      category: "Casual",
      description: "",
      rating: 4.5,
      reviews: 0,
      inStock: true,
      stockQuantity: 10,
      sku: "",
      sizes: [],
      condition: "good",
      seoTitle: "",
      seoDescription: "",
    });
    setSeoKeywords([]); // Reset keywords for new product
    setNewKeyword("");
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      images: product.images || [],
      category: product.category,
      description: product.description,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity ?? 0,
      sku: product.sku,
      sizes: product.sizes || [],
      condition: product.condition,
      seoTitle: (product as any).seoTitle || "",
      seoDescription: (product as any).seoDescription || "",
    });
    // Load SEO keywords from the product (stored as comma-separated string)
    const productKeywords = (product as any).seoKeywords;
    if (productKeywords && typeof productKeywords === "string") {
      setSeoKeywords(
        productKeywords
          .split(",")
          .map((k: string) => k.trim().toLowerCase())
          .filter((k: string) => k.length > 0)
      );
    } else {
      setSeoKeywords([]);
    }
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.sku) {
      alert("Please fill in all required fields");
      return;
    }

    // Include SEO keywords in the payload
    const payload = {
      ...formData,
      seoKeywords: seoKeywords.length > 0 ? seoKeywords.join(", ") : undefined,
    };

    (async () => {
      try {
        if (editingId !== null) {
          const res = await fetch(`/api/products/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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
            body: JSON.stringify(payload),
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
    <main>
      {/* Products Content */}
      <div>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-rust">Catalog</p>
            <h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl">
              Products
            </h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={handleAddProduct} className="h-11 rounded-full px-5 font-bold">Add Product</Button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-black/8 bg-[#fbf9f4] p-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, SKU, or category…" className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-rust focus:ring-4 focus:ring-rust/10" />
          <span className="hidden whitespace-nowrap px-3 text-xs font-bold text-ink/45 sm:block">{filteredProducts.length} products</span>
        </div>

        {/* Products Table */}
        <Card className="overflow-hidden rounded-[1.5rem] border-black/8 bg-[#fbf9f4] shadow-[0_12px_35px_rgba(31,33,29,.05)]">
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image width={256} height={256} unoptimized
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
                          (product.stockQuantity ?? 0) > 5
                            ? "bg-green-100 text-green-800"
                            : (product.stockQuantity ?? 0) > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stockQuantity ?? 0} in stock
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
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price:
                            e.target.value === ""
                              ? 0
                              : Number.parseFloat(e.target.value),
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
                      <option value="Basketball">Basketball</option>
                      <option value="Casual">Casual</option>
                      <option value="Running">Running</option>
                      {/* Show current category if it's not in standard list */}
                      {formData.category &&
                        !["Basketball", "Casual", "Running"].includes(
                          formData.category
                        ) && (
                          <option value={formData.category}>
                            {formData.category}
                          </option>
                        )}
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
                      Stock Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newQty = Math.max(
                            0,
                            (formData.stockQuantity ?? 0) - 1
                          );
                          setFormData({
                            ...formData,
                            stockQuantity: newQty,
                            inStock: newQty > 0,
                          });
                        }}
                        disabled={(formData.stockQuantity ?? 0) <= 0}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={formData.stockQuantity ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockQuantity: parseInt(e.target.value) || 0,
                            inStock: parseInt(e.target.value) > 0,
                          })
                        }
                        min="0"
                        className="w-20 px-3 py-2 border border-border rounded-md bg-background text-foreground text-center text-lg font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newQty = (formData.stockQuantity ?? 0) + 1;
                          setFormData({
                            ...formData,
                            stockQuantity: newQty,
                            inStock: true,
                          });
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click + or − to adjust, or type directly
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Available Sizes
                    </label>
                    <input
                      type="text"
                      value={formData.sizes?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sizes: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g., 7, 8, 9, 10, 11, 12"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter sizes separated by commas
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  {/* Rich Text Editor Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 border border-border border-b-0 rounded-t-md bg-muted/50">
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const newText =
                            text.substring(0, start) +
                            `**${selectedText}**` +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const newText =
                            text.substring(0, start) +
                            `*${selectedText}*` +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const text = formData.description;
                          const beforeCursor = text.substring(0, start);
                          const afterCursor = text.substring(start);
                          const newText =
                            beforeCursor +
                            (beforeCursor.endsWith("\n") || beforeCursor === ""
                              ? ""
                              : "\n") +
                            "## " +
                            afterCursor;
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Heading"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const lines = selectedText.split("\n");
                          const bulletedLines = lines
                            .map((line) => (line.trim() ? `- ${line}` : line))
                            .join("\n");
                          const newText =
                            text.substring(0, start) +
                            bulletedLines +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const lines = selectedText.split("\n");
                          const numberedLines = lines
                            .map((line, i) =>
                              line.trim() ? `${i + 1}. ${line}` : line
                            )
                            .join("\n");
                          const newText =
                            text.substring(0, start) +
                            numberedLines +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const newText =
                            text.substring(0, start) +
                            `[${selectedText || "link text"}](url)` +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Insert Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "product-description"
                        ) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description;
                          const selectedText = text.substring(start, end);
                          const lines = selectedText.split("\n");
                          const quotedLines = lines
                            .map((line) => `> ${line}`)
                            .join("\n");
                          const newText =
                            text.substring(0, start) +
                            quotedLines +
                            text.substring(end);
                          setFormData({ ...formData, description: newText });
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    id="product-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-b-md bg-background text-foreground font-mono text-sm"
                    rows={5}
                    placeholder="Product description... (Supports Markdown: **bold**, *italic*, - bullets, 1. numbered, ## heading)"
                  />
                </div>

                {/* SEO fields */}
                <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      SEO Settings
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSeo}
                      disabled={isGeneratingSeo || !formData.name.trim()}
                      className="gap-2"
                    >
                      {isGeneratingSeo ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate SEO
                        </>
                      )}
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Title
                      <span className="text-xs text-muted-foreground ml-2">
                        ({((formData as any).seoTitle || "").length}/60 chars)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={(formData as any).seoTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, seoTitle: e.target.value })
                      }
                      maxLength={60}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="SEO meta title (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Description
                      <span className="text-xs text-muted-foreground ml-2">
                        ({((formData as any).seoDescription || "").length}/160
                        chars)
                      </span>
                    </label>
                    <textarea
                      value={(formData as any).seoDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoDescription: e.target.value,
                        })
                      }
                      maxLength={160}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      rows={2}
                      placeholder="SEO meta description (optional)"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SEO Keywords
                      <span className="text-xs text-muted-foreground ml-2">
                        ({seoKeywords.length} keywords)
                      </span>
                    </label>

                    {/* Keywords chips */}
                    {seoKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {seoKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add keyword input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                        placeholder="Add a keyword..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addKeyword}
                        disabled={!newKeyword.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Multiple Images Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Images (3-7 recommended)
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    First image will be the main product image. Drag to reorder.
                  </p>

                  {/* Image Preview Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {/* Main Image */}
                    {formData.image && (
                      <div className="relative aspect-square rounded-md overflow-hidden border-2 border-primary bg-muted group">
                        <Image width={256} height={256} unoptimized
                          src={formData.image}
                          alt="Main product image"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              // Move first additional image to main if available
                              if (
                                formData.images &&
                                formData.images.length > 0
                              ) {
                                const [newMain, ...rest] = formData.images;
                                setFormData((prev) => ({
                                  ...prev,
                                  image: newMain,
                                  images: rest,
                                }));
                              } else {
                                setFormData((prev) => ({ ...prev, image: "" }));
                              }
                            }}
                            className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      </div>
                    )}

                    {/* Additional Images */}
                    {formData.images?.map((img, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted group"
                      >
                        <Image width={256} height={256} unoptimized
                          src={img}
                          alt={`Product image ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Set this image as main
                              const newImages = [...(formData.images || [])];
                              newImages.splice(index, 1);
                              if (formData.image) {
                                newImages.unshift(formData.image);
                              }
                              setFormData((prev) => ({
                                ...prev,
                                image: img,
                                images: newImages,
                              }));
                            }}
                            className="p-1 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground text-[10px]"
                            title="Set as main image"
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...(formData.images || [])];
                              newImages.splice(index, 1);
                              setFormData((prev) => ({
                                ...prev,
                                images: newImages,
                              }));
                            }}
                            className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-muted-foreground/80 text-white px-1.5 py-0.5 rounded">
                          {index + 2}
                        </span>
                      </div>
                    ))}

                    {/* Add More Images Button */}
                    {(!formData.image ||
                      (formData.images?.length || 0) < 6) && (
                      <label className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 hover:bg-muted transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Add
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;

                            // Calculate how many more images we can add
                            const currentTotal =
                              (formData.image ? 1 : 0) +
                              (formData.images?.length || 0);
                            const maxToAdd = 7 - currentTotal;
                            const filesToUpload = files.slice(0, maxToAdd);

                            if (files.length > maxToAdd) {
                              alert(
                                `You can only add ${maxToAdd} more image(s). Maximum is 7 total.`
                              );
                            }

                            // Upload all files
                            for (const file of filesToUpload) {
                              const url = await uploadImageToCloudinary(file);
                              if (url) {
                                setFormData((prev) => {
                                  if (!prev.image) {
                                    // Set as main image
                                    return { ...prev, image: url };
                                  } else {
                                    // Add to additional images
                                    return {
                                      ...prev,
                                      images: [...(prev.images || []), url],
                                    };
                                  }
                                });
                              }
                            }
                            // Reset input
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const url = input.value.trim();
                          if (!url) return;

                          const currentTotal =
                            (formData.image ? 1 : 0) +
                            (formData.images?.length || 0);
                          if (currentTotal >= 7) {
                            alert("Maximum 7 images allowed");
                            return;
                          }

                          if (!formData.image) {
                            setFormData((prev) => ({ ...prev, image: url }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              images: [...(prev.images || []), url],
                            }));
                          }
                          input.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement)
                          .previousElementSibling as HTMLInputElement;
                        const url = input?.value?.trim();
                        if (!url) return;

                        const currentTotal =
                          (formData.image ? 1 : 0) +
                          (formData.images?.length || 0);
                        if (currentTotal >= 7) {
                          alert("Maximum 7 images allowed");
                          return;
                        }

                        if (!formData.image) {
                          setFormData((prev) => ({ ...prev, image: url }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), url],
                          }));
                        }
                        input.value = "";
                      }}
                    >
                      Add URL
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {(formData.image ? 1 : 0) + (formData.images?.length || 0)}{" "}
                    of 7 images
                  </p>
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
