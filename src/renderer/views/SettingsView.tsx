import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  Flex,
  Text,
  Image,
} from '@chakra-ui/react';
import logoImage from '../assets/logo.png';
import { toast } from '../lib/toast';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from '../components/common/LoadingState';

export const SettingsView = () => {
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    email: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else if (!error) {
      setProfile({
        full_name: '',
        email: user.email || '',
        avatar_url: '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        status: 'error',
        
      });
    } else {
      toast({
        title: 'Profile updated',
        status: 'success',
        
      });
      fetchProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return <LoadingState message="Loading settings..." variant="skeleton" />;
  }

  return (
    <Box>
      <Heading size="lg" mb={8}>
        Settings
      </Heading>

      <VStack spacing={6} align="stretch" maxW="600px">
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Profile Information</Heading>

              <Flex justify="center">
                <Avatar
                  size="2xl"
                  name={profile.full_name || profile.email}
                  src={profile.avatar_url || undefined}
                />
              </Flex>

              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={profile.full_name || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={profile.email}
                  isReadOnly
                  bg="bg.muted"
                  _dark={{ bg: 'whiteAlpha.100' }}
                />
                <Text fontSize="xs" color="text.muted" mt={1}>
                  Email cannot be changed
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Avatar URL</FormLabel>
                <Input
                  value={profile.avatar_url || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                />
              </FormControl>

              <Button
                leftIcon={<Save size={20} />}
                colorScheme="blue"
                onClick={handleSave}
                isLoading={saving}
              >
                Save Changes
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">About</Heading>
              <Image
                src={logoImage}
                alt="App Logo"
                maxH="60px"
                maxW="200px"
                mx="auto"
              />
              <Text fontSize="sm" color="gray.600">
                Version 1.0.0
              </Text>
              <Text fontSize="sm" color="gray.600">
                Manage all your social media messages in one place with AI-powered assistance.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
