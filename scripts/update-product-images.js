/**
 * Update product images with real shoe photos from Unsplash
 *
 * Usage: node scripts/update-product-images.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

// Real shoe images from Unsplash (free to use)
const SHOE_IMAGES = [
  // Sneakers & Athletic
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", // Red Nike
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80", // White sneaker
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80", // Nike Air Force
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", // Colorful Nike
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80", // White Nike
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80", // Jordan-style
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&q=80", // Running shoe
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80", // Nike React
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80", // Colorful sneaker
  "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80", // Adidas style

  // More sneakers
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80", // Orange Nike
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80", // Vans style
  "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80", // Jordan 1
  "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80", // New Balance
  "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80", // Converse style
  "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80", // Nike Dunk
  "https://images.unsplash.com/photo-1491553895911-0055uj3e6b6d?w=800&q=80", // Classic sneaker
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80", // Blue sneaker
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80", // Air Max
  "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=800&q=80", // Running shoes

  // Additional variety
  "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80", // Jordan
  "https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800&q=80", // Yeezy style
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80", // Jordan retro
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80", // Basketball shoe
  "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80", // Sneaker pair
  "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80", // Nike blazer
  "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80", // Running
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80", // Sneaker lifestyle
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80", // High top
  "https://images.unsplash.com/photo-1594495894542-a46cc73e081a?w=800&q=80", // Sport shoes

  // More options
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80", // Nike running
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", // Red Nike
  "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800&q=80", // Sneakers
  "https://images.unsplash.com/photo-1612902456551-333ac5afa26e?w=800&q=80", // Colorful
  "https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=800&q=80", // Chunky sneaker
  "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80", // Retro
  "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=800&q=80", // Classic
  "https://images.unsplash.com/photo-1595909315417-2edd382a56dc?w=800&q=80", // Sport
  "https://images.unsplash.com/photo-1491553895911-0055uj3e6b6d?w=800&q=80", // Lifestyle
  "https://images.unsplash.com/photo-1580906853305-e481e1a0e3b3?w=800&q=80", // Basketball
];

// Generate 3-5 related images for each product
function getImagesForProduct(index) {
  const mainIndex = index % SHOE_IMAGES.length;
  const images = [SHOE_IMAGES[mainIndex]];

  // Add 2-4 more images
  const additionalCount = 2 + Math.floor(Math.random() * 3); // 2-4 additional
  for (let i = 1; i <= additionalCount; i++) {
    const nextIndex = (mainIndex + i * 7) % SHOE_IMAGES.length; // Skip by 7 to get variety
    if (!images.includes(SHOE_IMAGES[nextIndex])) {
      images.push(SHOE_IMAGES[nextIndex]);
    }
  }

  return images;
}

async function updateImages() {
  console.log("🖼️  Updating product images with real shoe photos...\n");

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);
    console.log(`   DB: ${MONGODB_DB}\n`);

    const db = client.db(MONGODB_DB);
    const collection = db.collection(PRODUCTS_COLLECTION);

    // Get all products
    const products = await collection.find({}).toArray();
    console.log(`📦 Found ${products.length} products to update\n`);

    let updated = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const images = getImagesForProduct(i);

      await collection.updateOne(
        { _id: product._id },
        {
          $set: {
            image: images[0],
            images: images,
            updatedAt: new Date(),
          },
        }
      );

      updated++;
      if (updated % 10 === 0) {
        console.log(`   Updated ${updated}/${products.length} products...`);
      }
    }

    console.log(`\n✅ Updated all ${updated} products with real shoe images!`);

    // Show sample
    const sample = await collection.findOne({});
    console.log("\n📋 Sample updated product:");
    console.log(`   Name: ${sample.name}`);
    console.log(`   Main image: ${sample.image}`);
    console.log(`   Gallery: ${sample.images.length} images`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n✅ Done!");
  }
}

updateImages();
