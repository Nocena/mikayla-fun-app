import { Box } from '@chakra-ui/react';
import type { MenuItemId } from '../../types';
import { HomeView } from '../views/HomeView.js';
import { BrowserView } from '../views/BrowserView.js';
import { SettingsView } from '../views/SettingsView.js';

interface ContentPanelProps {
  activeItem: MenuItemId;
}

export const ContentPanel = ({ activeItem }: ContentPanelProps) => {
  const renderContent = () => {
    switch (activeItem) {
      case 'home':
        return <HomeView />;
      case 'browser':
        return <BrowserView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <Box flex={1} h="100vh" bg="gray.900" overflow="hidden" display="flex" flexDirection="column">
      {renderContent()}
    </Box>
  );
};

