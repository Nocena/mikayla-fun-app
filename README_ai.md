# AI Integration Documentation

## Recent Changes

We have made significant updates to the backend infrastructure to support advanced AI features:

1.  **Database Migration**: We have switched our database provider (to Supabase) to better support vector embeddings and real-time data synchronization needed for the AI memory system.
2.  **Gemini API Integration**: We have integrated the Google Gemini API.
    *   **API Key**: The `VITE_API_KEY` has been added to the environment variables (`.env`) to authenticate requests.
    *   **SDK**: We are using the `@google/genai` SDK for robust interaction with the Gemini models.

## Basic Implementation Outline

The current AI implementation focuses on generating context-aware reply suggestions for OnlyFans creators.

### Core Components

1.  **Gemini Service (`geminiService.ts`)**:
    *   **Purpose**: Acts as the main interface to the Google Gemini API.
    *   **Functionality**:
        *   Initializes the Gemini client securely.
        *   `generateReplySuggestions`: Takes conversation history, personality profile, and context to generate 3 distinct reply options.
        *   `generateEmbedding`: Converts text into vector embeddings for semantic search.
    *   **Error Handling**: Includes robust error handling and fallbacks (mock data) if the API is unavailable or unconfigured.

2.  **AI Memory Service (`aiMemoryService.ts`)**:
    *   **Purpose**: Manages the "Long-term Memory" of the AI using RAG (Retrieval-Augmented Generation).
    *   **Functionality**:
        *   Stores past successful conversations (where tips or sales occurred).
        *   Retrieves relevant past conversations based on the current chat context to guide the AI's strategy.

### The Workflow (RAG)

1.  **Context Retrieval**: When a reply is requested, the system searches the database for past successful interactions that are semantically similar to the current user message.
2.  **Prompt Construction**: A prompt is built containing:
    *   The specific AI Personality (e.g., "The Girlfriend Experience", "The Dominatrix").
    *   The current conversation history (last 10 messages).
    *   *Retrieved Context*: Examples of what worked well in similar situations in the past.
3.  **Generation**: The prompt is sent to the Gemini Flash model (`gemini-2.5-flash`) to generate optimized replies.

## Future Outlook

**This is just the first step.**

We have established the foundational plumbing for a smart, learning AI. Future iterations will focus on:
*   **Enhanced RAG**: Improving the retrieval logic to include user-specific preferences and spending habits.
*   **Personality Tuning**: Refining the prompts to make the personalities more distinct and effective.
*   **Automated Learning**: Automatically adding new successful interactions to the memory bank without manual intervention.
*   **Performance Optimization**: Caching embeddings and responses to reduce latency.
