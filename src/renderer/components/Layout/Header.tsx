import {
  Box,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Badge,
  Avatar,
  HStack,
  useColorMode,
  Tooltip,
  Checkbox,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { Moon, Sun, ChevronDown, RefreshCw, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SocialAccount {
  id: string;
  platform: string;
  platform_username: string;
  profile_image_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
}

interface HeaderProps {
  onViewChange?: (view: string) => void;
}

export const Header = ({ onViewChange }: HeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSocialAccounts();
    }
  }, [user]);

  const fetchSocialAccounts = async () => {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSocialAccounts(data);
      if (data.length > 0 && selectedAccounts.length === 0) {
        setSelectedAccounts([data[0].id]);
        setLastSyncTime(data[0].last_synced_at);
      }
    }
  };

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

    setLastSyncTime(now);
    await fetchSocialAccounts();
    setIsSyncing(false);
  };

  const handleManageAccounts = () => {
    if (onViewChange) {
      onViewChange('accounts');
    }
  };

  const getTimeSinceSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never synced';

    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
  const currentSyncStatus = currentAccount ? getSyncStatus(currentAccount.last_synced_at) : null;

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={5}
      bg="bg.subtle"
      borderBottom="1px"
      borderColor="border.default"
      px={6}
      py={4}
    >
      <Flex justify="flex-end" align="center" gap={4}>
        <Menu closeOnSelect={false}>
          {({ onClose }) => (
            <>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDown size={16} />}
                variant="outline"
                size="md"
                minW="200px"
                justifyContent="space-between"
              >
                <HStack spacing={2}>
                  {selectedAccounts.length > 0 ? (
                    <>
                      {selectedAccounts.length === 1 && currentAccount ? (
                        <>
                          <Avatar
                            size="xs"
                            src={currentAccount.profile_image_url || undefined}
                            name={currentAccount.platform_username}
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {currentAccount.platform_username}
                          </Text>
                        </>
                      ) : (
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAccounts.length} accounts
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Select account
                    </Text>
                  )}
                </HStack>
              </MenuButton>
              <MenuList minW="320px" maxH="400px" overflowY="auto">
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
                              <Text fontSize="xs" color="gray.500">
                                {account.platform}
                              </Text>
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

        <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};
