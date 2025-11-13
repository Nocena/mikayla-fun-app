import { Button, HStack, Text } from '@chakra-ui/react';
import type { MenuItem } from '../../types';

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ item, isActive, onClick }: SidebarItemProps) => {
  return (
    <Button
      w="100%"
      justifyContent="flex-start"
      bg={isActive ? 'blue.600' : 'transparent'}
      color={isActive ? 'white' : 'gray.300'}
      _hover={{ bg: isActive ? 'blue.600' : 'gray.700' }}
      onClick={onClick}
      aria-label={item.label}
    >
      <HStack spacing={3}>
        <Text fontSize="lg">{item.icon}</Text>
        <Text fontWeight="medium">{item.label}</Text>
      </HStack>
    </Button>
  );
};

