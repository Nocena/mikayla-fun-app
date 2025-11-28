import { FanslyMessagesResponse } from '../../services/fanslyChatsService';
import { Message, MessageMedia } from '../../types/chat';

/**
 * Extracts media from Fansly message attachments
 */
function extractMedia(message: any): MessageMedia[] {
  if (!message.attachments || !Array.isArray(message.attachments) || message.attachments.length === 0) {
    return [];
  }

  return message.attachments
    .map((attachment: any) => {
      // Fansly attachments structure may vary, adjust based on actual structure
      if (!attachment.url && !attachment.location) {
        return null;
      }

      const url = attachment.url || attachment.location;
      const type = attachment.type || attachment.mimetype?.includes('video') ? 'video' : 'photo';

      return {
        id: attachment.id?.toString() || url,
        type: type as MessageMedia['type'],
        thumbnailUrl: url,
        fullUrl: url,
      };
    })
    .filter((m: any): m is MessageMedia => m !== null);
}

/**
 * Converts Fansly messages response to our Message format
 */
export function buildFanslyMessages(
  messagesResponse: FanslyMessagesResponse,
  modelUserId: string, // The model's user ID to determine sender
): Message[] {
  if (!messagesResponse?.success || !messagesResponse?.response?.messages || !Array.isArray(messagesResponse.response.messages)) {
    return [];
  }

  return messagesResponse.response.messages
    .map((message) => {
      if (!message.createdAt) {
        return null;
      }

      // Determine sender: if senderId matches modelUserId, it's from model/AI, otherwise from fan
      const sender: Message['sender'] = 
        message.senderId === modelUserId ? 'ai' : 'fan';

      const media = extractMedia(message);

      // Convert timestamp: createdAt * 1000 to ISO string
      const timestamp = new Date(message.createdAt * 1000).toISOString();

      const msg: Message = {
        id: message.id,
        sender,
        content: message.content || '',
        timestamp,
        media: media.length > 0 ? media : undefined,
        price: message.totalTipAmount || 0,
        canPurchase: undefined, // Fansly doesn't seem to have this field
        lockedText: undefined, // Fansly doesn't seem to have this field
        isFree: (message.totalTipAmount || 0) === 0,
      };

      return msg;
    })
    .filter((m): m is Message => m !== null)
    .reverse(); // Reverse to show oldest first (API returns newest first)
}

