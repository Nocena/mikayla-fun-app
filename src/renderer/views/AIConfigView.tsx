import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  Button,
  
  Card,
  CardBody,
  Text,
  Divider,
  SimpleGrid,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { toast } from '../lib/toast';
import { Bot, Save } from 'lucide-react';
import { supabase, AIConfiguration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const AIConfigView = () => {
  const [config, setConfig] = useState<Partial<AIConfiguration>>({
    is_enabled: true,
    auto_reply_enabled: false,
    response_tone: 'professional',
    custom_instructions: '',
    reply_delay_seconds: 0,
    filter_keywords: { include: [], exclude: [] },
    business_context: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIncludeKeyword, setNewIncludeKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const { user } = useAuth();
  

  useEffect(() => {
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('user_id', user.id)
      .is('social_account_id', null)
      .maybeSingle();

    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const configData = {
      user_id: user.id,
      social_account_id: null,
      ...config,
    };

    const { data: existing } = await supabase
      .from('ai_configurations')
      .select('id')
      .eq('user_id', user.id)
      .is('social_account_id', null)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('ai_configurations')
        .update(configData)
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('ai_configurations').insert(configData));
    }

    if (error) {
      toast({
        title: 'Error saving configuration',
        description: error.message,
        status: 'error',
        
      });
    } else {
      toast({
        title: 'Configuration saved',
        status: 'success',
        
      });
      fetchConfig();
    }
    setSaving(false);
  };

  const addIncludeKeyword = () => {
    if (newIncludeKeyword.trim()) {
      setConfig((prev) => ({
        ...prev,
        filter_keywords: {
          include: [...(prev.filter_keywords?.include || []), newIncludeKeyword.trim()],
          exclude: prev.filter_keywords?.exclude || [],
        },
      }));
      setNewIncludeKeyword('');
    }
  };

  const removeIncludeKeyword = (keyword: string) => {
    setConfig((prev) => ({
      ...prev,
      filter_keywords: {
        include: (prev.filter_keywords?.include || []).filter((k) => k !== keyword),
        exclude: prev.filter_keywords?.exclude || [],
      },
    }));
  };

  const addExcludeKeyword = () => {
    if (newExcludeKeyword.trim()) {
      setConfig((prev) => ({
        ...prev,
        filter_keywords: {
          include: prev.filter_keywords?.include || [],
          exclude: [...(prev.filter_keywords?.exclude || []), newExcludeKeyword.trim()],
        },
      }));
      setNewExcludeKeyword('');
    }
  };

  const removeExcludeKeyword = (keyword: string) => {
    setConfig((prev) => ({
      ...prev,
      filter_keywords: {
        include: prev.filter_keywords?.include || [],
        exclude: (prev.filter_keywords?.exclude || []).filter((k) => k !== keyword),
      },
    }));
  };

  if (loading) {
    return <Text>Loading configuration...</Text>;
  }

  return (
    <Box>
      <Flex mb={8} justify="space-between" align="center">
        <Box>
          <Heading size="lg" display="flex" alignItems="center" gap={2}>
            <Icon as={Bot} />
            AI Assistant Configuration
          </Heading>
          <Text color="gray.600" mt={2}>
            Configure your AI-powered message handling assistant
          </Text>
        </Box>
      </Flex>

      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">General Settings</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Enable AI Assistant</FormLabel>
                  <Switch
                    isChecked={config.is_enabled}
                    onChange={(e) =>
                      setConfig({ ...config, is_enabled: e.target.checked })
                    }
                    colorScheme="blue"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Auto-Reply</FormLabel>
                  <Switch
                    isChecked={config.auto_reply_enabled}
                    onChange={(e) =>
                      setConfig({ ...config, auto_reply_enabled: e.target.checked })
                    }
                    colorScheme="blue"
                    isDisabled={!config.is_enabled}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Response Tone</FormLabel>
                <Select
                  value={config.response_tone}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      response_tone: e.target.value as any,
                    })
                  }
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="custom">Custom</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Reply Delay (seconds)</FormLabel>
                <NumberInput
                  value={config.reply_delay_seconds}
                  onChange={(_, val) =>
                    setConfig({ ...config, reply_delay_seconds: val })
                  }
                  min={0}
                  max={300}
                >
                  <NumberInputField />
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Wait time before sending auto-reply (0 for immediate)
                </Text>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">AI Behavior</Heading>

              <FormControl>
                <FormLabel>Business Context</FormLabel>
                <Textarea
                  value={config.business_context || ''}
                  onChange={(e) =>
                    setConfig({ ...config, business_context: e.target.value })
                  }
                  placeholder="Describe your business, products, services, and any information the AI should know..."
                  rows={4}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Help the AI understand your business to provide better responses
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Custom Instructions</FormLabel>
                <Textarea
                  value={config.custom_instructions || ''}
                  onChange={(e) =>
                    setConfig({ ...config, custom_instructions: e.target.value })
                  }
                  placeholder="Add specific instructions for how the AI should respond..."
                  rows={4}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  E.g., "Always ask for order numbers when handling complaints"
                </Text>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Message Filtering</Heading>

              <FormControl>
                <FormLabel>Include Keywords</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  AI will only respond to messages containing these keywords
                </Text>
                <HStack mb={2}>
                  <Input
                    value={newIncludeKeyword}
                    onChange={(e) => setNewIncludeKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addIncludeKeyword()}
                  />
                  <Button onClick={addIncludeKeyword} colorScheme="blue">
                    Add
                  </Button>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {(config.filter_keywords?.include || []).map((keyword) => (
                    <Tag key={keyword} size="md" colorScheme="blue">
                      <TagLabel>{keyword}</TagLabel>
                      <TagCloseButton onClick={() => removeIncludeKeyword(keyword)} />
                    </Tag>
                  ))}
                  {(config.filter_keywords?.include || []).length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                      No keywords added (AI will respond to all messages)
                    </Text>
                  )}
                </HStack>
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel>Exclude Keywords</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  AI will ignore messages containing these keywords
                </Text>
                <HStack mb={2}>
                  <Input
                    value={newExcludeKeyword}
                    onChange={(e) => setNewExcludeKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addExcludeKeyword()}
                  />
                  <Button onClick={addExcludeKeyword} colorScheme="red">
                    Add
                  </Button>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {(config.filter_keywords?.exclude || []).map((keyword) => (
                    <Tag key={keyword} size="md" colorScheme="red">
                      <TagLabel>{keyword}</TagLabel>
                      <TagCloseButton onClick={() => removeExcludeKeyword(keyword)} />
                    </Tag>
                  ))}
                  {(config.filter_keywords?.exclude || []).length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                      No keywords added
                    </Text>
                  )}
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Button
          leftIcon={<Save size={20} />}
          colorScheme="blue"
          size="lg"
          onClick={handleSave}
          isLoading={saving}
        >
          Save Configuration
        </Button>
      </VStack>
    </Box>
  );
};
