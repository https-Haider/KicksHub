const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const col = db.collection(PRODUCTS_COLLECTION);

  const file = path.join(__dirname, "..", "data", "default-products.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const p of data) {
    // upsert by sku if present, otherwise by name
    const filter = p.sku ? { sku: p.sku } : { name: p.name };
    const existing = await col.findOne(filter);
    if (existing) {
      console.log("Skipping existing product", p.name);
      continue;
    }
    // compute id: max id +1
    const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = (last[0]?.id ?? 0) + 1;
    const doc = { ...p, id: nextId };
    await col.insertOne(doc);
    console.log("Inserted", p.name);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
