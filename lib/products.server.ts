import { MongoClient, WithId, Document } from "mongodb";
import { slugify as localSlugify } from "@/lib/products";

export type Product = {
  id: number;
  name: string;
  slug?: string;
  price: number;
  image: string;
  images?: string[]; // Additional images (3-7 total including main image)
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
  sizes?: string[];
  condition?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
};

interface ProductDocument extends WithId<Document> {
  id: number;
  name: string;
  slug?: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
  sizes?: string[];
  condition?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION ?? "products";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getCollection() {
  const client = await getClient();
  return client.db(MONGODB_DB).collection<ProductDocument>(PRODUCTS_COLLECTION);
}

function mapDocumentToProduct(d: ProductDocument): Product {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    price: d.price,
    image: d.image,
    images: d.images,
    category: d.category,
    description: d.description,
    rating: d.rating,
    reviews: d.reviews,
    inStock: d.inStock,
    stockQuantity: d.stockQuantity,
    sku: d.sku,
    sizes: d.sizes,
    condition: d.condition,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const col = await getCollection();
  const docs = await col.find({}).sort({ id: -1 }).toArray();
  return docs.map((d) => mapDocumentToProduct(d));
}

export async function getProductById(id: number): Promise<Product | null> {
  const col = await getCollection();
  const doc = await col.findOne({ id });
  if (!doc) return null;
  return mapDocumentToProduct(doc);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const col = await getCollection();
  // attempt to find by explicit slug field
  let doc = await col.findOne({ slug });
  if (!doc) {
    // try matching numeric id
    const maybeId = Number(slug);
    if (!Number.isNaN(maybeId)) {
      doc = await col.findOne({ id: maybeId });
    }
  }
  // if still not found, try matching by slugified name in DB documents
  if (!doc) {
    try {
      const cursor = col.find({});
      const docs = await cursor.toArray();
      const normalized = String(slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      for (const d of docs) {
        const name = String(d.name || "");
        const nameSlug = name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (nameSlug === normalized) {
          doc = d;
          break;
        }
      }
    } catch (e) {
      // ignore DB iteration errors and fallback to local products below
    }
  }
  if (!doc) return null;
  return mapDocumentToProduct(doc);
}

export async function addProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const col = await getCollection();
  // generate numeric id by taking max id +1
  const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  const nextId = (last[0]?.id ?? 0) + 1;
  const slug = await ensureUniqueSlug(
    col,
    product.slug || product.name || nextId
  );
  const doc = { ...product, id: nextId, slug };
  await col.insertOne(doc as ProductDocument);
  return { ...doc };
}

export async function updateProduct(
  id: number,
  updates: Partial<Product>
): Promise<Product | null> {
  const col = await getCollection();
  const set: Partial<Product> = { ...updates };
  // If name or slug is being updated, re-compute a unique slug unless explicitly set
  if (typeof updates.slug === "string" && updates.slug.trim()) {
    set.slug = await ensureUniqueSlug(col, updates.slug.trim(), id);
  } else if (typeof updates.name === "string" && updates.name.trim()) {
    set.slug = await ensureUniqueSlug(col, updates.name.trim(), id);
  }
  const res = await col.findOneAndUpdate(
    { id },
    { $set: set },
    { returnDocument: "after" }
  );
  if (!res.value) return null;
  return mapDocumentToProduct(res.value);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const col = await getCollection();
  const res = await col.deleteOne({ id });
  return res.deletedCount === 1;
}

// Helpers
type Col = Awaited<ReturnType<typeof getCollection>>;

async function ensureUniqueSlug(
  col: Col,
  value: string | number,
  currentId?: number
) {
  const base = localSlugify(String(value));
  if (!base) return `product-${Date.now()}`;
  let candidate = base;
  // allow keeping existing slug for current document
  const exists = async (s: string) => {
    if (typeof currentId === "number") {
      // exclude current document when checking for conflicts
      const clash = await col.findOne({ slug: s, id: { $ne: currentId } });
      return !!clash;
    }
    const clash = await col.findOne({ slug: s });
    return !!clash;
  };
  if (await exists(candidate)) {
    // try appending id if provided
    if (typeof currentId === "number") {
      const withId = `${candidate}-${currentId}`;
      if (!(await exists(withId))) return withId;
    }
    // try appending numeric suffix
    let i = 2;
    while (await exists(`${candidate}-${i}`)) i++;
    candidate = `${candidate}-${i}`;
  }
  return candidate;
}
