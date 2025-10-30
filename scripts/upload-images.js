const path = require("path");
const fs = require("fs");
const { MongoClient, GridFSBucket } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION || "products";
const IMAGES_DIR = path.join(process.cwd(), "images");

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const bucket = new GridFSBucket(db, { bucketName: "images" });
  const products = db.collection(PRODUCTS_COLLECTION);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images directory not found:", IMAGES_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => fs.statSync(path.join(IMAGES_DIR, f)).isFile());
  for (const file of files) {
    const full = path.join(IMAGES_DIR, file);
    const stream = fs.createReadStream(full);
    const uploadStream = bucket.openUploadStream(file);
    await new Promise((resolve, reject) => {
      stream.pipe(uploadStream).on("error", reject).on("finish", resolve);
    });
    const fileId = uploadStream.id;
    console.log("Uploaded", file, "->", String(fileId));

    // update products that reference this filename in their image path
    // match by file name (e.g. 'air-jordan-1.jpg')
    const res = await products.updateMany(
      { image: { $regex: file.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") } },
      { $set: { image: `/api/images/${fileId}` } }
    );
    console.log("Updated products count:", res.modifiedCount);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
