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
import { Plus, Users, MoreHorizontal, Settings, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AddAccountModal } from '../components/SocialAccounts/AddAccountModal';
import { getPlatformColor, getPlatformLogo } from '../utils/platform';
import { useAccountStatus } from '../contexts/AccountStatusContext';
import { LoadingState } from '../components/common/LoadingState';
import { useSocialAccounts } from '../contexts/SocialAccountsContext';
import { StyledButton } from '../components/common/StyledButton';

export const SocialAccountsView = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { statusById } = useAccountStatus();
  const { accounts, loading, refresh } = useSocialAccounts();

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
      // Refresh the context to update all components
      await refresh();
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
      // Refresh the context to update all components
      await refresh();
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
    // Refresh the context to update all components
    await refresh();
  };

  if (loading) {
    return <LoadingState message="Loading accounts..." variant="skeleton" />;
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
        <StyledButton 
          leftIcon={<Plus size={18} />} 
          onClick={onOpen}
          w="fit-content"
        >
          Link a new Account
        </StyledButton>
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
          <StyledButton 
            onClick={onOpen} 
            mt={4}
          >
            Connect Your First Account
          </StyledButton>
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
                          @{account.platform_user_id}
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
        onAccountAdded={refresh}
      />
    </Box>
  );
};
