import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewId = 'inbox' | 'chat' | 'accounts' | 'clients' | 'ai-config' | 'analytics' | 'settings';

interface NavigationContextType {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  pendingAccount: { id: string; platform: string; platformName?: string; platform_username?: string } | null;
  setPendingAccount: (acc: { id: string; platform: string; platformName?: string; platform_username?: string } | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within an AuthProvider');
  }
  return ctx;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<ViewId>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [pendingAccount, setPendingAccount] = useState<{ id: string; platform: string; platformName?: string; platform_username?: string } | null>(null);

  useEffect(() => {
    if (activeView !== 'clients' && pendingAccount) {
      setPendingAccount(null);
    }
  }, [activeView, pendingAccount]);

  return (
    <NavigationContext.Provider
      value={{
        activeView: activeView,
        setActiveView: setActiveView,
        selectedAccountId,
        setSelectedAccountId,
        pendingAccount,
        setPendingAccount,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};


