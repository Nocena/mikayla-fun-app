import { useState } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { AccountStatusProvider } from './contexts/AccountStatusContext';
import { SocialAccountsProvider } from './contexts/SocialAccountsContext';
import { ConversationsProvider } from './contexts/ConversationsContext';
import { WebviewProvider } from './contexts/WebviewContext';
import { GlobalAccountWebviews } from './components/Clients/GlobalAccountWebviews';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { InboxView } from './views/InboxView';
import { SocialAccountsView } from './views/SocialAccountsView';
import { ClientsView } from './views/ClientsView';
import { AIConfigView } from './views/AIConfigView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { Box, Container, Flex, Text, Image, useColorMode } from '@chakra-ui/react';
import theme from './theme';
import logoImage from './assets/logo.png';
import logoLightImage from './assets/logo-light.png';
import {ChatView} from "./views/ChatView";
import { LoadingState } from './components/common/LoadingState';
import { ThemeSync } from './components/common/ThemeSync';

function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);
  const { colorMode } = useColorMode();

  return (
    <Box minH="100vh" bg="bg.subtle" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.sm">
        <Box mb={8} textAlign="center">
          <Image
            src={colorMode === 'light' ? logoLightImage : logoImage}
            alt="App Logo"
            maxH="80px"
            mx="auto"
            mb={4}
            // light theme: logo-light.png, dark theme: logo.png
          />
          <Text color="text.muted" mt={2}>
            Manage all your social media messages with AI assistance
          </Text>
        </Box>
        {showLogin ? (
          <LoginForm onToggleForm={() => setShowLogin(false)} />
        ) : (
          <SignUpForm onToggleForm={() => setShowLogin(true)} />
        )}
      </Container>
    </Box>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { activeView, setActiveView } = useNavigation();
  
  return (
    <>
      <ThemeSync />
      {loading ? (
        <LoadingState message="Loading..." variant="minimal" />
      ) : !user ? (
        <AuthScreen />
      ) : (
        <>
          {/* Global background webviews for all accounts */}
          <GlobalAccountWebviews />
          <MainLayout activeView={activeView} onViewChange={(view) => setActiveView(view as any)}>
            {(() => {
              switch (activeView) {
                case 'inbox':
                  return <InboxView />;
                case 'chat':
                  return <ChatView />;
                case 'accounts':
                  return <SocialAccountsView />;
                case 'clients':
                  return <ClientsView />;
                case 'ai-config':
                  return <AIConfigView />;
                case 'analytics':
                  return <AnalyticsView />;
                case 'settings':
                  return <SettingsView />;
                default:
                  return <SocialAccountsView />;
              }
            })()}
          </MainLayout>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <NavigationProvider>
          <AccountStatusProvider>
            <SocialAccountsProvider>
              <WebviewProvider>
                <ConversationsProvider>
                  <AppContent />
                </ConversationsProvider>
              </WebviewProvider>
            </SocialAccountsProvider>
          </AccountStatusProvider>
        </NavigationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;

