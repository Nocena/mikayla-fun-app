import { useCallback } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import {
  getMessagesFetchScript,
  filterAllowedHeaders,
  OnlyFansMessagesResponse,
} from '../services/onlyfansChatsService';
import {
  getFanslyMessagesFetchScript,
  FanslyMessagesResponse,
  FanslyMessage,
  getFanslyMarkMessagesReadScript,
} from '../services/fanslyChatsService';
import { buildMessages } from '../lib/responseHelpers/buildMessages';
import { buildFanslyMessages } from '../lib/responseHelpers/buildFanslyMessages';
import { Message } from '../types/chat';

interface UseFetchMessagesProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook to fetch messages for a conversation
 * Supports both OnlyFans and Fansly platforms
 */
export const useFetchMessages = ({ accounts, webviewRefs }: UseFetchMessagesProps) => {
  const fetchMessages = useCallback(async (
    chatId: string,
    modelUserId: string,
    accountId?: string
  ): Promise<Message[]> => {
    // Find the account to use
    let account: SocialAccount | undefined;
    
    if (accountId) {
      account = accounts.find(acc => acc.id === accountId);
    } else {
      // If no accountId provided, find the first account that matches the modelUserId
      account = accounts.find(
        acc => acc.platform_user_id === modelUserId
      );
    }

    if (!account || !account.platform_user_id) {
      console.error('[useFetchMessages] No account found for chatId:', chatId);
      return [];
    }

    const ref = webviewRefs.current[account.id];
    if (!ref) {
      console.error('[useFetchMessages] No webview ref found for account:', account.id);
      return [];
    }

    const platform = account.platform.toLowerCase();

    try {
      const partitionName = `persist:${account.platform}-${account.id}`;
      // Get stored headers for this partition
      const hdrRes = await window.electronAPI.headers.get(partitionName);
      const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
      const allowedHeaders = filterAllowedHeaders(rawHeaders);
      console.log("fetch Messages", partitionName, allowedHeaders)

      if (Object.keys(allowedHeaders).length === 0) {
        console.error(`[useFetchMessages] No headers found for ${partitionName}`);
        return [];
      }

      let messages: Message[];

      if (platform === 'onlyfans') {
        // OnlyFans flow
        const messagesScript = getMessagesFetchScript(
          allowedHeaders,
          account.platform_user_id,
          chatId,
          50 // limit
        );
        const messagesRes = await ref.executeScript(messagesScript);

        if (!messagesRes || !messagesRes.ok || !messagesRes.data) {
          console.error(`[useFetchMessages] Failed to fetch messages for chat ${chatId}:`, messagesRes);
          return [];
        }

        const messagesData = messagesRes.data as OnlyFansMessagesResponse;
        messages = buildMessages(messagesData, account.platform_user_id);
      } else if (platform === 'fansly') {
        // Fansly flow
        // First fetch messages
        const messagesScript = getFanslyMessagesFetchScript(
          allowedHeaders,
          chatId, // groupId
          25 // limit
        );

        const messagesRes = await ref.executeScript(messagesScript);

        if (!messagesRes || !messagesRes.ok || !messagesRes.data) {
          console.error(`[useFetchMessages] Failed to fetch messages for group ${chatId}:`, messagesRes);
          return [];
        }

        const messagesData = messagesRes.data as FanslyMessagesResponse;
        messages = buildFanslyMessages(messagesData, account.platform_user_id);

        // After fetching messages, mark unread messages as read
        // Extract unread message IDs from the raw response
        // A message is unread if interactions[0].readAt === 0 or doesn't exist
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
        if (unreadMessageIds.length > 0) {
          const markReadScript = getFanslyMarkMessagesReadScript(
            allowedHeaders,
            unreadMessageIds,
          );

          const markReadRes = await ref.executeScript(markReadScript);

          if (!markReadRes || !markReadRes.ok) {
            console.warn(`[useFetchMessages] Failed to mark Fansly messages as read for group ${chatId}:`, markReadRes);
          } else {
            console.log(`[useFetchMessages] Marked ${unreadMessageIds.length} Fansly messages as read for group ${chatId}`);
          }
        }
      } else {
        console.error(`[useFetchMessages] Unsupported platform: ${platform}`);
        return [];
      }

      console.log("fetch messages", messages)
      return messages;
    } catch (error) {
      console.error(`[useFetchMessages] Error fetching messages for chat ${chatId}:`, error);
      return [];
    }
  }, [accounts, webviewRefs]);

  return { fetchMessages };
};

