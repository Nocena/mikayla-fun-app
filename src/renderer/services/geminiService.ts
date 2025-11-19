import { GoogleGenAI, Type } from "@google/genai";
import type { Message, Personality } from '../types/chat';

// This is a placeholder for the real API key which should be securely managed.
// In Vite, we use import.meta.env.VITE_API_KEY
const API_KEY = import.meta.env.VITE_API_KEY;

let ai: GoogleGenAI | undefined;

if (API_KEY) {
  // In a real application, you'd initialize this once and reuse it.
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("Gemini AI initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e);
  }
} else {
  // In a real app, you'd want to handle this more gracefully.
  // For this MVP, we will allow it to proceed as the functions are mocked.
  console.warn("VITE_API_KEY environment variable is not set. AI features will be mocked.");
  console.log("Please ensure your .env file contains VITE_API_KEY=your_key_here");
}


import { aiMemoryService } from './aiMemoryService';

/**
 * Generates AI-powered reply suggestions for a given conversation.
 * 
 * @param conversationHistory - An array of Message objects representing the chat history.
 * @param personality - The selected personality profile for the AI.
 * @param socialAccountId - The ID of the social account (required for RAG).
 * @returns A promise that resolves to an array of suggested reply strings.
 */
export const generateReplySuggestions = async (
  conversationHistory: Message[],
  personality: Personality,
  socialAccountId?: string
): Promise<string[]> => {
  console.log("Generating AI suggestions for personality:", personality.name);

  // If the Gemini API client isn't initialized, fall back to mock data.
  if (!ai) {
    console.warn("Gemini AI not initialized, falling back to mock data.");
    // --- MOCKED IMPLEMENTATION (Fallback) ---
    await new Promise(resolve => setTimeout(resolve, 800));

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
    // 1. **RAG: Retrieve Similar Successful Conversations**
    let similarConversationsText = "";
    if (socialAccountId && conversationHistory.length > 0) {
      const lastUserMessage = [...conversationHistory].reverse().find(m => m.sender === 'fan');
      if (lastUserMessage) {
        const similarMemories = await aiMemoryService.findSimilarConversations(
          socialAccountId,
          lastUserMessage.content,
          3 // Get top 3 similar successful chats
        );

        if (similarMemories.length > 0) {
          similarConversationsText = `
          Here are some examples of successful past conversations (where the user tipped or bought something) that are similar to the current context. Use these as inspiration for your tone and strategy:
          ---
          ${similarMemories.map(m => m.context_summary).join('\n---\n')}
          ---
          `;
        }
      }
    }

    // 2. **Construct the Prompt**
    const historyText = conversationHistory
      .slice(-10) // Only send last 10 messages to save context window
      .map(msg => `${msg.sender === 'fan' ? 'Fan' : 'Model'}: ${msg.content}`)
      .join('\n');

    const prompt = `
      You are an AI assistant helping an OnlyFans creator chat with their fans.
      
      **Your Persona:**
      ${personality.prompt}

      **Goal:**
      Generate 3 unique, engaging, and short replies that the model can send to the fan. 
      The replies should aim to encourage further conversation, build connection, and eventually lead to sales (tips/bundles).
      Do NOT be overly robotic. Be natural and authentic to the persona.

      ${similarConversationsText}

      **Current Conversation History:**
      ---
      ${historyText}
      ---

      Return ONLY a JSON array of 3 string suggestions. Example: ["Reply 1", "Reply 2", "Reply 3"]
    `;

    // 3. **Call the Gemini API**
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

    // Handle response text extraction safely for @google/genai SDK
    let responseText = "";
    try {
      if (response.text) {
        responseText = response.text;
      }
    } catch (e) {
      // response.text getter might throw if the response was blocked or invalid
      console.warn("Could not access response.text:", e);
    }

    if (!responseText && response.candidates && response.candidates.length > 0) {
      // Fallback to manual extraction from candidates
      const part = response.candidates[0].content?.parts?.[0];
      if (part && 'text' in part) {
        responseText = part.text as string;
      }
    }

    if (!responseText) {
      console.error("Empty response from Gemini API", response);
      return ["Error: No response generated."];
    }

    // @ts-ignore
    const suggestions = JSON.parse(responseText);
    return suggestions;

  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return ["Failed to generate suggestions. Please try again."];
  }
};

/**
 * Generates a vector embedding for the given text.
 */
export const generateEmbedding = async (text: string): Promise<number[] | null> => {
  if (!ai) {
    console.warn("Gemini AI not initialized, returning null embedding");
    return null;
  }

  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    return response.embeddings?.[0]?.values || null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};
