import { Schema, Type } from "@google/genai";
import { PO_PROMPT } from "../../constants";
import { PurchaseOrderLine } from "../../types";
import { generateWithRetry, getGeminiClient } from "./core";

export interface ExtractionResult {
  data: PurchaseOrderLine[];
  usage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
}

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

export const extractDataFromImages = async (
  base64Images: string[],
): Promise<ExtractionResult> => {
  const ai = getGeminiClient();

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
    if (!text) return { data: [] };

    let data = JSON.parse(text) as PurchaseOrderLine[];

    // Extract token usage
    const usage = response.usageMetadata
      ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          responseTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        }
      : undefined;

    // Post-processing logic for Unit Conversion
    data = data.map((item) => {
      // Normalize unit to lowercase for comparison
      const unit = item.unitOfMeasure
        ? item.unitOfMeasure.toLowerCase().trim()
        : "";

      // Ensure quantity is a number
      let qty = Number(item.orderQuantity);
      if (isNaN(qty)) {
        // Try to handle string numbers with commas
        qty = parseFloat(String(item.orderQuantity).replace(/,/g, ""));
      }

      if (isNaN(qty)) {
        return item; // If still not a number, return original item
      }

      // Define unit variations
      const lbsVariations = [
        "lbs",
        "lb",
        "pound",
        "pounds",
        "lbs.",
        "pound(s)",
      ];
      const tonVariations = ["ton", "tons", "metric ton", "metric tons"];

      // Condition 1: Convert LBS to KG
      if (lbsVariations.includes(unit)) {
        // Convert LBS to KG (1 lb = 0.45359237 kg)
        const convertedQty = qty * 0.45359237;

        return {
          ...item,
          orderQuantity: parseFloat(convertedQty.toFixed(2)), // Keep 2 decimal places
          unitOfMeasure: "KG",
        };
      }
      // Condition 2: Change Tons to TO (No quantity conversion)
      else if (tonVariations.includes(unit)) {
        return {
          ...item,
          // Quantity remains the same
          unitOfMeasure: "TO",
        };
      }
      // Condition 3: All other units default to KG
      else {
        return {
          ...item,
          unitOfMeasure: "KG",
        };
      }
    });

    return { data, usage };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
