/**
 * Add original KicksHub products back to the database
 *
 * Usage: node scripts/add-original-products.js
 */
require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required");
  process.exit(1);
}

// Original KicksHub products (premium vintage sneakers)
const ORIGINAL_PRODUCTS = [
  {
    name: "Vintage Air Jordan 1 Retro",
    price: 52500,
    category: "Basketball",
    description:
      "Classic Air Jordan 1 Retro in excellent condition. Iconic silhouette with premium leather construction. A must-have for any sneaker collection.",
    rating: 4.9,
    reviews: 324,
    inStock: true,
    sku: "AJ1-001",
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    condition: "excellent",
    seoTitle: "Buy Vintage Air Jordan 1 Retro | KicksHub Pakistan",
    seoDescription:
      "Shop authentic Vintage Air Jordan 1 Retro at 52,500 PKR. Premium quality, excellent condition. Sizes 7-13 available.",
    seoKeywords:
      "air jordan 1, retro sneakers, basketball shoes, vintage jordan, kickshub",
  },
  {
    name: "Nike Air Max 90",
    price: 35900,
    category: "Casual",
    description:
      "Timeless Nike Air Max 90 with visible Air unit. Great condition with minimal wear. The iconic chunky silhouette that changed sneaker culture.",
    rating: 4.7,
    reviews: 256,
    inStock: true,
    sku: "AM90-002",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    condition: "excellent",
    seoTitle: "Buy Nike Air Max 90 | KicksHub Pakistan",
    seoDescription:
      "Shop Nike Air Max 90 at 35,900 PKR. Classic design, excellent condition. Sizes 6-12 available.",
    seoKeywords:
      "nike air max 90, vintage sneakers, casual shoes, air max, kickshub",
  },
  {
    name: "Adidas Stan Smith",
    price: 22100,
    category: "Casual",
    description:
      "Classic Adidas Stan Smith in white leather. Perfect everyday sneaker with light wear. The timeless tennis-inspired design.",
    rating: 4.6,
    reviews: 189,
    inStock: true,
    sku: "SS-003",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    condition: "good",
    seoTitle: "Buy Adidas Stan Smith | KicksHub Pakistan",
    seoDescription:
      "Shop Adidas Stan Smith at 22,100 PKR. Classic white leather, good condition. Sizes 5-12 available.",
    seoKeywords:
      "adidas stan smith, white sneakers, casual shoes, leather sneakers, kickshub",
  },
  {
    name: "Converse Chuck Taylor All Star",
    price: 15200,
    category: "Casual",
    description:
      "Vintage Converse Chuck Taylor in canvas. Retro style with authentic wear. The original basketball shoe that became a cultural icon.",
    rating: 4.5,
    reviews: 412,
    inStock: true,
    sku: "CTA-004",
    sizes: ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    condition: "fair",
    seoTitle: "Buy Converse Chuck Taylor | KicksHub Pakistan",
    seoDescription:
      "Shop Converse Chuck Taylor All Star at 15,200 PKR. Vintage canvas, authentic wear. Sizes 4-13 available.",
    seoKeywords:
      "converse chuck taylor, all star, canvas sneakers, vintage shoes, kickshub",
  },
  {
    name: "Nike Dunk Low",
    price: 41400,
    category: "Basketball",
    description:
      "Nike Dunk Low with clean colorway. Excellent condition, barely worn. The iconic silhouette that bridges basketball and skateboarding.",
    rating: 4.8,
    reviews: 298,
    inStock: true,
    sku: "DL-005",
    sizes: ["7", "8", "9", "10", "11", "12"],
    condition: "like-new",
    seoTitle: "Buy Nike Dunk Low | KicksHub Pakistan",
    seoDescription:
      "Shop Nike Dunk Low at 41,400 PKR. Like-new condition, clean colorway. Sizes 7-12 available.",
    seoKeywords:
      "nike dunk low, basketball shoes, sneakers pakistan, dunk, kickshub",
  },
  {
    name: "Vans Old Skool",
    price: 19300,
    category: "Casual",
    description:
      "Classic Vans Old Skool with iconic side stripe. Good condition with minimal creasing. The skateboarding legend since 1977.",
    rating: 4.6,
    reviews: 167,
    inStock: true,
    sku: "VOS-006",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    condition: "good",
    seoTitle: "Buy Vans Old Skool | KicksHub Pakistan",
    seoDescription:
      "Shop Vans Old Skool at 19,300 PKR. Classic side stripe, good condition. Sizes 5-12 available.",
    seoKeywords:
      "vans old skool, skate shoes, canvas sneakers, vans pakistan, kickshub",
  },
  {
    name: "New Balance 574",
    price: 27600,
    category: "Running",
    description:
      "Comfortable New Balance 574 in retro colorway. Great for everyday wear. The heritage running shoe with ENCAP cushioning.",
    rating: 4.7,
    reviews: 234,
    inStock: true,
    sku: "NB574-007",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    condition: "excellent",
    seoTitle: "Buy New Balance 574 | KicksHub Pakistan",
    seoDescription:
      "Shop New Balance 574 at 27,600 PKR. Retro colorway, excellent condition. Sizes 6-13 available.",
    seoKeywords:
      "new balance 574, running shoes, retro sneakers, nb pakistan, kickshub",
  },
  {
    name: "Puma Suede Classic",
    price: 20700,
    category: "Casual",
    description:
      "Vintage Puma Suede in classic silhouette. Soft suede material with authentic patina. A street style icon since 1968.",
    rating: 4.5,
    reviews: 145,
    inStock: true,
    sku: "PS-008",
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
    condition: "good",
    seoTitle: "Buy Puma Suede Classic | KicksHub Pakistan",
    seoDescription:
      "Shop Puma Suede Classic at 20,700 PKR. Vintage suede, good condition. Sizes 5-11 available.",
    seoKeywords:
      "puma suede, classic sneakers, suede shoes, puma pakistan, kickshub",
  },
  {
    name: "Nike Air Force 1 Low",
    price: 38500,
    category: "Basketball",
    description:
      "The legendary Nike Air Force 1 Low in white. Excellent condition with crisp leather. The shoe that defined sneaker culture.",
    rating: 4.9,
    reviews: 456,
    inStock: true,
    sku: "AF1-009",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    condition: "excellent",
    seoTitle: "Buy Nike Air Force 1 Low | KicksHub Pakistan",
    seoDescription:
      "Shop Nike Air Force 1 Low at 38,500 PKR. White leather, excellent condition. Sizes 6-13 available.",
    seoKeywords:
      "nike air force 1, af1, white sneakers, basketball shoes, kickshub",
  },
  {
    name: "Asics Gel-Lyte III",
    price: 29900,
    category: "Running",
    description:
      "Classic Asics Gel-Lyte III with split tongue design. Great cushioning and retro style. A runner's dream since 1990.",
    rating: 4.6,
    reviews: 178,
    inStock: true,
    sku: "GL3-010",
    sizes: ["7", "8", "9", "10", "11", "12"],
    condition: "excellent",
    seoTitle: "Buy Asics Gel-Lyte III | KicksHub Pakistan",
    seoDescription:
      "Shop Asics Gel-Lyte III at 29,900 PKR. Split tongue design, excellent condition. Sizes 7-12 available.",
    seoKeywords:
      "asics gel lyte 3, running shoes, retro runners, asics pakistan, kickshub",
  },
  {
    name: "Reebok Classic Leather",
    price: 18500,
    category: "Casual",
    description:
      "Timeless Reebok Classic Leather in pristine white. Soft garment leather upper. The fitness icon from the 80s.",
    rating: 4.5,
    reviews: 134,
    inStock: true,
    sku: "RCL-011",
    sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    condition: "good",
    seoTitle: "Buy Reebok Classic Leather | KicksHub Pakistan",
    seoDescription:
      "Shop Reebok Classic Leather at 18,500 PKR. White leather, good condition. Sizes 5-12 available.",
    seoKeywords:
      "reebok classic, leather sneakers, vintage reebok, casual shoes, kickshub",
  },
  {
    name: "Nike Blazer Mid 77",
    price: 33200,
    category: "Basketball",
    description:
      "Vintage Nike Blazer Mid 77 with exposed foam collar. Retro basketball heritage meets modern street style.",
    rating: 4.7,
    reviews: 198,
    inStock: true,
    sku: "BM77-012",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    condition: "excellent",
    seoTitle: "Buy Nike Blazer Mid 77 | KicksHub Pakistan",
    seoDescription:
      "Shop Nike Blazer Mid 77 at 33,200 PKR. Vintage style, excellent condition. Sizes 6-12 available.",
    seoKeywords:
      "nike blazer, mid 77, vintage sneakers, basketball shoes, kickshub",
  },
  {
    name: "Saucony Shadow 6000",
    price: 25800,
    category: "Running",
    description:
      "Retro Saucony Shadow 6000 with premium materials. Exceptional comfort and vintage aesthetics. A hidden gem for collectors.",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    sku: "SS6-013",
    sizes: ["7", "8", "9", "10", "11"],
    condition: "excellent",
    seoTitle: "Buy Saucony Shadow 6000 | KicksHub Pakistan",
    seoDescription:
      "Shop Saucony Shadow 6000 at 25,800 PKR. Premium materials, excellent condition. Sizes 7-11 available.",
    seoKeywords:
      "saucony shadow, retro running, vintage sneakers, saucony pakistan, kickshub",
  },
];

