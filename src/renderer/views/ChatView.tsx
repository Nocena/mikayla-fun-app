import {useState, useEffect, useCallback} from 'react';
import {Conversation, Message} from '../types/chat';
import {ConversationList} from "../components/Chat/ConversationList";
import {ChatWindow} from "../components/Chat/ChatWindow";
import {ResizableSidebar} from "../components/Chat/ResizableSidebar";
import {ChatEmptyState} from "../components/Chat/ChatEmptyState";
import {useConversations} from '../contexts/ConversationsContext';
import {useSocialAccounts} from '../contexts/SocialAccountsContext';
import {useWebviews} from '../contexts/WebviewContext';
import {useFetchMessages} from '../hooks/useFetchMessages';
import {useSendMessage} from '../hooks/useSendMessage';
import {useMarkAsRead} from '../hooks/useMarkAsRead';
import {toast} from '../lib/toast';

export const ChatView = () => {
  const { conversations, updateConversation } = useConversations();
  const { accounts } = useSocialAccounts();
  const { webviewRefs } = useWebviews();
  const { fetchMessages } = useFetchMessages({ accounts, webviewRefs });
  const { sendMessage } = useSendMessage({ accounts, webviewRefs });
  const { markAsRead } = useMarkAsRead({ accounts, webviewRefs });
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Filter conversations to only show those from existing accounts
  const accountIds = new Set(accounts.map(acc => acc.id));
  const filteredConversations = conversations.filter(conv => 
    !conv.accountId || accountIds.has(conv.accountId)
  );

  // Read conversation ID from URL params on mount and when URL changes
  useEffect(() => {
    const updateSelectedFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const conversationId = params.get('conversation');
      
      if (conversationId) {
        const found = filteredConversations.find(c => c.id === conversationId);
        if (found) {
          setSelectedConversation(found);
        } else {
          // Conversation was filtered out (account deleted), clear selection
          setSelectedConversation(null);
        }
      } else {
        setSelectedConversation(null);
      }
    };

    updateSelectedFromUrl();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', updateSelectedFromUrl);
    return () => window.removeEventListener('popstate', updateSelectedFromUrl);
  }, [filteredConversations]);

  // Update selected conversation when conversations list changes (e.g., after fetching)
  useEffect(() => {
    if (selectedConversation) {
      const updated = filteredConversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      } else {
        // Selected conversation was filtered out (account deleted), clear selection
        setSelectedConversation(null);
      }
    }
  }, [filteredConversations, selectedConversation]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    // Only fetch if messages array is empty or has only the last message
    const shouldFetch = selectedConversation.messages.length <= 1;

    if (shouldFetch && !loadingMessages) {
      setLoadingMessages(true);
      
      // Find the account that owns this conversation
      const account = selectedConversation.accountId 
        ? accounts.find(acc => acc.id === selectedConversation.accountId)
        : accounts.find(acc => acc.platform.toLowerCase() === 'onlyfans'); // Fallback for old conversations
      
      if (account && account.platform_user_id) {
        fetchMessages(
          selectedConversation.id, // chatId
          account.platform_user_id,
          account.id
        ).then((messages) => {
          if (messages.length > 0) {
            const updatedConversation = {
              ...selectedConversation,
              messages: messages,
              // After fetching (and marking as read for Fansly), clear unread count
              ...(account.platform.toLowerCase() === 'fansly'
                ? { unreadCount: 0 }
                : {}),
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
    const found = filteredConversations.find(c => c.id === conversationId);
    if (found) {
      setSelectedConversation(found);
      // Update URL params without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', conversationId);
      window.history.pushState({ conversationId }, '', url.toString());
    }
  };

  // Handle marking messages as read (for Fansly conversations)
  const handleMarkAsRead = useCallback(async () => {
    if (!selectedConversation) return;
    
    const success = await markAsRead(selectedConversation);
    if (success) {
      // Update conversation unreadCount to 0
      const updatedConversation = {
        ...selectedConversation,
        unreadCount: 0,
      };
      setSelectedConversation(updatedConversation);
      updateConversation(updatedConversation.id, updatedConversation);
    }
  }, [selectedConversation, markAsRead, updateConversation]);

  const handleSendMessage = async (
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
  ) => {
    if (!selectedConversation || sendingMessage) return;

    // Find the account that owns this conversation
    const account = selectedConversation.accountId 
      ? accounts.find(acc => acc.id === selectedConversation.accountId)
      : accounts.find(acc => acc.platform.toLowerCase() === 'onlyfans'); // Fallback for old conversations
    
    if (!account || !account.platform_user_id) {
      console.error('No account found to send message');
      return;
    }

    setSendingMessage(true);

    try {
      // Format attachments for the service
      const formattedAttachments = options?.attachments?.map((att) => {
        if (att.type === 'vault') {
          return {
            type: 'vault' as const,
            vaultImageId: att.vaultImageId,
          };
        } else {
          return {
            type: 'uploaded' as const,
            uploadResult: att.uploadResult,
            file: att.file,
          };
        }
      });

      // Send message via API
      const success = await sendMessage(
        selectedConversation.id, // chatId
        content,
        account.platform_user_id,
        account.id,
        {
          price: options?.price,
          lockedText: options?.lockedText,
          attachments: formattedAttachments,
        }
      );

      if (success) {
        // Message sent successfully, refetch messages to get the actual message from API
        const messages = await fetchMessages(
          selectedConversation.id,
          account.platform_user_id,
          account.id
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
        // Failed to send
        toast({
          title: 'Failed to send message',
          description: 'Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSendingMessage(false);
    }
  };


  // Show empty state when there are no conversations
  const hasNoConversations = filteredConversations.length === 0;

  return (
      <div className="flex h-full bg-panel border border-border-color overflow-hidden">
        {hasNoConversations ? (
          <ChatEmptyState />
        ) : (
          <>
            <ResizableSidebar
              minWidth={200}
              maxWidth={500}
              defaultWidth={320}
              collapsedWidth={60}
              storageKey="chat-sidebar"
            >
              <ConversationList
                  conversations={filteredConversations}
                  selectedConversationId={selectedConversation?.id}
                  onConversationClick={handleConversationClick}
                  accounts={accounts}
              />
            </ResizableSidebar>
            <ChatWindow
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
                sendingMessage={sendingMessage}
                isLoadingMessages={loadingMessages}
                onMarkAsRead={handleMarkAsRead}
            />
          </>
        )}
      </div>
  );
};
