import React, { useState, useEffect } from 'react';
import { AIMode, Message, Personality, Fan } from "../../types/chat";
import { generateReplySuggestions } from '../../services/geminiService';
import { multiAgentService } from '../../services/multiAgentService';
import { AgentOrchestratorOutput } from '../../types/agent';
import { SparklesIcon } from './icons/SparklesIcon';
import { aiCacheService, SuggestionItem } from '../../services/aiCacheService';

interface AIControlsProps {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  onSuggestionSelect: (suggestion: string) => void;
  conversationHistory: Message[];
  socialAccountId?: string;
  conversationId?: string;
  fan: Fan;
  onAgentAnalysisStart: () => void;
  onAgentAnalysisComplete: (insights: AgentOrchestratorOutput) => void;
}

const mockPersonalities: Personality[] = [
  { id: '1', name: 'Girlfriend', description: 'Sweet, caring, and intimate', prompt: 'You are a loving girlfriend...', icon: '❤️' },
  { id: '2', name: 'Bratty', description: 'Teasing, playful, and demanding', prompt: 'You are a bratty tease...', icon: '😈' },
  { id: '3', name: 'Girl Next Door', description: 'Friendly, casual, and relatable', prompt: 'You are the girl next door...', icon: '🏡' },
  { id: '4', name: 'Dominant', description: 'Assertive, controlling, and confident', prompt: 'You are a dominant mistress...', icon: '👠' },
  { id: '5', name: 'Slutty', description: 'Open, eager, and very sexual', prompt: 'You are a slutty companion...', icon: '🍑' },
  { id: '6', name: 'Shy Girl', description: 'Timid, innocent, but curious', prompt: 'You are a shy, innocent girl...', icon: '🥺' },
];

export const AIControls: React.FC<AIControlsProps> = ({
  currentMode,
  onModeChange,
  onSuggestionSelect,
  conversationHistory,
  socialAccountId,
  conversationId,
  fan,
  onAgentAnalysisStart,
  onAgentAnalysisComplete
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>(mockPersonalities[0]);

  // Restore state from cache or reset when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    const cached = aiCacheService.get(conversationId);
    console.log("AIControls: Switching conversation. ID:", conversationId, "Cached:", cached);

    if (cached) {
      setSuggestions(cached.suggestions);
      if (cached.selectedPersonality) {
        setSelectedPersonality(cached.selectedPersonality);
      } else {
        setSelectedPersonality(mockPersonalities[0]);
      }
    } else {
      // No cache, reset to defaults
      setSuggestions([]);
      setSelectedPersonality(mockPersonalities[0]);
    }
    setIsLoading(false);
  }, [conversationId]);

  // Save state to cache whenever it changes
  useEffect(() => {
    if (conversationId) {
      aiCacheService.set(conversationId, {
        suggestions,
        selectedPersonality
      });
    }
  }, [suggestions, selectedPersonality, conversationId]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);

    // 1. Fast Path: Generate 3 quick suggestions
    try {
      // We await this to show suggestions quickly
      const fastSuggestions = await generateReplySuggestions(conversationHistory, selectedPersonality, socialAccountId);
      setSuggestions(fastSuggestions.map(s => ({ text: s, isSmart: false })));
    } catch (error) {
      console.error("Error fetching fast suggestions:", error);
      setSuggestions([
        { text: "Hey! How are you?", isSmart: false },
        { text: "Missed you!", isSmart: false },
        { text: "Check out my new post!", isSmart: false }
      ]); // Fallback
    }

    // 2. Slow Path: Deep Agent Analysis (Background)
    setIsLoading(false); // Unblock UI for fast suggestions

    onAgentAnalysisStart(); // Notify parent that agent analysis has started
    try {
      const agentResult = await multiAgentService.orchestrateConversation(
        conversationHistory,
        selectedPersonality,
        fan,
        socialAccountId
      );

      if (agentResult) {
        onAgentAnalysisComplete(agentResult); // Pass insights to parent

        setSuggestions(prev => {
          // Check if the smart suggestion is already in the list to avoid dupes
          if (!prev.some(s => s.text === agentResult.final_response)) {
            return [{ text: agentResult.final_response, isSmart: true }, ...prev];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error in agent orchestration:", error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-color">
          <div className="flex bg-surface border border-border-color rounded-lg p-1 min-w-max">
            {mockPersonalities.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPersonality(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedPersonality.id === p.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-hover'
                  }`}
              >
                <span className="mr-1">{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface border border-border-color hover:border-primary/50 text-text-primary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group ml-2"
        >
          <SparklesIcon className={`w-4 h-4 text-primary ${isLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
          <span className="text-sm font-medium">
            {isLoading ? 'Thinking...' : 'Suggest'}
          </span>
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionSelect(suggestion.text)}
              className={`text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${suggestion.isSmart
                ? 'bg-surface border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:border-yellow-500'
                : 'bg-surface border-border-color hover:border-primary/50 hover:bg-surface/80'
                }`}
            >
              {suggestion.isSmart && (
                <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Smart
                </div>
              )}
              <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${suggestion.isSmart
                ? 'bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0'
                : 'bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0'
                }`} />
              <p className="text-sm text-text-primary relative z-10 pr-8">{suggestion.text}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};