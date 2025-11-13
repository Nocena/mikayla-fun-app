import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Code, Badge, Spinner } from '@chakra-ui/react';
import { getAllStorage, deleteStorageForOrigin } from '../../utils/storageUtils.js';

export const SettingsView = () => {
  const [storageData, setStorageData] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);

  const loadStorageData = async () => {
    setLoading(true);
    try {
      const data = await getAllStorage();
      setStorageData(data);
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
    // Refresh every 5 seconds to show updates
    const interval = setInterval(loadStorageData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (origin: string) => {
    const success = await deleteStorageForOrigin(origin);
    if (success) {
      await loadStorageData();
      if (selectedOrigin === origin) {
        setSelectedOrigin(null);
      }
    }
  };

  const origins = Object.keys(storageData);

  return (
    <Box flex={1} p={10} overflowY="auto">
      <Heading size="xl" mb={5} color="white">
        Settings
      </Heading>

      <Box mb={8}>
        <Heading size="md" mb={3} color="gray.300">
          Captured LocalStorage Data
        </Heading>
        <Text color="gray.400" fontSize="sm" mb={4}>
          LocalStorage data captured from websites opened in the browser view
        </Text>

        {loading ? (
          <Spinner color="blue.500" />
        ) : origins.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            No localStorage data captured yet. Open a website in the browser view to capture its localStorage.
          </Text>
        ) : (
          <VStack align="stretch" spacing={4}>
            {origins.map((origin) => {
              const data = storageData[origin];
              const itemCount = Object.keys(data).length;
              const isSelected = selectedOrigin === origin;

              return (
                <Box
                  key={origin}
                  p={4}
                  bg="gray.800"
                  borderRadius="md"
                  border="1px"
                  borderColor={isSelected ? 'blue.500' : 'gray.700'}
                  cursor="pointer"
                  onClick={() => setSelectedOrigin(isSelected ? null : origin)}
                >
                  <HStack justify="space-between" mb={isSelected ? 3 : 0}>
                    <HStack>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        {origin}
                      </Text>
                      <Badge colorScheme="blue">{itemCount} items</Badge>
                    </HStack>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(origin);
                      }}
                    >
                      Delete
                    </Button>
                  </HStack>

                  {isSelected && (
                    <Box mt={3} pt={3} borderTop="1px" borderColor="gray.700">
                      <VStack align="stretch" spacing={2}>
                        {Object.entries(data).map(([key, value]) => (
                          <Box key={key} p={2} bg="gray.900" borderRadius="sm">
                            <Text color="gray.400" fontSize="xs" mb={1}>
                              {key}:
                            </Text>
                            <Code
                              colorScheme="green"
                              fontSize="xs"
                              p={2}
                              display="block"
                              whiteSpace="pre-wrap"
                              wordBreak="break-all"
                            >
                              {value}
                            </Code>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

