import { useState } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
  const [activeView, setActiveView] = useState('inbox');

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
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </MainLayout>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;

