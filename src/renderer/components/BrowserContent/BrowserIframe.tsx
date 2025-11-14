import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface BrowserIframeProps {
  url: string;
}

// Script to capture cookies and return them
const getCookiesScript = `
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
      
      return {
        origin: window.location.origin,
        url: window.location.href,
        cookies: cookies
      };
    } catch (error) {
      return {
        origin: window.location.origin,
        url: window.location.href || '',
        cookies: {},
        error: error.message
      };
    }
  })();
`;

export const BrowserIframe = ({ url }: BrowserIframeProps) => {
  const webviewRef = useRef<WebviewTag | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to capture and save cookies
  const captureCookies = async () => {
    const webview = webviewRef.current;
    if (!webview) return;

    try {
      // Execute script to get cookies directly from webview
      const result = await webview.executeJavaScript(getCookiesScript);
      
      if (result && result.origin && result.cookies) {
        // Save to main process
        const saveResult = await window.electronAPI.cookies.save(
          result.origin,
          result.url,
          result.cookies
        );
        
        if (saveResult.success) {
          console.log(`Cookies captured for ${result.origin}:`, Object.keys(result.cookies).length, 'cookies');
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
      // Start capturing cookies periodically
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      
      // Capture immediately
      setTimeout(captureCookies, 1000);
      
      // Capture every 2 seconds
      captureIntervalRef.current = setInterval(captureCookies, 2000);
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
        setTimeout(captureCookies, 500);
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
