import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  Text,
  Image,
  Box,
} from '@chakra-ui/react';
import { toast } from '../../lib/toast';
import { getCreatorPlatforms } from '../../utils/platform';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import onlyfansLogo from '../../assets/onlyfans.svg';
import fanslyLogo from '../../assets/fansly.svg';
import patreonLogo from '../../assets/patreon-logo.png';
import heroheroLogo from '../../assets/herohero.svg';

const platformLogoMap: Record<string, string> = {
  onlyfans: onlyfansLogo,
  fansly: fanslyLogo,
  patreon: patreonLogo,
  herohero: heroheroLogo,
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
    logo: platformLogoMap[platform.key],
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
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="bg.canvas" borderColor="border.default" borderWidth="1px">
        <ModalHeader color="text.default">Connect Social Account</ModalHeader>
        <ModalCloseButton color="text.muted" />
        <ModalBody pb={6}>
          <VStack spacing={3}>
            {platforms.map((platform) => (
              <Button
                key={platform.key}
                w="full"
                size="lg"
                bg="bg.subtle"
                color={platform.isEnabled ? 'text.default' : 'text.muted'}
                onClick={() => platform.isEnabled && handleConnect(platform.name, platform.key)}
                isDisabled={!platform.isEnabled}
                justifyContent="flex-start"
                pl={4}
                pr={4}
                py={6}
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="lg"
                transition="all 0.2s"
                _hover={
                  platform.isEnabled
                    ? {
                        bg: 'bg.muted',
                        borderColor: 'border.subtle',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }
                    : {}
                }
                _active={
                  platform.isEnabled
                    ? {
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                      }
                    : {}
                }
                _disabled={{
                  opacity: 0.6,
                  cursor: 'not-allowed',
                  bg: 'bg.subtle',
                }}
              >
                <Box mr={3} w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
                  <Image
                    src={platform.logo}
                    alt={`${platform.name} logo`}
                    maxW="24px"
                    maxH="24px"
                    objectFit="contain"
                    opacity={platform.isEnabled ? 1 : 0.6}
                  />
                </Box>
                <Text fontWeight="medium" fontSize="sm">
                  Connect {platform.name}
                  {!platform.isEnabled ? ' (coming soon)' : ''}
                </Text>
              </Button>
            ))}
          </VStack>
          <Text fontSize="sm" color="text.muted" mt={4} textAlign="center">
            You'll be redirected to authorize access to your account
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
