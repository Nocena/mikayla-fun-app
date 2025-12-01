import React from 'react';
import { useAccountStatus } from '../../contexts/AccountStatusContext';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';
import mikaImage from '../../assets/mika.png';

export const ChatEmptyState: React.FC = () => {
  const { statusById } = useAccountStatus();
  const { accounts } = useSocialAccounts();

  // Calculate syncing status
  const totalAccounts = accounts.length;
  const syncingCount = accounts.filter(acc => statusById[acc.id] === 'syncing').length;
  const syncedCount = accounts.filter(acc => statusById[acc.id] === 'synced').length;
  const isSyncing = syncingCount > 0;
  const allSynced = syncedCount === totalAccounts && totalAccounts > 0;

  return (
    <div className="flex-1 flex items-center justify-center h-full bg-panel relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 py-12">
        {/* Mika Image Container */}
        <div className="relative mb-8">
          {/* Mika Image with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-110" />
            <img 
              src={mikaImage} 
              alt="Mika" 
              className="relative w-32 h-32 object-cover rounded-3xl drop-shadow-2xl animate-float"
              style={{
                animation: 'float 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            {totalAccounts === 0 
              ? 'No Accounts Connected'
              : isSyncing 
                ? 'Syncing Conversations...'
                : allSynced
                  ? 'All Set!'
                  : 'Getting Ready...'}
          </h2>
          
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            {totalAccounts === 0
              ? 'Connect your social media accounts to start managing conversations'
              : isSyncing
                ? `Syncing ${syncingCount} of ${totalAccounts} account${totalAccounts !== 1 ? 's' : ''}...`
                : allSynced
                  ? 'Your conversations are up to date and ready to go!'
                  : 'Preparing your conversations...'}
          </p>

          {/* Progress Indicator */}
          {totalAccounts > 0 && (
            <div className="mt-8 space-y-3">
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-2 bg-surface rounded-full overflow-hidden border border-border-color">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ 
                      width: `${totalAccounts > 0 ? (syncedCount / totalAccounts) * 100 : 0}%`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                      style={{
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Text */}
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                {isSyncing ? (
                  <>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span>Syncing {syncingCount} of {totalAccounts} account{totalAccounts !== 1 ? 's' : ''}</span>
                  </>
                ) : allSynced ? (
                  <>
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span>All {totalAccounts} account{totalAccounts !== 1 ? 's' : ''} synced</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse" />
                    <span>Initializing...</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Account Status List */}
          {totalAccounts > 0 && (
            <div className="mt-8 w-full max-w-md mx-auto">
              <div className="space-y-2">
                {accounts.map((account) => {
                  const status = statusById[account.id] || 'syncing';
                  const isAccountSyncing = status === 'syncing';
                  const isAccountSynced = status === 'synced';
                  
                  return (
                    <div 
                      key={account.id}
                      className="flex items-center justify-between p-3 bg-surface/50 border border-border-color rounded-lg backdrop-blur-sm transition-all hover:bg-surface/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          isAccountSynced 
                            ? 'bg-accent' 
                            : isAccountSyncing 
                              ? 'bg-primary animate-pulse' 
                              : 'bg-text-secondary'
                        }`} />
                        <span className="text-text-primary font-medium capitalize">
                          {account.platform}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {isAccountSynced 
                          ? 'Synced' 
                          : isAccountSyncing 
                            ? 'Syncing...' 
                            : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

