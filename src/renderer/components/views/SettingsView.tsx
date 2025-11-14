import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, Code, Badge, Spinner } from '@chakra-ui/react';
import { getAllCookies, deleteCookiesForOrigin } from '../../utils/storageUtils.js';

export const SettingsView = () => {
  const [cookiesData, setCookiesData] = useState<Record<string, { url: string; cookies: Record<string, string> }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);

  const loadCookiesData = async () => {
    setLoading(true);
    try {
      const data = await getAllCookies();
      setCookiesData(data);
    } catch (error) {
      console.error('Error loading cookies data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCookiesData();
    // Refresh every 5 seconds to show updates
    const interval = setInterval(loadCookiesData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (origin: string) => {
    const success = await deleteCookiesForOrigin(origin);
    if (success) {
      await loadCookiesData();
      if (selectedOrigin === origin) {
        setSelectedOrigin(null);
      }
    }
  };

  const origins = Object.keys(cookiesData);

  return (
    <Box flex={1} p={10} overflowY="auto">
      <Heading size="xl" mb={5} color="white">
        Settings
      </Heading>

      <Box mb={8}>
        <Heading size="md" mb={3} color="gray.300">
          Captured Cookies Data
        </Heading>
        <Text color="gray.400" fontSize="sm" mb={4}>
          Cookies captured from websites opened in the browser view
        </Text>

        {loading ? (
          <Spinner color="blue.500" />
        ) : origins.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            No cookies captured yet. Open a website in the browser view to capture its cookies.
          </Text>
        ) : (
          <VStack align="stretch" spacing={4}>
            {origins.map((origin) => {
              const data = cookiesData[origin];
              const cookieCount = Object.keys(data?.cookies || {}).length;
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
                      <Badge colorScheme="blue">{cookieCount} cookies</Badge>
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
                  
                  {data?.url && (
                    <Text color="gray.500" fontSize="xs" mb={isSelected ? 2 : 0}>
                      {data.url}
                    </Text>
                  )}

                  {isSelected && data?.cookies && (
                    <Box mt={3} pt={3} borderTop="1px" borderColor="gray.700">
                      <VStack align="stretch" spacing={2}>
                        {Object.entries(data.cookies).map(([key, value]) => (
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

