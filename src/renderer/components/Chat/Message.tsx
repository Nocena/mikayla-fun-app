import React from 'react';
import type { Message as MessageType } from '../../types/chat';
import {SparklesIcon} from "./icons/SparklesIcon";

interface MessageProps {
  message: MessageType;
  fanAvatar: string;
}

export const Message: React.FC<MessageProps> = ({ message, fanAvatar }) => {
  const isFan = message.sender === 'fan';
  const isAI = message.sender === 'ai';

  const wrapperClasses = `flex items-end gap-3 ${isFan ? 'justify-start' : 'justify-end'}`;
  const bubbleClasses = `max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl relative ${
    isFan
      ? 'bg-surface text-text-primary rounded-bl-none'
      : isAI
      ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-br-none shadow-glow-primary'
      : 'bg-secondary text-white rounded-br-none shadow-glow-secondary'
  }`;

  return (
    <div className={wrapperClasses}>
      {isFan && (
        <img src={fanAvatar} alt="Fan" className="w-8 h-8 rounded-full flex-shrink-0" />
      )}
      <div className="flex flex-col" style={{ alignItems: isFan ? 'flex-start' : 'flex-end' }}>
        <div className={bubbleClasses}>
            {isAI && (
                <SparklesIcon className="absolute -top-2 -left-2 w-5 h-5 text-primary bg-panel rounded-full p-1" />
            )}
            <p className="text-sm break-words">{message.content}</p>
        </div>
        <span className="text-xs text-text-secondary mt-1.5 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
};
