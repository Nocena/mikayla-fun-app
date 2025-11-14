import {
  Box,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { getCreatorPlatforms } from '../../utils/platform';

interface InboxFiltersProps {
  filters: {
    platform: string;
    status: string;
    sentiment: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const InboxFilters = ({ filters, onFilterChange }: InboxFiltersProps) => {
  const platforms = getCreatorPlatforms();

  return (
    <Box mb={6}>
      <HStack spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={Search} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search messages..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={filters.platform}
          onChange={(e) => onFilterChange('platform', e.target.value)}
        >
          <option value="all">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform.key} value={platform.key}>
              {platform.name}
            </option>
          ))}
        </Select>

        <Select
          maxW="200px"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="unreplied">Unreplied</option>
          <option value="replied">Replied</option>
        </Select>

        <Select
          maxW="200px"
          value={filters.sentiment}
          onChange={(e) => onFilterChange('sentiment', e.target.value)}
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </Select>
      </HStack>
    </Box>
  );
};
