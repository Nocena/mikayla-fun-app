import { useCallback } from 'react';
import { SocialAccount } from '../lib/supabase';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';
import { filterAllowedHeaders } from '../services/onlyfansChatsService';
import {
  getPaymentMethodsVatScript,
  OnlyFansPaymentMethodsVatResponse,
} from '../services/onlyfansPaymentsService';

interface UsePaymentMethodsVatProps {
  accounts: SocialAccount[];
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

interface FetchPaymentMethodsVatArgs {
  price: number;
  toUserId: string | number;
  accountId?: string;
}

export const usePaymentMethodsVat = ({ accounts, webviewRefs }: UsePaymentMethodsVatProps) => {
  const fetchPaymentMethodsVat = useCallback(async ({
    price,
    toUserId,
    accountId,
  }: FetchPaymentMethodsVatArgs): Promise<OnlyFansPaymentMethodsVatResponse> => {
    let account: SocialAccount | undefined;

    if (accountId) {
      account = accounts.find((acc) => acc.id === accountId);
    }

    if (!account) {
      account = accounts.find(
        (acc) => acc.platform.toLowerCase() === 'onlyfans' && !!acc.platform_user_id,
      );
    }

    if (!account || !account.platform_user_id) {
      throw new Error('OnlyFans account not available for purchases.');
    }

    const ref = webviewRefs.current[account.id];
    if (!ref) {
      throw new Error('OnlyFans session not ready. Please reopen the account webview.');
    }

    const partitionName = `persist:${account.platform}-${account.id}`;
    const hdrRes = await window.electronAPI.headers.get(partitionName);
    const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
    const allowedHeaders = filterAllowedHeaders(rawHeaders);

    if (Object.keys(allowedHeaders).length === 0) {
      throw new Error('Authentication headers missing for OnlyFans request.');
    }

    const script = getPaymentMethodsVatScript(
      allowedHeaders,
      account.platform_user_id,
      price,
      toUserId,
    );

    const response = await ref.executeScript(script);
    if (!response?.ok || !response.data) {
      const status = response?.status ?? 'unknown';
      throw new Error(`Failed to load payment methods (status ${status}).`);
    }

    return response.data as OnlyFansPaymentMethodsVatResponse;
  }, [accounts, webviewRefs]);

  return { fetchPaymentMethodsVat };
};

