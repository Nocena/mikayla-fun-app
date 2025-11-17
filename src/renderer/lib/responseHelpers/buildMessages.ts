import { OnlyFansMessagesResponse } from "../../services/onlyfansChatsService";
import { Message } from "../../types/chat";

/**
 * Converts OnlyFans messages response to our Message format
 */
export function buildMessages(
    messagesResponse: OnlyFansMessagesResponse,
    modelUserId: string, // The model's user ID to determine sender
): Message[] {
    if (!messagesResponse?.list || !Array.isArray(messagesResponse.list)) {
        return [];
    }

    return messagesResponse.list
        .map((entry) => {
            if (!entry.text || !entry.createdAt) {
                return null;
            }

            // Determine sender: if fromUser.id matches modelUserId, it's from model, otherwise from fan
            const sender: Message["sender"] = 
                entry.fromUser?.id?.toString() === modelUserId ? "model" : "fan";

            const message: Message = {
                id: entry.id.toString(),
                sender,
                content: entry.text || "",
                timestamp: entry.createdAt
            };

            return message;
        })
        .filter((m): m is Message => m !== null)
        .reverse(); // Reverse to show oldest first (API returns newest first)
}

