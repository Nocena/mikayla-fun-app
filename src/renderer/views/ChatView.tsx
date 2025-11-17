import {useState, useEffect} from 'react';
import {Conversation, Message} from '../types/chat';
import {ConversationList} from "../components/Chat/ConversationList";
import {ChatWindow} from "../components/Chat/ChatWindow";
import {useConversations} from '../contexts/ConversationsContext';

export const ChatView = () => {
  const { conversations, updateConversation } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Read conversation ID from URL params on mount and when URL changes
  useEffect(() => {
    const updateSelectedFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const conversationId = params.get('conversation');
      
      if (conversationId) {
        const found = conversations.find(c => c.id === conversationId);
        if (found) {
          setSelectedConversation(found);
        }
      } else {
        setSelectedConversation(null);
      }
    };

    updateSelectedFromUrl();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', updateSelectedFromUrl);
    return () => window.removeEventListener('popstate', updateSelectedFromUrl);
  }, [conversations]);

  // Update selected conversation when conversations list changes (e.g., after fetching)
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations]);

  const handleConversationClick = (conversationId: string) => {
    const found = conversations.find(c => c.id === conversationId);
    if (found) {
      setSelectedConversation(found);
      // Update URL params without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', conversationId);
      window.history.pushState({ conversationId }, '', url.toString());
    }
  };

  const handleSendMessage = (content: string, sender: 'model' | 'ai') => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender,
      content,
      timestamp: 'Just now',
    };

    // TODO: This is where you would send the message to your backend via API/WebSocket.
    // The backend would then proxy it to OnlyFans.
    console.log("Sending message:", newMessage);

    // For the mock frontend, we optimistically update the state.
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
    };
    setSelectedConversation(updatedConversation);

    // Also update the main conversations list
    updateConversation(updatedConversation.id, updatedConversation);
  };


  return (
      <div className="flex h-[calc(100vh-8.5rem)] bg-panel border border-border-color rounded-2xl overflow-hidden">
        <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onConversationClick={handleConversationClick}
        />
        <ChatWindow
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
        />
      </div>
  );
};
