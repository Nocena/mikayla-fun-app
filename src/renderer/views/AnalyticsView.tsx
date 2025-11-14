import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Select,
  HStack,
  Text,
  VStack,
  Card,
  CardBody,
  Flex,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { toast } from '../lib/toast';
import {
  MessageSquare,
  Send,
  Bot,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
} from 'lucide-react';
import { supabase, Analytics, SocialAccount } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/Analytics/StatCard';

export const AnalyticsView = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedAccount, dateRange, accounts]);

  const fetchAccounts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error loading accounts',
        description: error.message,
        status: 'error',
        
      });
    } else {
      setAccounts(data || []);
    }
  };

  const fetchAnalytics = async () => {
    if (accounts.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    let query = supabase
      .from('analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (selectedAccount !== 'all') {
      query = query.eq('social_account_id', selectedAccount);
    } else {
      const accountIds = accounts.map((a) => a.id);
      query = query.in('social_account_id', accountIds);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error loading analytics',
        description: error.message,
        status: 'error',
        
      });
    } else {
      setAnalytics(data || []);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    if (analytics.length === 0) {
      return {
        totalMessages: 0,
        totalReplies: 0,
        aiReplies: 0,
        manualReplies: 0,
        avgResponseTime: 0,
        positiveSentiment: 0,
        negativeSentiment: 0,
        neutralSentiment: 0,
      };
    }

    return {
      totalMessages: analytics.reduce((sum, a) => sum + a.messages_received, 0),
      totalReplies: analytics.reduce((sum, a) => sum + a.messages_replied, 0),
      aiReplies: analytics.reduce((sum, a) => sum + a.ai_replies, 0),
      manualReplies: analytics.reduce((sum, a) => sum + a.manual_replies, 0),
      avgResponseTime: Math.round(
        analytics.reduce((sum, a) => sum + a.avg_response_time_minutes, 0) / analytics.length
      ),
      positiveSentiment: analytics.reduce((sum, a) => sum + a.positive_sentiment_count, 0),
      negativeSentiment: analytics.reduce((sum, a) => sum + a.negative_sentiment_count, 0),
      neutralSentiment: analytics.reduce((sum, a) => sum + a.neutral_sentiment_count, 0),
    };
  };

  const stats = calculateStats();
  const replyRate = stats.totalMessages > 0
    ? Math.round((stats.totalReplies / stats.totalMessages) * 100)
    : 0;

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={8} justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Heading size="lg">Analytics Dashboard</Heading>
        <HStack spacing={4} flexWrap="wrap">
          <Select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            maxW="250px"
            bg="bg.surface"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.platform} - {account.platform_username}
              </option>
            ))}
          </Select>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            maxW="200px"
            bg="bg.surface"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </HStack>
      </Flex>

      {accounts.length === 0 ? (
        <VStack
          spacing={4}
          py={20}
          px={6}
          bg="bg.subtle"
          borderRadius="lg"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border.subtle"
        >
          <Icon as={Users} w={16} h={16} color="text.muted" />
          <Heading size="md" color="text.muted">
            No analytics available
          </Heading>
          <Text color="text.subtle" textAlign="center">
            Connect social accounts to start tracking analytics
          </Text>
        </VStack>
      ) : (
        <VStack spacing={8} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              label="Total Messages"
              value={stats.totalMessages}
              helpText={`${dateRange} days`}
              icon={MessageSquare}
              colorScheme="blue"
            />
            <StatCard
              label="Total Replies"
              value={stats.totalReplies}
              helpText={`${replyRate}% reply rate`}
              icon={Send}
              colorScheme="green"
            />
            <StatCard
              label="AI Replies"
              value={stats.aiReplies}
              helpText={`${stats.manualReplies} manual`}
              icon={Bot}
              colorScheme="purple"
            />
            <StatCard
              label="Avg Response Time"
              value={`${stats.avgResponseTime}m`}
              helpText="Minutes"
              icon={Clock}
              colorScheme="orange"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg="bg.surface">
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box>
                    <Text fontSize="sm" color="text.muted" fontWeight="medium">
                      Positive Sentiment
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {stats.positiveSentiment}
                    </Text>
                  </Box>
                  <Box bg="icon.green" p={3} borderRadius="lg">
                    <Icon as={TrendingUp} w={6} h={6} color="green.500" />
                  </Box>
                </Flex>
                <Text fontSize="xs" color="text.subtle">
                  {stats.totalMessages > 0
                    ? `${Math.round((stats.positiveSentiment / stats.totalMessages) * 100)}% of total`
                    : 'No messages'}
                </Text>
              </CardBody>
            </Card>

            <Card bg="bg.surface">
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box>
                    <Text fontSize="sm" color="text.muted" fontWeight="medium">
                      Neutral Sentiment
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                      {stats.neutralSentiment}
                    </Text>
                  </Box>
                  <Box bg="icon.gray" p={3} borderRadius="lg">
                    <Icon as={Minus} w={6} h={6} color="gray.500" />
                  </Box>
                </Flex>
                <Text fontSize="xs" color="text.subtle">
                  {stats.totalMessages > 0
                    ? `${Math.round((stats.neutralSentiment / stats.totalMessages) * 100)}% of total`
                    : 'No messages'}
                </Text>
              </CardBody>
            </Card>

            <Card bg="bg.surface">
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box>
                    <Text fontSize="sm" color="text.muted" fontWeight="medium">
                      Negative Sentiment
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">
                      {stats.negativeSentiment}
                    </Text>
                  </Box>
                  <Box bg="icon.red" p={3} borderRadius="lg">
                    <Icon as={TrendingDown} w={6} h={6} color="red.500" />
                  </Box>
                </Flex>
                <Text fontSize="xs" color="text.subtle">
                  {stats.totalMessages > 0
                    ? `${Math.round((stats.negativeSentiment / stats.totalMessages) * 100)}% of total`
                    : 'No messages'}
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card bg="bg.surface">
            <CardBody>
              <Heading size="sm" mb={4}>
                Quick Insights
              </Heading>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" p={3} bg="bg.subtle" borderRadius="md">
                  <Text fontSize="sm">Reply Rate</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {replyRate}%
                  </Text>
                </Flex>
                <Flex justify="space-between" p={3} bg="bg.subtle" borderRadius="md">
                  <Text fontSize="sm">AI Automation Rate</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {stats.totalReplies > 0
                      ? `${Math.round((stats.aiReplies / stats.totalReplies) * 100)}%`
                      : '0%'}
                  </Text>
                </Flex>
                <Flex justify="space-between" p={3} bg="bg.subtle" borderRadius="md">
                  <Text fontSize="sm">Positive Sentiment Rate</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {stats.totalMessages > 0
                      ? `${Math.round((stats.positiveSentiment / stats.totalMessages) * 100)}%`
                      : '0%'}
                  </Text>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      )}
    </Box>
  );
};
