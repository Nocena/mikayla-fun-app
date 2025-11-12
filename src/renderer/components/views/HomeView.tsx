import { Box, Heading, Text } from '@chakra-ui/react';

export const HomeView = () => {
  return (
    <Box flex={1} p={10} overflowY="auto">
      <Heading size="xl" mb={5} color="white">
        Welcome Home
      </Heading>
      <Text color="gray.300" fontSize="md" lineHeight="tall">
        Select an item from the sidebar to get started.
      </Text>
    </Box>
  );
};

