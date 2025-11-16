import { createContext, useContext, useState, ReactNode } from 'react';

type SyncStatus = 'syncing' | 'synced' | 'lost';

interface AccountStatusContextValue {
  statusById: Record<string, SyncStatus>;
  setStatus: (id: string, status: SyncStatus) => void;
}

const AccountStatusContext = createContext<AccountStatusContextValue | undefined>(undefined);

export const useAccountStatus = () => {
  const ctx = useContext(AccountStatusContext);
  if (!ctx) {
    throw new Error('useAccountStatus must be used within an AccountStatusProvider');
  }
  return ctx;
};

export const AccountStatusProvider = ({ children }: { children: ReactNode }) => {
  const [statusById, setStatusById] = useState<Record<string, SyncStatus>>({});

  const setStatus = (id: string, status: SyncStatus) => {
    setStatusById((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <AccountStatusContext.Provider value={{ statusById, setStatus }}>
      {children}
    </AccountStatusContext.Provider>
  );
};