function generateSlug(name, id) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    id
  );
}

async function main() {
  console.log("🚀 Adding original KicksHub products...\n");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const col = client.db("edm").collection("products");

  // Get current max ID
  const existingProducts = await col
    .find({})
    .sort({ id: -1 })
    .limit(1)
    .toArray();
  let nextId =
    existingProducts.length > 0
      ? (existingProducts[0].id || Date.now()) + 1
      : Date.now();

  // Prepare products with IDs and slugs
  const productsToAdd = ORIGINAL_PRODUCTS.map((p, index) => {
    const id = nextId + index;
    return {
      ...p,
      id,
      slug: generateSlug(p.name, id),
      images: [], // Will be updated with images later
      image: "", // Will be updated with images later
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Insert products
  const result = await col.insertMany(productsToAdd);
  console.log(`✅ Added ${result.insertedCount} original products`);

  // Show what was added
  console.log("\n📋 Added products:");
  productsToAdd.forEach((p, i) => {
    console.log(
      `   ${i + 1}. ${p.name} - PKR ${p.price.toLocaleString()} (${p.category})`
    );
  });

  const totalCount = await col.countDocuments();
  console.log(`\n📊 Total products in database: ${totalCount}`);

  await client.close();
  console.log("\n✅ Done!");
}

main().catch(console.error);
