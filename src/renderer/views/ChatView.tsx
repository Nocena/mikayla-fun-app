import {useState, useEffect} from 'react';
import {Conversation, Message} from '../types/chat';
import {ConversationList} from "../components/Chat/ConversationList";
import {ChatWindow} from "../components/Chat/ChatWindow";
import {useConversations} from '../contexts/ConversationsContext';
import {useSocialAccounts} from '../contexts/SocialAccountsContext';
import {useWebviews} from '../contexts/WebviewContext';
import {useFetchMessages} from '../hooks/useFetchMessages';
import {useSendMessage} from '../hooks/useSendMessage';

export const ChatView = () => {
  const { conversations, updateConversation } = useConversations();
  const { accounts } = useSocialAccounts();
  const { webviewRefs } = useWebviews();
  const { fetchMessages } = useFetchMessages({ accounts, webviewRefs });
  const { sendMessage } = useSendMessage({ accounts, webviewRefs });
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    // Only fetch if messages array is empty or has only the last message
    const shouldFetch = selectedConversation.messages.length <= 1;

    if (shouldFetch && !loadingMessages) {
      setLoadingMessages(true);
      
      // Find the account that owns this conversation
      // For now, we'll try the first OnlyFans account
      const onlyFansAccount = accounts.find(acc => acc.platform.toLowerCase() === 'onlyfans');
      
      if (onlyFansAccount && onlyFansAccount.platform_user_id) {
        fetchMessages(
          selectedConversation.id, // chatId
          onlyFansAccount.platform_user_id,
          onlyFansAccount.id
        ).then((messages) => {
          if (messages.length > 0) {
            const updatedConversation = {
              ...selectedConversation,
              messages: messages,
            };
            setSelectedConversation(updatedConversation);
            updateConversation(updatedConversation.id, updatedConversation);
          }
          setLoadingMessages(false);
        }).catch((error) => {
          console.error('Error fetching messages:', error);
          setLoadingMessages(false);
        });
      } else {
        setLoadingMessages(false);
      }
    }
  }, [selectedConversation?.id, fetchMessages, accounts, updateConversation]);

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

  const handleSendMessage = async (content: string, sender: 'model' | 'ai') => {
    if (!selectedConversation || sendingMessage) return;

    // Find the account that owns this conversation
    const onlyFansAccount = accounts.find(acc => acc.platform.toLowerCase() === 'onlyfans');
    
    if (!onlyFansAccount || !onlyFansAccount.platform_user_id) {
      console.error('No OnlyFans account found to send message');
      return;
    }

    setSendingMessage(true);

    // Optimistically add the message to the UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'model',
      content: `<p>${content}</p>`,
      timestamp: new Date().toISOString(),
    };

    const optimisticConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, tempMessage],
    };
    setSelectedConversation(optimisticConversation);
    updateConversation(optimisticConversation.id, optimisticConversation);

    try {
      // Send message via API
      const success = await sendMessage(
        selectedConversation.id, // chatId
        content,
        onlyFansAccount.platform_user_id,
        onlyFansAccount.id
      );

      if (success) {
        // Message sent successfully, refetch messages to get the actual message from API
        const messages = await fetchMessages(
          selectedConversation.id,
          onlyFansAccount.platform_user_id,
          onlyFansAccount.id
        );

        if (messages.length > 0) {
          const updatedConversation = {
            ...selectedConversation,
            messages: messages,
          };
          setSelectedConversation(updatedConversation);
          updateConversation(updatedConversation.id, updatedConversation);
        }
      } else {
        // Failed to send, remove optimistic message
        setSelectedConversation(selectedConversation);
        updateConversation(selectedConversation.id, selectedConversation);
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setSelectedConversation(selectedConversation);
      updateConversation(selectedConversation.id, selectedConversation);
    } finally {
      setSendingMessage(false);
    }
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
