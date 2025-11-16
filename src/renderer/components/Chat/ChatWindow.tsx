import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import {Conversation} from "../../types/chat";

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (content: string, sender: 'model' | 'ai') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-panel">
        {/* Chat Header */}
        <div className="flex-shrink-0 h-16 flex items-center px-6 border-b border-border-color bg-surface">
            <img src={conversation.fan.avatarUrl} alt={conversation.fan.name} className="w-10 h-10 rounded-full mr-4" />
            <div>
                <h3 className="font-bold text-text-primary">{conversation.fan.name}</h3>
                <p className="text-xs text-accent">{conversation.fan.isOnline ? 'Online' : `Last seen ${conversation.fan.lastSeen}`}</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-sm font-semibold text-primary">${conversation.fan.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-text-secondary">Total Spent</p>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
                {conversation.messages.map((msg) => (
                    <Message key={msg.id} message={msg} fanAvatar={conversation.fan.avatarUrl} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t border-border-color bg-surface">
            <MessageInput
              onSendMessage={onSendMessage}
              conversationHistory={conversation.messages}
            />
        </div>
    </div>
  );
};