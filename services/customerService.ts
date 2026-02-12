import { Customer } from '../types';

// Assuming running locally on port 3001
const API_BASE_URL = 'http://localhost:3001/api';

export const customerService = {
  searchCustomers: async (query: string): Promise<Customer[]> => {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      return await response.json();
    } catch (error) {
      console.error("Customer search failed:", error);
      return [];
    }
  }
};