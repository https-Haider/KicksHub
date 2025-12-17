/**
 * Seed products from thrift_shoes_products.json into MongoDB
 *
 * Usage: node scripts/seed-thrift-products.js
 *
 * Options:
 *   --clear    Clear existing products before seeding
 *   --dry-run  Show what would be inserted without actually inserting
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";

// Category mapping from source data to KicksHub categories
const CATEGORY_MAP = {
  sports: "Basketball",
  formal: "Casual",
  casual: "Casual",
  running: "Running",
  basketball: "Basketball",
  // Default fallback
  default: "Casual",
};

function mapCategory(category) {
  const lower = (category || "").toLowerCase();
  return CATEGORY_MAP[lower] || CATEGORY_MAP["default"];
}

// Generate a unique numeric ID based on timestamp + random
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Generate slug from name
function generateSlug(name, id) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${baseSlug}-${id}`;
}

async function seedProducts() {
  const args = process.argv.slice(2);
  const clearExisting = args.includes("--clear");
  const dryRun = args.includes("--dry-run");

  console.log("🚀 Starting product seed...");
  console.log(`   MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);
  console.log(`   Database: ${MONGODB_DB}`);
  console.log(`   Collection: ${PRODUCTS_COLLECTION}`);
  console.log(`   Clear existing: ${clearExisting}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log("");

  // Read source file
  const sourcePath = path.join(
    __dirname,
    "..",
    "data",
    "thrift_shoes_products.json"
  );

  if (!fs.existsSync(sourcePath)) {
    console.error("❌ Source file not found:", sourcePath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(sourcePath, "utf-8");
  const sourceProducts = JSON.parse(rawData);

  console.log(`📦 Found ${sourceProducts.length} products in source file`);

  // Transform products to match schema
  const products = sourceProducts.map((p, index) => {
    const id = generateId() + index;
    return {
      id,
      name: p.name,
      slug: p.slug || generateSlug(p.name, id),
      price: p.price,
      image: p.image,
      images: p.images || [],
      category: mapCategory(p.category),
      description: p.description,
      rating: Math.min(5, Math.max(0, p.rating || 4.0)),
      reviews: p.reviews || 0,
      inStock: p.inStock !== false,
      sku: p.sku || `SKU-${id}`,
      sizes: p.sizes || ["8", "9", "10", "11"],
      condition: p.condition || "good",
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || "",
      seoKeywords: p.seoKeywords || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Show sample
  console.log("\n📋 Sample transformed product:");
  console.log(JSON.stringify(products[0], null, 2));

  // Category distribution
  const categoryCount = {};
  products.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });
  console.log("\n📊 Category distribution:");
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  if (dryRun) {
    console.log("\n✅ Dry run complete. No changes made.");
    return;
  }

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("\n✅ Connected to MongoDB");

    const db = client.db(MONGODB_DB);
    const collection = db.collection(PRODUCTS_COLLECTION);

    // Clear existing if requested
    if (clearExisting) {
      const deleteResult = await collection.deleteMany({});
      console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing products`);
    }

    // Insert products
    const insertResult = await collection.insertMany(products);
    console.log(`✅ Inserted ${insertResult.insertedCount} products`);

    // Verify
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total products in collection: ${totalCount}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n✅ Done!");
  }
}

seedProducts();
