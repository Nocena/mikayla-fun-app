import { useEffect } from 'react';
import { SocialAccount } from '../../lib/supabase';
import { BrowserIframe, BrowserIframeHandle } from '../BrowserContent/BrowserIframe';
import { useAccountStatus } from '../../contexts/AccountStatusContext';
import { getPlatformMeta } from '../../utils/platform';
import { useAccountChatsPoller } from '../../hooks/useAccountChatsPoller';
import { filterAllowedHeaders } from '../../services/onlyfansChatsService';
import { useWebviews } from '../../contexts/WebviewContext';

interface AccountWebviewManagerProps {
  accounts: SocialAccount[];
}

export const AccountWebviewManager = ({ accounts }: AccountWebviewManagerProps) => {
  const { webviewRefs: refs } = useWebviews();
  const { setStatus } = useAccountStatus();

  // Poll chats and users for synced accounts
  useAccountChatsPoller({ accounts, webviewRefs: refs });

  // Poll /me inside each account's webview to determine sync status
  useEffect(() => {
    const timers: any[] = [];
    // Initialize all accounts as syncing when list changes
    accounts.forEach((acc) => setStatus(acc.id, 'syncing'));

    accounts.forEach((acc) => {
      const platform = acc.platform.toLowerCase();
      // Only handle supported platforms (OnlyFans and Fansly)
      if (platform !== 'onlyfans' && platform !== 'fansly') return;

      const partitionName = `persist:${acc.platform}-${acc.id}`;
      // Use composite key format: partition:platform for header storage
      const headerStorageKey = `${partitionName}:${platform}`;

      // Platform-specific configuration
      const platformConfig = {
        onlyfans: {
          endpoint: 'https://onlyfans.com/api2/v2/users/me',
          checkAuth: (data: any) => data?.isAuth === true || data?.is_auth === true,
        },
        fansly: {
          endpoint: 'https://apiv3.fansly.com/api/v1/account/me',
          checkAuth: (data: any) => data?.success === true && data?.response?.account != null,
        },
      };

      const config = platformConfig[platform as keyof typeof platformConfig];
      if (!config) return;

      const tick = async () => {
        const ref = refs.current[acc.id];
        if (!ref) return;
        try {
          // Read latest captured request headers for this partition:platform from main (may include cookies, x-bc, etc.)
          const hdrRes = await window.electronAPI.headers.get(headerStorageKey);
          const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
          // Filter out forbidden headers for browser fetch (cookie, host, origin, referer, connection, content-length, sec-*, proxy-*)
          const allowedHeaders = filterAllowedHeaders(rawHeaders);
          console.log(`on ${partitionName}`, allowedHeaders)

          let meRes = null;
          if (Object.keys(allowedHeaders).length > 0) {
            meRes = await ref.executeScript(`
              (async () => {
                try {
                  const headers = ${JSON.stringify(allowedHeaders)};
                  const res = await fetch('${config.endpoint}', {
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
            `);
            console.log(`${partitionName} meRes result = `, meRes)
          }
          if (meRes && meRes.ok && meRes.data) {
            const isAuth = config.checkAuth(meRes.data);
            setStatus(acc.id, isAuth ? 'synced' : 'lost');
          } else {
            setStatus(acc.id, 'lost');
          }
        } catch {
          setStatus(acc.id, 'lost');
        }
      };

      // Start polling at a reasonable interval
      console.log(`setInterval on ${partitionName}`)
      const timer = setInterval(tick, 5000);
      timers.push(timer);
      // Kick off an immediate check on mount
      tick();
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [accounts.map(a => a.id).join(',')]);

  return (
    <>
      {accounts.map((acc) => {
        const meta = getPlatformMeta(acc.platform);
        const url = meta?.loginUrl ?? meta?.baseUrl ?? 'about:blank';
        const partitionName = `persist:${acc.platform}-${acc.id}`;

        return (
          <div
            key={acc.id}
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <BrowserIframe
              ref={(instance) => {
                refs.current[acc.id] = instance;
              }}
              url={url}
              platformName={meta?.name}
              partitionName={partitionName}
            />
          </div>
        );
      })}
    </>
  );
};


