import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../lib/toast';

interface LoginFormProps {
  onToggleForm: () => void;
}

export const LoginForm = ({ onToggleForm }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
      });
    } else {
      toast({
        title: 'Welcome back!',
        status: 'success',
      });
    }

    setLoading(false);
  };

  return (
    <Box w="full" maxW="400px" mx="auto" bg="bg.surface" p={8} borderRadius="xl" borderWidth="1px" borderColor="border.default">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Sign In
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                bg="bg.muted"
                borderColor="border.default"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                bg="bg.muted"
                borderColor="border.default"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              isLoading={loading}
              mt={4}
              size="lg"
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" fontSize="sm" color="text.muted">
          Don't have an account?{' '}
          <Button variant="link" colorScheme="purple" onClick={onToggleForm}>
            Sign Up
          </Button>
        </Text>
      </VStack>
    </Box>
  );
};
