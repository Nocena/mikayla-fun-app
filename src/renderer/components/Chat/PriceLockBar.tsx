import { Tag, X } from 'lucide-react';

export interface PriceLockBarProps {
  price: number;
  onRemove: () => void;
}

export const PriceLockBar = ({ price, onRemove }: PriceLockBarProps) => {
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg border border-border-color bg-panel p-2">
      {/* Free Preview Section */}
      <div className="flex flex-1 items-center gap-2 rounded bg-surface px-3 py-2">
        <Tag className="h-4 w-4 text-text-secondary" strokeWidth={2.5} />
        <span className="text-sm font-medium text-text-secondary">Free preview</span>
      </div>

      {/* Price to View Section */}
      <div className="flex items-center gap-2 rounded bg-primary/10 px-3 py-2">
        <Tag className="h-4 w-4 text-primary" strokeWidth={2.5} />
        <span className="text-sm font-medium text-text-primary">Price to view</span>
        <span className="text-sm font-semibold text-text-primary">{formatPrice(price)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary transition-colors hover:bg-primary/30"
          aria-label="Remove price lock"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

