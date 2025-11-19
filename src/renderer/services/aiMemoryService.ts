import { supabase, ConversationMemory } from '../lib/supabase';
import { generateEmbedding } from './geminiService';
import { Message } from '../types/chat';

export const aiMemoryService = {
    /**
     * Store a conversation turn (user message + AI reply) in vector memory
     */
    async rememberConversation(
        socialAccountId: string,
        messageId: string,
        userMessage: string,
        aiReply: string,
        sentimentScore: number = 0
    ) {
        // Create a rich context string to embed
        // We combine what the user said and how we replied to capture the "flow"
        const contextText = `User: ${userMessage}\nAI: ${aiReply}`;

        const embedding = await generateEmbedding(contextText);

        if (!embedding) {
            console.error('Failed to generate embedding for conversation memory');
            return null;
        }

        const memory: Partial<ConversationMemory> = {
            social_account_id: socialAccountId,
            message_id: messageId,
            embedding: embedding,
            context_summary: contextText.substring(0, 1000), // Store truncated text for debugging/preview
            sentiment_score: sentimentScore,
            is_sale_conversion: false
        };

        const { data, error } = await supabase
            .from('conversation_memories')
            .insert(memory)
            .select()
            .single();

        if (error) {
            console.error('Error storing conversation memory:', error);
            throw error;
        }

        return data;
    },

    /**
     * Find similar past successful conversations
     */
    async findSimilarConversations(
        socialAccountId: string,
        currentMessage: string,
        limit: number = 3
    ): Promise<ConversationMemory[]> {
        const embedding = await generateEmbedding(`User: ${currentMessage}`);

        if (!embedding) return [];

        // Call the Supabase RPC function for vector similarity search
        // Note: You need to create this RPC function in Supabase first!
        const { data, error } = await supabase.rpc('match_conversation_memories', {
            query_embedding: embedding,
            match_threshold: 0.7, // Only return fairly relevant matches
            match_count: limit,
            filter_social_account_id: socialAccountId
        });

        if (error) {
            console.error('Error searching memories:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Mark a memory as leading to a sale
     */
    async markAsSale(messageId: string) {
        const { error } = await supabase
            .from('conversation_memories')
            .update({ is_sale_conversion: true })
            .eq('message_id', messageId);

        if (error) throw error;
    }
};
