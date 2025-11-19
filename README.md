# Mikayla Fun App

An advanced Electron application for managing OnlyFans interactions with a sophisticated Multi-Agent AI system.

## 🚀 Key Features

### 🧠 Multi-Agent AI Swarm
A powerful swarm of 8 specialized agents working in parallel to optimize conversations:
-   **Analyzer**: Detects intent and sentiment.
-   **Memory**: Recalls user history and spending habits.
-   **Personality**: Enforces 6 distinct personas (Girlfriend, Bratty, etc.).
-   **Sales Strategist**: Decides the best sales approach (Soft Pitch, Upsell, etc.).
-   **Content Matchmaker**: Finds the perfect PPV content to sell.
-   **Response Generator**: Crafts the final message.
-   **Critique**: Reviews and refines the response before sending.
-   **Orchestrator**: Manages the entire workflow.

### 🎛️ AI Command Center
A premium dashboard to configure your digital assistant:
-   **Custom Brain**: Write your own "System Prompt Override" for total control.
-   **Creator Context**: Define your bio, rules, and business details.
-   **Personality Hub**: Visually select your active persona.
-   **Safety Layer**: Manage included/excluded keywords.

### ✨ Agent Advisor Sidebar
-   **Deep Analysis**: Real-time sidebar showing the AI's reasoning, strategy, and confidence.
-   **Smart Suggestions**: Gold-tiered suggestions backed by the full agent swarm.
-   **Collapsible**: Automatically minimizes to give you space when chatting.

### 💬 Believable Human Tone
-   **Relaxed Grammar**: No more robotic perfection.
-   **Slang & Shortcuts**: Uses "lol", "rn", "hbu", and specific terms like "bby".
-   **Realistic Typos**: Occasional "misslicks" to prove humanity.
-   **Limited Emojis**: Natural usage, not spammy.

### ⚡ Performance & Caching
-   **Dual-Fetch Architecture**: Instant "Fast Suggestions" while the "Smart Suggestion" computes in the background.
-   **State Persistence**: Switch chats freely—your analysis and suggestions are cached and restored instantly.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Chakra UI, Framer Motion
-   **Backend**: Electron (Main Process), Supabase (Database & Vector Search)
-   **AI**: Google Gemini 1.5 Flash (via `@google/genai` SDK)
-   **Build**: Vite

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Supabase project with Vector extension enabled
-   Google Gemini API Key

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in `src/renderer`:

```env
VITE_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```
