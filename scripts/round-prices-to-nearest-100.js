const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(MONGODB_DB);
  const products = db.collection(PRODUCTS_COLLECTION);

  const docs = await products.find({}).toArray();
  console.log(
    "Found",
    docs.length,
    "products. Rounding prices to nearest 100..."
  );

  let updated = 0;
  for (const p of docs) {
    const oldPrice = Number(p.price || 0);
    const newPrice = Math.round(oldPrice / 100) * 100;
    if (newPrice !== oldPrice) {
      const res = await products.updateOne(
        { _id: p._id },
        { $set: { price: newPrice, currency: "PKR" } }
      );
      if (res.modifiedCount > 0) updated++;
      console.log(`- ${p.name || p.id || p._id}: ${oldPrice} -> ${newPrice}`);
    } else {
      // ensure currency is set
      if (p.currency !== "PKR") {
        await products.updateOne({ _id: p._id }, { $set: { currency: "PKR" } });
        console.log(
          `- ${
            p.name || p.id || p._id
          }: currency set to PKR (price ${oldPrice})`
        );
      }
    }
  }

  console.log(`Updated ${updated} product(s).`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
