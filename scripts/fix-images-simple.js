/**
 * Simple image fix script
 */
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const IMAGES = [
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
];

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required");
  process.exit(1);
}

async function fix() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("Connected!");

  const col = client.db("edm").collection("products");
  const products = await col.find({}).toArray();
  console.log(`Found ${products.length} products`);

  for (let i = 0; i < products.length; i++) {
    const mainImg = IMAGES[i % IMAGES.length];
    const gallery = [
      mainImg,
      IMAGES[(i + 5) % IMAGES.length],
      IMAGES[(i + 10) % IMAGES.length],
      IMAGES[(i + 15) % IMAGES.length],
    ];

    await col.updateOne(
      { _id: products[i]._id },
      { $set: { image: mainImg, images: gallery, updatedAt: new Date() } }
    );
    console.log(`Updated ${i + 1}/${products.length}: ${products[i].name}`);
  }

  console.log("\nDone! All products updated with working images.");
  await client.close();
}

fix().catch(console.error);
