import { GoogleGenAI } from "@google/genai";

// Helper function to handle Rate Limiting (429) with exponential backoff
export async function generateWithRetry(
  ai: GoogleGenAI,
  params: any,
  maxRetries = 3,
) {
  let retries = 0;

  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Check if it's a quota/rate-limit error (429) or temporary server error (503)
      const isRateLimit =
        error.message?.includes("429") ||
        error.status === 429 ||
        error.code === 429 ||
        error.message?.includes("RESOURCE_EXHAUSTED");
      const isServerOverload =
        error.message?.includes("503") || error.status === 503;

      if ((isRateLimit || isServerOverload) && retries < maxRetries) {
        retries++;
        // Wait time: 2s, 4s, 8s...
        const delay = 2000 * Math.pow(2, retries - 1);
        console.warn(
          `Rate limit hit. Retrying in ${delay}ms (Attempt ${retries}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If not a retryable error or max retries reached, throw it
      throw error;
    }
  }
}

export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY ? process.env.API_KEY.trim() : "";
  if (!apiKey) {
    throw new Error(
      "API Key is missing in environment variables (process.env.API_KEY).",
    );
  }
  return new GoogleGenAI({ apiKey: apiKey });
};
