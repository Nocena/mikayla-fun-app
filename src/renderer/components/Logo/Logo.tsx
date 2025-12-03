import { Box, Image, useColorMode } from '@chakra-ui/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Import logos - Vite will handle this and return the URL
// Use dynamic import to handle case where file doesn't exist
let logoUrl: string | undefined;
let logoLightUrl: string | undefined;

// Try to import the logos - this will work once you place logo.png and logo-light.png in src/renderer/assets/
try {
  // @ts-expect-error - Dynamic import for assets
  logoUrl = new URL('../assets/logo.png', import.meta.url).href;
} catch (error) {
  // File doesn't exist yet - will be undefined
  logoUrl = undefined;
}

try {
  // @ts-expect-error - Dynamic import for assets
  logoLightUrl = new URL('../assets/logo-light.png', import.meta.url).href;
} catch (error) {
  // File doesn't exist yet - will be undefined
  logoLightUrl = undefined;
}

export const Logo = ({ size = 'lg' }: LogoProps) => {
  const { colorMode } = useColorMode();
  const sizes = {
    sm: { imageSize: '80px' },
    md: { imageSize: '120px' },
    lg: { imageSize: '180px' },
    xl: { imageSize: '280px' },
  };

  const { imageSize } = sizes[size];
  
  // Choose logo based on theme: light theme uses logo-light.png, dark theme uses logo.png
  const currentLogoUrl = colorMode === 'light' && logoLightUrl ? logoLightUrl : logoUrl;

  // Don't render if logo doesn't exist
  if (!currentLogoUrl) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Image
        src={currentLogoUrl}
        alt="Mikayla Logo"
        maxH={imageSize}
        maxW={imageSize}
        objectFit="contain"
        onError={(e) => {
          // Hide image if it fails to load
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </Box>
  );
};

