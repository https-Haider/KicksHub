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
  const docs = await products.find({}).limit(10).toArray();
  console.log("Found", docs.length, "products");
  for (const p of docs) {
    console.log(
      JSON.stringify(
        {
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          description: p.description,
        },
        null,
        2
      )
    );
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
