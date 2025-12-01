import { useCallback } from 'react';
import { Conversation } from '../types/chat';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import { getFanslyMarkMessagesReadScript, FanslyMessage, getFanslyMessagesFetchScript, FanslyMessagesResponse } from '../services/fanslyChatsService';
import { filterAllowedHeaders } from '../services/onlyfansChatsService';

interface UseMarkAsReadProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook to mark Fansly messages as read
 * Only works for Fansly conversations
 */
export const useMarkAsRead = ({ accounts, webviewRefs }: UseMarkAsReadProps) => {
  const markAsRead = useCallback(async (conversation: Conversation): Promise<boolean> => {
    // Only for Fansly conversations with unread messages
    if (!conversation || conversation.unreadCount === 0) {
      return false;
    }

    const account = conversation.accountId 
      ? accounts.find(acc => acc.id === conversation.accountId)
      : accounts.find(acc => acc.platform.toLowerCase() === 'fansly');
    
    if (!account || account.platform.toLowerCase() !== 'fansly') {
      return false;
    }
    
    const ref = webviewRefs.current[account.id];
    if (!ref) {
      console.error('[useMarkAsRead] No webview ref found for account:', account.id);
      return false;
    }

    try {
      const partitionName = `persist:${account.platform}-${account.id}`;
      const hdrRes = await window.electronAPI.headers.get(partitionName);
      const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
      const allowedHeaders = filterAllowedHeaders(rawHeaders);

      if (Object.keys(allowedHeaders).length === 0) {
        console.error(`[useMarkAsRead] No headers found for ${partitionName}`);
        return false;
      }

      // Fetch messages to get unread message IDs
      const messagesScript = getFanslyMessagesFetchScript(
        allowedHeaders,
        conversation.id, // groupId
        25 // limit
      );
      const messagesRes = await ref.executeScript(messagesScript);

      if (!messagesRes || !messagesRes.ok || !messagesRes.data) {
        console.error(`[useMarkAsRead] Failed to fetch messages for group ${conversation.id}:`, messagesRes);
        return false;
      }

      const messagesData = messagesRes.data as FanslyMessagesResponse;
      
      // Extract unread message IDs
      const unreadMessageIds: string[] = [];
      if (messagesData?.response?.messages && Array.isArray(messagesData.response.messages)) {
        messagesData.response.messages.forEach((msg: FanslyMessage) => {
          const interaction = msg.interactions?.[0];
          // Message is unread if readAt is 0, undefined, or null
          if (!interaction || interaction.readAt === 0 || interaction.readAt === null || interaction.readAt === undefined) {
            unreadMessageIds.push(msg.id);
          }
        });
      }

      // Mark messages as read if there are any unread messages
      if (unreadMessageIds.length === 0) {
        return false; // No unread messages to mark
      }

      const markReadScript = getFanslyMarkMessagesReadScript(
        allowedHeaders,
        unreadMessageIds,
      );

      const markReadRes = await ref.executeScript(markReadScript);

      if (!markReadRes || !markReadRes.ok) {
        console.warn(`[useMarkAsRead] Failed to mark Fansly messages as read for group ${conversation.id}:`, markReadRes);
        return false;
      }

      console.log(`[useMarkAsRead] Marked ${unreadMessageIds.length} Fansly messages as read for group ${conversation.id}`);
      return true;
    } catch (error) {
      console.error(`[useMarkAsRead] Error marking messages as read for conversation ${conversation.id}:`, error);
      return false;
    }
  }, [accounts, webviewRefs]);

  return { markAsRead };
};

