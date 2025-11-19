export interface AgentAnalyzerOutput {
    intent: string;
    sentiment: string;
    urgency: string;
    entities: string[];
    emotional_state: string;
    priority: number;
    conversation_phase: string;
    buying_signals: string[];
}

export interface AgentMemoryOutput {
    user_profile: {
        total_spent: number;
        avg_purchase: number;
        favorite_content: string;
        price_sensitivity: string;
        last_purchase: string;
        engagement_pattern: string;
        personality_match: string;
    };
    relevant_context: string[];
    similar_user_patterns: string;
}

export interface AgentPersonalityOutput {
    active_personality: string;
    tone_modifiers: {
        sweetness: number;
        flirtiness: number;
        directness: number;
        playfulness: number;
    };
    language_style: {
        emoji_frequency: string;
        avg_message_length: string;
        vocabulary: string;
        use_petnames: boolean;
        petname: string;
    };
    personality_confidence: number;
    reason: string;
}

export interface AgentSalesOutput {
    sales_recommendation: string;
    confidence: number;
    reasoning: string;
    suggested_approach: string;
    pricing_strategy: {
        suggested_price: number;
        anchor_price: number;
        minimum_acceptable: number;
        bundle_opportunity: boolean;
    };
    timing: string;
    urgency_needed: boolean;
    upsell_opportunity?: {
        type: string;
        items: string[];
        value_prop: string;
    };
}

export interface AgentContentOutput {
    recommended_content: Array<{
        type: string;
        description: string;
        base_price: number;
        user_price: number;
        why_match: string;
        pitch_angle: string;
        items?: string[]; // For bundles
        bundle_price?: number;
        savings?: number;
    }>;
    custom_request_feasibility?: {
        can_do: boolean;
        estimated_price: number;
        timeline: string;
        notes: string;
    };
}

export interface AgentGeneratorOutput {
    response: string;
    metadata?: {
        message_length: number;
        emoji_count: number;
    };
}

export interface AgentOrchestratorOutput {
    analyzer: AgentAnalyzerOutput;
    memory: AgentMemoryOutput;
    personality: AgentPersonalityOutput;
    sales: AgentSalesOutput;
    content: AgentContentOutput;
    final_response: string;
    performance_score?: number;
}
