const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

/**
 * Fetches the latest exchange rates for a given base currency.
 * @param baseCurrency The currency to use as the base for rates. Defaults to 'USD'.
 * @returns A promise that resolves to an object containing currency rates.
 */
export const fetchLatestRates = async (baseCurrency: string = 'USD'): Promise<{[key: string]: number}> => {
  try {
    const response = await fetch(`${API_URL}${baseCurrency}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        const errorMessage = errorData.error_type || `Failed to fetch rates with status: ${response.status}`;
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
    }
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while fetching rates.");
  }
};
