import { Schema, Type } from "@google/genai";
import { generateWithRetry, getGeminiClient } from "./core";

// Schema for Sold To determination
const soldToSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    customerId: { type: Type.STRING },
    reason: { type: Type.STRING },
  },
  required: ["customerId"],
};

// Schema for Ship To determination
const shipToSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    shipToKey: { type: Type.STRING },
    reason: { type: Type.STRING },
  },
  required: ["shipToKey"],
};

export const determineSoldTo = async (
  poCustomerName: string,
  candidates: any[],
): Promise<string | null> => {
  console.log(`[Gemini] Determining Sold To for: "${poCustomerName}"`);
  console.log(`[Gemini] Candidates found: ${candidates.length}`);

  if (candidates.length === 0) {
    console.log("[Gemini] No candidates to check.");
    return null;
  }

  const ai = getGeminiClient();

  // Create a simplified list of candidates to save tokens
  const simplifiedCandidates = candidates.map((c) => ({
    customerId: c.customer_id,
    names: c.customer_names,
  }));

  const prompt = `
    I have a customer name extracted from a Purchase Order: "${poCustomerName}".
    I have a list of candidate customers from my database:
    ${JSON.stringify(simplifiedCandidates, null, 2)}

    Please determine which candidate is the best match for the PO customer name.
    The content in the database might be slightly different.
    Return the "customer_id" of the best match. If no reasonable match is found, return null or empty string.
  `;

  // Log key info for debugging
  console.log(
    `[Gemini] Candidate Names:`,
    candidates.map((c) => c.customer_names?.[0] || c.customer_id),
  );

  try {
    const response = await generateWithRetry(ai, {
      model: "gemini-2.0-flash-lite",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: soldToSchema,
        temperature: 0,
      },
    });

    const result = JSON.parse(response.text || "{}");
    console.log(`[Gemini] Sold To Determination Result:`, result);
    return result.customerId || null;
  } catch (error) {
    console.error("Error determining Sold To:", error);
    return null;
  }
};

export const determineShipTo = async (
  poAddress: string,
  shipToMap: { [key: string]: string },
): Promise<string | null> => {
  console.log(`[Gemini] Determining Ship To for Address: "${poAddress}"`);
  const shipToKeys = Object.keys(shipToMap);
  console.log(`[Gemini] Possible Ship To Keys: ${shipToKeys.length}`);

  if (shipToKeys.length === 0) {
    console.log("[Gemini] No ship-to addresses available.");
    return null;
  }

  const ai = getGeminiClient();

  const prompt = `
    I have a delivery address extracted from a Purchase Order: "${poAddress}".
    I have a map of possible ship-to addresses for the customer (Key: Address):
    ${JSON.stringify(shipToMap, null, 2)}

    Please determine which ship-to key corresponds to the PO address.
    The address format might vary slightly.
    Return the "shipToKey" of the best match. If no match is found, return null.
  `;

  try {
    const response = await generateWithRetry(ai, {
      model: "gemini-2.0-flash-lite",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: shipToSchema,
        temperature: 0,
      },
    });

    const result = JSON.parse(response.text || "{}");
    console.log(`[Gemini] Ship To Determination Result:`, result);
    return result.shipToKey || null;
  } catch (error) {
    console.error("Error determining Ship To:", error);
    return null;
  }
};
