import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { Conversation, Message as ChatMessage } from "../../types/chat";
import { Avatar } from "./Avatar";
import { AgentAdvisorPanel } from './AgentAdvisorPanel';
import { AgentOrchestratorOutput } from '../../types/agent';
import { aiCacheService } from '../../services/aiCacheService';
import { SparklesIcon } from './icons/SparklesIcon';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';
import { useWebviews } from '../../contexts/WebviewContext';
import { usePaymentMethodsVat } from '../../hooks/usePaymentMethodsVat';
import { OnlyFansPaymentMethodsVatResponse } from '../../services/onlyfansPaymentsService';

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
  isLoadingMessages?: boolean;
  onMarkAsRead?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversation, 
  onSendMessage, 
  sendingMessage = false,
  isLoadingMessages = false,
  onMarkAsRead,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agentInsights, setAgentInsights] = useState<AgentOrchestratorOutput | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unlockingMessageId, setUnlockingMessageId] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    error?: string;
    quote?: OnlyFansPaymentMethodsVatResponse | null;
    message?: ChatMessage | null;
    selectedCardId?: number | null;
  }>({
    isOpen: false,
    isLoading: false,
    quote: null,
    message: null,
    selectedCardId: null,
  });
  const { accounts } = useSocialAccounts();
  const { webviewRefs } = useWebviews();
  const { fetchPaymentMethodsVat } = usePaymentMethodsVat({ accounts, webviewRefs });

  // Check if conversation is Fansly and has unread messages
  const shouldMarkAsRead = useCallback(() => {
    if (!conversation || !onMarkAsRead || conversation.unreadCount === 0) {
      return false;
    }
    const account = conversation.accountId 
      ? accounts.find(acc => acc.id === conversation.accountId)
      : accounts.find(acc => acc.platform.toLowerCase() === 'fansly');
    return account?.platform.toLowerCase() === 'fansly';
  }, [conversation, accounts, onMarkAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [conversation?.messages]);

  // Restore insights from cache or reset when conversation changes
  useEffect(() => {
    if (!conversation?.id) {
      setAgentInsights(null);
      setPurchaseState((prev) => ({
        ...prev,
        isOpen: false,
        isLoading: false,
        quote: null,
        message: null,
        selectedCardId: null,
        error: undefined,
      }));
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

  const handleUnlockRequest = async (message: ChatMessage) => {
    if (!conversation || !message.price || message.price <= 0) return;

    setUnlockingMessageId(message.id);
    setPurchaseState({
      isOpen: true,
      isLoading: true,
      quote: null,
      message,
      error: undefined,
      selectedCardId: null,
    });

    try {
      const quote = await fetchPaymentMethodsVat({
        price: message.price,
        toUserId: conversation.fan.id,
        accountId: conversation.accountId,
      });
      const defaultCardId =
        quote.cards?.find((card) => card.isDefault)?.id ??
        quote.cards?.[0]?.id ??
        null;
      setPurchaseState({
        isOpen: true,
        isLoading: false,
        quote,
        message,
        error: undefined,
        selectedCardId: defaultCardId ?? undefined,
      });
    } catch (error: unknown) {
      setPurchaseState({
        isOpen: true,
        isLoading: false,
        quote: null,
        message,
        error: error instanceof Error ? error.message : 'Unable to load payment info.',
        selectedCardId: null,
      });
    } finally {
      setUnlockingMessageId(null);
    }
  };

  const handleClosePurchaseModal = () => {
    setPurchaseState({
      isOpen: false,
      isLoading: false,
      quote: null,
      message: null,
      selectedCardId: null,
      error: undefined,
    });
  };

  const handleSelectPaymentMethod = (cardId: number) => {
    setPurchaseState((prev) => ({
      ...prev,
      selectedCardId: cardId,
    }));
  };

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
        <div 
          className="flex-1 overflow-y-auto p-6 relative"
          onClick={() => {
            // Mark as read when clicking on messages area (only for Fansly with unread messages)
            if (shouldMarkAsRead()) {
              onMarkAsRead();
            }
          }}
        >
          {isLoadingMessages && (
            <div className="absolute inset-0 flex items-center justify-center bg-panel/70 z-10">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <div className={`flex flex-col gap-4 transition-opacity ${isLoadingMessages ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {conversation.messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                fanAvatar={conversation.fan.avatarUrl}
                fanName={conversation.fan.name}
                onRequestUnlock={handleUnlockRequest}
                unlockingMessageId={unlockingMessageId}
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
            onInputFocus={() => {
              // Mark as read when input is focused (only for Fansly with unread messages)
              if (shouldMarkAsRead()) {
                onMarkAsRead();
              }
            }}
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
      <PurchaseConfirmModal
        isOpen={purchaseState.isOpen}
        onClose={handleClosePurchaseModal}
        price={purchaseState.message?.price ?? 0}
        isLoading={purchaseState.isLoading}
        quote={purchaseState.quote}
        error={purchaseState.error}
        selectedCardId={purchaseState.selectedCardId ?? undefined}
        onSelectCard={handleSelectPaymentMethod}
      />
    </div>
  );
};