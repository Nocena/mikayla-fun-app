import React, { useRef, useEffect, useState } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { Conversation } from "../../types/chat";
import { Avatar } from "./Avatar";
import { AgentAdvisorPanel } from './AgentAdvisorPanel';
import { AgentOrchestratorOutput } from '../../types/agent';
import { aiCacheService } from '../../services/aiCacheService';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (
    content: string,
    sender: 'model' | 'ai',
    options?: {
      price?: number;
      lockedText?: boolean;
      attachments?: Array<{
        type: 'uploaded' | 'vault';
        vaultImageId?: string;
        uploadResult?: {
          processId: string;
          host: string;
          extra: string;
          sourceUrl?: string;
        };
        file?: {
          name: string;
        };
      }>;
    }
  ) => void;
  sendingMessage?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, sendingMessage = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agentInsights, setAgentInsights] = useState<AgentOrchestratorOutput | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [conversation?.messages]);

  // Restore insights from cache or reset when conversation changes
  useEffect(() => {
    if (!conversation?.id) {
      setAgentInsights(null);
      return;
    }

    const cached = aiCacheService.get(conversation.id);
    if (cached && cached.agentInsights) {
      console.log("ChatWindow: Restoring insights from cache for", conversation.id);
      setAgentInsights(cached.agentInsights);
    } else {
      console.log("ChatWindow: No cache found for", conversation.id, "- resetting insights.");
      setAgentInsights(null);
    }
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-panel min-w-0 transition-all duration-300">
        {/* Chat Header */}
        <div className="flex-shrink-0 h-16 flex items-center px-6 border-b border-border-color bg-surface">
          <Avatar avatarUrl={conversation.fan.avatarUrl} name={conversation.fan.name} size="md" className="mr-4" />
          <div>
            <h3 className="font-bold text-text-primary">{conversation.fan.name}</h3>
            <p className="text-xs text-accent">{conversation.fan.isOnline ? 'Online' : `Last seen ${conversation.fan.lastSeen}`}</p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">${conversation.fan.totalSpent.toFixed(2)}</p>
              <p className="text-xs text-text-secondary">Total Spent</p>
            </div>
            <div className="h-8 w-px bg-border-color mx-2"></div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface'}`}
              title="Toggle Agent Advisor"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {conversation.messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                fanAvatar={conversation.fan.avatarUrl}
                fanName={conversation.fan.name}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t border-border-color bg-surface">
          <MessageInput
            onSendMessage={onSendMessage}
            conversationHistory={conversation.messages}
            sendingMessage={sendingMessage}
            socialAccountId={conversation.accountId}
            conversationId={conversation.id} // Pass conversation ID
            fan={conversation.fan}
            onAgentAnalysisStart={() => {
              setIsAgentLoading(true);
              if (!isSidebarOpen) setIsSidebarOpen(true); // Auto-open on analysis
            }}
            onAgentAnalysisComplete={(insights) => {
              setAgentInsights(insights);
              setIsAgentLoading(false);
              // Explicitly save to cache only when new insights are generated for the current conversation
              if (conversation?.id) {
                aiCacheService.set(conversation.id, { agentInsights: insights });
              }
            }}
          />
        </div>
      </div>

      {/* Agent Advisor Sidebar */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'}`}>
        <AgentAdvisorPanel insights={agentInsights} isLoading={isAgentLoading} />
      </div>
    </div>
  );
};