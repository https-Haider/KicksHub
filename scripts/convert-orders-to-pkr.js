/*
Script: convert-orders-to-pkr.js
- Connects to MongoDB (MONGODB_URI / MONGODB_DB)
- Reads all orders and converts monetary values from USD -> PKR using ORDERS_USD_TO_PKR_RATE env var (default 280)
- Updates items[].price, subtotal, shipping, tax, total, and sets currency: 'PKR'
- Rounds prices to nearest integer
*/

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edm";
const ORDERS_COLLECTION = process.env.MONGODB_COLLECTION || "orders";
const RATE = parseFloat(process.env.ORDERS_USD_TO_PKR_RATE || "280");

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const col = client.db(MONGODB_DB).collection(ORDERS_COLLECTION);

  const cursor = col.find({});
  const orders = await cursor.toArray();
  console.log(`Found ${orders.length} orders`);
  let updated = 0;
  for (const o of orders) {
    const upd = {};
    let changed = false;
    if (Array.isArray(o.items)) {
      const newItems = o.items.map((it) => {
        if (typeof it.price === "number") {
          changed = true;
          return { ...it, price: Math.round(it.price * RATE) };
        }
        return it;
      });
      if (changed) upd.items = newItems;
    }
    if (typeof o.subtotal === "number") {
      upd.subtotal = Math.round(o.subtotal * RATE);
      changed = true;
    }
    if (typeof o.shipping === "number") {
      upd.shipping = Math.round(o.shipping * RATE);
      changed = true;
    }
    if (typeof o.tax === "number") {
      upd.tax = Math.round(o.tax * RATE);
      changed = true;
    }
    if (typeof o.total === "number") {
      upd.total = Math.round(o.total * RATE);
      changed = true;
    }
    if (changed) upd.currency = "PKR";

    if (changed) {
      await col.updateOne({ _id: o._id }, { $set: upd });
      updated++;
      console.log(`Updated order ${o.id}`);
    }
  }
  console.log(`Updated ${updated} orders`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
