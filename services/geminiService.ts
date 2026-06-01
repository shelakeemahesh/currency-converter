import { GoogleGenAI } from '@google/genai';

/**
 * Retrieves the Gemini API key from environment variables.
 * Returns null if the key is not set or remains as a placeholder.
 */
export const getGeminiApiKey = (): string | null => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'PLACEHOLDER_API_KEY' || key.trim() === '') {
    return null;
  }
  return key;
};

/**
 * Checks if the Gemini API key is configured.
 */
export const isGeminiConfigured = (): boolean => {
  return getGeminiApiKey() !== null;
};

/**
 * Dynamically creates a GoogleGenAI client instance if API key is configured.
 */
const getAiClient = (): GoogleGenAI => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Fetches AI-powered currency pair insights.
 */
export const fetchCurrencyInsights = async (
  fromCode: string,
  fromName: string,
  toCode: string,
  toName: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are an expert currency analyst and financial historian. Provide a concise, highly engaging, and visually appealing markdown analysis of the currency pair: ${fromCode} (${fromName}) to ${toCode} (${toName}).
      
      Structure your response exactly with these sections (using h2 tags):
      
      ## 🌍 Historical Background
      A brief, fascinating history of both currencies and how they relate (max 4 sentences).
      
      ## 📈 Economic Drivers
      What major forces drive the exchange rate between ${fromCode} and ${toCode}? Mention factors like central bank policies (e.g., Fed, ECB), inflation, and trade dynamics. Keep it concise.
      
      ## 💡 Fun Trivia
      Provide 2 interesting or unusual facts about these currencies (e.g., origins of their symbols, nicknames, security features, or unusual polymer notes).
      
      Make the response engaging, professional, and formatted in clean markdown. Use bullet points and bold text where appropriate. Do not include markdown codeblocks around your response, just return the raw markdown content directly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Empty response received from Gemini.');
    }

    return response.text;
  } catch (error) {
    console.error('Error in fetchCurrencyInsights:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with Gemini.');
  }
};

/**
 * Fetches travel guides, item prices, tipping rules, and budget advice for a destination.
 */
export const fetchTravelGuide = async (
  fromCode: string,
  fromName: string,
  toCode: string,
  toName: string,
  amount: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are a smart travel finance assistant. The user is planning a trip from a country using ${fromCode} (${fromName}) to a country using ${toCode} (${toName}). 
      They are looking to convert their money (e.g., around ${amount} ${fromCode}).
      
      Provide a highly practical, visually engaging travel finance guide for someone visiting the country that uses ${toCode}.
      
      Structure your response exactly with these sections (using h2 tags):
      
      ## 💵 Purchasing Power & Item Costs
      Provide a markdown table showing the typical estimated cost of common travel items in the destination, showing values in BOTH ${toCode} and converted to ${fromCode} (approximate based on standard values).
      Items to include:
      - A cup of coffee / espresso
      - A mid-range dinner for one
      - Public transit one-way fare
      - Taxi ride from main airport to city center
      - Single night in a standard boutique hotel
      
      ## 💳 Payment & Tipping Customs
      - What is the preferred payment method in the target country (Cash, Visa/Mastercard credit cards, mobile wallets, or specific local networks)?
      - Tipping etiquette: Who is tipped (waitstaff, taxi drivers, hotel staff), how much (percentage or rounding up), and when?
      
      ## 🎒 Travel Budget Profiles
      Provide a quick daily budget breakdown in ${toCode} for three traveler profiles:
      1. **Budget Backpacker**: Shared hostel, street food, public transit.
      2. **Mid-Range Explorer**: Private hotel room, local restaurants, occasional taxis.
      3. **Luxury Seeker**: 4/5 star hotel, fine dining, private tours/transport.
      
      Make the response extremely actionable, professional, and formatted in clean markdown. Do not include markdown codeblocks around your response, just return the raw markdown content directly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Empty response received from Gemini.');
    }

    return response.text;
  } catch (error) {
    console.error('Error in fetchTravelGuide:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with Gemini.');
  }
};
