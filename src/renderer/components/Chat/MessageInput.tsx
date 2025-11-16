import React, { useState } from 'react';
import { AIControls } from './AIControls';
import {AIMode, Message} from "../../types/chat";
import {SendIcon} from "./icons/SendIcon";

interface MessageInputProps {
  onSendMessage: (content: string, sender: 'model' | 'ai') => void;
  conversationHistory: Message[];
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, conversationHistory }) => {
  const [text, setText] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('suggest');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text, 'model'); // Assume manual sends are from the 'model'
      setText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
        <AIControls
          currentMode={aiMode}
          onModeChange={setAiMode}
          onSuggestionSelect={setText}
          conversationHistory={conversationHistory}
        />
        <div className="relative mt-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={2}
                className="w-full bg-surface border border-border-color rounded-lg p-3 pr-12 resize-none focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
            <button
                onClick={handleSend}
                className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-full hover:bg-purple-500 transition-colors disabled:bg-surface disabled:text-text-secondary"
                disabled={!text.trim()}
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};