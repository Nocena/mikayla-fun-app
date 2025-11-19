import { GoogleGenAI, Type } from "@google/genai";
import { Message, Personality, Fan } from '../types/chat';
import { aiMemoryService } from './aiMemoryService';
import {
    AgentAnalyzerOutput,
    AgentMemoryOutput,
    AgentPersonalityOutput,
    AgentSalesOutput,
    AgentContentOutput,
    AgentOrchestratorOutput,
    AgentGeneratorOutput
} from '../types/agent';

const API_KEY = import.meta.env.VITE_API_KEY;
let ai: GoogleGenAI | undefined;

if (API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI in MultiAgentService:", e);
    }
}

const MODEL_NAME = 'gemini-2.5-flash';

export const multiAgentService = {
    async orchestrateConversation(
        conversationHistory: Message[],
        basePersonality: Personality,
        fan: Fan,
        socialAccountId?: string
    ): Promise<AgentOrchestratorOutput | null> {
        if (!ai) {
            console.error("AI not initialized");
            return null;
        }

        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (!lastMessage || lastMessage.sender !== 'fan') {
            console.warn("Last message is not from fan, or history is empty.");
            return null;
        }

        console.log("--- Starting Optimized Multi-Agent Swarm ---");

        // --- Step 1: Parallel Execution (Analyzer, Memory, Personality) ---
        // We run these in parallel to minimize latency.
        const [analyzerResult, memoryResult, personalityResult] = await Promise.all([
            this.runAnalyzer(lastMessage.content),
            this.runMemoryManager(socialAccountId, lastMessage.content, fan),
            this.runPersonalityController(conversationHistory, basePersonality)
        ]);

        // --- Step 2: Sales Strategist (Needs Analyzer & Memory) ---
        const salesResult = await this.runSalesStrategist(analyzerResult, memoryResult, conversationHistory);

        // --- Step 3: Content Matchmaker (Needs Sales Strategy) ---
        // Only run if sales strategy suggests selling or upselling to save time/tokens
        let contentResult: AgentContentOutput = { recommended_content: [] };
        if (salesResult.sales_recommendation !== 'build_rapport' && salesResult.sales_recommendation !== 'none') {
            contentResult = await this.runContentMatchmaker(salesResult, memoryResult);
        }

        // --- Step 4: Response Generator (Needs Everything) ---
        const generatorResult = await this.runResponseGenerator(
            conversationHistory,
            analyzerResult,
            memoryResult,
            personalityResult,
            salesResult,
            contentResult
        );

        const finalOutput: AgentOrchestratorOutput = {
            analyzer: analyzerResult,
            memory: memoryResult,
            personality: personalityResult,
            sales: salesResult,
            content: contentResult,
            final_response: generatorResult.response,
            performance_score: 0.95
        };

        console.log("--- Swarm Complete ---", finalOutput);
        return finalOutput;
    },

    async runAnalyzer(message: string): Promise<AgentAnalyzerOutput> {
        // Optimized prompt for speed
        const prompt = `
      Analyze this OnlyFans message: "${message}"
      Return JSON:
      {
        "intent": "casual_chat" | "buying_signal" | "complaint" | "sexting" | "relationship_building",
        "sentiment": "positive" | "negative" | "neutral" | "excited" | "horny",
        "urgency": "low" | "medium" | "high",
        "entities": [],
        "emotional_state": "string",
        "priority": 1-10,
        "conversation_phase": "string",
        "buying_signals": []
      }
    `;
        return this.callAgent<AgentAnalyzerOutput>(prompt, "Analyzer");
    },

    async runMemoryManager(socialAccountId: string | undefined, message: string, fan: Fan): Promise<AgentMemoryOutput> {
        let similarContext: string[] = [];
        if (socialAccountId) {
            const memories = await aiMemoryService.findSimilarConversations(socialAccountId, message, 2);
            similarContext = memories
                .map(m => m.context_summary)
                .filter((s): s is string => s !== null);
        }

        // Use REAL Fan data
        return {
            user_profile: {
                total_spent: fan.totalSpent,
                avg_purchase: fan.totalSpent > 0 ? fan.totalSpent / 5 : 0, // Simple estimation
                favorite_content: "unknown", // Would need real transaction history
                price_sensitivity: fan.totalSpent > 100 ? "low" : "medium",
                last_purchase: "unknown",
                engagement_pattern: fan.isOnline ? "currently_online" : "offline",
                personality_match: "unknown"
            },
            relevant_context: similarContext,
            similar_user_patterns: "High retention potential."
        };
    },

    async runPersonalityController(history: Message[], basePersonality: Personality): Promise<AgentPersonalityOutput> {
        const historyText = history.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n');
        const prompt = `
      Role: ${basePersonality.name}. Context: ${basePersonality.prompt}.
      Chat History:
      ${historyText}
      
      IMPORTANT TONE INSTRUCTIONS:
      - Use relaxed grammar (mostly lowercase, but occasional caps for emphasis is ok).
      - Do NOT use apostrophes (e.g., "dont", "im", "cant").
      - Use slang/shortcuts: "bby" or "babyyyyy" instead of "baby", "lol", "rn", "hbu".
      - Be casual and believable.
      
      Return JSON:
      {
        "active_personality": "string",
        "tone_modifiers": { "sweetness": 1-10, "flirtiness": 1-10, "directness": 1-10, "playfulness": 1-10 },
        "language_style": { "emoji_frequency": "string", "avg_message_length": "string", "vocabulary": "string", "use_petnames": boolean, "petname": "string" },
        "personality_confidence": 0-1,
        "reason": "string"
      }
    `;
        return this.callAgent<AgentPersonalityOutput>(prompt, "Personality");
    },

    async runSalesStrategist(
        analyzer: AgentAnalyzerOutput,
        memory: AgentMemoryOutput,
        history: Message[]
    ): Promise<AgentSalesOutput> {
        const prompt = `
      Decide sales strategy.
      Intent: ${analyzer.intent}, Sentiment: ${analyzer.sentiment}, Spent: $${memory.user_profile.total_spent}.
      
      Return JSON:
      {
        "sales_recommendation": "soft_pitch" | "direct_pitch" | "exclusive_offer" | "build_rapport" | "none",
        "confidence": 0-1,
        "reasoning": "string",
        "suggested_approach": "string",
        "pricing_strategy": { "suggested_price": number, "anchor_price": number, "minimum_acceptable": number, "bundle_opportunity": boolean },
        "timing": "string",
        "urgency_needed": boolean,
        "upsell_opportunity": { "type": "string", "items": [], "value_prop": "string" }
      }
    `;
        return this.callAgent<AgentSalesOutput>(prompt, "Sales");
    },

    async runContentMatchmaker(sales: AgentSalesOutput, memory: AgentMemoryOutput): Promise<AgentContentOutput> {
        const prompt = `
      Suggest content. Strategy: ${sales.sales_recommendation}, Price: ${sales.pricing_strategy.suggested_price}.
      
      Return JSON:
      {
        "recommended_content": [{ "type": "string", "description": "string", "base_price": number, "user_price": number, "why_match": "string", "pitch_angle": "string" }],
        "custom_request_feasibility": { "can_do": boolean, "estimated_price": number, "timeline": "string", "notes": "string" }
      }
    `;
        return this.callAgent<AgentContentOutput>(prompt, "Content");
    },

    async runResponseGenerator(
        history: Message[],
        analyzer: AgentAnalyzerOutput,
        memory: AgentMemoryOutput,
        personality: AgentPersonalityOutput,
        sales: AgentSalesOutput,
        content: AgentContentOutput
    ): Promise<AgentGeneratorOutput> {
        const historyText = history.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');

        const prompt = `
      Generate reply.
      Persona: ${personality.active_personality} (${personality.tone_modifiers.flirtiness}/10 flirty).
      Strategy: ${sales.sales_recommendation}.
      Content to sell: ${content.recommended_content.map(c => c.type).join(', ') || 'none'}.
      
      History:
      ${historyText}

      CRITICAL BELIEVABILITY RULES:
      1. **Grammar**: Mostly lowercase, but not strictly. Don't be perfectly grammatically correct.
      2. **Apostrophes**: NEVER use them (e.g., "dont", "im", "thats").
      3. **Slang**: Use shortcuts like "lol", "rn", "hbu". IMPORTANT: Use "bby" or "babyyyyy" instead of "baby".
      4. **Typos**: Introduce a realistic "misslick" or typo in roughly 10% of messages (e.g., "teh" instead of "the", or missing a letter).
      5. **Emojis**: Use sparingly (max 2 per message), only if fitting for the persona.
      6. **Style**: Sound like a real girl chatting, not an AI.

      Return JSON:
      {
        "response": "string",
        "metadata": { "message_length": number, "emoji_count": number }
      }
    `;
        return this.callAgent<AgentGeneratorOutput>(prompt, "Generator");
    },

    async callAgent<T>(prompt: string, agentName: string): Promise<T> {
        if (!ai) throw new Error("AI not initialized");

        try {
            const result = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            let responseText = "";
            try {
                // @ts-ignore - SDK types might be slightly off or different versions
                if (typeof result.text === 'function') {
                    // @ts-ignore
                    responseText = result.text();
                } else if (result.text) {
                    responseText = result.text;
                }
            } catch (e) {
                // Fallback
            }

            if (!responseText && result.candidates && result.candidates.length > 0) {
                const part = result.candidates[0].content?.parts?.[0];
                if (part && 'text' in part) {
                    responseText = part.text as string;
                }
            }

            if (!responseText) throw new Error("Empty response");

            return JSON.parse(responseText) as T;
        } catch (error) {
            console.error(`Error in ${agentName} Agent:`, error);
            throw error;
        }
    }
};
