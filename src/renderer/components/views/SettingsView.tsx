import { Box, Heading, Text } from '@chakra-ui/react';

export const SettingsView = () => {
  return (
    <Box flex={1} p={10} overflowY="auto">
      <Heading size="xl" mb={5} color="white">
        Settings
      </Heading>
      <Text color="gray.300" fontSize="md" lineHeight="tall">
        Application settings will be displayed here.
      </Text>
    </Box>
  );
};

