const path = require("path");
const fs = require("fs");
const { MongoClient, GridFSBucket } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";
const IMAGES_DIR = path.join(process.cwd(), "images");

function titleCase(s) {
  return s
    .replace(/[-_\.]+/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .trim();
}

function skuFromName(name) {
  return name
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 30);
}

function priceForName(name) {
  const n = name.toLowerCase();
  if (n.includes("nike") || n.includes("jordan")) return 25000;
  if (
    n.includes("new balance") ||
    n.includes("newbalance") ||
    n.includes("new")
  )
    return 18000;
  if (n.includes("puma")) return 12000;
  if (n.includes("reebok")) return 10000;
  if (n.includes("tommy")) return 16000;
  if (n.includes("zara") || n.includes("stradivarius") || n.includes("mng"))
    return 8000;
  return 12000;
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images directory not found:", IMAGES_DIR);
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const products = db.collection(PRODUCTS_COLLECTION);
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  console.log("Clearing existing products collection...");
  await products.deleteMany({});

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => fs.statSync(path.join(IMAGES_DIR, f)).isFile());
  let created = [];

  for (const file of files) {
    const full = path.join(IMAGES_DIR, file);
    const stream = fs.createReadStream(full);
    const uploadStream = bucket.openUploadStream(file);
    await new Promise((resolve, reject) => {
      stream.pipe(uploadStream).on("error", reject).on("finish", resolve);
    });
    const fileId = uploadStream.id;
    const name = titleCase(file.replace(/\.[^/.]+$/, ""));
    const price = priceForName(name);
    const sku = skuFromName(name);

    // compute next numeric id
    const last = await products.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = (last[0]?.id ?? 0) + 1;

    const doc = {
      id: nextId,
      name,
      price,
      image: `/api/images/${fileId}`,
      category: "Casual",
      description: `Photo: ${file}`,
      rating: 4.6,
      reviews: 100,
      inStock: true,
      sku,
      sizes: ["6", "7", "8", "9", "10", "11", "12"],
      condition: "excellent",
    };

    await products.insertOne(doc);
    created.push(doc);
    console.log("Created product from", file, "-> id", nextId);
  }

  console.log("Created", created.length, "products.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
