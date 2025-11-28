import {OnlyFansChatsResponse, OnlyFansUsersResponse} from "../../services/onlyfansChatsService";
import {Conversation, Fan, Message} from "../../types/chat";

export function buildConversations(
    chats: OnlyFansChatsResponse,
    users: OnlyFansUsersResponse,
    accountId?: string,
): Conversation[] {
    if (!chats.list || chats.list.length === 0) return [];

    return chats.list.map((entry) => {
        const userId = entry.withUser.id.toString();
        const chatId = entry.id?.toString() || userId; // Use chat.id if available, fallback to userId
        const userInfo = users[userId];

        if (!userInfo || !entry.lastMessage) {
            return null;
        }

        const msg = entry.lastMessage;

        // Determine the sender
        const sender: Message["sender"] = entry.lastMessage?.fromUser?.id == userId ? "fan" : "ai"

        // Build Fan object
        const fan: Fan = {
            id: userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatar,
            isOnline: true, // OF does not give exact online status → default true
            totalSpent: 0,  // Optional placeholder
            lastSeen: msg.createdAt,

            tags: []
        };

        // Build last message
        const message: Message = {
            id: msg.id.toString(),
            sender,
            content: msg.text || "",
            timestamp: msg.createdAt,
            price: 0,
        };

        // Final conversation - use chatId as the conversation id for fetching messages
        const conversation: Conversation = {
            id: chatId,
            fan,
            messages: [message],
            unreadCount: entry.unreadMessagesCount,
            lastMessage: msg.text || "",
            lastMessageTimestamp: msg.createdAt,
            accountId: accountId
        };

        return conversation;
    }).filter((c): c is Conversation => c !== null);
}
