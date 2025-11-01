/*
Script: backfill-product-seo.js
- Connects to MongoDB (MONGODB_URI / MONGODB_DB)
- Scans the products collection (MONGODB_PRODUCTS_COLLECTION or "products")
- For any product missing seoTitle/seoDescription (or empty), sets:
    seoTitle: "<name> — KicksHub"
    seoDescription: first 160 chars of HTML-stripped description or a default fallback
*/

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

function stripHtml(input) {
  return String(input || "").replace(/<[^>]+>/g, "");
}

function makeSeoTitle(name) {
  const base = String(name || "").trim();
  if (!base) return "KicksHub — Vintage & Thrifted Sneakers";
  return `${base} — KicksHub`;
}

function makeSeoDescription(description) {
  const clean = stripHtml(description);
  const text =
    clean ||
    "Discover authentic vintage and thrifted sneakers at KicksHub. Curated selection of Jordans, Nike, Adidas and more.";
  return text.slice(0, 160);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const col = client.db(MONGODB_DB).collection(PRODUCTS_COLLECTION);

  // Find all docs missing seo fields or having empty values
  const cursor = col.find({
    $or: [
      { seoTitle: { $exists: false } },
      { seoDescription: { $exists: false } },
      { seoTitle: "" },
      { seoDescription: "" },
    ],
  });

  const candidates = await cursor.toArray();
  console.log(`Found ${candidates.length} products to backfill`);

  let updated = 0;
  for (const p of candidates) {
    const newSeoTitle =
      p.seoTitle && String(p.seoTitle).trim()
        ? p.seoTitle
        : makeSeoTitle(p.name);
    const newSeoDescription =
      p.seoDescription && String(p.seoDescription).trim()
        ? p.seoDescription
        : makeSeoDescription(p.description);

    const set = {};
    if (newSeoTitle !== p.seoTitle) set.seoTitle = newSeoTitle;
    if (newSeoDescription !== p.seoDescription)
      set.seoDescription = newSeoDescription;

    if (Object.keys(set).length > 0) {
      await col.updateOne({ _id: p._id }, { $set: set });
      updated++;
      console.log(`Updated product id=${p.id} (${p.name})`);
    }
  }

  console.log(`Backfilled ${updated} product(s).`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
