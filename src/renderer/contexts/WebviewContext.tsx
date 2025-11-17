import { createContext, useContext, useRef, ReactNode } from 'react';
import { BrowserIframeHandle } from '../components/BrowserContent/BrowserIframe';

interface WebviewContextValue {
  webviewRefs: React.MutableRefObject<Record<string, BrowserIframeHandle | null>>;
}

const WebviewContext = createContext<WebviewContextValue | undefined>(undefined);

export const useWebviews = () => {
  const ctx = useContext(WebviewContext);
  if (!ctx) {
    throw new Error('useWebviews must be used within a WebviewProvider');
  }
  return ctx;
};

export const WebviewProvider = ({ children }: { children: ReactNode }) => {
  const webviewRefs = useRef<Record<string, BrowserIframeHandle | null>>({});

  return (
    <WebviewContext.Provider value={{ webviewRefs }}>
      {children}
    </WebviewContext.Provider>
  );
};

