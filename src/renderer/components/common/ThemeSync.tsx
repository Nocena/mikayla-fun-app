import { useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';

/**
 * Syncs CSS variables with Chakra UI theme
 * This ensures Tailwind classes work with both light and dark themes
 */
export const ThemeSync = () => {
  const { colorMode } = useColorMode();

  useEffect(() => {
    const html = document.documentElement;
    
    // Update data-theme attribute for CSS variable selectors
    if (colorMode === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark');
      html.classList.add('chakra-ui-dark');
    } else {
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark');
      html.classList.remove('chakra-ui-dark');
    }
  }, [colorMode]);

  return null;
};

