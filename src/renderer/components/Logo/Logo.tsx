import { Box, Text } from '@chakra-ui/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFull?: boolean;
}

export const Logo = ({ size = 'lg', showFull = true }: LogoProps) => {
  const sizes = {
    sm: { mSize: '2rem', textSize: 'md' },
    md: { mSize: '3rem', textSize: 'lg' },
    lg: { mSize: '4rem', textSize: 'xl' },
    xl: { mSize: '6rem', textSize: '2xl' },
  };

  const { mSize, textSize } = sizes[size];

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {/* Stylized 3D Purple M */}
      <Box
        as="span"
        fontSize={mSize}
        fontWeight="bold"
        color="purple.400"
        style={{
          fontFamily: 'Arial, sans-serif',
          textShadow: `
            2px 2px 0px rgba(139, 92, 246, 0.3),
            4px 4px 0px rgba(139, 92, 246, 0.2),
            6px 6px 0px rgba(139, 92, 246, 0.1),
            0 0 20px rgba(139, 92, 246, 0.5)
          `,
          transform: 'perspective(500px) rotateY(-5deg)',
          display: 'inline-block',
          filter: 'drop-shadow(0 4px 6px rgba(139, 92, 246, 0.4))',
        }}
      >
        M
      </Box>
      
      {/* White "ikayla" text */}
      {showFull && (
        <Text
          fontSize={textSize}
          fontWeight="normal"
          color="white"
          letterSpacing="0.05em"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ikayla
        </Text>
      )}
    </Box>
  );
};

