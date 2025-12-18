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
  let context = `Product: ${input.title}`;

  if (input.category) {
    context += ` | Category: ${input.category}`;
  }

  if (input.brand) {
    context += ` | Brand: ${input.brand}`;
  }

  if (input.shortDescription) {
    context += ` | ${input.shortDescription}`;
  }

  const prompt = `Generate SEO for this shoe product: ${context}

Output JSON only:
{
  "metaTitle": "max 60 chars, include product name",
  "metaDescription": "140-160 chars, natural text with call to action",
  "keywords": ["8-12 keyword phrases", "2-4 words each", "include buy online pakistan"]
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

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
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
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    console.log("AI API finish_reason:", result.choices?.[0]?.finish_reason);

    // Handle different response structures - some models use reasoning_content instead of content
    const message = result.choices?.[0]?.message;
    let aiContent = message?.content;

    // If content is null/empty but reasoning_content exists, try to extract JSON from it
    if (!aiContent && message?.reasoning_content) {
      console.log("Content is null, checking reasoning_content...");
      const reasoning = message.reasoning_content as string;

      // Look for JSON objects in the reasoning content
      // Try to find a complete JSON object with our expected fields
      const jsonMatches = reasoning.match(
        /\{[^{}]*"metaTitle"[^{}]*"metaDescription"[^{}]*"keywords"[^{}]*\[.*?\][^{}]*\}/g
      );

      if (jsonMatches && jsonMatches.length > 0) {
        // Use the last match (usually the final output)
        aiContent = jsonMatches[jsonMatches.length - 1];
        console.log("Extracted JSON from reasoning:", aiContent);
      } else {
        // Try to build JSON from the reasoning content manually
        const titleMatch = reasoning.match(/"metaTitle":\s*"([^"]+)"/);
        const descMatch = reasoning.match(/"metaDescription":\s*"([^"]+)"/);
        const keywordsMatch = reasoning.match(/"keywords":\s*\[([\s\S]*?)\]/);

        if (titleMatch && descMatch && keywordsMatch) {
          aiContent = `{"metaTitle":"${titleMatch[1]}","metaDescription":"${descMatch[1]}","keywords":[${keywordsMatch[1]}]}`;
          console.log("Built JSON from reasoning parts:", aiContent);
        }
      }
    }

    if (!aiContent) {
      console.error("AI response structure:", JSON.stringify(result, null, 2));
      throw new Error("No content in AI response");
    }

    const parsed = parseAIResponse(aiContent);
    if (!parsed) {
      throw new Error("Failed to parse AI response");
    }

    return enforceConstraints(parsed);
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("AI API request timed out. Please try again.");
    }

    if (
      error.cause?.code === "ENOTFOUND" ||
      error.cause?.code === "ECONNREFUSED"
    ) {
      throw new Error(
        "Could not connect to AI service. Check your internet connection."
      );
    }

    throw error;
  }
}
