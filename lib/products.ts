export interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  image: string;
  images?: string[]; // Additional images (3-7 total including main image)
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number; // Number of items in stock
  sku: string;
  sizes?: string[];
  condition: "like-new" | "excellent" | "good" | "fair";
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export const allProducts: Product[] = [
  {
    id: 1,
    name: "Vintage Air Jordan 1 Retro",
    price: 189.99,
    image: "/shoes/air-jordan-1.jpg",
    category: "Basketball",
    description:
      "Classic Air Jordan 1 Retro in excellent condition. Iconic silhouette with premium leather construction.",
    rating: 4.9,
    reviews: 324,
    inStock: true,
    sku: "AJ1-001",
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    condition: "excellent",
  },
  {
    id: 2,
    name: "Nike Air Max 90",
    price: 129.99,
    image: "/shoes/air-max-90.jpg",
    category: "Casual",
    description:
      "Timeless Nike Air Max 90 with visible Air unit. Great condition with minimal wear.",
    rating: 4.7,
    reviews: 256,
    inStock: true,
    sku: "AM90-002",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    condition: "excellent",
  },
  {
    id: 3,
    name: "Adidas Stan Smith",
    price: 79.99,
    image: "/shoes/stan-smith.jpg",
    category: "Casual",
    description:
      "Classic Adidas Stan Smith in white leather. Perfect everyday sneaker with light wear.",
    rating: 4.6,
    reviews: 189,
    inStock: true,
    sku: "SS-003",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    condition: "good",
  },
  {
    id: 4,
    name: "Converse Chuck Taylor All Star",
    price: 54.99,
    image: "/shoes/chuck-taylor.jpg",
    category: "Casual",
    description:
      "Vintage Converse Chuck Taylor in canvas. Retro style with authentic wear.",
    rating: 4.5,
    reviews: 412,
    inStock: true,
    sku: "CTA-004",
    sizes: ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    condition: "fair",
  },
  {
    id: 5,
    name: "Nike Dunk Low",
    price: 149.99,
    image: "/shoes/dunk-low.jpg",
    category: "Basketball",
    description:
      "Nike Dunk Low with clean colorway. Excellent condition, barely worn.",
    rating: 4.8,
    reviews: 298,
    inStock: true,
    sku: "DL-005",
    sizes: ["7", "8", "9", "10", "11", "12"],
    condition: "like-new",
  },
  {
    id: 6,
    name: "Vans Old Skool",
    price: 69.99,
    image: "/shoes/vans-old-skool.jpg",
    category: "Casual",
    description:
      "Classic Vans Old Skool with iconic side stripe. Good condition with minimal creasing.",
    rating: 4.6,
    reviews: 167,
    inStock: true,
    sku: "VOS-006",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    condition: "good",
  },
  {
    id: 7,
    name: "New Balance 574",
    price: 99.99,
    image: "/shoes/new-balance-574.jpg",
    category: "Running",
    description:
      "Comfortable New Balance 574 in retro colorway. Great for everyday wear.",
    rating: 4.7,
    reviews: 234,
    inStock: true,
    sku: "NB574-007",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    condition: "excellent",
  },
  {
    id: 8,
    name: "Puma Suede Classic",
    price: 74.99,
    image: "/shoes/puma-suede.jpg",
    category: "Casual",
    description:
      "Vintage Puma Suede in classic silhouette. Soft suede material with authentic patina.",
    rating: 4.5,
    reviews: 145,
    inStock: true,
    sku: "PS-008",
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
    condition: "good",
  },
];

export function getProductById(id: number): Product | undefined {
  return allProducts.find((product) => product.id === id);
}

export function slugify(input: string | number) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getProductSlug(
  product: Product | { id: number; name?: string; slug?: string }
) {
  // prefer an explicit slug field if present, otherwise derive from name or id
  if ("slug" in product && product.slug) return String(product.slug);
  if (product.name) return slugify(product.name);
  return String(product.id);
}

export function getProductBySlug(slug: string): Product | undefined {
  const normalized = slugify(slug);
  return allProducts.find((product) => {
    const s = getProductSlug(product);
    if (s === slug) return true;
    if (slugify(s) === normalized) return true;
    // fallback to numeric id match
    if (String(product.id) === slug) return true;
    return false;
  });
}

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((product) => product.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(allProducts.map((product) => product.category)));
}
