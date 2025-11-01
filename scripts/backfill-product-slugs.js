/*
Script: backfill-product-slugs.js
- Connects to MongoDB (MONGODB_URI / MONGODB_DB)
- Scans the products collection (MONGODB_PRODUCTS_COLLECTION or "products")
- Populates a canonical, URL-safe slug for each product derived from name
- Ensures uniqueness by de-duplicating; if conflict, appends "-<id>" suffix
- After backfilling, creates a unique index on { slug: 1 }
*/

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD") // strip diacritics
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const col = client.db(MONGODB_DB).collection(PRODUCTS_COLLECTION);

  // Load existing slugs to avoid duplicates
  const existing = await col
    .find(
      { slug: { $exists: true, $type: "string", $ne: "" } },
      { projection: { slug: 1 } }
    )
    .toArray();
  const existingSlugs = new Set(existing.map((d) => String(d.slug)));

  // Find items missing slug or with empty/invalid slug
  const candidates = await col
    .find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] })
    .toArray();

  console.log(`Found ${candidates.length} products missing slug`);

  let updated = 0;
  for (const p of candidates) {
    const base = slugify(p.name || p.sku || p.id);
    let candidate = base;
    if (!candidate) {
      // fallback: ensure some slug exists
      candidate = `product-${p.id || Date.now()}`;
    }
    // Ensure unique across current DB + updates in this run
    if (existingSlugs.has(candidate)) {
      // Prefer to append numeric id for deterministic uniqueness
      const withId = `${candidate}-${p.id ?? "x"}`;
      if (!existingSlugs.has(withId)) {
        candidate = withId;
      } else {
        // Fallback to incremental suffix
        let i = 2;
        while (existingSlugs.has(`${candidate}-${i}`)) i++;
        candidate = `${candidate}-${i}`;
      }
    }

    await col.updateOne({ _id: p._id }, { $set: { slug: candidate } });
    existingSlugs.add(candidate);
    updated++;
    console.log(`Set slug for id=${p.id}: ${candidate}`);
  }

  console.log(`Backfilled slugs for ${updated} product(s).`);

  // Create a unique index on slug for fast lookup and integrity
  try {
    const name = await col.createIndex(
      { slug: 1 },
      { unique: true, name: "unique_slug" }
    );
    console.log(`Created index: ${name}`);
  } catch (e) {
    if (e && e.code === 11000) {
      console.error(
        "Duplicate slug detected while creating unique index. Resolve duplicates and re-run."
      );
    } else {
      console.warn("Index creation warning:", e?.message || e);
    }
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
