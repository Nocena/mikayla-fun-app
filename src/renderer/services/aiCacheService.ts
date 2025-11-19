import { AgentOrchestratorOutput } from '../types/agent';
import { Personality } from '../types/chat';

export interface SuggestionItem {
    text: string;
    isSmart: boolean;
}

interface ConversationCache {
    suggestions: SuggestionItem[];
    selectedPersonality: Personality | null;
    agentInsights: AgentOrchestratorOutput | null;
    timestamp: number;
}

class AICacheService {
    private cache: Map<string, ConversationCache> = new Map();

    // Save state for a conversation
    set(conversationId: string, data: Partial<ConversationCache>) {
        const existing = this.cache.get(conversationId) || {
            suggestions: [],
            selectedPersonality: null,
            agentInsights: null,
            timestamp: Date.now()
        };

        this.cache.set(conversationId, {
            ...existing,
            ...data,
            timestamp: Date.now()
        });
    }

    // Get state for a conversation
    get(conversationId: string): ConversationCache | undefined {
        return this.cache.get(conversationId);
    }

    // Clear cache for a conversation
    clear(conversationId: string) {
        this.cache.delete(conversationId);
    }

    // Clear all cache
    clearAll() {
        this.cache.clear();
    }
}

export const aiCacheService = new AICacheService();
