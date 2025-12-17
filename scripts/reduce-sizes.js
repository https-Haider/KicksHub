const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://haider:haider1011@cluster0.ts7eadi.mongodb.net/?appName=Cluster0";

// Generate random 2-3 sizes from 38 to 46
function generateRandomSizes() {
  const allSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  // Pick 2-3 random sizes only
  const numSizes = Math.floor(Math.random() * 2) + 2; // 2-3 sizes
  const shuffled = allSizes.sort(() => Math.random() - 0.5);
  const selectedSizes = shuffled.slice(0, numSizes).sort((a, b) => a - b);
  return selectedSizes;
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("edm");
    const collection = db.collection("products");

    // Get all products
    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;

    for (const product of products) {
      const newSizes = generateRandomSizes();

      await collection.updateOne(
        { _id: product._id },
        { $set: { sizes: newSizes } }
      );

      console.log(`✅ ${product.name}: [${newSizes.join(", ")}]`);
      updatedCount++;
    }

    console.log("\n========================================");
    console.log(`✅ Updated ${updatedCount} products to have 2-3 sizes each`);
    console.log("========================================\n");

    // Show sample
    const samples = await collection.find({}).limit(5).toArray();
    console.log("Sample products:");
    samples.forEach((p) => {
      console.log(`  ${p.name}: [${p.sizes.join(", ")}]`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
