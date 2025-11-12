import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface BrowserIframeProps {
  url: string;
}

export const BrowserIframe = ({ url }: BrowserIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && url !== 'about:blank') {
      try {
        iframeRef.current.src = url;
      } catch (error) {
        console.error('Error loading URL:', error);
      }
    }
  }, [url]);

  return (
    <Box flex={1} overflow="hidden" bg="white">
      <Box
        as="iframe"
        ref={iframeRef}
        w="100%"
        h="100%"
        border="none"
        bg="white"
        title="Browser Content"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </Box>
  );
};

