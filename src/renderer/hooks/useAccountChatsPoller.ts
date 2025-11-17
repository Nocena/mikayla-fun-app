import { useEffect } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import { useAccountStatus } from '../contexts/AccountStatusContext';
import {
  getChatsFetchScript,
  getUsersListFetchScript,
  extractUserIdsFromChats,
  filterAllowedHeaders,
  OnlyFansChatsResponse,
  addUserIdToHeaders,
} from '../services/onlyfansChatsService';

interface UseAccountChatsPollerProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook that polls OnlyFans chats and users APIs for synced accounts
 * Runs periodically when account status is 'synced'
 */
export const useAccountChatsPoller = ({ accounts, webviewRefs }: UseAccountChatsPollerProps) => {
  const { statusById } = useAccountStatus();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    accounts.forEach((acc) => {
      // Only poll for OnlyFans accounts that are synced
      if (acc.platform.toLowerCase() !== 'onlyfans') return;
      if (statusById[acc.id] !== 'synced') return;

      const partitionName = `persist:${acc.platform}-${acc.id}`;

      const pollChatsAndUsers = async () => {
        const ref = webviewRefs.current[acc.id];
        if (!ref) return;

        try {
          // Get stored headers for this partition
          const hdrRes = await window.electronAPI.headers.get(partitionName);
          const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
          let allowedHeaders = filterAllowedHeaders(rawHeaders);

          if (Object.keys(allowedHeaders).length === 0 || !acc.platform_user_id) {
            console.log(`[useAccountChatsPoller] No headers found for ${partitionName}, skipping`);
            return;
          }

          // Step 1: Fetch chats
          const chatsScript = getChatsFetchScript(allowedHeaders, acc.platform_user_id);
          const chatsRes = await ref.executeScript(chatsScript);

          if (!chatsRes || !chatsRes.ok || !chatsRes.data) {
            console.error(`[useAccountChatsPoller] Failed to fetch chats for ${acc.platform_user_id}:`, chatsRes);
            return;
          }

          const chatsData = chatsRes.data as OnlyFansChatsResponse;
          const userIds = extractUserIdsFromChats(chatsData);

          if (userIds.length === 0) {
            console.log(`[useAccountChatsPoller] No user IDs found in chats for ${acc.id}`);
            return;
          }

          // Step 2: Fetch users list using IDs from chats
          const usersScript = getUsersListFetchScript(allowedHeaders, acc.platform_user_id, userIds);
          const usersRes = await ref.executeScript(usersScript);

          if (!usersRes || !usersRes.ok || !usersRes.data) {
            console.error(`[useAccountChatsPoller] Failed to fetch users for ${acc.id}:`, usersRes);
            return;
          }

          // Successfully fetched both chats and users
          console.log(`[useAccountChatsPoller] Successfully fetched chats and users for ${acc.id}`, {
            chatsCount: chatsData.list?.length || 0,
            usersCount: userIds.length,
          });

          // TODO: Store or process the data as needed
          // You can store it in a context, send to main process, or update state here

        } catch (error) {
          console.error(`[useAccountChatsPoller] Error polling chats/users for ${acc.id}:`, error);
        }
      };

      // Start polling every 30 seconds (adjust interval as needed)
      const timer = setInterval(pollChatsAndUsers, 30000);
      timers.push(timer);

      // Initial call after a short delay to let the webview settle
      setTimeout(pollChatsAndUsers, 2000);
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [accounts, statusById, webviewRefs]);
};

