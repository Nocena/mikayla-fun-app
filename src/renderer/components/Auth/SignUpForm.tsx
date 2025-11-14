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

interface SignUpFormProps {
  onToggleForm: () => void;
}

export const SignUpForm = ({ onToggleForm }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        status: 'error',
      });
    } else {
      toast({
        title: 'Account created successfully!',
        description: 'Welcome!',
        status: 'success',
      });
    }

    setLoading(false);
  };

  return (
    <Box w="full" maxW="400px" mx="auto" bg="bg.surface" p={8} borderRadius="xl" borderWidth="1px" borderColor="border.default">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Create Account
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                bg="bg.muted"
                borderColor="border.default"
              />
            </FormControl>

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
                minLength={6}
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
              Create Account
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" fontSize="sm" color="text.muted">
          Already have an account?{' '}
          <Button variant="link" colorScheme="purple" onClick={onToggleForm}>
            Sign In
          </Button>
        </Text>
      </VStack>
    </Box>
  );
};
