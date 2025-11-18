import { Button, ButtonProps } from '@chakra-ui/react';

export const StyledButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button
      bg="bg.subtle"
      color="text.default"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{
        bg: 'bg.muted',
        borderColor: 'border.subtle',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      _active={{
        transform: 'translateY(0)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      }}
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
        bg: 'bg.subtle',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

