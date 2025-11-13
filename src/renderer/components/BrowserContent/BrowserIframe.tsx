import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface BrowserIframeProps {
  url: string;
}

// Script to capture localStorage and return it
const getLocalStorageScript = `
  (function() {
    try {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key);
        }
      }
      return {
        origin: window.location.origin,
        data: storage
      };
    } catch (error) {
      return {
        origin: window.location.origin,
        data: {},
        error: error.message
      };
    }
  })();
`;

export const BrowserIframe = ({ url }: BrowserIframeProps) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to capture and save localStorage
  const captureLocalStorage = async () => {
    const webview = webviewRef.current;
    if (!webview) return;

    try {
      // Execute script to get localStorage directly from webview
      const result = await webview.executeJavaScript(getLocalStorageScript);
      
      if (result && result.origin && result.data) {
        // Save to main process
        const saveResult = await window.electronAPI.storage.save(
          result.origin,
          result.data
        );
        
        if (saveResult.success) {
          console.log(`LocalStorage captured for ${result.origin}:`, Object.keys(result.data).length, 'items');
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

    const handleDOMReady = () => {
      // Start capturing localStorage periodically
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      
      // Capture immediately
      setTimeout(captureLocalStorage, 1000);
      
      // Capture every 2 seconds
      captureIntervalRef.current = setInterval(captureLocalStorage, 2000);
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
        setTimeout(captureLocalStorage, 500);
      }
    };

    // Add event listeners
    webview.addEventListener('dom-ready', handleDOMReady);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);

    // Cleanup
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      webview.removeEventListener('dom-ready', handleDOMReady);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
    };
  }, [url]);

  return (
    <Box flex={1} overflow="hidden" bg="white" position="relative">
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
    </Box>
  );
};
