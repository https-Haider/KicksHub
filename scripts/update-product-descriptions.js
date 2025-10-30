const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

function buildDescription(product) {
  // A rich HTML description template — adjust as needed.
  const sizeLine = `Shoe Size: EUR 42 / UK 7.5 / PAK 7.5 / USA 8.5`;
  const lines = [
    sizeLine,
    "Actual unedited pictures of the product - What you see is what you get",
    `Color: ${product.color || "See photos"}`,
    "100% Authentic & Genuine product - All items sold are personally inspected by our team for originality",
    "Imported from USA",
    "Not a Fake / Not a First Copy / Not a Replica",
    "Pre-owned and pre-used",
    "We offer 7 days easy return/exchange policy in case there is a size issue or you are not satisfied with the product",
  ];

  // Do not include a raw photo URL or filename in the description — keep descriptions clean.
  return (
    `<div class="product-description"><h3>Product Detail</h3><ul>` +
    lines.map((l) => `<li>${l}</li>`).join("") +
    `</ul></div>`
  );
}

async function main() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(MONGODB_DB);
  const products = db.collection(PRODUCTS_COLLECTION);

  const cursor = products.find({});
  let count = 0;
  while (await cursor.hasNext()) {
    const p = await cursor.next();
    const newDescription = buildDescription(p);
    await products.updateOne(
      { _id: p._id },
      { $set: { description: newDescription } }
    );
    console.log(`Updated product ${p.id || p._id} description`);
    count++;
  }
  console.log(`Updated ${count} products.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
