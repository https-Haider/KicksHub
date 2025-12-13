const { MongoClient } = require("mongodb");

// Sample Cloudinary image URLs for different shoe angles
// These are placeholder URLs - in production, you'd upload actual images
const sampleImages = {
  newBalance: [
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nb-side",
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nb-top",
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nb-back",
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nb-sole",
  ],
  nike: [
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nike-side",
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nike-top",
    "https://res.cloudinary.com/dhrt728up/image/upload/v1/kickshub/nike-back",
  ],
};

async function main() {
  const c = new MongoClient(
    process.env.MONGODB_URI || "mongodb://localhost:27017"
  );
  await c.connect();
  const col = c.db(process.env.MONGODB_DB || "edm").collection("products");

  // Get current max ID
  const products = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  const maxId = products[0]?.id || 0;

  // Check if New Balance 1080 already exists
  const existing1080 = await col.findOne({ name: { $regex: /1080/i } });

  if (!existing1080) {
    // Add New Balance 1080 product
    const nb1080 = {
      id: maxId + 1,
      name: "New Balance Fresh Foam 1080v13",
      slug: "new-balance-fresh-foam-1080v13",
      price: 5500,
      image:
        "https://res.cloudinary.com/dhrt728up/image/upload/v1761840777/hyylkh9tfoail8spf7z1.webp", // Using existing cloudinary image as placeholder
      images: [], // Will be filled with actual images when uploaded
      category: "Running",
      description: `<div class="product-description"><h3>Product Detail</h3><ul><li>Shoe Size: EUR 43 / UK 8.5 / PAK 8.5 / USA 9.5</li><li>New Balance Fresh Foam 1080v13 - Premium running shoe</li><li>Actual unedited pictures of the product - What you see is what you get</li><li>Color: See photos</li><li>100% Authentic & Genuine product</li><li>Imported from USA</li><li>Pre-owned in excellent condition</li><li>We offer 7 days easy return/exchange policy</li></ul></div>`,
      rating: 4.8,
      reviews: 50,
      inStock: true,
      sku: "NB1080V13",
      sizes: ["7", "8", "9", "10", "11"],
      condition: "excellent",
      seoTitle: "New Balance Fresh Foam 1080v13 — KicksHub",
      seoDescription:
        "Premium New Balance Fresh Foam 1080v13 running shoes in excellent condition. Authentic, imported from USA.",
    };

    await col.insertOne(nb1080);
    console.log(`✓ Added New Balance 1080 (ID: ${nb1080.id})`);
  } else {
    console.log(`ℹ New Balance 1080 already exists (ID: ${existing1080.id})`);
  }

  // Show all products after update
  const allProducts = await col.find({}).toArray();
  console.log("\n=== Current Products ===");
  allProducts.forEach((p) => {
    console.log(
      `${p.id}: ${p.name} | ${p.category} | images: ${
        1 + (p.images?.length || 0)
      }`
    );
  });

  await c.close();
  console.log("\nDone! Restart your dev server to see changes.");
}

main().catch(console.error);
