require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI environment variable is required");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("edm");
    const collection = db.collection("products");

    // Update all products that don't have stockQuantity
    const result = await collection.updateMany(
      { stockQuantity: { $exists: false } },
      { $set: { stockQuantity: 5 } } // Default to 5 items in stock
    );

    console.log(
      `Updated ${result.modifiedCount} products with default stockQuantity of 5`
    );

    // Also update inStock based on stockQuantity for consistency
    await collection.updateMany(
      { stockQuantity: { $gt: 0 } },
      { $set: { inStock: true } }
    );

    await collection.updateMany(
      { stockQuantity: { $lte: 0 } },
      { $set: { inStock: false } }
    );

    console.log("✅ Stock consistency updated");

    // Show sample
    const sample = await collection.findOne({});
    console.log("\nSample product:", {
      name: sample.name,
      stockQuantity: sample.stockQuantity,
      inStock: sample.inStock,
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
