import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Text,
  Avatar,
  Badge,
  Icon,
  Heading,
  useDisclosure,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Search,
  Plus,
  AlertCircle,
  UserPlus,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase, SocialAccount } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AddAccountModal } from '../components/SocialAccounts/AddAccountModal';
import { BrowserIframe } from '../components/BrowserContent/BrowserIframe';
import { toast } from '../lib/toast';
import { getPlatformColor, getPlatformUrl } from '../utils/platform';
import { GradientButton } from '../components/common/GradientButton';

export const ClientsView = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAccountsSidebarCollapsed, setIsAccountsSidebarCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const gradientButtonBg = useColorModeValue('white', 'gray.900');
  const gradientButtonColor = useColorModeValue('gray.900', 'white');

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAccounts(
        accounts.filter(
          (account) =>
            account.platform_username.toLowerCase().includes(query) ||
            account.platform.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, accounts]);

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
      setFilteredAccounts(data || []);
    }
    setLoading(false);
  };

  const handleAccountClick = (account: SocialAccount) => {
    setSelectedAccount(account);
  };

  const handleAccountAdded = () => {
    fetchAccounts();
    onClose();
  };

  const getSelectedUrl = (): string => {
    if (!selectedAccount) return '';
    return getPlatformUrl(selectedAccount.platform, selectedAccount.platform_username);
  };

  return (
    <Flex 
      w="100%" 
      h="100vh" 
      bg="bg.canvas"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      {/* Left Sidebar */}
      <Box
        w={isAccountsSidebarCollapsed ? '64px' : '320px'}
        borderRight="1px"
        borderColor="border.default"
        bg="bg.subtle"
        display="flex"
        flexDirection="column"
        h="100vh"
        flexShrink={0}
        position="relative"
      >
        <IconButton
          aria-label={isAccountsSidebarCollapsed ? 'Expand accounts panel' : 'Collapse accounts panel'}
          icon={isAccountsSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          size="sm"
          variant="solid"
          position="absolute"
          top="50%"
          right="-16px"
          transform="translateY(-50%)"
          onClick={() => setIsAccountsSidebarCollapsed((prev) => !prev)}
          zIndex={2}
          bg={gradientButtonBg}
          color={gradientButtonColor}
          borderRadius="full"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="border.default"
        />

        {!isAccountsSidebarCollapsed ? (
          <>
            <Box p={4} borderBottom="1px" borderColor="border.default">
              <Heading size="md" mb={4}>
                Accounts
              </Heading>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="text.muted" />
                </InputLeftElement>
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="bg.surface"
                  borderColor="border.default"
                />
              </InputGroup>
            </Box>

            <VStack
              spacing={2}
              p={4}
              flex={1}
              overflowY="auto"
              align="stretch"
            >
              {loading ? (
                <Text color="text.muted">Loading accounts...</Text>
              ) : filteredAccounts.length === 0 ? (
                <Text color="text.muted" fontSize="sm" textAlign="center" py={8}>
                  {searchQuery ? 'No accounts found' : 'No accounts'}
                </Text>
              ) : (
                filteredAccounts.map((account) => (
                  <Box
                    key={account.id}
                    p={3}
                    borderRadius="md"
                    bg={selectedAccount?.id === account.id ? 'bg.muted' : 'bg.surface'}
                    borderWidth="1px"
                    borderColor={
                      selectedAccount?.id === account.id ? 'blue.500' : 'border.default'
                    }
                    cursor="pointer"
                    onClick={() => handleAccountClick(account)}
                    _hover={{
                      bg: 'bg.muted',
                      borderColor: 'border.subtle',
                    }}
                    transition="all 0.2s"
                  >
                    <Flex align="center" gap={3}>
                      <Avatar
                        size="sm"
                        name={account.platform_username}
                        src={account.profile_image_url || undefined}
                      />
                      <VStack align="flex-start" spacing={0} flex={1} minW={0}>
                        <Text fontSize="sm" fontWeight="semibold" isTruncated>
                          {account.platform_username}
                        </Text>
                        <HStack spacing={2}>
                          {!account.is_active && (
                            <Text fontSize="xs" color="red.500" fontWeight="medium">
                              Sync Lost
                            </Text>
                          )}
                          <Badge
                            colorScheme={getPlatformColor(account.platform)}
                            fontSize="xs"
                          >
                            {account.platform}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>

            <Box p={4} borderTop="1px" borderColor="border.default">
              <GradientButton leftIcon={<Plus size={18} />} onClick={onOpen}>
                Link new account
              </GradientButton>
            </Box>
          </>
        ) : (
          <VStack
            spacing={3}
            p={3}
            flex={1}
            align="center"
            overflowY="auto"
            justify="flex-start"
          >
            {loading ? (
              <Text fontSize="xs" color="text.muted" textAlign="center">
                Loading...
              </Text>
            ) : filteredAccounts.length === 0 ? (
              <Text fontSize="xs" color="text.muted" textAlign="center">
                No accounts
              </Text>
            ) : (
              filteredAccounts.map((account) => (
                <Tooltip
                  key={account.id}
                  label={`${account.platform_username} (${account.platform})`}
                  placement="right"
                >
                  <Box
                    borderWidth={selectedAccount?.id === account.id ? '2px' : '1px'}
                    borderColor={selectedAccount?.id === account.id ? 'blue.500' : 'border.default'}
                    borderRadius="full"
                    p={1}
                    cursor="pointer"
                    onClick={() => handleAccountClick(account)}
                    bg={selectedAccount?.id === account.id ? 'bg.muted' : 'transparent'}
                    transition="all 0.2s"
                  >
                    <Avatar
                      size="sm"
                      name={account.platform_username}
                      src={account.profile_image_url || undefined}
                    />
                  </Box>
                </Tooltip>
              ))
            )}
          </VStack>
        )}
      </Box>

      {/* Right Content Area */}
      <Box 
        flex={1} 
        display="flex" 
        flexDirection="column" 
        overflow="hidden"
        h="100vh"
      >
        {selectedAccount ? (
          // Show webview when account is selected
          <Box 
            display="flex" 
            flexDirection="column" 
            h="100vh"
            flex={1}
          >
            <Box
              p={2}
              bg="bg.muted"
              borderBottom="1px"
              borderColor="border.default"
              flexShrink={0}
            >
              <HStack spacing={2}>
                <Avatar
                  size="xs"
                  name={selectedAccount.platform_username}
                  src={selectedAccount.profile_image_url || undefined}
                />
                <Text fontSize="xs" fontWeight="medium" flex={1} isTruncated>
                  {selectedAccount.platform_username} ({selectedAccount.platform})
                </Text>
                {!selectedAccount.is_active && (
                  <Badge colorScheme="red" fontSize="xs">
                    Sync Lost
                  </Badge>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setSelectedAccount(null)}
                >
                  Close
                </Button>
              </HStack>
            </Box>
            <Box 
              flex={1} 
              overflow="hidden" 
              position="relative"
              minH={0}
              h="100%"
            >
              <BrowserIframe url={getSelectedUrl()} />
            </Box>
          </Box>
        ) : (
          // Default view when no account selected
          <Flex
            flex={1}
            align="center"
            justify="center"
            bg="bg.canvas"
            h="100%"
          >
            <VStack spacing={6} maxW="600px">
              <Heading size="lg" textAlign="center">
                Select Account to Open in the Client
              </Heading>

              {accounts.length > 0 ? (
                <VStack spacing={4} w="100%">
                  {accounts.slice(0, 4).map((account) => (
                    <Box
                      key={account.id}
                      w="100%"
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="border.default"
                      bg="bg.surface"
                      cursor="pointer"
                      onClick={() => handleAccountClick(account)}
                      _hover={{
                        bg: 'bg.muted',
                        borderColor: 'blue.500',
                      }}
                      transition="all 0.2s"
                    >
                      <Flex align="center" gap={4}>
                        <Avatar
                          size="md"
                          name={account.platform_username}
                          src={account.profile_image_url || undefined}
                        />
                        <VStack align="flex-start" spacing={1} flex={1}>
                          <Text fontWeight="semibold" fontSize="md">
                            {account.platform_username}
                          </Text>
                          <HStack spacing={2}>
                            {!account.is_active && (
                              <HStack spacing={1}>
                                <Icon as={AlertCircle} boxSize={3} color="red.500" />
                                <Text fontSize="xs" color="red.500" fontWeight="medium">
                                  Sync Lost
                                </Text>
                              </HStack>
                            )}
                            <Badge
                              colorScheme={getPlatformColor(account.platform)}
                              fontSize="xs"
                            >
                              {account.platform}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="text.muted" textAlign="center">
                  No accounts available. Link a new account to get started.
                </Text>
              )}

              <GradientButton leftIcon={<UserPlus size={18} />} onClick={onOpen} mt={4}>
                Link new Creator to Mikayla
              </GradientButton>

              <Button
                variant="link"
                leftIcon={<HelpCircle size={18} />}
                colorScheme="blue"
                size="sm"
              >
                View the Creator Platform{' '}
              </Button>
            </VStack>
          </Flex>
        )}
      </Box>

      <AddAccountModal
        isOpen={isOpen}
        onClose={onClose}
        onAccountAdded={handleAccountAdded}
      />
    </Flex>
  );
};
