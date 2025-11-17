import {Box, Container, useBreakpointValue} from '@chakra-ui/react';
import {ReactNode, useState} from 'react';
import {Sidebar} from './Sidebar';
import {Header} from './Header';

interface MainLayoutProps {
    children: ReactNode;
    activeView: string;
    onViewChange: (view: string) => void;
}

export const MainLayout = ({children, activeView, onViewChange}: MainLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useBreakpointValue({base: true, md: false});
    const isClientsView = activeView === 'clients';
    const isDesktop = isMobile === false;
    const isSidebarCollapsed = isDesktop && isClientsView;

    return (
        <Box minH="100vh" bg="bg.canvas" position="relative">
            <Sidebar
                activeView={activeView}
                onViewChange={onViewChange}
                isMobile={isMobile || false}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpen={() => setIsSidebarOpen(true)}
                isCollapsed={isSidebarCollapsed}
            />
            <Box
                ml={{base: 0, md: isSidebarCollapsed ? '80px' : '260px'}}
                minH="100vh"
                position="relative"
            >
                {!isClientsView && <Header onViewChange={onViewChange}/>}
                {isClientsView ? (
                    <Box h="100vh" position="absolute" top={0} left={0} right={0} bottom={0}>
                        {children}
                    </Box>
                ) : (
                    <Container maxW="container.xl" py={8} px={{base: 4, md: 8}}>
                        {children}
                    </Container>
                )}
            </Box>
        </Box>
    );
};
