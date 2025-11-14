import { Box, Container, useBreakpointValue } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const MainLayout = ({ children, activeView, onViewChange }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minH="100vh" bg="bg.canvas">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        isMobile={isMobile || false}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />
      <Box ml={{ base: 0, md: '260px' }} minH="100vh">
        <Header onViewChange={onViewChange} />
        <Container maxW="container.xl" py={8} px={{ base: 4, md: 8 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
