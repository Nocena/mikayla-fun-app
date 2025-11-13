import { Box, Image } from '@chakra-ui/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Import logo - Vite will handle this and return the URL
// Use dynamic import to handle case where file doesn't exist
let logoUrl: string | undefined;

// Try to import the logo - this will work once you place logo.png in src/renderer/assets/
try {
  // @ts-expect-error - Dynamic import for assets
  logoUrl = new URL('../assets/logo.png', import.meta.url).href;
} catch (error) {
  // File doesn't exist yet - will be undefined
  logoUrl = undefined;
}

export const Logo = ({ size = 'lg' }: LogoProps) => {
  const sizes = {
    sm: { imageSize: '80px' },
    md: { imageSize: '120px' },
    lg: { imageSize: '180px' },
    xl: { imageSize: '280px' },
  };

  const { imageSize } = sizes[size];

  // Don't render if logo doesn't exist
  if (!logoUrl) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Image
        src={logoUrl}
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

