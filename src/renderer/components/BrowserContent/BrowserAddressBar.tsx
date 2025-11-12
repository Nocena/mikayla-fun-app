import { useState } from 'react';
import { Box, HStack, Input, Button } from '@chakra-ui/react';

interface BrowserAddressBarProps {
  url: string;
  onNavigate: (url: string) => void;
}

export const BrowserAddressBar = ({ url, onNavigate }: BrowserAddressBarProps) => {
  const [inputValue, setInputValue] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(inputValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Box p={2} bg="gray.800" borderBottom="1px" borderColor="gray.700">
      <form onSubmit={handleSubmit}>
        <HStack spacing={2}>
          <Input
            flex={1}
            size="sm"
            bg="gray.700"
            borderColor="gray.600"
            color="gray.300"
            _focus={{ borderColor: 'blue.500', bg: 'gray.900', color: 'white' }}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter URL or search"
          />
          <Button
            type="submit"
            size="sm"
            bg="blue.600"
            color="white"
            _hover={{ bg: 'blue.500' }}
            aria-label="Go"
          >
            →
          </Button>
        </HStack>
      </form>
    </Box>
  );
};

