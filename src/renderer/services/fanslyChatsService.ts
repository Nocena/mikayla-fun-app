/**
 * Fansly Chats Service
 * Handles fetching conversations (groups) and users data from Fansly API
 */

export interface FanslyGroup {
  id: string;
  account_id: string;
  partnerAccountId: string;
  partnerUsername: string;
  flags: number;
  unreadCount: number;
  subscriptionTierId: string | null;
  lastMessageId: string;
  lastUnreadMessageId: string | null;
  [key: string]: any;
}

export interface FanslyAccount {
  id: string;
  username: string;
  displayName: string | null;
  flags: number;
  avatar?: {
    locations?: Array<{ location: string }>;
  };
  [key: string]: any;
}

export interface FanslyLastMessage {
  id: string;
  type: number;
  content: string;
  groupId: string;
  senderId: string;
  createdAt: number;
  interactions?: Array<{
    userId: string;
    readAt?: number;
    deliveredAt?: number;
  }>;
  [key: string]: any;
}

export interface FanslyGroupsResponse {
  success: boolean;
  response: {
    data: FanslyGroup[];
    aggregationData: {
      accounts: FanslyAccount[];
      groups: Array<{
        id: string;
        lastMessage?: FanslyLastMessage;
        [key: string]: any;
      }>;
    };
  };
}

const baseUrl = 'https://apiv3.fansly.com';

/**
 * Generates JavaScript code to fetch conversation groups from Fansly API
 */
export const getGroupsFetchScript = (
  headers: Record<string, string>,
  limit: number = 20,
  offset: number = 0
): string => {
  const subUrl = `/api/v1/messaging/groups?sortOrder=1&flags=0&subscriptionTierId=&listIds=&search=&limit=${limit}&offset=${offset}&ngsw-bypass=true`;

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(headers)};
        const res = await fetch('${baseUrl}${subUrl}', {
          method: 'GET',
          credentials: 'include',
          headers
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

export interface FanslyMessage {
  id: string;
  type: number;
  dataVersion: number;
  content: string;
  groupId: string;
  senderId: string;
  correlationId: string;
  inReplyTo: string | null;
  inReplyToRoot: string | null;
  createdAt: number;
  attachments: any[];
  embeds: any[];
  interactions?: Array<{
    userId: string;
    readAt?: number;
    deliveredAt?: number;
  }>;
  likes: any[];
  totalTipAmount: number;
  [key: string]: any;
}

export interface FanslyMessagesResponse {
  success: boolean;
  response: {
    messages: FanslyMessage[];
    accountMedia: any[];
    accountMediaBundles: any[];
    tips: any[];
    tipGoals: any[];
    accountMediaOrders: any[];
    stories: any[];
    storyOrders: any[];
  };
}

/**
 * Generates JavaScript code to mark Fansly messages as read
 * by calling the message ack endpoint with unread message IDs.
 */
export const getFanslyMarkMessagesReadScript = (
  headers: Record<string, string>,
  messageIds: string[],
): string => {
  const subUrl = `/api/v1/message/ack?ngsw-bypass=true`;

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(headers)};
        const payload = {
          messageIds: ${JSON.stringify(messageIds)},
          type: 2
        };
        const res = await fetch('${baseUrl}${subUrl}', {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

/**
 * Generates JavaScript code to fetch messages from Fansly API
 */
export const getFanslyMessagesFetchScript = (
  headers: Record<string, string>,
  groupId: string,
  limit: number = 25
): string => {
  const subUrl = `/api/v1/message?groupId=${groupId}&limit=${limit}&ngsw-bypass=true`;

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(headers)};
        const res = await fetch('${baseUrl}${subUrl}', {
          method: 'GET',
          credentials: 'include',
          headers
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

/**
 * Generates JavaScript code to send a message to Fansly API
 */
export const getFanslySendMessageScript = (
  headers: Record<string, string>,
  groupId: string,
  text: string,
  options?: {
    attachments?: any[];
    inReplyTo?: string | null;
  }
): string => {
  const subUrl = `/api/v1/message?ngsw-bypass=true`;

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(headers)};
        // Get current timestamp in seconds at execution time
        const createdAt = Date.now() / 1000;
        const payload = {
          type: 1,
          attachments: ${JSON.stringify(options?.attachments || [])},
          likes: [],
          content: ${JSON.stringify(text)},
          groupId: ${JSON.stringify(groupId)},
          scheduledFor: 0,
          inReplyTo: ${options?.inReplyTo ? JSON.stringify(options.inReplyTo) : 'null'},
          createdAt: createdAt,
        };
        const res = await fetch('${baseUrl}${subUrl}', {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

