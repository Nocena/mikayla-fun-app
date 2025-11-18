import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  Text,
  VStack,
  Icon,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from '@chakra-ui/react';
import { toast } from '../lib/toast';
import { Plus, Users, MoreHorizontal, Settings, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase, SocialAccount } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AddAccountModal } from '../components/SocialAccounts/AddAccountModal';
import { getPlatformColor, getPlatformLogo } from '../utils/platform';
import { useAccountStatus } from '../contexts/AccountStatusContext';
import { AccountWebviewManager } from '../components/Clients/AccountWebviewManager';

export const SocialAccountsView = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const { statusById } = useAccountStatus();

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading accounts',
        description: error.message,
        status: 'error',
        
      });
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error removing account',
        description: error.message,
        status: 'error',
        
      });
    } else {
      toast({
        title: 'Account removed',
        status: 'success',
        
      });
      fetchAccounts();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating account',
        description: error.message,
        status: 'error',
        
      });
    } else {
      toast({
        title: isActive ? 'Account activated' : 'Account deactivated',
        status: 'success',
        
      });
      fetchAccounts();
    }
  };

  const handleSync = async (id: string) => {
    toast({
      title: 'Syncing messages',
      status: 'info',
    });
    await supabase
      .from('social_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', id);
    fetchAccounts();
  };

  if (loading) {
    return <Text>Loading accounts...</Text>;
  }

  return (
    <Box position="relative">
      {/* Background webviews for each account to keep sessions and run JS (e.g., /me sync checks) */}
      {/*<AccountWebviewManager accounts={accounts} />*/}
      <Flex mb={6} justify="space-between" align="center">
        <Box>
          <Heading size="lg" mb={1}>Accounts</Heading>
          <Text color="text.muted" fontSize="sm">
            View accounts on the currently selected team
          </Text>
        </Box>
        <Button leftIcon={<Plus size={18} />} colorScheme="blue" onClick={onOpen}>
          Link a new Account
        </Button>
      </Flex>

      {accounts.length === 0 ? (
        <VStack
          spacing={4}
          py={20}
          px={6}
          bg="bg.muted"
          _dark={{ bg: 'gray.800' }}
          borderRadius="lg"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border.default"
        >
          <Icon as={Users} w={16} h={16} color="gray.400" />
          <Heading size="md" color="text.muted">
            No social accounts connected
          </Heading>
          <Text color="text.subtle" textAlign="center">
            Connect your social media accounts to start managing messages in one place
          </Text>
          <Button colorScheme="blue" onClick={onOpen} mt={4}>
            Connect Your First Account
          </Button>
        </VStack>
      ) : (
        <Box
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          overflow="hidden"
          bg="bg.surface"
        >
          <Table variant="simple">
            <Thead bg="bg.muted" _dark={{ bg: 'whiteAlpha.50' }}>
              <Tr>
                <Th color="text.muted" textTransform="none" fontWeight="semibold">Sync</Th>
                <Th color="text.muted" textTransform="none" fontWeight="semibold">Unread</Th>
                <Th color="text.muted" textTransform="none" fontWeight="semibold">Account</Th>
                <Th color="text.muted" textTransform="none" fontWeight="semibold">Plan</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {accounts.map((account) => (
                <Tr key={account.id} _hover={{ bg: 'bg.subtle' }}>
                  <Td>
                    <Flex align="center" gap={2}>
                      <Badge
                        colorScheme={
                          statusById[account.id] === 'synced'
                            ? 'green'
                            : statusById[account.id] === 'lost'
                            ? 'red'
                            : 'yellow'
                        }
                        fontSize="xs"
                      >
                        {statusById[account.id] === 'synced'
                          ? 'Synced'
                          : statusById[account.id] === 'lost'
                          ? 'Sync lost'
                          : 'Syncing...'}
                      </Badge>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex align="center" gap={1}>
                      <Icon as={MessageSquare} boxSize={4} color="text.muted" />
                      <Text fontSize="sm">0</Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex align="center" gap={3}>
                      <Avatar
                        size="sm"
                        name={account.platform_username}
                        src={account.profile_image_url || undefined}
                      />
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm">
                          {account.platform_username}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                          @{account.platform_username}
                        </Text>
                      </Box>
                      {getPlatformLogo(account.platform) ? (
                        <Image
                          src={getPlatformLogo(account.platform)}
                          alt={account.platform}
                          w="20px"
                          h="20px"
                          objectFit="contain"
                        />
                      ) : (
                        <Badge colorScheme={getPlatformColor(account.platform)} fontSize="xs">
                          {account.platform}
                        </Badge>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme="green" fontSize="xs" px={3} py={1}>
                      Pro Trial
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={1} justify="flex-end">
                      <IconButton
                        icon={<MessageSquare size={18} />}
                        aria-label="Messages"
                        variant="ghost"
                        size="sm"
                      />
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Settings size={18} />}
                          variant="ghost"
                          size="sm"
                          aria-label="Settings"
                        />
                        <MenuList>
                          <MenuItem onClick={() => handleSync(account.id)}>
                            Sync Messages
                          </MenuItem>
                          <MenuItem onClick={() => handleToggleActive(account.id, !account.is_active)}>
                            {account.is_active ? 'Deactivate' : 'Activate'}
                          </MenuItem>
                          <MenuItem color="red.500" onClick={() => handleDelete(account.id)}>
                            Remove Account
                          </MenuItem>
                        </MenuList>
                      </Menu>
                      <IconButton
                        icon={<MoreHorizontal size={18} />}
                        aria-label="More options"
                        variant="ghost"
                        size="sm"
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AddAccountModal
        isOpen={isOpen}
        onClose={onClose}
        onAccountAdded={fetchAccounts}
      />
    </Box>
  );
};
