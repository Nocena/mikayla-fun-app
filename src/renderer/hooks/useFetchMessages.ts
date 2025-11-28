import { useCallback } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import {
  getMessagesFetchScript,
  filterAllowedHeaders,
  OnlyFansMessagesResponse,
} from '../services/onlyfansChatsService';
import { buildMessages } from '../lib/responseHelpers/buildMessages';
import { Message } from '../types/chat';

interface UseFetchMessagesProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook to fetch messages for a conversation
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
      // If no accountId provided, find the first OnlyFans account that matches the modelUserId
      account = accounts.find(
        acc => acc.platform.toLowerCase() === 'onlyfans' && 
        acc.platform_user_id === modelUserId
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

      // Fetch messages
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
      const messages = buildMessages(messagesData, account.platform_user_id);
      console.log("fetch messages", messages)

      return messages;
    } catch (error) {
      console.error(`[useFetchMessages] Error fetching messages for chat ${chatId}:`, error);
      return [];
    }
  }, [accounts, webviewRefs]);

  return { fetchMessages };
};

