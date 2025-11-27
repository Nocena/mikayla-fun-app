import React from 'react';
import type { Message as MessageType } from '../../types/chat';
import {SparklesIcon} from "./icons/SparklesIcon";
import {Avatar} from "./Avatar";
import {formatRelativeTime} from "../../utils/dateUtils";
import { MediaSwiper } from './MediaSwiper';
import { LockedMessageCard } from './LockedMessageCard';

interface MessageProps {
  message: MessageType;
  fanAvatar?: string | null;
  fanName?: string;
}

export const Message: React.FC<MessageProps> = ({ message, fanAvatar, fanName = 'Fan' }) => {
  const isFan = message.sender === 'fan';
  const isAI = message.sender === 'ai';
  const isLockedFanMessage = isFan && !!message.canPurchase;
  const priceValue = message.price ?? 0;
  const hasUnlockedMedia = !!message.media && message.media.length > 0 && !isLockedFanMessage;
  const hasUnlockedText = !!message.content && message.content.trim().length > 0 && !isLockedFanMessage;
  const lockedMediaCount = message.media?.length ?? 0;
  const lockedHasText = !!message.lockedText || (!!message.content && message.content.trim().length > 0);

  const wrapperClasses = `flex items-end gap-3 ${isFan ? 'justify-start' : 'justify-end'}`;
  
  const getBubbleClasses = (hasMediaAbove: boolean) => {
    const baseClasses = 'px-4 py-3 relative';
    const roundedClasses = hasMediaAbove 
      ? 'rounded-b-2xl rounded-t-none'
      : 'rounded-2xl';
    const cornerClasses = hasMediaAbove
      ? ''
      : isFan
      ? 'rounded-bl-none'
      : isAI
      ? 'rounded-br-none'
      : 'rounded-br-none';
    const bgClasses = isFan
      ? 'bg-surface text-text-primary'
      : isAI
      ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-glow-primary'
      : 'bg-secondary text-white shadow-glow-secondary';
    
    return `${baseClasses} ${roundedClasses} ${cornerClasses} ${bgClasses}`;
  };

  return (
    <div className={wrapperClasses}>
      {isFan && (
        <Avatar avatarUrl={fanAvatar} name={fanName} size="sm" className="flex-shrink-0" />
      )}
      <div className="flex flex-col" style={{ alignItems: isFan ? 'flex-start' : 'flex-end' }}>
        <div className="max-w-xs md:max-w-md lg:max-w-lg overflow-hidden rounded-2xl">
          {isLockedFanMessage ? (
            <LockedMessageCard price={priceValue} mediaCount={lockedMediaCount} hasText={lockedHasText} />
          ) : (
            <>
              {hasUnlockedMedia && (
                <MediaSwiper media={message.media!} hasTextBelow={hasUnlockedText} />
              )}
              {hasUnlockedText && (
                <div className={getBubbleClasses(hasUnlockedMedia)}>
{/*
              {isAI && !hasMedia && (
                <SparklesIcon className="absolute -top-2 -left-2 w-5 h-5 text-primary bg-panel rounded-full p-1" />
              )}
*/}
                  <div
                    className="text-sm break-words"
                    dangerouslySetInnerHTML={{ __html: message.content || '' }}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5 px-1" style={{ justifyContent: isFan ? 'flex-start' : 'flex-end' }}>
          {!message.isFree && message.price && message.price > 0 && (
            <>
              <span className="text-xs text-text-secondary">
                ${message.price} {message.canPurchase ? 'not paid yet' : 'paid'}
              </span>
              <span className="text-xs text-text-secondary">, </span>
            </>
          )}
          <span className="text-xs text-text-secondary">{formatRelativeTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
