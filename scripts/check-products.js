const { MongoClient } = require("mongodb");

async function main() {
  const c = new MongoClient(
    process.env.MONGODB_URI || "mongodb://localhost:27017"
  );
  await c.connect();
  const col = c.db(process.env.MONGODB_DB || "edm").collection("products");

  // Get all products with full details
  const products = await col.find({}).toArray();

  console.log("=== All Products ===");
  products.forEach((p) => {
    console.log(`\nID: ${p.id} - ${p.name}`);
    console.log(`  Category: "${p.category}"`);
    console.log(`  Main Image: ${p.image || "NONE"}`);
    console.log(`  Additional Images: ${p.images ? p.images.length : 0}`);
    if (p.images && p.images.length > 0) {
      p.images.forEach((img, i) =>
        console.log(`    [${i + 1}] ${img.substring(0, 60)}...`)
      );
    }
  });

  // Check if any image starts with cloudinary
  const cloudinaryProducts = products.filter(
    (p) =>
      (p.image && p.image.includes("cloudinary")) ||
      (p.images && p.images.some((img) => img.includes("cloudinary")))
  );
  console.log("\n=== Products with Cloudinary images ===");
  cloudinaryProducts.forEach((p) => {
    console.log(`- ${p.id}: ${p.name}`);
    console.log(`  Image: ${p.image}`);
  });

  await c.close();
}

main().catch(console.error);
