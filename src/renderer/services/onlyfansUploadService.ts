import { needSignTimeHeaders } from '../lib/requestHelpers';

const baseUrl = 'https://onlyfans.com';

export interface UploadSignedCreateResponse {
  putUrl: string;
  getUrl: string;
}

export interface UploadConvertResponse {
  processId: string;
  host: string;
  sourceUrl: string;
  extra: string;
  additional: {
    user: string;
  };
  thumbs?: Array<{
    id: number;
    url: string;
  }>;
}

/**
 * Generates UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extracts main URL without query parameters
 */
function extractMainUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

/**
 * Creates signed upload URL script
 */
export const createSignedUploadUrlScript = (
  headers: Record<string, string>,
  userId: string,
  contentType: string,
  fileName: string,
): string => {
  const uuid = generateUUID();
  const key = `upload/${uuid}/${fileName}`;
  const subUrl = '/api2/v2/upload/signed/create';
  const updatedHeaders = needSignTimeHeaders(headers, subUrl, userId);

  const payload = {
    contentType,
    key,
    parts: 1,
    secure: false,
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
        return { ok: res.ok, status: res.status, data, key: '${key}' };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

/**
 * Uploads file to S3 using PUT request
 * This is done directly from the renderer process, not via webview
 */
export const uploadFileToS3 = async (putUrl: string, file: File): Promise<void> => {
  const response = await fetch(putUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.statusText}`);
  }
};

/**
 * Converts uploaded file via OnlyFans convert API script
 */
export const convertUploadedFileScript = (
  getUrl: string,
  key: string,
  fileName: string,
  userId: string,
): string => {
  const mainUrl = extractMainUrl(getUrl);
  const etag = 'cOuqi6etsttTiQF5yDDOvV8XK7X90Vvb';

  return `
    (async () => {
      try {
        const formData = new FormData();
        formData.append('preset', 'of_beta');
        formData.append('protected_preset', 'of_drm');
        formData.append('preset_png', 'of_png');
        formData.append('isDelay', 'true');
        formData.append('needThumbs', 'true');
        formData.append('additional[user]', '${userId}');
        formData.append('file[ETag]', '${etag}');
        formData.append('file[Location]', '${mainUrl}');
        formData.append('file[Key]', '${key}');
        formData.append('file[name]', '${fileName}');
        formData.append('file[secure]', 'false');
        formData.append('file[Bucket]', 'of2transcoder');
        formData.append('watermark[text]', 'OnlyFans.com/u${userId}');
        formData.append('watermark[position]', 'bottom_right');

        const res = await fetch('https://convert.onlyfans.com/file/upload', {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
          },
          body: formData
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

