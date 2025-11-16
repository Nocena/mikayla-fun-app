import { createContext, useContext, useState, ReactNode } from 'react';

type ViewId = 'inbox' | 'accounts' | 'clients' | 'ai-config' | 'analytics' | 'settings';

interface NavigationContextType {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<ViewId>('inbox');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  return (
    <NavigationContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedAccountId,
        setSelectedAccountId,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};


