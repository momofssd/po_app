import { Customer } from "../types";
import { authService } from "./authService";

// Assuming running locally on port 3001
const API_BASE_URL = "http://localhost:3001/api";

export const customerService = {
  searchCustomers: async (
    query: string = "",
    limit: string | number = "50",
  ): Promise<Customer[]> => {
    try {
      const limitParam =
        limit === "none" ? "none" : limit ? limit.toString() : "50";
      const response = await fetch(
        `${API_BASE_URL}/customers/search?q=${encodeURIComponent(
          query,
        )}&limit=${limitParam}`,
        {
          headers: authService.getAuthHeaders(),
        },
      );

      if (response.status === 401) {
        authService.logout();
        return [];
      }

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      return await response.json();
    } catch (error) {
      console.error("Customer search failed:", error);
      return [];
    }
  },

  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/search?limit=none`,
        {
          headers: authService.getAuthHeaders(),
        },
      );

      if (response.status === 401) {
        authService.logout();
        return [];
      }

      if (!response.ok) {
        throw new Error("Failed to fetch all customers");
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch all customers failed:", error);
      return [];
    }
  },

  createCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        ...authService.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      throw new Error("Failed to create customer");
    }

    return await response.json();
  },

  updateCustomer: async (
    id: string,
    customer: Partial<Customer>,
  ): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        ...authService.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      throw new Error("Failed to update customer");
    }

    return await response.json();
  },

  deleteCustomer: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete customer");
    }
  },
};
