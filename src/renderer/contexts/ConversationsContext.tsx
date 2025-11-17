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
      newConversations.forEach(newConv => {
        const existingConv = existingMap.get(newConv.id);
        
        if (existingConv && existingConv.messages.length > 0) {
          // Check if existing conversation has messages
          const existingLastMsg = existingConv.messages[existingConv.messages.length - 1];
          const newLastMsg = newConv.messages[0]; // New conversation's last message preview is the first in array
          
          // Compare last message by content and timestamp
          const lastMsgMatches = existingLastMsg && newLastMsg &&
            existingLastMsg.content === newLastMsg.content &&
            existingLastMsg.timestamp === newLastMsg.timestamp;
          
          if (lastMsgMatches) {
            // Last message is the same, don't update messages but update metadata
            existingMap.set(newConv.id, {
              ...newConv,
              messages: existingConv.messages, // Preserve existing messages
            });
          } else if (newLastMsg && newLastMsg.content && newLastMsg.content.trim() !== '') {
            // Last message is different and not blank, add it to messages
            const updatedMessages = [...existingConv.messages, newLastMsg];
            existingMap.set(newConv.id, {
              ...newConv,
              messages: updatedMessages,
            });
          } else {
            // New last message is blank, set last message as messages (replace)
            existingMap.set(newConv.id, {
              ...newConv,
              messages: newConv.messages,
            });
          }
        } else {
          // New conversation or no existing messages, just set it
          existingMap.set(newConv.id, newConv);
        }
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

