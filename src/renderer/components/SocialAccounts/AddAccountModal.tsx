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

  const platforms = getCreatorPlatforms().map((platform) => ({
    name: platform.name,
    color: platform.colorScheme,
    icon: platformIconMap[platform.key],
  }));

  const handleConnect = (platform: string) => {
    toast({
      title: 'OAuth Integration',
      description: `In production, this would redirect to ${platform} OAuth flow`,
      status: 'info',
    });
    onClose();
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
                key={platform.name}
                w="full"
                size="lg"
                leftIcon={<Icon as={platform.icon} />}
                colorScheme={platform.color}
                onClick={() => handleConnect(platform.name)}
                justifyContent="flex-start"
              >
                <Text ml={2}>Connect {platform.name}</Text>
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
