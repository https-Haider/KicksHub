const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(MONGODB_DB);
  const products = db.collection(PRODUCTS_COLLECTION);

  const docs = await products.find({}).toArray();
  console.log(
    "Found",
    docs.length,
    "products. Updating prices to PKR 3000-4000..."
  );

  let updated = 0;
  for (const p of docs) {
    const newPrice = randInt(3000, 4000);
    const res = await products.updateOne(
      { _id: p._id },
      { $set: { price: newPrice, currency: "PKR" } }
    );
    if (res.modifiedCount > 0) updated++;
    console.log(
      `- ${p.name || p.title || p.id || p._id}: ${p.price} -> ${newPrice}`
    );
  }

  console.log(`Updated ${updated} product(s).`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
