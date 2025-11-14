import {
  Box,
  Flex,
  Avatar,
  Text,
  Badge,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { MessageSquare, Clock } from 'lucide-react';
import { Message } from '../../lib/supabase';

interface MessageCardProps {
  message: Message & { social_account?: { platform: string; platform_username: string } };
  onClick: () => void;
}

export const MessageCard = ({ message, onClick }: MessageCardProps) => {

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'green',
      negative: 'red',
      neutral: 'gray',
    };
    return colors[sentiment] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'yellow',
      low: 'gray',
    };
    return colors[priority] || 'gray';
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={4}
      bg={message.is_read ? 'bg.surface' : 'blue.50'}
      _dark={{ bg: message.is_read ? 'gray.800' : 'blue.900' }}
      cursor="pointer"
      onClick={onClick}
      _hover={{ shadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
    >
      <Flex gap={4}>
        <Avatar
          size="md"
          name={message.sender_name}
          src={message.sender_avatar_url || undefined}
        />
        <Box flex={1} overflow="hidden">
          <Flex justify="space-between" align="start" mb={2}>
            <Box flex={1}>
              <Flex gap={2} align="center" mb={1}>
                <Text fontWeight="semibold" fontSize="md">
                  {message.sender_name}
                </Text>
                {message.sender_username && (
                  <Text fontSize="sm" color="text.subtle">
                    @{message.sender_username}
                  </Text>
                )}
              </Flex>
              <HStack spacing={2}>
                <Badge fontSize="xs" colorScheme="blue">
                  {message.social_account?.platform || 'Unknown'}
                </Badge>
                <Badge fontSize="xs" colorScheme={getSentimentColor(message.sentiment)}>
                  {message.sentiment}
                </Badge>
                {message.priority === 'high' && (
                  <Badge fontSize="xs" colorScheme={getPriorityColor(message.priority)}>
                    High Priority
                  </Badge>
                )}
              </HStack>
            </Box>
            <Flex direction="column" align="flex-end" gap={1}>
              <Text fontSize="xs" color="text.subtle">
                {getRelativeTime(message.platform_created_at)}
              </Text>
              {message.is_replied && (
                <Badge colorScheme="green" fontSize="xs">
                  Replied {message.replied_by_ai && '(AI)'}
                </Badge>
              )}
            </Flex>
          </Flex>

          <Text fontSize="sm" noOfLines={2} color="text.muted">
            {message.content}
          </Text>

          <HStack spacing={4} mt={2}>
            <Flex align="center" gap={1} fontSize="xs" color="text.subtle">
              <MessageSquare size={14} />
              <Text>{message.message_type}</Text>
            </Flex>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};
