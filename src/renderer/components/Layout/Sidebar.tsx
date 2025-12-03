import {
  Box,
  VStack,
  Button,
  Icon,
  Text,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorMode,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  Image,
  Tooltip,
  HStack,
  Badge,
  Checkbox,
  Divider,
} from '@chakra-ui/react';
import {
  MessageSquare,
  Inbox,
  BarChart3,
  Settings,
  Users,
  Bot,
  LogOut,
  ChevronDown,
  MenuIcon,
  Globe,
  RefreshCw,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';
import { getPlatformLogo } from '../../utils/platform';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import logoImage from '../../assets/logo.png';
import logoLightImage from '../../assets/logo-light.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  isCollapsed?: boolean;
}

export const Sidebar = ({
  activeView,
  onViewChange,
  isMobile,
  isOpen,
  onClose,
  onOpen,
  isCollapsed = false,
}: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { accounts: socialAccounts, refresh } = useSocialAccounts();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (socialAccounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts([socialAccounts[0].id]);
    }
  }, [socialAccounts]);

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((id) => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleSync = async (accountIds?: string[]) => {
    const idsToSync = accountIds || selectedAccounts;
    if (idsToSync.length === 0) return;

    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const now = new Date().toISOString();
    for (const accountId of idsToSync) {
      await supabase
        .from('social_accounts')
        .update({ last_synced_at: now })
        .eq('id', accountId);
    }

    await refresh();
    setIsSyncing(false);
  };

  const handleManageAccounts = () => {
    onViewChange('accounts');
    if (isMobile) {
      onClose();
    }
  };

  const getSyncStatus = (lastSync: string | null) => {
    if (!lastSync) return { status: 'error', text: 'Not synced' };
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMins = Math.floor((now.getTime() - syncDate.getTime()) / 60000);
    if (diffMins < 15) return { status: 'success', text: 'Synced' };
    if (diffMins < 60) return { status: 'warning', text: 'Needs sync' };
    return { status: 'error', text: 'Out of sync' };
  };

  const currentAccount = socialAccounts.find(acc => selectedAccounts.includes(acc.id));

  const menuItems = [
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'clients', label: 'Clients', icon: Globe },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'ai-config', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: string) => {
    onViewChange(view);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <VStack spacing={0} align="stretch" h="full">
      <Flex
        p={6}
        align="center"
        justify="center"
        borderBottom="1px"
        borderColor="border.default"
      >
        <Image
          src={colorMode === 'light' ? logoLightImage : logoImage}
          alt="App Logo"
          maxH={isCollapsed ? '32px' : '50px'}
          maxW={isCollapsed ? '48px' : '200px'}
          // light theme: logo-light.png, dark theme: logo.png
        />
      </Flex>

      <VStack spacing={1} p={3} flex={1} align="stretch">
        {menuItems.map((item) => (
          <Tooltip key={item.id} label={isCollapsed ? item.label : undefined} placement="right">
            <Box
              position="relative"
              borderRadius="8px"
              p="1px"
              bgGradient={activeView === item.id ? "linear(to-r, cyan.400, purple.500)" : "transparent"}
              _hover={{
                bgGradient: "linear(to-r, cyan.400, purple.500)",
              }}
              transition="all 0.2s"
            >
              {isCollapsed ? (
                <IconButton
                  aria-label={item.label}
                  icon={<Icon as={item.icon} />}
                  onClick={() => handleNavClick(item.id)}
                  size="lg"
                  w="full"
                  h="56px"
                  borderRadius="7px"
                  bg={colorMode === 'dark' ? 'gray.900' : 'white'}
                  color={activeView === item.id ? (colorMode === 'dark' ? 'white' : 'gray.900') : 'gray.500'}
                  _hover={{
                    bg: colorMode === 'dark' ? 'gray.900' : 'white',
                    color: colorMode === 'dark' ? 'white' : 'gray.900',
                    opacity: 0.9,
                  }}
                  _active={{
                    bg: colorMode === 'dark' ? 'gray.900' : 'white',
                  }}
                />
              ) : (
                <Button
                  leftIcon={<Icon as={item.icon} />}
                  justifyContent="flex-start"
                  variant="ghost"
                  onClick={() => handleNavClick(item.id)}
                  size="lg"
                  fontWeight="medium"
                  w="full"
                  borderRadius="7px"
                  bg={colorMode === 'dark' ? 'gray.900' : 'white'}
                  color={activeView === item.id ? (colorMode === 'dark' ? 'white' : 'gray.900') : 'gray.500'}
                  _hover={{
                    bg: colorMode === 'dark' ? 'gray.900' : 'white',
                    color: colorMode === 'dark' ? 'white' : 'gray.900',
                    opacity: 0.9,
                  }}
                  _active={{
                    bg: colorMode === 'dark' ? 'gray.900' : 'white',
                  }}
                >
                  {item.label}
                </Button>
              )}
            </Box>
          </Tooltip>
        ))}
      </VStack>

      <Box p={4} borderTop="1px" borderColor="border.default">
        <Menu>
          <MenuButton
            as={isCollapsed ? IconButton : Button}
            variant="ghost"
            w="full"
            rightIcon={isCollapsed ? undefined : <ChevronDown size={16} />}
            aria-label="Account menu"
          >
            <Flex align="center" gap={isCollapsed ? 0 : 3} justify={isCollapsed ? 'center' : 'flex-start'}>
              <Avatar size="sm" name={user?.email || undefined} />
              {!isCollapsed && (
                <Box textAlign="left" flex={1} overflow="hidden">
                  <Text fontSize="sm" fontWeight="medium" isTruncated>
                    {user?.email}
                  </Text>
                </Box>
              )}
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<LogOut size={16} />} onClick={signOut}>
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </VStack>
  );

  // Account selection menu component
  const AccountSelectionMenu = () => (
    <Menu closeOnSelect={false}>
      {({ onClose }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            variant="outline"
            size="sm"
            minW="140px"
            maxW="180px"
            justifyContent="space-between"
          >
            <HStack spacing={2} overflow="hidden">
              {selectedAccounts.length > 0 ? (
                <>
                  {selectedAccounts.length === 1 && currentAccount ? (
                    <>
                      <Avatar
                        size="xs"
                        src={currentAccount.profile_image_url || undefined}
                        name={currentAccount.platform_username}
                      />
                      <Text fontSize="xs" fontWeight="medium" isTruncated>
                        {currentAccount.platform_username}
                      </Text>
                    </>
                  ) : (
                    <Text fontSize="xs" fontWeight="medium">
                      {selectedAccounts.length} accounts
                    </Text>
                  )}
                </>
              ) : (
                <Text fontSize="xs" color="gray.500">
                  Select account
                </Text>
              )}
            </HStack>
          </MenuButton>
          <MenuList minW="280px" maxH="400px" overflowY="auto">
            {socialAccounts.length === 0 ? (
              <Box px={4} py={3}>
                <Text fontSize="sm" color="gray.500">
                  No accounts connected
                </Text>
              </Box>
            ) : (
              socialAccounts.map((account) => {
                const syncStatus = getSyncStatus(account.last_synced_at);
                return (
                  <MenuItem
                    key={account.id}
                    closeOnSelect={false}
                    py={3}
                  >
                    <HStack spacing={3} w="full">
                      <Checkbox
                        isChecked={selectedAccounts.includes(account.id)}
                        onChange={() => handleAccountToggle(account.id)}
                        colorScheme="purple"
                      />
                      <Avatar
                        size="sm"
                        src={account.profile_image_url || undefined}
                        name={account.platform_username}
                      />
                      <VStack align="flex-start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {account.platform_username}
                        </Text>
                        <HStack spacing={2}>
                          {getPlatformLogo(account.platform) ? (
                            <Image
                              src={getPlatformLogo(account.platform)}
                              alt={account.platform}
                              w="16px"
                              h="16px"
                              objectFit="contain"
                            />
                          ) : (
                            <Text fontSize="xs" color="gray.500">
                              {account.platform}
                            </Text>
                          )}
                          <Badge
                            colorScheme={
                              syncStatus.status === 'success'
                                ? 'green'
                                : syncStatus.status === 'warning'
                                ? 'orange'
                                : 'red'
                            }
                            fontSize="xs"
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            p={0}
                          />
                        </HStack>
                      </VStack>
                      <Tooltip label="Sync this account">
                        <IconButton
                          aria-label="Sync account"
                          icon={<RefreshCw size={14} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="purple"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSync([account.id]);
                          }}
                          isLoading={isSyncing}
                        />
                      </Tooltip>
                    </HStack>
                  </MenuItem>
                );
              })
            )}
            <Divider />
            <MenuItem
              icon={<Settings size={16} />}
              onClick={() => {
                onClose();
                handleManageAccounts();
              }}
              fontWeight="medium"
            >
              Manage Accounts
            </MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  );

  if (isMobile) {
    return (
      <>
        <Flex
          position="fixed"
          top={0}
          left={0}
          right={0}
          h="60px"
          bg="bg.subtle"
          borderBottom="1px"
          borderColor="border.default"
          align="center"
          justify="space-between"
          px={4}
          zIndex={10}
        >
          <Flex align="center">
            <IconButton
              aria-label="Open menu"
              icon={<MenuIcon size={20} />}
              onClick={onOpen}
              variant="ghost"
              mr={3}
            />
            <Image
              src={colorMode === 'light' ? logoLightImage : logoImage}
              alt="App Logo"
              maxH="40px"
              maxW="150px"
              // light theme: logo-light.png, dark theme: logo.png
            />
          </Flex>
          <HStack spacing={2}>
            <AccountSelectionMenu />
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
            </Tooltip>
          </HStack>
        </Flex>
        <Box h="60px" />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="bg.subtle">
            <DrawerCloseButton />
            <SidebarContent />
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      w={isCollapsed ? '80px' : '260px'}
      h="100vh"
      bg="bg.subtle"
      borderRight="1px"
      borderColor="border.default"
      position="fixed"
      left={0}
      top={0}
    >
      <SidebarContent />
    </Box>
  );
};
