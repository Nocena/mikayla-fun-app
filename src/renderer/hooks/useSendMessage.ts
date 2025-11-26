import { useCallback } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import {
  getSendMessageScript,
  filterAllowedHeaders,
  SendMessageAttachments,
} from '../services/onlyfansChatsService';

interface UseSendMessageProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook to send messages for a conversation
 */
export const useSendMessage = ({ accounts, webviewRefs }: UseSendMessageProps) => {
  const sendMessage = useCallback(async (
    chatId: string,
    text: string,
    modelUserId: string,
    accountId?: string,
    options?: {
      price?: number;
      lockedText?: boolean;
      attachments?: SendMessageAttachments[];
    }
  ): Promise<boolean> => {
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
      console.error('[useSendMessage] No account found for chatId:', chatId);
      return false;
    }

    const ref = webviewRefs.current[account.id];
    if (!ref) {
      console.error('[useSendMessage] No webview ref found for account:', account.id);
      return false;
    }

    try {
      const partitionName = `persist:${account.platform}-${account.id}`;
      
      // Get stored headers for this partition
      const hdrRes = await window.electronAPI.headers.get(partitionName);
      const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
      const allowedHeaders = filterAllowedHeaders(rawHeaders);

      if (Object.keys(allowedHeaders).length === 0) {
        console.error(`[useSendMessage] No headers found for ${partitionName}`);
        return false;
      }

      // Send message
      const sendScript = getSendMessageScript(
        allowedHeaders,
        account.platform_user_id,
        chatId,
        text,
        options
      );
      const sendRes = await ref.executeScript(sendScript);

      if (!sendRes || !sendRes.ok) {
        console.error(`[useSendMessage] Failed to send message to chat ${chatId}:`, sendRes);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[useSendMessage] Error sending message to chat ${chatId}:`, error);
      return false;
    }
  }, [accounts, webviewRefs]);

  return { sendMessage };
};

