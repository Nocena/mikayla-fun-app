import { useCallback } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import {
  getSendMessageScript,
  filterAllowedHeaders,
  SendMessageAttachments,
} from '../services/onlyfansChatsService';
import {
  getFanslySendMessageScript,
} from '../services/fanslyChatsService';

interface UseSendMessageProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook to send messages for a conversation
 * Supports both OnlyFans and Fansly platforms
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
      // If no accountId provided, find the first account that matches the modelUserId
      account = accounts.find(
        acc => acc.platform_user_id === modelUserId
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

    const platform = account.platform.toLowerCase();

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

      let sendScript: string;

      if (platform === 'onlyfans') {
        // OnlyFans flow
        sendScript = getSendMessageScript(
          allowedHeaders,
          account.platform_user_id,
          chatId,
          text,
          options
        );
      } else if (platform === 'fansly') {
        // Fansly flow
        // Convert attachments if needed (Fansly might have different structure)
        const fanslyAttachments = options?.attachments?.map(att => {
          // Map OnlyFans attachment format to Fansly if needed
          // For now, return empty array as Fansly structure may differ
          return {};
        }) || [];
        
        sendScript = getFanslySendMessageScript(
          allowedHeaders,
          chatId, // groupId
          text,
          {
            attachments: fanslyAttachments,
            inReplyTo: null, // Can be extended later if needed
          }
        );
      } else {
        console.error(`[useSendMessage] Unsupported platform: ${platform}`);
        return false;
      }

      const sendRes = await ref.executeScript(sendScript);

      if (!sendRes || !sendRes.ok) {
        console.error(`[useSendMessage] Failed to send message to ${platform} ${chatId}:`, sendRes);
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

