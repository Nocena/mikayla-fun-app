import React from 'react';
import {Conversation} from "../../types/chat";
import {Avatar} from "./Avatar";
import {formatRelativeTime} from "../../utils/dateUtils";
import {SocialAccount} from "../../lib/supabase";
import {getPlatformLogo} from "../../utils/platform";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationClick: (conversationId: string) => void;
  accounts: SocialAccount[];
}

const ConversationItem: React.FC<{ 
  conv: Conversation; 
  isSelected: boolean;
  onClick: () => void;
  account?: SocialAccount;
}> = ({ conv, isSelected, onClick, account }) => {
  const accountLogo = account ? getPlatformLogo(account.platform) : null;
  
  return (
    <div
      onClick={onClick}
      className={`flex items-start p-3 rounded-lg transition-all duration-200 cursor-pointer ${
        isSelected ? 'bg-primary/10' : 'hover:bg-surface'
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar avatarUrl={conv.fan.avatarUrl} name={conv.fan.name} size="lg" />
        {conv.fan.isOnline && (
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-accent ring-2 ring-panel" />
        )}
      </div>
      <div className="ml-4 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-text-primary truncate">{conv.fan.name}</h3>
          <span className="text-xs text-text-secondary flex-shrink-0">{formatRelativeTime(conv.lastMessageTimestamp)}</span>
        </div>
        <div 
          className="text-sm text-text-secondary mt-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            maxHeight: '1.5em',
            lineHeight: '1.5em'
          }}
          dangerouslySetInnerHTML={{ __html: conv.lastMessage || '' }}
        />
        {account && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {accountLogo && (
              <img 
                src={accountLogo} 
                alt={account.platform}
                className="w-3 h-3 object-contain"
              />
            )}
            <span className="text-xs text-text-secondary truncate">
              {account.platform_username}
            </span>
          </div>
        )}
      </div>
      {conv.unreadCount > 0 && (
         <div className="ml-2 flex-shrink-0 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full h-5 w-5 mt-1">
           {conv.unreadCount}
         </div>
      )}
    </div>
  );
};


export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  selectedConversationId,
  onConversationClick,
  accounts
}) => {
  // Create a map of account ID to account for quick lookup
  const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-border-color flex flex-col">
      <div className="p-4 border-b border-border-color flex-shrink-0">
        <h2 className="text-xl font-bold">Messages</h2>
        {/* TODO: Add search/filter input */}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-1">
          {conversations.map((conv) => {
            const account = conv.accountId ? accountMap.get(conv.accountId) : undefined;
            return (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => onConversationClick(conv.id)}
                account={account}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
