// Script to capture cookies and localStorage from within a webview page context.
// Returns an object with origin, url, cookies map, localStorage map, and optional error.
export const getStorageScript = `
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


