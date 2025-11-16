import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { BrowserAddressBar } from './BrowserAddressBar.js';
import { BrowserIframe } from './BrowserIframe.js';

interface BrowserContentProps {
  url: string;
  onUrlChange: (url: string) => void;
  platformName?: string;
  userId?: string;
}

export const BrowserContent = ({ url, onUrlChange, platformName, userId }: BrowserContentProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);

  const handleNavigate = (newUrl: string) => {
    const normalizedUrl = normalizeUrl(newUrl);
    setCurrentUrl(normalizedUrl);
    onUrlChange(normalizedUrl);
  };

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
      <BrowserAddressBar url={currentUrl} onNavigate={handleNavigate} />
      <BrowserIframe url={currentUrl} platformName={platformName} userId={userId} />
    </Box>
  );
};

const normalizeUrl = (input: string): string => {
  if (!input || input.trim() === '') {
    return 'about:blank';
  }

  const trimmed = input.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
};

