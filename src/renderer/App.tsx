import { useState } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { AccountStatusProvider } from './contexts/AccountStatusContext';
import { SocialAccountsProvider } from './contexts/SocialAccountsContext';
import { ConversationsProvider } from './contexts/ConversationsContext';
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
import { Box, Container, Flex, Text, Image } from '@chakra-ui/react';
import theme from './theme';
import logoImage from './assets/logo.png';
import {ChatView} from "./views/ChatView";

function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <Box minH="100vh" bg="bg.subtle" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.sm">
        <Box mb={8} textAlign="center">
          <Image
            src={logoImage}
            alt="App Logo"
            maxH="80px"
            mx="auto"
            mb={4}
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

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderView = () => {
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
        return <InboxView />;
    }
  };

  return (
    <>
      {/* Global background webviews for all accounts */}
      <GlobalAccountWebviews />
      <MainLayout activeView={activeView} onViewChange={(view) => setActiveView(view as any)}>
        {renderView()}
      </MainLayout>
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
              <ConversationsProvider>
                <AppContent />
              </ConversationsProvider>
            </SocialAccountsProvider>
          </AccountStatusProvider>
        </NavigationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;

