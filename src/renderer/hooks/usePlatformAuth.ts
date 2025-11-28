import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSocialAccounts } from '../contexts/SocialAccountsContext';
import { getPlatformAuthConfig, isPlatformAuthSupported } from '../config/platformAuth';
import { filterAllowedHeaders, generateAuthCheckScript, extractUserData } from '../utils/authHelpers';
import { toast } from '../lib/toast';
import type { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';

interface UsePlatformAuthOptions {
  /** Whether linking is in progress */
  linking: boolean;
  /** Pending account being linked */
  pendingAccount: { id: string; platform: string } | null;
  /** Currently selected account (for re-linking) */
  selectedAccount: { id: string; platform: string } | null;
  /** Browser iframe ref for executing scripts */
  browserRef: React.RefObject<BrowserIframeHandle | null>;
  /** Partition name for the session */
  partitionName: string;
  /** Callback when account is successfully linked */
  onAccountLinked?: (accountId: string) => void;
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
}

/**
 * Hook for polling platform authentication during account linking
 * Supports multiple platforms through configuration
 */
export const usePlatformAuth = ({
  linking,
  pendingAccount,
  selectedAccount,
  browserRef,
  partitionName,
  onAccountLinked,
  pollInterval = 2000,
}: UsePlatformAuthOptions) => {
  const { user } = useAuth();
  const { refresh: refreshAccounts } = useSocialAccounts();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only poll if linking is active and we have a pending account
    if (!linking || !pendingAccount) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Check if platform supports authentication
    if (!isPlatformAuthSupported(pendingAccount.platform)) {
      return;
    }

    const authConfig = getPlatformAuthConfig(pendingAccount.platform);
    if (!authConfig) {
      return;
    }

    const tick = async () => {
      try {
        // Read captured headers from main process using composite key format: partition:platform
        const platform = pendingAccount.platform.toLowerCase();
        const headerStorageKey = `${partitionName}:${platform}`;
        const hdrRes = await window.electronAPI.headers.get(headerStorageKey);
        const rawHeaders = (hdrRes.success && hdrRes.data) ? hdrRes.data : {};

        // Filter allowed headers
        const allowedHeaders = filterAllowedHeaders(rawHeaders);

        // Merge with additional platform-specific headers if any
        const headers = {
          ...allowedHeaders,
          ...authConfig.additionalHeaders,
        };

        // Generate and execute auth check script
        const script = generateAuthCheckScript(
          authConfig.authCheckEndpoint,
          authConfig.authCheckMethod,
          headers
        );
        console.log("script", script)

        const meRes = await browserRef.current?.executeScript(script);
        console.log("meRes", meRes)

        // Check if authentication is successful
        if (
          meRes &&
          meRes.ok &&
          meRes.data &&
          authConfig.isAuthenticated(meRes.data)
        ) {
          // Extract user data
          const userData = extractUserData(meRes.data, {
            extractUserId: authConfig.extractUserId,
            extractUsername: authConfig.extractUsername,
            extractAvatar: authConfig.extractAvatar,
          });

          if (!userData.userId || !user) {
            return;
          }

          // Create or update account
          if (pendingAccount) {
            // Create new account
            const { data, error } = await supabase
              .from('social_accounts')
              .insert({
                id: pendingAccount.id,
                user_id: user.id,
                platform: pendingAccount.platform,
                platform_user_id: userData.userId,
                platform_username: userData.username || '',
                profile_image_url: userData.avatar,
                is_active: true,
              })
              .select('id')
              .single();

            if (!error && data?.id) {
              toast({
                title: `${authConfig.extractUsername(meRes.data) || 'Account'} linked`,
                status: 'success',
              });
              await refreshAccounts();
              onAccountLinked?.(data.id);
            } else if (error) {
              console.error('Error creating account:', error);
            }
          } else if (selectedAccount) {
            // Update existing account
            const { error } = await supabase
              .from('social_accounts')
              .update({
                platform_user_id: userData.userId,
                platform_username: userData.username || '',
                profile_image_url: userData.avatar,
                is_active: true,
              })
              .eq('id', selectedAccount.id);

            if (!error) {
              toast({
                title: `${userData.username || 'Account'} linked`,
                status: 'success',
              });
              await refreshAccounts();
              onAccountLinked?.(selectedAccount.id);
            } else {
              console.error('Error updating account:', error);
            }
          }
        }
      } catch (error) {
        // Silently handle errors during polling
        console.debug('Auth polling error:', error);
      }
    };

    // Start polling
    timerRef.current = setInterval(tick, pollInterval);

    // Cleanup on unmount or dependency change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    linking,
    pendingAccount?.id,
    pendingAccount?.platform,
    selectedAccount?.id,
    selectedAccount?.platform,
    partitionName,
    user?.id,
    browserRef,
    onAccountLinked,
    pollInterval,
    refreshAccounts,
  ]);
};

