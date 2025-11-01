import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || "";

function slugify(input: string | number) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  // Simple secret-based protection
  const header = req.headers.get("x-migration-secret") || "";
  if (!MIGRATION_SECRET || header !== MIGRATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const col = client.db(MONGODB_DB).collection(PRODUCTS_COLLECTION);

    const existing = await col
      .find(
        { slug: { $exists: true, $type: "string", $ne: "" } },
        { projection: { slug: 1 } }
      )
      .toArray();
    const existingSlugs = new Set(existing.map((d: any) => String(d.slug)));

    const candidates = await col
      .find({
        $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
      })
      .toArray();

    let updated = 0;
    for (const p of candidates) {
      const base = slugify((p as any).name || (p as any).sku || (p as any).id);
      let candidate = base || `product-${(p as any).id ?? Date.now()}`;
      if (existingSlugs.has(candidate)) {
        const withId = `${candidate}-${(p as any).id ?? "x"}`;
        if (!existingSlugs.has(withId)) {
          candidate = withId;
        } else {
          let i = 2;
          while (existingSlugs.has(`${candidate}-${i}`)) i++;
          candidate = `${candidate}-${i}`;
        }
      }
      await col.updateOne(
        { _id: (p as any)._id },
        { $set: { slug: candidate } }
      );
      existingSlugs.add(candidate);
      updated++;
    }

    // Ensure unique index exists
    let indexName: string | undefined;
    try {
      indexName = await col.createIndex(
        { slug: 1 },
        { unique: true, name: "unique_slug" }
      );
    } catch (e: any) {
      // If it already exists or there are dupes, surface info
      indexName = undefined;
    }

    return NextResponse.json({
      updated,
      index: indexName || "existing or could not be created",
    });
  } catch (err: any) {
    console.error("run-slug-migration error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
