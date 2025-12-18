import { z } from "zod";

// Request schema for SEO generation
export const GenerateSeoRequestSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  category: z.string().optional(),
  brand: z.string().optional(),
  shortDescription: z.string().optional(),
  keyFeatures: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  tone: z
    .enum(["neutral", "premium", "friendly", "technical"])
    .optional()
    .default("neutral"),
  locale: z.string().optional().default("en-PK"),
});

export type GenerateSeoRequest = z.infer<typeof GenerateSeoRequestSchema>;

// Response schema for SEO generation
export const GenerateSeoResponseSchema = z.object({
  metaTitle: z.string().max(60),
  metaDescription: z.string().min(100).max(160),
  keywords: z.array(z.string()).min(8).max(20),
});

export type GenerateSeoResponse = z.infer<typeof GenerateSeoResponseSchema>;

// Build the AI prompt for SEO generation
export function buildSeoPrompt(input: GenerateSeoRequest): string {
  const toneDescriptions: Record<string, string> = {
    neutral: "professional and balanced",
    premium: "luxurious and exclusive",
    friendly: "warm and approachable",
    technical: "detailed and informative",
  };

  const toneDesc = toneDescriptions[input.tone || "neutral"];

  let context = `Product Title: ${input.title}`;

  if (input.category) {
    context += `\nCategory: ${input.category}`;
  }

  if (input.brand) {
    context += `\nBrand: ${input.brand}`;
  }

  if (input.shortDescription) {
    context += `\nDescription: ${input.shortDescription}`;
  }

  if (input.keyFeatures && input.keyFeatures.length > 0) {
    context += `\nKey Features:\n${input.keyFeatures
      .map((f) => `- ${f}`)
      .join("\n")}`;
  }

  if (input.targetAudience) {
    context += `\nTarget Audience: ${input.targetAudience}`;
  }

  const prompt = `You are an SEO expert for an e-commerce sneaker/shoe store in Pakistan. Generate SEO metadata for the following product.

${context}

Requirements:
1. Tone: ${toneDesc}
2. Locale: ${input.locale || "en-PK"}

Rules:
- metaTitle: Maximum 60 characters. Include the product name. Make it compelling for search results.
- metaDescription: Between 140-160 characters. Write naturally, not as a keyword list. Include a call to action.
- keywords: Generate 8-20 relevant keyword phrases (2-6 words each). Include:
  * Product type terms (e.g., "sneakers", "running shoes")
  * Category terms if provided
  * Brand name if provided
  * Audience-relevant terms if provided
  * Purchase intent terms like "buy online", "price in Pakistan" where appropriate
  * Do NOT use spammy terms like "best", "top", "#1", "official"
  * Do NOT fabricate claims (no "warranty", "authentic" unless explicitly stated)
  * No duplicate keywords
  * Focus on terms Pakistani customers would search for

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "metaTitle": "string",
  "metaDescription": "string", 
  "keywords": ["keyword1", "keyword2", ...]
}`;

  return prompt;
}

// Parse AI response safely
export function parseAIResponse(response: string): GenerateSeoResponse | null {
  try {
    // Try to find JSON in the response (in case AI adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate with Zod
    const result = GenerateSeoResponseSchema.safeParse(parsed);
    if (!result.success) {
      console.error("AI response validation failed:", result.error.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}

// Truncate and clean text to fit constraints
export function enforceConstraints(
  data: GenerateSeoResponse
): GenerateSeoResponse {
  // Truncate metaTitle to 60 chars (smart truncate at word boundary)
  let metaTitle = data.metaTitle;
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.substring(0, 57);
    const lastSpace = metaTitle.lastIndexOf(" ");
    if (lastSpace > 40) {
      metaTitle = metaTitle.substring(0, lastSpace);
    }
    metaTitle = metaTitle.trim() + "...";
  }

  // Truncate metaDescription to 160 chars, ensure min 140
  let metaDescription = data.metaDescription;
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157);
    const lastSpace = metaDescription.lastIndexOf(" ");
    if (lastSpace > 130) {
      metaDescription = metaDescription.substring(0, lastSpace);
    }
    metaDescription = metaDescription.trim() + "...";
  }

  // Clean keywords: remove duplicates, limit to 8-20, filter 2-6 words
  const seenKeywords = new Set<string>();
  const cleanedKeywords = data.keywords
    .map((k) => k.trim().toLowerCase())
    .filter((k) => {
      if (seenKeywords.has(k)) return false;
      const wordCount = k.split(/\s+/).length;
      if (wordCount < 2 || wordCount > 6) return false;
      seenKeywords.add(k);
      return true;
    })
    .slice(0, 20);

  // Ensure at least 8 keywords (pad with generic ones if needed)
  const genericKeywords = [
    "buy online pakistan",
    "shoes pakistan",
    "sneakers karachi",
    "footwear lahore",
    "sports shoes",
    "casual sneakers",
    "online shoe store",
    "quality footwear",
  ];

  while (cleanedKeywords.length < 8 && genericKeywords.length > 0) {
    const generic = genericKeywords.shift()!;
    if (!seenKeywords.has(generic)) {
      cleanedKeywords.push(generic);
      seenKeywords.add(generic);
    }
  }

  return {
    metaTitle,
    metaDescription,
    keywords: cleanedKeywords,
  };
}

// Call AI API for SEO generation
export async function generateSeoWithAI(
  input: GenerateSeoRequest
): Promise<GenerateSeoResponse> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_URL || "https://inference.do-ai.run/v1";

  if (!apiKey) {
    throw new Error("AI_API_KEY environment variable is not configured");
  }

  const prompt = buildSeoPrompt(input);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai-gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are an SEO expert. Return only valid JSON, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);

    // Parse error message for better user feedback
    let errorMessage = `AI API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Use default error message
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  const aiContent = result.choices?.[0]?.message?.content;

  if (!aiContent) {
    throw new Error("No content in AI response");
  }

  const parsed = parseAIResponse(aiContent);
  if (!parsed) {
    throw new Error("Failed to parse AI response");
  }

  return enforceConstraints(parsed);
}
