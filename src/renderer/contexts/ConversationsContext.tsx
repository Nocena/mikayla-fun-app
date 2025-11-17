import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Conversation } from '../types/chat';

interface ConversationsContextValue {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  mergeConversations: (newConversations: Conversation[]) => void;
  updateConversation: (conversationId: string, conversation: Conversation) => void;
  addConversation: (conversation: Conversation) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

export const useConversations = () => {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return ctx;
};

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const updateConversation = useCallback((conversationId: string, conversation: Conversation) => {
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? conversation : c)
    );
  }, []);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.find(c => c.id === conversation.id);
      if (exists) {
        return prev.map(c => c.id === conversation.id ? conversation : c);
      }
      return [...prev, conversation];
    });
  }, []);

  const mergeConversations = useCallback((newConversations: Conversation[]) => {
    setConversations(prev => {
      // Create a map of existing conversations by ID
      const existingMap = new Map(prev.map(c => [c.id, c]));
      
      // Merge new conversations, updating existing ones or adding new ones
      newConversations.forEach(conv => {
        existingMap.set(conv.id, conv);
      });
      
      // Convert back to array and sort by last message timestamp (most recent first)
      return Array.from(existingMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastMessageTimestamp).getTime();
        const timeB = new Date(b.lastMessageTimestamp).getTime();
        return timeB - timeA;
      });
    });
  }, []);

  return (
    <ConversationsContext.Provider 
      value={{ 
        conversations, 
        setConversations,
        mergeConversations,
        updateConversation,
        addConversation
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};

