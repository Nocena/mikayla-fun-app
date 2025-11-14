import { Box, HStack, Button } from '@chakra-ui/react';
import type { BrowserTab } from '../../types';
import { BrowserTabItem } from './BrowserTabItem.js';

interface BrowserTabsProps {
  tabs: BrowserTab[];
  onTabClick: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
}

export const BrowserTabs = ({
  tabs,
  onTabClick,
  onNewTab,
  onCloseTab,
}: BrowserTabsProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      bg="bg.muted"
      borderBottom="1px"
      borderColor="border.default"
      h="36px"
      overflowX="auto"
      overflowY="hidden"
    >
      <HStack spacing={0} flex={1} minW={0}>
        {tabs.map((tab) => (
          <BrowserTabItem
            key={tab.id}
            tab={tab}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onCloseTab(tab.id)}
          />
        ))}
      </HStack>
      <Button
        size="sm"
        w="32px"
        h="32px"
        bg="transparent"
        color="gray.300"
        _hover={{ bg: 'gray.700' }}
        onClick={onNewTab}
        aria-label="New Tab"
        flexShrink={0}
        fontSize="xl"
      >
        +
      </Button>
    </Box>
  );
};

