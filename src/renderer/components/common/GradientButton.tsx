import { Box, Button, ButtonProps, useColorModeValue } from '@chakra-ui/react';

export const GradientButton = ({ children, w = 'full', _hover, _active, ...props }: ButtonProps) => {
  const bg = useColorModeValue('white', 'gray.900');
  const color = useColorModeValue('gray.900', 'white');

  return (
    <Box
      borderRadius="md"
      p="1px"
      bgGradient="linear(to-r, cyan.400, purple.500)"
      w={w}
    >
      <Button
        {...props}
        w="full"
        bg={bg}
        color={color}
        _hover={{
          bg,
          opacity: 0.9,
          ..._hover,
        }}
        _active={{
          bg,
          ..._active,
        }}
      >
        {children}
      </Button>
    </Box>
  );
};

