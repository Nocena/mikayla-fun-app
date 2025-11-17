/**
 * OnlyFans Chats Service
 * Handles fetching chats and users data from OnlyFans API
 */
import {needSignTimeHeaders} from "../lib/requestHelpers";

export interface OnlyFansChat {
  id: number;
  [key: string]: any;
}

export interface OnlyFansChatsResponse {
  list: OnlyFansChat[];
  [key: string]: any;
}

export interface OnlyFansUser {
  id: number;
  [key: string]: any;
}

export interface OnlyFansUsersResponse {
  list: OnlyFansUser[];
  [key: string]: any;
}

const baseUrl = 'https://onlyfans.com'

/**
 * Generates JavaScript code to fetch chats from OnlyFans API
 */
export const getChatsFetchScript = (headers: Record<string, string>, userId: string): string => {
  let subUrl = '/api2/v2/chats?limit=10&offset=0&skip_users=all&order=recent'
  let updatedHeaders = needSignTimeHeaders(headers, subUrl, userId)

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(updatedHeaders)};
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
 * Generates JavaScript code to fetch messages from OnlyFans API
 */
export const getMessagesFetchScript = (headers: Record<string, string>, userId: string, chatId: string | number, limit: number = 50): string => {
  let subUrl = `/api2/v2/chats/${chatId}/messages?limit=${limit}&order=desc&skip_users=all`
  let updatedHeaders = needSignTimeHeaders(headers, subUrl, userId)

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(updatedHeaders)};
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

export interface OnlyFansMessage {
  id: number;
  text: string;
  createdAt: string;
  fromUser: {
    id: number;
  };
  [key: string]: any;
}

export interface OnlyFansMessagesResponse {
  list: OnlyFansMessage[];
  hasMore: boolean;
  [key: string]: any;
}

/**
 * Generates JavaScript code to fetch users list from OnlyFans API
 */
export const getUsersListFetchScript = (headers: Record<string, string>, userId: string, userIds: number[]): string => {
  const queryParams = userIds.map(id => `cl[]=${id}`).join('&');
  const subUrl = `/api2/v2/users/list?${queryParams}`
  let updatedHeaders = needSignTimeHeaders(headers, subUrl, userId)

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(updatedHeaders)};
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
 * Extracts user IDs from chats response
 */
export const extractUserIdsFromChats = (chatsResponse: OnlyFansChatsResponse): number[] => {
  if (!chatsResponse?.list || !Array.isArray(chatsResponse.list)) {
    return [];
  }
  return chatsResponse.list
    .map((chat: OnlyFansChat) => chat.withUser?.id)
    .filter((id: number | undefined): id is number => typeof id === 'number');
};

/**
 * Filters headers to remove forbidden ones for browser fetch
 */
export const filterAllowedHeaders = (rawHeaders: Record<string, any>): Record<string, string> => {
  const allowedHeaders: Record<string, string> = {};
  Object.entries(rawHeaders).forEach(([k, v]) => {
    const key = String(k);
    if (!/^(cookie|host|origin|referer|connection|content-length|sec-|proxy-)/i.test(key)) {
      allowedHeaders[key] = String(v as any);
    }
  });
  return allowedHeaders;
};

export const addUserIdToHeaders = (headers: Record<string, string>, userId: string): Record<string, string> => {
  return {
    ...headers,
    'user-id': userId,
  }
};

/**
 * Generates JavaScript code to send a message to OnlyFans API
 */
export const getSendMessageScript = (
  headers: Record<string, string>, 
  userId: string, 
  chatId: string | number, 
  text: string
): string => {
  const subUrl = `/api2/v2/chats/${chatId}/messages`;
  const updatedHeaders = needSignTimeHeaders(headers, subUrl, userId);
  
  const payload = {
    text: `<p>${text}</p>`,
    lockedText: false,
    mediaFiles: [],
    price: 0,
    previews: [],
    rfTag: [],
    rfGuest: [],
    rfPartner: [],
    isForward: false,
  };

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(updatedHeaders)};
        const payload = ${JSON.stringify(payload)};
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
