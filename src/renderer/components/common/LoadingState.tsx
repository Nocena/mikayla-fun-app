import { Box, Flex, Spinner, VStack, Text, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'minimal';
  showMessage?: boolean;
}

export const LoadingState = ({ 
  message = 'Loading...', 
  variant = 'spinner',
  showMessage = true 
}: LoadingStateProps) => {
  if (variant === 'minimal') {
    return (
      <Flex justify="center" align="center" minH="200px">
        <VStack spacing={4}>
          <Spinner size="lg" color="accent.primary" thickness="3px" speed="0.8s" />
          {showMessage && (
            <Text color="text.muted" fontSize="sm">
              {message}
            </Text>
          )}
        </VStack>
      </Flex>
    );
  }

  if (variant === 'skeleton') {
    return (
      <Box>
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Box key={i} p={4} bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.default">
              <Flex gap={4}>
                <SkeletonCircle size="12" />
                <Box flex={1}>
                  <SkeletonText noOfLines={2} spacing="2" />
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Flex justify="center" align="center" minH="400px">
      <VStack spacing={4}>
        <Spinner 
          size="xl" 
          color="accent.primary" 
          thickness="4px"
          speed="0.8s"
          emptyColor="bg.muted"
        />
        {showMessage && (
          <Text color="text.muted" fontSize="md" fontWeight="medium">
            {message}
          </Text>
        )}
      </VStack>
    </Flex>
  );
};

