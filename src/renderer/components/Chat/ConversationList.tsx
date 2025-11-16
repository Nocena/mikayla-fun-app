import React from 'react';
import {Conversation} from "../../types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationClick: (conversationId: string) => void;
}

const ConversationItem: React.FC<{ 
  conv: Conversation; 
  isSelected: boolean;
  onClick: () => void;
}> = ({ conv, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-start p-3 rounded-lg transition-all duration-200 cursor-pointer ${
      isSelected ? 'bg-primary/10' : 'hover:bg-surface'
    }`}
  >
    <div className="relative flex-shrink-0">
      <img src={conv.fan.avatarUrl} alt={conv.fan.name} className="w-12 h-12 rounded-full object-cover" />
      {conv.fan.isOnline && (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-accent ring-2 ring-panel" />
      )}
    </div>
    <div className="ml-4 flex-1 overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-text-primary truncate">{conv.fan.name}</h3>
        <span className="text-xs text-text-secondary flex-shrink-0">{conv.lastMessageTimestamp}</span>
      </div>
      <p className="text-sm text-text-secondary truncate mt-1">{conv.lastMessage}</p>
    </div>
    {conv.unreadCount > 0 && (
       <div className="ml-2 flex-shrink-0 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full h-5 w-5 mt-1">
         {conv.unreadCount}
       </div>
    )}
  </div>
);


export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  selectedConversationId,
  onConversationClick 
}) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-border-color flex flex-col">
      <div className="p-4 border-b border-border-color flex-shrink-0">
        <h2 className="text-xl font-bold">Messages</h2>
        {/* TODO: Add search/filter input */}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-1">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isSelected={conv.id === selectedConversationId}
              onClick={() => onConversationClick(conv.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
