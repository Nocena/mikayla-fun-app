import { useEffect, useRef } from 'react';
import { SocialAccount } from '../../lib/supabase';
import { BrowserIframe, BrowserIframeHandle } from '../BrowserContent/BrowserIframe';
import { useAccountStatus } from '../../contexts/AccountStatusContext';
import { getPlatformMeta } from '../../utils/platform';

interface AccountWebviewManagerProps {
  accounts: SocialAccount[];
}

export const AccountWebviewManager = ({ accounts }: AccountWebviewManagerProps) => {
  const refs = useRef<Record<string, BrowserIframeHandle | null>>({});
  const { setStatus } = useAccountStatus();

  // Poll /me inside each account's webview to determine sync status
  useEffect(() => {
    const timers: any[] = [];
    // Initialize all accounts as syncing when list changes
    accounts.forEach((acc) => setStatus(acc.id, 'syncing'));

    accounts.forEach((acc) => {
      // For now only handle OnlyFans; extend as needed for other platforms
      if (acc.platform.toLowerCase() !== 'onlyfans') return;

      const partitionName = `persist:${acc.platform}-${acc.id}`;

      const tick = async () => {
        const ref = refs.current[acc.id];
        if (!ref) return;
        try {
          // Read latest captured request headers for this partition from main (may include cookies, x-bc, etc.)
          const hdrRes = await window.electronAPI.headers.get(partitionName);
          const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
          // Filter out forbidden headers for browser fetch (cookie, host, origin, referer, connection, content-length, sec-*, proxy-*)
          const allowedHeaders: Record<string, string> = {};
          Object.entries(rawHeaders).forEach(([k, v]) => {
            const key = String(k);
            if (!/^(cookie|host|origin|referer|connection|content-length|sec-|proxy-)/i.test(key)) {
              allowedHeaders[key] = String(v as any);
            }
          });

          let meRes = null;
          if (Object.keys(allowedHeaders).length > 0) {
            meRes = await ref.executeScript(`
              (async () => {
                try {
                  const headers = ${JSON.stringify(allowedHeaders)};
                  const res = await fetch('https://onlyfans.com/api2/v2/users/me', {
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
          }
          if (meRes && meRes.ok && meRes.data) {
            const isAuth = meRes.data.isAuth === true || meRes.data.is_auth === true;
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


