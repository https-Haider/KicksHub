import { MongoClient, ObjectId, Sort, WithId, Document } from "mongodb";

export interface Review {
  _id?: string;
  productId?: number; // optional - for site-wide reviews
  rating: number; // 1-5 stars
  content?: string; // optional review note/comment
  images?: string[]; // array of image URLs
  authorName: string;
  authorEmail?: string;
  verified: boolean; // verified purchase
  helpful: number; // helpful votes count
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB document type for reviews (without _id for inserts)
interface ReviewDocumentInput {
  productId?: number;
  rating: number;
  content?: string;
  images?: string[];
  authorName: string;
  authorEmail?: string;
  verified?: boolean;
  helpful?: number;
  notHelpful?: number;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB document type for reviews (with _id from database)
interface ReviewDocument extends ReviewDocumentInput {
  _id: ObjectId;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommendationPercentage: number;
}

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "edm";
const REVIEWS_COLLECTION = "reviews";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getCollection() {
  const client = await getClient();
  return client.db(MONGODB_DB).collection<ReviewDocument>(REVIEWS_COLLECTION);
}

// Helper function to convert MongoDB document to Review type
function mapDocumentToReview(d: WithId<ReviewDocument>): Review {
  return {
    _id: d._id.toString(),
    productId: d.productId,
    rating: d.rating,
    content: d.content,
    images: d.images || [],
    authorName: d.authorName,
    authorEmail: d.authorEmail,
    verified: d.verified ?? false,
    helpful: d.helpful ?? 0,
    notHelpful: d.notHelpful ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// Helper to get sort option based on sort type
function getSortOption(
  sort?: "newest" | "oldest" | "highest" | "lowest" | "most-helpful"
): Sort {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "highest":
      return { rating: -1, createdAt: -1 };
    case "lowest":
      return { rating: 1, createdAt: -1 };
    case "most-helpful":
      return { helpful: -1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

// Get all reviews for a product
export async function getReviewsByProductId(
  productId: number,
  options?: {
    sort?: "newest" | "oldest" | "highest" | "lowest" | "most-helpful";
    limit?: number;
    offset?: number;
  }
): Promise<Review[]> {
  const col = await getCollection();

  const sortOption = getSortOption(options?.sort);

  const cursor = col
    .find({ productId })
    .sort(sortOption)
    .skip(options?.offset ?? 0);

  if (options?.limit) {
    cursor.limit(options.limit);
  }

  const docs = await cursor.toArray();

  return docs.map(mapDocumentToReview);
}

// Get review statistics for a product
export async function getReviewStats(productId?: number): Promise<ReviewStats> {
  const col = await getCollection();

  const matchStage = productId ? { $match: { productId } } : { $match: {} };

  const pipeline = [
    matchStage,
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        recommended: {
          $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] },
        },
      },
    },
  ];

  const results = await col.aggregate(pipeline).toArray();

  if (results.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendationPercentage: 0,
    };
  }

  const stats = results[0];
  const total = stats.totalReviews || 1;

  return {
    averageRating: Math.round((stats.averageRating || 0) * 10) / 10,
    totalReviews: stats.totalReviews,
    ratingDistribution: {
      1: stats.rating1,
      2: stats.rating2,
      3: stats.rating3,
      4: stats.rating4,
      5: stats.rating5,
    },
    recommendationPercentage: Math.round((stats.recommended / total) * 100),
  };
}

// Get all site-wide reviews (not tied to a specific product)
export async function getAllReviews(options?: {
  sort?: "newest" | "oldest" | "highest" | "lowest" | "most-helpful";
  limit?: number;
  offset?: number;
}): Promise<Review[]> {
  const col = await getCollection();

  const sortOption = getSortOption(options?.sort);

  const cursor = col
    .find({})
    .sort(sortOption)
    .skip(options?.offset ?? 0);

  if (options?.limit) {
    cursor.limit(options.limit);
  }

  const docs = await cursor.toArray();

  return docs.map(mapDocumentToReview);
}

// Add a new review
export async function addReview(
  review: Omit<
    Review,
    "_id" | "helpful" | "notHelpful" | "createdAt" | "updatedAt"
  >
): Promise<Review> {
  const col = await getCollection();

  const now = new Date();
  const doc: ReviewDocumentInput = {
    ...review,
    helpful: 0,
    notHelpful: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc as ReviewDocument);

  return {
    ...doc,
    _id: result.insertedId.toString(),
    helpful: 0,
    notHelpful: 0,
    verified: review.verified,
  };
}

// Update a review
export async function updateReview(
  reviewId: string,
  updates: Partial<Pick<Review, "rating" | "content" | "images">>
): Promise<Review | null> {
  const col = await getCollection();

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result.value) return null;

  const d = result.value;
  return {
    _id: d._id.toString(),
    productId: d.productId,
    rating: d.rating,
    content: d.content,
    images: d.images || [],
    authorName: d.authorName,
    authorEmail: d.authorEmail,
    verified: d.verified ?? false,
    helpful: d.helpful ?? 0,
    notHelpful: d.notHelpful ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.deleteOne({ _id: new ObjectId(reviewId) });
  return result.deletedCount === 1;
}

// Vote on review helpfulness
export async function voteReviewHelpful(
  reviewId: string,
  isHelpful: boolean
): Promise<Review | null> {
  const col = await getCollection();

  const updateField = isHelpful ? "helpful" : "notHelpful";

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $inc: { [updateField]: 1 } },
    { returnDocument: "after" }
  );

  if (!result.value) return null;

  const d = result.value;
  return {
    _id: d._id.toString(),
    productId: d.productId,
    rating: d.rating,
    content: d.content,
    images: d.images || [],
    authorName: d.authorName,
    authorEmail: d.authorEmail,
    verified: d.verified ?? false,
    helpful: d.helpful ?? 0,
    notHelpful: d.notHelpful ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// Get review by ID
export async function getReviewById(reviewId: string): Promise<Review | null> {
  const col = await getCollection();

  try {
    const doc = await col.findOne({ _id: new ObjectId(reviewId) });
    if (!doc) return null;

    return {
      _id: doc._id.toString(),
      productId: doc.productId,
      rating: doc.rating,
      content: doc.content,
      images: doc.images || [],
      authorName: doc.authorName,
      authorEmail: doc.authorEmail,
      verified: doc.verified ?? false,
      helpful: doc.helpful ?? 0,
      notHelpful: doc.notHelpful ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  } catch (err) {
    console.error(`getReviewById error for reviewId="${reviewId}":`, err);
    return null;
  }
}
