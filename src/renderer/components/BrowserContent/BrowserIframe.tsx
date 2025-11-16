import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Box, Button, Flex, Spinner, Text, Icon, Link } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { getStorageScript } from '../../scripts/storage';

export type BrowserStatus = 'loading' | 'ready' | 'error';

export interface BrowserIframeHandle {
  reload: () => void;
  setZoomFactor: (factor: number) => void;
  executeScript: (code: string) => Promise<any>;
  executeScripts: (scripts: Array<{ id: string; code: string }>) => Promise<Array<{ id: string; result?: any; error?: string }>>;
}

interface BrowserIframeProps {
  url: string;
  zoomFactor?: number;
  onStatusChange?: (status: BrowserStatus, payload?: { message?: string }) => void;
  platformName?: string;
  userId?: string;
  partitionName?: string;
}


export const BrowserIframe = forwardRef<BrowserIframeHandle, BrowserIframeProps>(
({ url, zoomFactor = 1, onStatusChange, platformName, userId, partitionName: explicitPartitionName }, ref) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const friendlyPlatformName = platformName || 'this page';
  const CHROME_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.161 Safari/537.36';
  const partitionName = explicitPartitionName
    ? explicitPartitionName
    : (platformName && userId ? `persist:${platformName}-${userId}` : 'persist:default');

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
    executeScript: async (code: string) => {
      const webview = webviewRef.current as any;
      if (!webview) throw new Error('webview not ready');
      return webview.executeJavaScript(code);
    },
    executeScripts: async (scripts: Array<{ id: string; code: string }>) => {
      const webview = webviewRef.current as any;
      if (!webview) throw new Error('webview not ready');
      const results: Array<{ id: string; result?: any; error?: string }> = [];
      for (const s of scripts) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = await webview.executeJavaScript(s.code);
          results.push({ id: s.id, result });
          try {
            // Persist each result keyed by partitionName + script id
            await window.electronAPI.scripts.append(`${partitionName}:${s.id}`, { result, at: Date.now() });
          } catch {}
        } catch (e: any) {
          const error = String(e?.message ?? e);
          results.push({ id: s.id, error });
          try {
            await window.electronAPI.scripts.append(`${partitionName}:${s.id}`, { error, at: Date.now() });
          } catch {}
        }
      }
      return results;
    },
  }));

  // Function to capture and save cookies and localStorage
  const captureStorage = async () => {
    const webview = webviewRef.current as any;
    if (!webview) return;

    try {
      // Execute script to get cookies and localStorage from webview
      const result = await webview.executeJavaScript(getStorageScript);
      
      // Persist the entire capture into the centralized script results store
      try {
        await window.electronAPI.scripts.append(`${partitionName}:storage-capture`, {
          at: Date.now(),
          ...result,
        });
      } catch {}
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

    // Ensure the target partition is configured in the main process before traffic
    try {
      // @ts-expect-error: preload typing
      window.electronAPI?.session?.configureChromeLike?.(partitionName, CHROME_UA);
    } catch {}

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

      // Listen for websocket events forwarded from webview preload
      try {
        (webview as any).addEventListener('ipc-message', (e: any) => {
          console.log("BrowserIframe: Received websocket event:", e);
          if (e.channel === 'ws-event' && e.args?.[0]) {
            // lazy init buffer on first use to avoid TS edits above
            (window as any).__wsBuffer = (window as any).__wsBuffer || [];
            (window as any).__wsBuffer.push(e.args[0]);
          }
        });
      } catch {}
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
        key={partitionName}
        ref={webviewRef}
        preload={window.electronAPI?.getWebviewPreloadPath?.()}
        src={url === 'about:blank' ? 'about:blank' : url}
        style={{
          width: '100%',
          height: '100%',
          display: 'inline-flex',
        }}
        allowpopups
        webpreferences="contextIsolation=yes, nodeIntegration=no"
        {...({ partition: partitionName, useragent: CHROME_UA } as any)}
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
