import { Box, Heading, VStack, Center } from '@chakra-ui/react';
import type { MenuItem, MenuItemId } from '../../types';
import { SidebarItem } from './SidebarItem.js';
import { Logo } from '../Logo/Logo.js';

interface SidebarProps {
  menuItems: MenuItem[];
  activeItem: MenuItemId;
  onItemClick: (id: MenuItemId) => void;
}

export const Sidebar = ({ menuItems, activeItem, onItemClick }: SidebarProps) => {
  return (
    <Box
      w="200px"
      h="100vh"
      bg="gray.800"
      borderRight="1px"
      borderColor="gray.700"
      display="flex"
      flexDirection="column"
    >
      <Box p={5} borderBottom="1px" borderColor="gray.700">
        <Center>
          <Logo size="md" />
        </Center>
      </Box>
      <VStack spacing={1} p={2} align="stretch" flex={1}>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </VStack>
    </Box>
  );
};

