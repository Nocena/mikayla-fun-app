import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  Icon,
  Text,
} from '@chakra-ui/react';
import { toast } from '../../lib/toast';
import { DollarSign, Heart, Star, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCreatorPlatforms } from '../../utils/platform';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';

const platformIconMap: Record<string, LucideIcon> = {
  onlyfans: DollarSign,
  fansly: Heart,
  patreon: Star,
  herohero: Shield,
};

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

export const AddAccountModal = ({
  isOpen,
  onClose,
  onAccountAdded,
}: AddAccountModalProps) => {
  const { user } = useAuth();
  const { setActiveView, setSelectedAccountId, setPendingAccount } = useNavigation();

  const platforms = getCreatorPlatforms().map((platform) => ({
    key: platform.key,
    name: platform.name,
    color: platform.colorScheme,
    icon: platformIconMap[platform.key],
    isEnabled: platform.key === 'onlyfans',
  }));

  const handleConnect = async (platformName: string, platformKey: string) => {
    if (!user) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to link an account.',
        status: 'error',
      });
      return;
    }

    // Generate a stable UUID to use as the local app's account id and for the webview partition
    const newAccountId =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? (crypto as any).randomUUID()
        : `${platformKey}-${Date.now()}`;

    onClose();
    // Start ephemeral linking flow (no DB insert until we have platform_user_id)
    setPendingAccount({ id: String(newAccountId), platform: platformKey, platformName, platform_username: '' });
    // Ensure no DB account is pre-selected
    setSelectedAccountId(null);
    setActiveView('clients');
    toast({ title: `Opening ${platformName} login...`, status: 'info' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Social Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={3}>
            {platforms.map((platform) => (
              <Button
                key={platform.key}
                w="full"
                size="lg"
                leftIcon={<Icon as={platform.icon} />}
                colorScheme={platform.color}
                onClick={() => platform.isEnabled && handleConnect(platform.name, platform.key)}
                isDisabled={!platform.isEnabled}
                justifyContent="flex-start"
              >
                <Text ml={2}>
                  Connect {platform.name}
                  {!platform.isEnabled ? ' (coming soon)' : ''}
                </Text>
              </Button>
            ))}
          </VStack>
          <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
            You'll be redirected to authorize access to your account
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
