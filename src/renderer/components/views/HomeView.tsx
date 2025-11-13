import { Box, Heading, Text, VStack, Center } from '@chakra-ui/react';
import { Logo } from '../Logo/Logo.js';

export const HomeView = () => {
  return (
    <Box flex={1} p={10} overflowY="auto" bg="gray.900">
      <Center h="100%" minH="500px">
        <VStack spacing={8} align="center">
          <Logo size="xl" />
          <VStack spacing={4} align="center" maxW="600px">
            <Heading size="lg" color="white" textAlign="center" fontWeight="normal">
              Welcome to Mikayla
            </Heading>
            <Text color="gray.300" fontSize="md" lineHeight="tall" textAlign="center">
              Select an item from the sidebar to get started.
            </Text>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
};

