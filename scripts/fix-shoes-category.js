require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function fixShoesCategory() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // First, let's see what categories exist
    const products = await db
      .collection("products")
      .find({})
      .project({ name: 1, category: 1, _id: 0 })
      .toArray();
    console.log("Current products and categories:");
    products.forEach((p) => console.log(`  - ${p.name}: ${p.category}`));

    // Get unique categories
    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\nUnique categories:", categories);

    // Update any product with category containing "shoe" (case-insensitive) to "Basketball"
    const result = await db
      .collection("products")
      .updateMany(
        { category: { $regex: /shoe/i } },
        { $set: { category: "Basketball" } }
      );

    console.log(
      `\nUpdated ${result.modifiedCount} products from Shoes category to Basketball`
    );

    // Show updated categories
    if (result.modifiedCount > 0) {
      const updated = await db
        .collection("products")
        .find({})
        .project({ name: 1, category: 1, _id: 0 })
        .toArray();
      console.log("\nUpdated products and categories:");
      updated.forEach((p) => console.log(`  - ${p.name}: ${p.category}`));
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

fixShoesCategory();
