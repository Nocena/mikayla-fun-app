import { needSignTimeHeaders } from '../lib/requestHelpers';

const baseUrl = 'https://onlyfans.com';

export type OnlyFansVaultMediaType = 'photo' | 'gif' | 'video' | 'audio';

export interface OnlyFansVaultListEntry {
  id: number;
  type: string;
  name: string;
  hasMedia: boolean;
  videosCount: number;
  photosCount: number;
  gifsCount: number;
  audiosCount: number;
}

export interface OnlyFansVaultListsResponse {
  list: OnlyFansVaultListEntry[];
  all?: {
    videosCount: number;
    photosCount: number;
    gifsCount: number;
    audiosCount: number;
  };
  hasMore?: boolean;
}

export interface OnlyFansVaultMediaFile {
  url: string;
  width?: number;
  height?: number;
}

export interface OnlyFansVaultMediaItem {
  id: number;
  type: OnlyFansVaultMediaType;
  createdAt: string;
  files: {
    full?: OnlyFansVaultMediaFile;
    thumb?: OnlyFansVaultMediaFile;
    preview?: OnlyFansVaultMediaFile;
    squarePreview?: OnlyFansVaultMediaFile;
  };
}

export interface OnlyFansVaultMediaResponse {
  list: OnlyFansVaultMediaItem[];
  hasMore: boolean;
}

interface ScriptParams {
  view?: string;
  offset?: number;
  limit?: number;
  field?: string;
  sort?: string;
  list?: string | number;
}

const buildFetcherScript = (headers: Record<string, string>, subUrl: string) => {
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

export const getVaultListsScript = (
  headers: Record<string, string>,
  userId: string,
  params: ScriptParams = {},
) => {
  const { view = 'main', offset = 0, limit = 15 } = params;
  const subUrl = `/api2/v2/vault/lists?view=${view}&offset=${offset}&limit=${limit}`;
  const updatedHeaders = needSignTimeHeaders(headers, subUrl, userId);
  return buildFetcherScript(updatedHeaders, subUrl);
};

export const getVaultMediaScript = (
  headers: Record<string, string>,
  userId: string,
  params: ScriptParams,
) => {
  const {
    limit = 24,
    offset = 0,
    field = 'recent',
    sort = 'desc',
    list = 'all',
  } = params;
  const subUrl = `/api2/v2/vault/media?limit=${limit}&offset=${offset}&field=${field}&sort=${sort}&list=${list}`;
  const updatedHeaders = needSignTimeHeaders(headers, subUrl, userId);
  return buildFetcherScript(updatedHeaders, subUrl);
};

