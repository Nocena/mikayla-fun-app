import { FanslyGroupsResponse } from '../../services/fanslyChatsService';
import { Conversation, Fan, Message } from '../../types/chat';

/**
 * Builds conversations from Fansly groups response
 * Transforms Fansly API response to match the Conversation interface
 */
export function buildFanslyConversations(
  groupsResponse: FanslyGroupsResponse,
  accountId?: string,
): Conversation[] {
  if (!groupsResponse?.success || !groupsResponse?.response?.aggregationData) {
    return [];
  }

  const { data, aggregationData } = groupsResponse.response;
  
  // Build accounts map for quick lookup
  const accountsMap = new Map<string, typeof aggregationData.accounts[0]>();
  if (aggregationData?.accounts) {
    aggregationData.accounts.forEach((account) => {
      accountsMap.set(account.id, account);
    });
  }

  // Build data map to get partnerAccountId and unreadCount by groupId
  const dataMap = new Map<string, { partnerAccountId: string; unreadCount: number }>();
  if (data) {
    data.forEach((item) => {
      dataMap.set(item.groupId, {
        partnerAccountId: item.partnerAccountId,
        unreadCount: item.unreadCount || 0,
      });
    });
  }

  // Use aggregationData.groups as the main source (not response.data)
  if (!aggregationData?.groups || aggregationData.groups.length === 0) {
    return [];
  }

  return aggregationData.groups
    .map((group) => {
      // Get partnerAccountId and unreadCount from data map
      const groupData = dataMap.get(group.id);
      if (!groupData) {
        return null;
      }

      const partnerAccountId = groupData.partnerAccountId;
      const account = accountsMap.get(partnerAccountId);

      if (!account) {
        return null;
      }

      // Get last message from group
      const lastMessage = group.lastMessage;
      if (!lastMessage) {
        return null;
      }

      // Determine if message is unread
      // Check if interactions[0].readAt is 0 (as per user requirement: readAt === 0 => unread)
      const interaction = lastMessage.interactions?.[0];
      const isUnread = interaction?.readAt === 0;

      // Determine sender (if senderId matches partnerAccountId, it's from fan, otherwise from AI/creator)
      const sender: Message['sender'] = lastMessage.senderId === partnerAccountId ? 'fan' : 'ai';

      // Extract avatar URL from nested structure
      const avatarUrl =
        account.avatar?.locations?.[0]?.location || '';

      // Build Fan object
      const fan: Fan = {
        id: partnerAccountId,
        name: account.displayName || account.username,
        avatarUrl,
        isOnline: true, // Fansly doesn't provide exact online status
        totalSpent: 0, // Placeholder
        lastSeen: lastMessage.createdAt ? new Date(lastMessage.createdAt * 1000).toISOString() : new Date().toISOString(),
        tags: [],
      };

      // Build last message
      const message: Message = {
        id: lastMessage.id,
        sender,
        content: lastMessage.content || '',
        timestamp: lastMessage.createdAt ? new Date(lastMessage.createdAt * 1000).toISOString() : new Date().toISOString(),
        price: 0,
        isFree: true,
      };

      // Calculate unread count
      // Use unreadCount from data map, or check if last message is unread
      const unreadCount = groupData.unreadCount || (isUnread ? 1 : 0);

      // Final conversation
      const conversation: Conversation = {
        id: group.id, // Use group.id as conversation ID
        fan,
        messages: [message],
        unreadCount,
        lastMessage: lastMessage.content || '',
        lastMessageTimestamp: lastMessage.createdAt ? new Date(lastMessage.createdAt * 1000).toISOString() : new Date().toISOString(),
        accountId: accountId,
      };

      return conversation;
    })
    .filter((c): c is Conversation => c !== null);
}

