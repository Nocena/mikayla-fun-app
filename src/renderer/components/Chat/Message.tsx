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
  onRequestUnlock?: (message: MessageType) => void;
  unlockingMessageId?: string | null;
}

export const Message: React.FC<MessageProps> = ({
  message,
  fanAvatar,
  fanName = 'Fan',
  onRequestUnlock,
  unlockingMessageId,
}) => {
  const isFan = message.sender === 'fan';
  const isAI = message.sender === 'ai';
  const isLockedFanMessage = isFan && !!message.canPurchase;
  const priceValue = message.price ?? 0;
  
  // For locked messages, filter media to only show items with canView: true and valid URLs
  // For unlocked messages, show all media
  const viewableMedia = isLockedFanMessage && message.media
    ? message.media.filter(m => m.canView !== false && (m.thumbnailUrl || m.fullUrl))
    : message.media;
  
  const hasViewableMedia = !!viewableMedia && viewableMedia.length > 0;
  
  // Check if text is just "Pay to view" (OnlyFans default text) - strip HTML tags first
  const stripHtml = (html: string) => {
    // Simple regex to remove HTML tags
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
  };
  
  const rawText = message.content ? stripHtml(message.content) : '';
  const isPayToViewText = rawText.toLowerCase() === 'pay to view';
  const hasText = !!message.content && message.content.trim().length > 0 && !isPayToViewText;
  
  // Count total media (for locked messages, show total count including viewable ones)
  const totalMediaCount = message.media?.length ?? 0;
  
  // Count locked media (media that can't be viewed) - for display purposes
  const lockedMediaCount = isLockedFanMessage && message.media
    ? message.media.filter(m => m.canView === false || (!m.thumbnailUrl && !m.fullUrl)).length
    : 0;

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
            <>
              {/* Always show locked message card at the top for locked messages */}
              <LockedMessageCard
                price={priceValue}
                mediaCount={totalMediaCount}
                hasText={!!message.lockedText || (hasText && !message.lockedText)}
                onUnlock={() => onRequestUnlock?.(message)}
                isUnlocking={unlockingMessageId === message.id}
                hasContentBelow={hasViewableMedia || hasText}
              />
              {/* Show viewable media even if message is locked */}
              {hasViewableMedia && (
                <MediaSwiper media={viewableMedia} hasTextBelow={hasText} hasContentAbove={true} />
              )}
              {/* Show text content even if message is locked (but not "Pay to view") */}
              {hasText && (
                <div className={getBubbleClasses(hasViewableMedia || isLockedFanMessage)}>
                  <div
                    className="text-sm break-words"
                    dangerouslySetInnerHTML={{ __html: message.content || '' }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {hasViewableMedia && (
                <MediaSwiper media={viewableMedia} hasTextBelow={hasText} />
              )}
              {hasText && (
                <div className={getBubbleClasses(hasViewableMedia)}>
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
