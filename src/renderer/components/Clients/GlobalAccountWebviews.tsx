import { AccountWebviewManager } from './AccountWebviewManager';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';

export const GlobalAccountWebviews = () => {
  const { accounts } = useSocialAccounts();
  if (!accounts.length) return null;
  console.log("we have accounts, return accounts", accounts)
  return <AccountWebviewManager accounts={accounts} />;
};


