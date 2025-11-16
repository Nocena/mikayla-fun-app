import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateReplySuggestions } from '../../services/geminiService';
import type { AIMode, Message, Personality } from '../../types/chat';
import {mockPersonalities} from "../../views/mockData";

interface AIControlsProps {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  onSuggestionSelect: (suggestion: string) => void;
  conversationHistory: Message[];
}

export const AIControls: React.FC<AIControlsProps> = ({ currentMode, onModeChange, onSuggestionSelect, conversationHistory }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPersonality, setSelectedPersonality] = useState<Personality>(mockPersonalities[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    const fetchSuggestions = async () => {
        setIsLoading(true);
        setSuggestions([]);
        try {
            const result = await generateReplySuggestions(conversationHistory, selectedPersonality);
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
            setSuggestions(["Sorry, couldn't get suggestions."]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPersonality = (personality: Personality) => {
        setSelectedPersonality(personality);
        setIsDropdownOpen(false);
        setSuggestions([]);
    };

  return (
    <div className="bg-panel p-2 rounded-lg border border-border-color">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Personality Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-surface hover:bg-surface/80 rounded-md transition-colors text-sm"
            >
              <span className="text-lg">{selectedPersonality.icon}</span>
              <span className="font-semibold">{selectedPersonality.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 w-48 bg-glass backdrop-blur-md border border-border-color rounded-lg shadow-lg z-10 overflow-hidden">
                {mockPersonalities.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersonality(p)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/20 ${selectedPersonality.id === p.id ? 'bg-primary/10 text-primary' : 'text-text-primary'}`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm hidden sm:inline">AI Assist</span>
            <div className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">{currentMode}</div>
        </div>
      </div>
      
      {currentMode === 'suggest' && (
        <div className="mt-2">
          {suggestions.length === 0 ? (
            <button
              onClick={fetchSuggestions}
              disabled={isLoading}
              className="w-full text-center py-2 text-sm bg-surface hover:bg-primary/20 text-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : '✨ Generate Suggestions'}
            </button>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSuggestionSelect(s)}
                    className="text-left p-2 text-xs bg-surface hover:bg-primary/20 text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchSuggestions}
                disabled={isLoading}
                className="w-full text-center mt-2 py-1 text-xs bg-surface/50 hover:bg-surface text-text-secondary rounded-md transition-colors"
              >
                {isLoading ? 'Generating...' : 'Regenerate'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};