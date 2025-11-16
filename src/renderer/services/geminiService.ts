import {GoogleGenAI, Type} from "@google/genai";
import type {Message, Personality} from '../types/chat';

// This is a placeholder for the real API key which should be securely managed.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | undefined;

if (API_KEY) {
  // In a real application, you'd initialize this once and reuse it.
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // In a real app, you'd want to handle this more gracefully.
  // For this MVP, we will allow it to proceed as the functions are mocked.
  console.warn("API_KEY environment variable is not set. AI features will be mocked.");
}


/**
 * Generates AI-powered reply suggestions for a given conversation.
 * 
 * @param conversationHistory - An array of Message objects representing the chat history.
 * @param personality - The selected personality profile for the AI.
 * @returns A promise that resolves to an array of suggested reply strings.
 */
export const generateReplySuggestions = async (
  conversationHistory: Message[],
  personality: Personality,
): Promise<string[]> => {
  console.log("Generating AI suggestions for personality:", personality.name);

  // If the Gemini API client isn't initialized, fall back to mock data.
  if (!ai) {
    // --- MOCKED IMPLEMENTATION (For UI Development) ---
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Return mock suggestions based on the personality
    if (personality.name.toLowerCase().includes('slutty')) {
      return [
        "Mmm, tell me more... I'm listening.",
        "You have no idea what you do to me... 😉",
        "I've been waiting for you to message me all day.",
      ];
    } else if (personality.name.toLowerCase().includes('girlfriend')) {
      return [
        "Aww, that's so sweet! How was your day?",
        "I was just thinking about you! ❤️",
        "You always know how to make me smile.",
      ];
    } else {
      return [
        "What else is on your mind?",
        "That's interesting, tell me more.",
        "You're a lot of fun to talk to 😊",
      ];
    }
  }

  // --- REAL IMPLEMENTATION ---
  try {
    // 1. **Construct the Prompt:** Combine the personality prompt, the conversation history,
    //    and a final instruction to generate replies.
    const historyText = conversationHistory
      .map(msg => `${msg.sender === 'fan' ? 'Fan' : 'Model'}: ${msg.content}`)
      .join('\n');

    const prompt = `
      ${personality.prompt}

      Here is the recent conversation history:
      ---
      ${historyText}
      ---

      Based on the personality and the conversation, generate 3 unique, engaging, and short replies that the model can send to the fan. The replies should aim to encourage further conversation and spending.
    `;

    // 2. **Call the Gemini API:**
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      }
    });

    // @ts-ignore
    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // Fallback or re-throw
    return ["Failed to generate suggestions. Please try again."];
  }
};
