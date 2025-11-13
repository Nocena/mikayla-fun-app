import { Box, HStack, Text, IconButton } from '@chakra-ui/react';
import type { BrowserTab } from '../../types';

interface BrowserTabItemProps {
  tab: BrowserTab;
  onClick: () => void;
  onClose: () => void;
}

export const BrowserTabItem = ({ tab, onClick, onClose }: BrowserTabItemProps) => {
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      px={3}
      bg={tab.isActive ? 'gray.900' : 'gray.800'}
      borderRight="1px"
      borderColor="gray.700"
      cursor="pointer"
      minW="120px"
      maxW="240px"
      h="32px"
      _hover={{ bg: tab.isActive ? 'gray.900' : 'gray.700' }}
      borderBottom={tab.isActive ? '2px solid' : 'none'}
      borderBottomColor={tab.isActive ? 'blue.500' : 'transparent'}
      onClick={onClick}
      userSelect="none"
    >
      <Text
        flex={1}
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        fontSize="xs"
        color={tab.isActive ? 'white' : 'gray.300'}
        title={tab.url}
      >
        {tab.title || 'New Tab'}
      </Text>
      <IconButton
        size="xs"
        w="18px"
        h="18px"
        minW="18px"
        bg="transparent"
        color="gray.300"
        _hover={{ bg: 'gray.700', color: 'white' }}
        onClick={handleCloseClick}
        aria-label="Close tab"
        icon={<Text fontSize="sm">×</Text>}
      />
    </Box>
  );
};

