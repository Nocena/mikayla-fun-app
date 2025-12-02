import React from 'react';

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <path d="m21 15-3.5-3.5a1.5 1.5 0 0 0-2.1 0L9 18" />
  </svg>
);

interface LockedMessageCardProps {
  price: number;
  mediaCount: number;
  hasText: boolean;
  onUnlock?: () => void;
  isUnlocking?: boolean;
  hasContentBelow?: boolean;
}

export const LockedMessageCard: React.FC<LockedMessageCardProps> = ({
  price,
  mediaCount,
  hasText,
  onUnlock,
  isUnlocking = false,
  hasContentBelow = false,
}) => {
  const formattedPrice = price.toFixed(2).replace(/\.00$/, '');
  const roundedClasses = hasContentBelow ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl';

  return (
    <div className={`relative overflow-hidden ${roundedClasses} border border-border-color bg-panel/80 px-5 py-6 text-center`}>
      <div className="absolute -top-3 right-4 text-text-secondary/20">
        <LockIcon className="w-10 h-10" />
      </div>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        ${formattedPrice}
      </div>
      <p className="text-sm font-semibold text-text-primary">Locked message</p>
      <p className="text-xs text-text-secondary">Unlock to view this content</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex flex-wrap items-center gap-3">
          {mediaCount > 0 && (
            <span className="flex items-center gap-1 text-text-primary font-medium">
              <ImageIcon className="h-4 w-4 text-text-secondary" />
              <span>
                {mediaCount} {mediaCount === 1 ? 'image' : 'images'}
              </span>
            </span>
          )}
          {hasText && (
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-surface text-[11px] font-semibold text-text-primary">
                A
              </span>
              Text
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 font-semibold text-text-primary">
          ${formattedPrice}
          <LockIcon className="h-4 w-4 text-text-secondary" />
        </span>
      </div>
      <button
        className={`mt-4 w-full rounded-full py-2 text-sm font-semibold text-white transition ${
          isUnlocking
            ? 'bg-primary/60 cursor-not-allowed'
            : 'bg-primary hover:bg-primary/90'
        }`}
        type="button"
        onClick={onUnlock}
        disabled={isUnlocking}
      >
        {isUnlocking ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Processing...
          </span>
        ) : (
          <>Unlock for ${formattedPrice}</>
        )}
      </button>
    </div>
  );
};

