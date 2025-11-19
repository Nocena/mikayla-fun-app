import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Textarea,
  Button,
  Card,
  CardBody,
  Text,
  SimpleGrid,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
  Tooltip,
  Divider,
  Avatar,
} from '@chakra-ui/react';
import { toast } from '../lib/toast';
import {
  Bot,
  Save,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Sparkles,
  MessageSquare,
  UserCircle2,
  Settings2
} from 'lucide-react';
import { supabase, AIConfiguration, AIPersona } from '../lib/supabase';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { StyledButton } from '../components/common/StyledButton';
import { aiPersonasService } from '../services/aiPersonasService';

export const AIConfigView = () => {
  const [config, setConfig] = useState<Partial<AIConfiguration>>({
    is_enabled: true,
    auto_reply_enabled: false,
    response_tone: 'professional',
    custom_instructions: '',
    reply_delay_seconds: 0,
    filter_keywords: { include: [], exclude: [] },
    business_context: '',
    active_persona_id: null,
  });
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIncludeKeyword, setNewIncludeKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const { user } = useAuth();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [configData, personasData] = await Promise.all([
        fetchConfig(),
        aiPersonasService.getPersonas()
      ]);

      if (configData) {
        setConfig(configData);
      }
      setPersonas(personasData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading configuration',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('user_id', user!.id)
      .is('social_account_id', null)
      .maybeSingle();

    if (error) throw error;
    return data;
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
      fetchData();
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
    return <LoadingState message="Initializing Command Center..." variant="skeleton" />;
  }

  return (
    <Box maxW="1600px" mx="auto">
      {/* Header */}
      <Flex mb={8} justify="space-between" align="center">
        <Box>
          <Heading size="lg" display="flex" alignItems="center" gap={3} mb={2}>
            <Icon as={BrainCircuit} className="text-primary" />
            AI Command Center
          </Heading>
          <Text color="gray.500">
            Configure the brain of your digital assistant.
          </Text>
        </Box>
        <HStack spacing={4}>
          <Badge
            colorScheme={config.is_enabled ? 'green' : 'gray'}
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Box w={2} h={2} borderRadius="full" bg={config.is_enabled ? 'green.400' : 'gray.400'} />
            {config.is_enabled ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </Badge>
          <StyledButton
            leftIcon={<Save size={18} />}
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </StyledButton>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>

        {/* LEFT COLUMN - Controls & Personality */}
        <VStack spacing={6} align="stretch">

          {/* Quick Actions */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm">
            <CardBody>
              <Flex align="center" gap={2} mb={4}>
                <Icon as={Zap} size={20} className="text-yellow-500" />
                <Heading size="sm">Quick Actions</Heading>
              </Flex>

              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" p={3} bg="bg.subtle" borderRadius="md">
                  <Box>
                    <Text fontWeight="medium">AI Assistant</Text>
                    <Text fontSize="xs" color="gray.500">Master switch for all AI features</Text>
                  </Box>
                  <Switch
                    isChecked={config.is_enabled}
                    onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                    colorScheme="purple"
                    size="lg"
                  />
                </Flex>

                <Flex justify="space-between" align="center" p={3} bg="bg.subtle" borderRadius="md">
                  <Box>
                    <Text fontWeight="medium">Auto-Reply</Text>
                    <Text fontSize="xs" color="gray.500">Automatically send generated replies</Text>
                  </Box>
                  <Switch
                    isChecked={config.auto_reply_enabled}
                    onChange={(e) => setConfig({ ...config, auto_reply_enabled: e.target.checked })}
                    colorScheme="purple"
                    isDisabled={!config.is_enabled}
                  />
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Personality Hub */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm" flex={1}>
            <CardBody>
              <Flex align="center" gap={2} mb={4}>
                <Icon as={UserCircle2} size={20} className="text-blue-500" />
                <Heading size="sm">Personality Hub</Heading>
              </Flex>

              <VStack spacing={3} align="stretch">
                {personas.map((persona) => {
                  const isActive = config.active_persona_id === persona.id;
                  return (
                    <Box
                      key={persona.id}
                      p={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={isActive ? 'purple.500' : borderColor}
                      bg={isActive ? 'purple.500' : 'transparent'}
                      color={isActive ? 'white' : 'inherit'}
                      cursor="pointer"
                      onClick={() => setConfig({ ...config, active_persona_id: persona.id })}
                      transition="all 0.2s"
                      _hover={{ borderColor: 'purple.400', transform: 'translateY(-1px)' }}
                    >
                      <Flex align="center" justify="space-between">
                        <HStack>
                          <Avatar size="xs" name={persona.name} bg={isActive ? 'whiteAlpha.300' : 'gray.200'} />
                          <Text fontWeight="bold" fontSize="sm">{persona.name}</Text>
                        </HStack>
                        {isActive && <Icon as={Sparkles} size={14} />}
                      </Flex>
                      <Text fontSize="xs" mt={1} opacity={0.8} noOfLines={2}>
                        {persona.description}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* MIDDLE COLUMN - Brain Configuration */}
        <VStack spacing={6} align="stretch" gridColumn={{ xl: "span 2" }}>

          {/* Brain Configuration */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="sm">
            <CardBody>
              <Flex align="center" gap={2} mb={6}>
                <Icon as={Settings2} size={20} className="text-purple-500" />
                <Heading size="sm">Brain Configuration</Heading>
              </Flex>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel display="flex" alignItems="center" gap={2}>
                    <Icon as={BrainCircuit} size={16} />
                    System Prompt Override
                  </FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    Directly override the AI's core instructions. Use this to define specific behaviors, rules, or knowledge.
                  </Text>
                  <Textarea
                    value={config.custom_instructions || ''}
                    onChange={(e) => setConfig({ ...config, custom_instructions: e.target.value })}
                    placeholder="You are a helpful assistant..."
                    rows={15}
                    fontFamily="mono"
                    fontSize="sm"
                    bg="bg.subtle"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                  />
                </FormControl>

                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={MessageSquare} size={16} />
                      Creator Bio & Context
                    </FormLabel>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Provide context about yourself, your content, and your business rules.
                    </Text>
                    <Textarea
                      value={config.business_context || ''}
                      onChange={(e) => setConfig({ ...config, business_context: e.target.value })}
                      placeholder="I am a fitness model..."
                      rows={6}
                      bg="bg.subtle"
                      borderColor={borderColor}
                    />
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={ShieldCheck} size={16} />
                      Safety Layer (Keywords)
                    </FormLabel>

                    <Box mb={4}>
                      <Text fontSize="xs" fontWeight="bold" mb={1} color="green.500">Must Include</Text>
                      <HStack mb={2}>
                        <Input
                          size="sm"
                          value={newIncludeKeyword}
                          onChange={(e) => setNewIncludeKeyword(e.target.value)}
                          placeholder="Add keyword..."
                          onKeyPress={(e) => e.key === 'Enter' && addIncludeKeyword()}
                        />
                        <Button size="sm" onClick={addIncludeKeyword} colorScheme="green" variant="ghost">Add</Button>
                      </HStack>
                      <Flex wrap="wrap" gap={2}>
                        {(config.filter_keywords?.include || []).map((k) => (
                          <Tag key={k} size="sm" colorScheme="green" variant="subtle">
                            <TagLabel>{k}</TagLabel>
                            <TagCloseButton onClick={() => removeIncludeKeyword(k)} />
                          </Tag>
                        ))}
                      </Flex>
                    </Box>

                    <Box>
                      <Text fontSize="xs" fontWeight="bold" mb={1} color="red.500">Must Exclude</Text>
                      <HStack mb={2}>
                        <Input
                          size="sm"
                          value={newExcludeKeyword}
                          onChange={(e) => setNewExcludeKeyword(e.target.value)}
                          placeholder="Add keyword..."
                          onKeyPress={(e) => e.key === 'Enter' && addExcludeKeyword()}
                        />
                        <Button size="sm" onClick={addExcludeKeyword} colorScheme="red" variant="ghost">Add</Button>
                      </HStack>
                      <Flex wrap="wrap" gap={2}>
                        {(config.filter_keywords?.exclude || []).map((k) => (
                          <Tag key={k} size="sm" colorScheme="red" variant="subtle">
                            <TagLabel>{k}</TagLabel>
                            <TagCloseButton onClick={() => removeExcludeKeyword(k)} />
                          </Tag>
                        ))}
                      </Flex>
                    </Box>
                  </FormControl>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};
