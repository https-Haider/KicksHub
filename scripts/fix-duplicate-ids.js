/**
 * Fix duplicate product IDs by assigning new unique IDs
 */
const { MongoClient } = require("mongodb");

const MONGODB_URI =
  "mongodb+srv://haider:haider1011@cluster0.ts7eadi.mongodb.net/?appName=Cluster0";

async function fixDuplicateIds() {
  console.log("Checking for duplicate IDs...\n");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const col = client.db("edm").collection("products");
  const products = await col.find({}).toArray();

  // Find duplicates
  const idCounts = {};
  products.forEach((p) => {
    idCounts[p.id] = (idCounts[p.id] || 0) + 1;
  });

  const duplicateIds = Object.entries(idCounts).filter(
    ([id, count]) => count > 1
  );

  if (duplicateIds.length === 0) {
    console.log("No duplicate IDs found!");
    await client.close();
    return;
  }

  console.log("Found duplicate IDs:", duplicateIds);

  // Fix duplicates by assigning new unique IDs
  let fixedCount = 0;
  for (const [duplicateId, count] of duplicateIds) {
    const productsWithDuplicateId = products.filter(
      (p) => String(p.id) === String(duplicateId)
    );

    // Keep the first one, reassign IDs to the rest
    for (let i = 1; i < productsWithDuplicateId.length; i++) {
      const product = productsWithDuplicateId[i];
      const newId = Date.now() + Math.floor(Math.random() * 10000) + i;

      await col.updateOne(
        { _id: product._id },
        {
          $set: {
            id: newId,
            slug: product.slug
              ? product.slug.replace(/-\d+$/, `-${newId}`)
              : undefined,
            updatedAt: new Date(),
          },
        }
      );

      console.log(
        `Fixed: ${product.name} - Old ID: ${product.id} -> New ID: ${newId}`
      );
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} products with duplicate IDs`);

  // Verify no more duplicates
  const verifyProducts = await col.find({}).toArray();
  const verifyIdCounts = {};
  verifyProducts.forEach((p) => {
    verifyIdCounts[p.id] = (verifyIdCounts[p.id] || 0) + 1;
  });

  const remainingDuplicates = Object.entries(verifyIdCounts).filter(
    ([id, count]) => count > 1
  );
  if (remainingDuplicates.length === 0) {
    console.log("✅ All IDs are now unique!");
  } else {
    console.log("⚠️ Still have duplicates:", remainingDuplicates);
  }

  await client.close();
}

fixDuplicateIds().catch(console.error);
