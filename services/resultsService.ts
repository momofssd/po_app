import { PurchaseOrderLine } from "../types";
import { authService } from "./authService";

const API_URL = "/api/results";

export const resultsService = {
  saveResults: async (data: PurchaseOrderLine[]): Promise<void> => {
    // Filter out unwanted fields for the API response
    // Specifically: sourceUrl (internal blob) and deliveryAddress (requested removal)
    const filteredData = data.map((item) => {
      // Destructure to remove fields, keep the rest
      const { deliveryAddress, sourceUrl, ...rest } = item;
      return rest;
    });

    const authHeaders = authService.getAuthHeaders();

    const response = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ data: filteredData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to save results");
    }
  },

  getResultsUrl: (): string => {
    const token = authService.getToken();
    if (!token) return "";
    // Make the URL absolute so it can be used by external applications
    const baseUrl = window.location.origin;
    return `${baseUrl}${API_URL}?wms_session_token=${token}`;
  },

  clearResults: async (): Promise<void> => {
    const authHeaders = authService.getAuthHeaders();
    await fetch(`${API_URL}/clear`, {
      method: "DELETE",
      headers: authHeaders as HeadersInit,
    });
  },
};
