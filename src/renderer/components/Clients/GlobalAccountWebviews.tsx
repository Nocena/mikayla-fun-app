import { AccountWebviewManager } from './AccountWebviewManager';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';

export const GlobalAccountWebviews = () => {
  const { accounts } = useSocialAccounts();
  if (!accounts.length) return null;
  return <AccountWebviewManager accounts={accounts} />;
};


