import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PriceLockModalProps {
  isOpen: boolean;
  initialValue?: number | null;
  onClose: () => void;
  onSave: (price: number | null) => void;
}

const formatDisplayValue = (value: number | null) => {
  if (value === null || value === 0) {
    return '';
  }
  return value.toString();
};

const parseInputValue = (input: string): { price: number | null; error?: string } => {
  if (input === '') {
    return { price: null };
  }

  const numeric = Number(input);
  if (Number.isNaN(numeric) || numeric < 0) {
    return { price: null, error: 'Enter a valid number' };
  }

  if (numeric > 0 && numeric < 3) {
    return { price: numeric, error: 'Minimum $3 USD or free' };
  }

  if (numeric > 100) {
    return { price: numeric, error: 'Maximum $100 USD' };
  }

  return { price: numeric };
};

export const PriceLockModal = ({
  isOpen,
  initialValue = null,
  onClose,
  onSave,
}: PriceLockModalProps) => {
  const [inputValue, setInputValue] = useState(formatDisplayValue(initialValue));
  const [price, setPrice] = useState<number | null>(initialValue ?? null);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setInputValue(formatDisplayValue(initialValue ?? null));
      setPrice(initialValue ?? null);
      setError(undefined);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleChange = (value: string) => {
    setInputValue(value);
    const result = parseInputValue(value);
    setPrice(result.price);
    setError(result.error);
  };

  const handleSave = () => {
    if (error) return;
    onSave(price);
  };

  const isSaveDisabled = Boolean(error);
  const hasError = Boolean(error);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border-color bg-panel p-6 text-text-primary shadow-2xl">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Message Price
        </h3>
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Price
          </label>
          <div
            className={`mt-1 flex items-center rounded-lg border bg-surface px-3 py-2 text-sm ${
              hasError ? 'border-red-500' : 'border-border-color'
            }`}
          >
            <span className={`pr-2 text-base ${hasError ? 'text-red-400' : 'text-text-secondary'}`}>
              $
            </span>
            <input
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Free"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="flex-1 border-none bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
            />
            {hasError && <AlertTriangle className="h-4 w-4 text-red-400" />}
          </div>
          <p
            className={`mt-1 text-xs ${
              hasError ? 'text-red-400' : 'text-text-secondary'
            }`}
          >
            {error || 'Minimum $3 USD or free (max $100 USD)'}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-end gap-6 text-sm font-semibold uppercase tracking-wide">
          <button
            type="button"
            className="text-primary transition hover:text-primary/80"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1 ${
              isSaveDisabled
                ? 'cursor-not-allowed text-text-muted'
                : 'text-primary hover:text-primary/80'
            }`}
            disabled={isSaveDisabled}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
