import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PO_PROMPT } from "../constants";
import { PurchaseOrderLine } from "../types";

// Schema definition to ensure strict JSON output
const poResponseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING },
      purchaseOrderNumber: { type: Type.STRING },
      requiredDeliveryDate: { type: Type.STRING },
      materialNumber: { type: Type.STRING },
      orderQuantity: { type: Type.NUMBER },
      unitOfMeasure: { type: Type.STRING },
      deliveryAddress: { type: Type.STRING },
    },
    required: [
      "customerName",
      "purchaseOrderNumber",
      "requiredDeliveryDate",
      "materialNumber",
      "orderQuantity",
      "unitOfMeasure",
      "deliveryAddress",
    ],
  },
};

// Helper function to handle Rate Limiting (429) with exponential backoff
async function generateWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  let retries = 0;
  
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Check if it's a quota/rate-limit error (429) or temporary server error (503)
      const isRateLimit = error.message?.includes('429') || error.status === 429 || error.code === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      const isServerOverload = error.message?.includes('503') || error.status === 503;

      if ((isRateLimit || isServerOverload) && retries < maxRetries) {
        retries++;
        // Wait time: 2s, 4s, 8s...
        const delay = 2000 * Math.pow(2, retries - 1);
        console.warn(`Rate limit hit. Retrying in ${delay}ms (Attempt ${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If not a retryable error or max retries reached, throw it
      throw error;
    }
  }
}

export const extractDataFromImages = async (
  base64Images: string[]
): Promise<PurchaseOrderLine[]> => {
  // Robustly get the API key from the environment
  const apiKey = process.env.API_KEY ? process.env.API_KEY.trim() : "";

  if (!apiKey) {
    throw new Error("API Key is missing in environment variables (process.env.API_KEY).");
  }

  // Debug log to confirm the correct key is being loaded (masking middle characters)
  console.log(`[Gemini Service] Initializing with API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Prepare contents: Text prompt + Image parts
  const parts = [];
  
  // Add the prompt text
  parts.push({ text: PO_PROMPT });

  // Add images
  base64Images.forEach((base64) => {
    // Strip the "data:image/jpeg;base64," prefix if present
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64,
      },
    });
  });

  try {
    // Switch to gemini-3-flash-preview for higher rate limits and speed
    const response = await generateWithRetry(ai, {
      model: "gemini-3-flash-preview", 
      contents: {
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: poResponseSchema,
        temperature: 0, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) return [];

    let data = JSON.parse(text) as PurchaseOrderLine[];

    // Post-processing logic for Unit Conversion
    data = data.map(item => {
      // Normalize unit to lowercase for comparison
      const unit = item.unitOfMeasure ? item.unitOfMeasure.toLowerCase().trim() : "";
      
      // Ensure quantity is a number
      let qty = Number(item.orderQuantity);
      if (isNaN(qty)) {
        // Try to handle string numbers with commas
        qty = parseFloat(String(item.orderQuantity).replace(/,/g, ''));
      }
      
      if (isNaN(qty)) {
        return item; // If still not a number, return original item
      }

      // Define unit variations
      const lbsVariations = ['lbs', 'lb', 'pound', 'pounds', 'lbs.', 'pound(s)'];
      const tonVariations = ['ton', 'tons', 'metric ton', 'metric tons'];

      // Condition 1: Convert LBS to KG
      if (lbsVariations.includes(unit)) {
        // Convert LBS to KG (1 lb = 0.45359237 kg)
        const convertedQty = qty * 0.45359237;
        
        return {
          ...item,
          orderQuantity: parseFloat(convertedQty.toFixed(2)), // Keep 2 decimal places
          unitOfMeasure: "KG"
        };
      } 
      // Condition 2: Change Tons to TO (No quantity conversion)
      else if (tonVariations.includes(unit)) {
        return {
          ...item,
          // Quantity remains the same
          unitOfMeasure: "TO"
        };
      }

      return item;
    });

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};