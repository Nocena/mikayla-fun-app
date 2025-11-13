import { useState } from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import type { MenuItemId } from './types';
import { MENU_ITEMS } from './constants/menuItems.js';
import { Sidebar } from './components/Sidebar/Sidebar.js';
import { ContentPanel } from './components/ContentPanel/ContentPanel.js';

export const App = () => {
  const [activeItem, setActiveItem] = useState<MenuItemId>('home');

  return (
    <ChakraProvider>
      <Flex h="100vh" bg="gray.900">
        <Sidebar
          menuItems={MENU_ITEMS}
          activeItem={activeItem}
          onItemClick={setActiveItem}
        />
        <ContentPanel activeItem={activeItem} />
      </Flex>
    </ChakraProvider>
  );
};

