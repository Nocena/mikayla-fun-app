import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Avatar,
  Text,
  Badge,
  VStack,
  HStack,
  Textarea,
  Button,
  Divider,
} from '@chakra-ui/react';
import { toast } from '../../lib/toast';
import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { Message, MessageReply, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message & { social_account?: { platform: string; platform_username: string } };
  replies: MessageReply[];
  onReply: () => void;
}

export const MessageDetailModal = ({
  isOpen,
  onClose,
  message,
  replies,
  onReply,
}: MessageDetailModalProps) => {
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const { user } = useAuth();

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    setSending(true);
    const { error } = await supabase.from('message_replies').insert({
      message_id: message.id,
      social_account_id: message.social_account_id,
      content: replyContent,
      sent_by_ai: false,
      sent_by_user_id: user?.id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: 'Error sending reply',
        description: error.message,
        status: 'error',
      });
    } else {
      await supabase
        .from('messages')
        .update({
          is_replied: true,
          replied_at: new Date().toISOString(),
          replied_by_ai: false,
        })
        .eq('id', message.id);

      toast({
        title: 'Reply sent',
        status: 'success',
      });
      setReplyContent('');
      onReply();
    }
    setSending(false);
  };

  const handleGenerateAIReply = () => {
    setGeneratingAI(true);
    setTimeout(() => {
      const aiReplies = [
        `Thank you for reaching out! I appreciate your message and will get back to you shortly with more details.`,
        `Hi ${message.sender_name}! Thanks for your message. I'd be happy to help you with that.`,
        `Great question! Let me provide you with some information about this.`,
      ];
      setReplyContent(aiReplies[Math.floor(Math.random() * aiReplies.length)]);
      setGeneratingAI(false);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" display="flex" flexDirection="column">
        <ModalHeader>
          <Flex align="center" gap={3}>
            <Avatar
              size="sm"
              name={message.sender_name}
              src={message.sender_avatar_url || undefined}
            />
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                {message.sender_name}
              </Text>
              <HStack spacing={2}>
                <Badge fontSize="xs" colorScheme="blue">
                  {message.social_account?.platform}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  {new Date(message.platform_created_at).toLocaleString()}
                </Text>
              </HStack>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto">
          <VStack spacing={4} align="stretch">
            <Box
              bg="bg.muted"
              _dark={{ bg: 'whiteAlpha.100' }}
              p={4}
              borderRadius="md"
            >
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {message.content}
              </Text>
            </Box>

            {replies.length > 0 && (
              <>
                <Divider />
                <Text fontWeight="semibold" fontSize="sm">
                  Replies ({replies.length})
                </Text>
                {replies.map((reply) => (
                  <Box
                    key={reply.id}
                    bg={reply.sent_by_ai ? 'blue.50' : 'green.50'}
                    _dark={{ bg: reply.sent_by_ai ? 'blue.900' : 'green.900' }}
                    p={4}
                    borderRadius="md"
                  >
                    <Flex justify="space-between" mb={2}>
                      <Badge colorScheme={reply.sent_by_ai ? 'blue' : 'green'}>
                        {reply.sent_by_ai ? 'AI Reply' : 'Manual Reply'}
                      </Badge>
                      <Text fontSize="xs" color="text.muted">
                        {reply.sent_at && new Date(reply.sent_at).toLocaleString()}
                      </Text>
                    </Flex>
                    <Text fontSize="sm">{reply.content}</Text>
                  </Box>
                ))}
              </>
            )}

            <Divider />

            <Box>
              <Text fontWeight="semibold" mb={2}>
                Reply to this message
              </Text>
              <VStack spacing={3}>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                />
                <Flex gap={2} w="full">
                  <Button
                    leftIcon={<Bot size={18} />}
                    onClick={handleGenerateAIReply}
                    isLoading={generatingAI}
                    variant="outline"
                    colorScheme="blue"
                  >
                    Generate AI Reply
                  </Button>
                  <Button
                    leftIcon={<Send size={18} />}
                    colorScheme="blue"
                    onClick={handleSendReply}
                    isLoading={sending}
                    isDisabled={!replyContent.trim()}
                    flex={1}
                  >
                    Send Reply
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
