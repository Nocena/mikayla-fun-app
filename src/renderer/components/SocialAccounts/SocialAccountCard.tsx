import {
  Box,
  Flex,
  Avatar,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from '@chakra-ui/react';
import { toast } from '../../lib/toast';
import { MoreVertical, Trash2, RefreshCw, Power } from 'lucide-react';
import { SocialAccount } from '../../lib/supabase';
import { getPlatformColor, getPlatformLogo } from '../../utils/platform';

interface SocialAccountCardProps {
  account: SocialAccount;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onSync: (id: string) => void;
}

export const SocialAccountCard = ({
  account,
  onDelete,
  onToggleActive,
  onSync,
}: SocialAccountCardProps) => {

  const handleSync = () => {
    onSync(account.id);
    toast({
      title: 'Syncing messages',
      description: `Fetching latest messages from ${account.platform}`,
      status: 'info',
    });
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={5}
      bg="bg.surface"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start">
        <Flex gap={4} align="center" flex={1}>
          <Avatar
            size="lg"
            name={account.platform_username}
            src={account.profile_image_url || undefined}
          />
          <Box flex={1}>
            <Flex gap={2} align="center" mb={1}>
              <Text fontSize="lg" fontWeight="semibold">
                {account.platform_username}
              </Text>
              {getPlatformLogo(account.platform) ? (
                <Image
                  src={getPlatformLogo(account.platform)}
                  alt={account.platform}
                  w="20px"
                  h="20px"
                  objectFit="contain"
                />
              ) : (
                <Badge colorScheme={getPlatformColor(account.platform)}>
                  {account.platform}
                </Badge>
              )}
            </Flex>
            <Text fontSize="sm" color="text.muted">
              {account.is_active ? 'Active' : 'Inactive'}
            </Text>
            {account.last_synced_at && (
              <Text fontSize="xs" color="text.subtle" mt={1}>
                Last synced: {new Date(account.last_synced_at).toLocaleString()}
              </Text>
            )}
          </Box>
        </Flex>

        <Menu>
          <MenuButton
            as={IconButton}
            icon={<MoreVertical size={20} />}
            variant="ghost"
            size="sm"
          />
          <MenuList>
            <MenuItem icon={<RefreshCw size={16} />} onClick={handleSync}>
              Sync Messages
            </MenuItem>
            <MenuItem
              icon={<Power size={16} />}
              onClick={() => onToggleActive(account.id, !account.is_active)}
            >
              {account.is_active ? 'Deactivate' : 'Activate'}
            </MenuItem>
            <MenuItem
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(account.id)}
              color="red.500"
            >
              Remove Account
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};
