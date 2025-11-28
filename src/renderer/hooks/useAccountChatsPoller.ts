import { useEffect } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import { useAccountStatus } from '../contexts/AccountStatusContext';
import { useConversations } from '../contexts/ConversationsContext';
import {
  getChatsFetchScript,
  getUsersListFetchScript,
  extractUserIdsFromChats,
  filterAllowedHeaders,
  OnlyFansChatsResponse,
  addUserIdToHeaders,
} from '../services/onlyfansChatsService';
import {
  getGroupsFetchScript,
  FanslyGroupsResponse,
} from '../services/fanslyChatsService';
import { buildConversations } from '../lib/responseHelpers/buildConversations';
import { buildFanslyConversations } from '../lib/responseHelpers/buildFanslyConversations';

interface UseAccountChatsPollerProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

/**
 * Hook that polls platform-specific chats/conversations APIs for synced accounts
 * Supports OnlyFans and Fansly platforms
 * Runs periodically when account status is 'synced'
 */
export const useAccountChatsPoller = ({ accounts, webviewRefs }: UseAccountChatsPollerProps) => {
  const { statusById } = useAccountStatus();
  const { mergeConversations } = useConversations();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    accounts.forEach((acc) => {
      const platform = acc.platform.toLowerCase();
      
      // Only poll for supported platforms that are synced
      if (platform !== 'onlyfans' && platform !== 'fansly') return;
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

          if (Object.keys(allowedHeaders).length === 0) {
            console.log(`[useAccountChatsPoller] No headers found for ${partitionName}, skipping`);
            return;
          }

          let conversations;

          if (platform === 'onlyfans') {
            // OnlyFans flow: Fetch chats, then fetch users
            if (!acc.platform_user_id) {
              console.log(`[useAccountChatsPoller] No platform_user_id for OnlyFans account ${acc.id}`);
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

            conversations = buildConversations(
              chatsRes.data,
              usersRes.data,
              acc.id,
            );
          } else if (platform === 'fansly') {
            // Fansly flow: Single API call returns both groups and accounts
            const groupsScript = getGroupsFetchScript(allowedHeaders);
            const groupsRes = await ref.executeScript(groupsScript);

            if (!groupsRes || !groupsRes.ok || !groupsRes.data) {
              console.error(`[useAccountChatsPoller] Failed to fetch groups for ${acc.id}:`, groupsRes);
              return;
            }
            console.log("fansly data", groupsRes)
            const groupsData = groupsRes.data as FanslyGroupsResponse;
            conversations = buildFanslyConversations(groupsData, acc.id);
          } else {
            return;
          }

          console.log(`[useAccountChatsPoller] Built ${conversations.length} conversations for ${platform} account ${acc.id}`);
          
          // Merge conversations into global context (handles multiple accounts)
          mergeConversations(conversations);

        } catch (error) {
          console.error(`[useAccountChatsPoller] Error polling chats/users for ${acc.id}:`, error);
        }
      };

      // Start polling every 30 seconds (adjust interval as needed)
      const timer = setInterval(pollChatsAndUsers, 8000);
      timers.push(timer);

      // Initial call after a short delay to let the webview settle
      setTimeout(pollChatsAndUsers, 2000);
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [accounts, statusById, webviewRefs, mergeConversations]);
};

