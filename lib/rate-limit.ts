import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "edm";
const RATE_LIMIT_COLLECTION = "ai_request_logs";

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getRateLimitCollection() {
  const client = await getClient();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(RATE_LIMIT_COLLECTION);

  // Ensure TTL index exists (creates if not present, no-op if exists)
  // This index automatically deletes documents after 1 hour
  try {
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 3600 } // 1 hour TTL
    );
  } catch {
    // Index might already exist with same config - that's fine
    console.log("TTL index already exists or created");
  }

  return collection;
}

interface RateLimitParams {
  userId: string;
  endpoint: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and enforce rate limiting using MongoDB TTL
 *
 * @param params - Rate limit parameters
 * @returns Object indicating if request is allowed and remaining quota
 */
export async function checkMongoRateLimit(
  params: RateLimitParams
): Promise<RateLimitResult> {
  const { userId, endpoint, limit, windowMs } = params;
  const collection = await getRateLimitCollection();

  const windowStart = new Date(Date.now() - windowMs);

  // Count requests in current window
  const count = await collection.countDocuments({
    userId,
    endpoint,
    createdAt: { $gte: windowStart },
  });

  const remaining = Math.max(0, limit - count);
  const resetAt = new Date(Date.now() + windowMs);

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Log this request BEFORE processing (so retries count)
  await collection.insertOne({
    userId,
    endpoint,
    createdAt: new Date(),
  });

  return {
    allowed: true,
    remaining: remaining - 1, // Account for this request
    resetAt,
  };
}

/**
 * Get current rate limit status without consuming a request
 */
export async function getRateLimitStatus(
  params: Omit<RateLimitParams, "limit" | "windowMs"> & {
    limit: number;
    windowMs: number;
  }
): Promise<{ count: number; remaining: number }> {
  const { userId, endpoint, limit, windowMs } = params;
  const collection = await getRateLimitCollection();

  const windowStart = new Date(Date.now() - windowMs);

  const count = await collection.countDocuments({
    userId,
    endpoint,
    createdAt: { $gte: windowStart },
  });

  return {
    count,
    remaining: Math.max(0, limit - count),
  };
}
