import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface BrowserIframeProps {
  url: string;
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

export const BrowserIframe = ({ url }: BrowserIframeProps) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to capture and save cookies and localStorage
  const captureStorage = async () => {
    const webview = webviewRef.current;
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

    const handleDOMReady = () => {
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
    </Box>
  );
};
