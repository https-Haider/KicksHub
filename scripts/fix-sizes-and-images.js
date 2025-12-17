const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://haider:haider1011@cluster0.ts7eadi.mongodb.net/?appName=Cluster0";

// Verified working Cloudinary shoe images
const cloudinaryImages = [
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992958/kickshub/products/shoe_0.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992959/kickshub/products/shoe_1.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992960/kickshub/products/shoe_2.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992961/kickshub/products/shoe_3.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992963/kickshub/products/shoe_4.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992964/kickshub/products/shoe_5.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992965/kickshub/products/shoe_6.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992966/kickshub/products/shoe_7.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992967/kickshub/products/shoe_8.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992968/kickshub/products/shoe_9.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992969/kickshub/products/shoe_10.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992970/kickshub/products/shoe_11.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992971/kickshub/products/shoe_12.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992972/kickshub/products/shoe_13.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992973/kickshub/products/shoe_14.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992974/kickshub/products/shoe_15.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992975/kickshub/products/shoe_16.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992976/kickshub/products/shoe_17.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992977/kickshub/products/shoe_18.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992978/kickshub/products/shoe_19.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992979/kickshub/products/shoe_20.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992980/kickshub/products/shoe_21.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992981/kickshub/products/shoe_22.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992982/kickshub/products/shoe_23.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992983/kickshub/products/shoe_24.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992984/kickshub/products/shoe_25.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992985/kickshub/products/shoe_26.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992986/kickshub/products/shoe_27.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992987/kickshub/products/shoe_28.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992988/kickshub/products/shoe_29.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992989/kickshub/products/shoe_30.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992990/kickshub/products/shoe_31.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992991/kickshub/products/shoe_32.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992992/kickshub/products/shoe_33.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992993/kickshub/products/shoe_34.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992994/kickshub/products/shoe_35.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992995/kickshub/products/shoe_36.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992996/kickshub/products/shoe_37.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992997/kickshub/products/shoe_38.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992998/kickshub/products/shoe_39.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765992999/kickshub/products/shoe_40.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993000/kickshub/products/shoe_41.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993001/kickshub/products/shoe_42.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993002/kickshub/products/shoe_43.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993003/kickshub/products/shoe_44.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993004/kickshub/products/shoe_45.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993005/kickshub/products/shoe_46.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993006/kickshub/products/shoe_47.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993007/kickshub/products/shoe_48.jpg",
  "https://res.cloudinary.com/dhrt728up/image/upload/v1765993008/kickshub/products/shoe_49.jpg",
];

// Generate random sizes from 38 to 46
function generateRandomSizes() {
  const allSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  // Pick 3-6 random sizes
  const numSizes = Math.floor(Math.random() * 4) + 3; // 3-6 sizes
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
    let imageFixedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newSizes = generateRandomSizes();

      const updateObj = {
        sizes: newSizes,
      };

      // Check if image is using Unsplash (broken) and replace with Cloudinary
      if (product.image && product.image.includes("unsplash")) {
        const randomImage =
          cloudinaryImages[Math.floor(Math.random() * cloudinaryImages.length)];
        updateObj.image = randomImage;

        // Also update gallery images
        updateObj.images = [
          randomImage,
          cloudinaryImages[Math.floor(Math.random() * cloudinaryImages.length)],
          cloudinaryImages[Math.floor(Math.random() * cloudinaryImages.length)],
          cloudinaryImages[Math.floor(Math.random() * cloudinaryImages.length)],
        ];
        imageFixedCount++;
        console.log(`🖼️  Fixed image for: ${product.name}`);
      }

      await collection.updateOne({ _id: product._id }, { $set: updateObj });

      console.log(
        `✅ Updated sizes for: ${product.name} -> [${newSizes.join(", ")}]`
      );
      updatedCount++;
    }

    console.log("\n========================================");
    console.log(`✅ Updated sizes for ${updatedCount} products`);
    console.log(`🖼️  Fixed images for ${imageFixedCount} products`);
    console.log("========================================\n");

    // Show a sample product
    const sample = await collection.findOne({});
    console.log("Sample product after update:");
    console.log(
      JSON.stringify(
        { name: sample.name, sizes: sample.sizes, image: sample.image },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
