import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, SocialAccount } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '../lib/toast';

interface SocialAccountsContextValue {
  accounts: SocialAccount[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const SocialAccountsContext = createContext<SocialAccountsContextValue | undefined>(undefined);

export const useSocialAccounts = () => {
  const ctx = useContext(SocialAccountsContext);
  if (!ctx) {
    throw new Error('useSocialAccounts must be used within a SocialAccountsProvider');
  }
  return ctx;
};

export const SocialAccountsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading accounts',
        description: error.message,
        status: 'error',
      });
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  return (
    <SocialAccountsContext.Provider value={{ accounts, loading, refresh }}>
      {children}
    </SocialAccountsContext.Provider>
  );
};


