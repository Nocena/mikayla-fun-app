import { Box, Stat, StatLabel, StatNumber, StatHelpText, Icon, Flex } from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  icon: LucideIcon;
  colorScheme?: string;
}

export const StatCard = ({ label, value, helpText, icon, colorScheme = 'blue' }: StatCardProps) => {
  const iconBgMap: Record<string, string> = {
    blue: 'icon.blue',
    green: 'icon.green',
    orange: 'icon.orange',
    purple: 'icon.purple',
    red: 'icon.red',
    cyan: 'icon.cyan',
  };

  const iconColorMap: Record<string, string> = {
    blue: 'blue.500',
    green: 'green.500',
    orange: 'orange.500',
    purple: 'purple.500',
    red: 'red.500',
    cyan: 'cyan.500',
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={6}
      bg="bg.surface"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Stat>
          <StatLabel color="text.muted" fontSize="sm" fontWeight="medium">
            {label}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" mt={2}>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="text.subtle">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Box bg={iconBgMap[colorScheme] || 'icon.blue'} p={3} borderRadius="lg">
          <Icon as={icon} w={6} h={6} color={iconColorMap[colorScheme] || 'blue.500'} />
        </Box>
      </Flex>
    </Box>
  );
};
