import { OnlyFansMessagesResponse } from "../../services/onlyfansChatsService";
import { Message, MessageMedia } from "../../types/chat";

/**
 * Extracts media from OnlyFans message entry
 */
function extractMedia(entry: any): MessageMedia[] {
    if (!entry.media || !Array.isArray(entry.media) || entry.media.length === 0) {
        return [];
    }

    return entry.media
        .map((mediaItem: any) => {
            if (!mediaItem.files?.thumb?.url) {
                return null;
            }

            return {
                id: mediaItem.id.toString(),
                type: (mediaItem.type || 'photo') as MessageMedia['type'],
                thumbnailUrl: mediaItem.files.thumb.url,
                fullUrl: mediaItem.files.full?.url || mediaItem.files.preview?.url || mediaItem.files.thumb.url,
            };
        })
        .filter((m: any): m is MessageMedia => m !== null);
}

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
            // Allow messages with media even if no text
            if (!entry.createdAt) {
                return null;
            }

            // Determine sender: if fromUser.id matches modelUserId, it's from model, otherwise from fan
            const sender: Message["sender"] = 
                entry.fromUser?.id?.toString() === modelUserId ? "ai" : "fan";

            const media = extractMedia(entry);

            const message: Message = {
                id: entry.id.toString(),
                sender,
                content: entry.text || "",
                timestamp: entry.createdAt,
                media: media.length > 0 ? media : undefined,
                price: typeof entry.price === 'number' ? entry.price : 0,
                canPurchase: typeof entry.canPurchase === 'boolean' ? entry.canPurchase : undefined,
                lockedText: typeof entry.lockedText === 'boolean' ? entry.lockedText : undefined,
                isFree: typeof entry.isFree === 'boolean' ? entry.isFree : undefined,
            };

            return message;
        })
        .filter((m): m is Message => m !== null)
        .reverse(); // Reverse to show oldest first (API returns newest first)
}

