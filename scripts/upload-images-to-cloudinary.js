/**
 * Download images from Unsplash and upload to Cloudinary
 * Then update all products with Cloudinary URLs
 *
 * Usage: node scripts/upload-images-to-cloudinary.js
 */
require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const https = require("https");
const http = require("http");
const cloudinary = require("cloudinary").v2;

// Validate required environment variables
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "MONGODB_URI",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("Error: Missing required environment variables:", missingVars.join(", "));
  process.exit(1);
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGODB_URI = process.env.MONGODB_URI;

// Unsplash shoe image URLs (will be downloaded and re-uploaded to Cloudinary)
const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595909315417-2edd382a56dc?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1612902456551-333ac5afa26e?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1580906853149-27b4c5a4a726?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1594495894542-a46cc73e081a?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1580906853305-e481e1a0e3b3?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1559479083-62f7133a78ad?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600185652960-c9d8869d015c?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055uj3e6b6d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1578116922645-3976907a7671?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595909315417-2edd382a56dc?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1623998021446-45cd9b269c93?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595461135849-cf11a4b0e35d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&h=800&fit=crop",
];

// Upload URL directly to Cloudinary
async function uploadToCloudinary(imageUrl, index) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "kickshub/products",
      public_id: `shoe_${index}`,
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: "fill" },
        { quality: "auto:best" },
        { fetch_format: "auto" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload image ${index}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🚀 Starting image upload to Cloudinary...\n");

  // Upload all images to Cloudinary
  const cloudinaryUrls = [];

  for (let i = 0; i < UNSPLASH_IMAGES.length; i++) {
    console.log(`Uploading image ${i + 1}/${UNSPLASH_IMAGES.length}...`);
    const url = await uploadToCloudinary(UNSPLASH_IMAGES[i], i);
    if (url) {
      cloudinaryUrls.push(url);
      console.log(`  ✅ Uploaded: ${url.substring(0, 60)}...`);
    } else {
      // Use a fallback if upload fails
      cloudinaryUrls.push(UNSPLASH_IMAGES[i]);
      console.log(`  ⚠️ Using original URL as fallback`);
    }
  }

  console.log(`\n✅ Uploaded ${cloudinaryUrls.length} images to Cloudinary\n`);

  // Connect to MongoDB and update products
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const col = client.db("edm").collection("products");
  const products = await col.find({}).toArray();
  console.log(`📦 Found ${products.length} products to update\n`);

  // Update each product with Cloudinary URLs
  for (let i = 0; i < products.length; i++) {
    const mainImg = cloudinaryUrls[i % cloudinaryUrls.length];
    const gallery = [
      mainImg,
      cloudinaryUrls[(i + 5) % cloudinaryUrls.length],
      cloudinaryUrls[(i + 10) % cloudinaryUrls.length],
      cloudinaryUrls[(i + 15) % cloudinaryUrls.length],
    ];

    await col.updateOne(
      { _id: products[i]._id },
      { $set: { image: mainImg, images: gallery, updatedAt: new Date() } }
    );
    console.log(`Updated ${i + 1}/${products.length}: ${products[i].name}`);
  }

  console.log("\n✅ All products updated with Cloudinary URLs!");
  await client.close();
}

main().catch(console.error);
