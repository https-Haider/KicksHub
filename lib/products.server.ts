import { MongoClient } from "mongodb";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  sku?: string;
  sizes?: string[];
  condition?: string;
};

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
  return client.db(MONGODB_DB).collection(PRODUCTS_COLLECTION);
}

export async function getAllProducts(): Promise<Product[]> {
  const col = await getCollection();
  const docs = await col.find({}).sort({ id: -1 }).toArray();
  return docs.map((d: any) => ({
    id: d.id,
    name: d.name,
    price: d.price,
    image: d.image,
    category: d.category,
    description: d.description,
    rating: d.rating,
    reviews: d.reviews,
    inStock: d.inStock,
    sku: d.sku,
    sizes: d.sizes,
    condition: d.condition,
  }));
}

export async function getProductById(id: number): Promise<Product | null> {
  const col = await getCollection();
  const doc = await col.findOne({ id });
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    price: doc.price,
    image: doc.image,
    category: doc.category,
    description: doc.description,
    rating: doc.rating,
    reviews: doc.reviews,
    inStock: doc.inStock,
    sku: doc.sku,
    sizes: doc.sizes,
    condition: doc.condition,
  };
}

export async function addProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const col = await getCollection();
  // generate numeric id by taking max id +1
  const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  const nextId = (last[0]?.id ?? 0) + 1;
  const doc = { ...product, id: nextId };
  await col.insertOne(doc);
  return { ...doc };
}

export async function updateProduct(
  id: number,
  updates: Partial<Product>
): Promise<Product | null> {
  const col = await getCollection();
  const res = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  );
  if (!res.value) return null;
  const d: any = res.value;
  return {
    id: d.id,
    name: d.name,
    price: d.price,
    image: d.image,
    category: d.category,
    description: d.description,
    rating: d.rating,
    reviews: d.reviews,
    inStock: d.inStock,
    sku: d.sku,
    sizes: d.sizes,
    condition: d.condition,
  };
}

export async function deleteProduct(id: number): Promise<boolean> {
  const col = await getCollection();
  const res = await col.deleteOne({ id });
  return res.deletedCount === 1;
}
