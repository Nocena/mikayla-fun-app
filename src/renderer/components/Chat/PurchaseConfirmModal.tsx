import React from 'react';
import { OnlyFansPaymentCard, OnlyFansPaymentMethodsVatResponse } from '../../services/onlyfansPaymentsService';
import { toast } from '../../lib/toast';

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  isLoading: boolean;
  quote?: OnlyFansPaymentMethodsVatResponse | null;
  error?: string;
  selectedCardId?: number | null;
  onSelectCard?: (cardId: number) => void;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const CardBrandBadge: React.FC<{ brand?: string }> = ({ brand }) => {
  const label = brand || 'Card';
  const initials = label.slice(0, 1).toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-primary">
      {initials}
    </div>
  );
};

const PaymentMethodSummary: React.FC<{ card?: OnlyFansPaymentCard }> = ({ card }) => {
  if (!card) return null;
  return (
    <div className="mt-4 rounded-lg border border-border-color bg-panel/80 p-4 text-left">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        Payment method
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-text-primary">
          <CardBrandBadge brand={card.brand} />
          <span className="text-text-primary">
            {card.brand || 'Card'} •••• {card.last4}
          </span>
        </div>
        <span className="text-xs text-text-secondary">Default</span>
      </div>
    </div>
  );
};

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  isOpen,
  onClose,
  price,
  isLoading,
  quote,
  error,
  selectedCardId,
  onSelectCard,
}) => {
  if (!isOpen) return null;

  const cards = quote?.cards ?? [];
  const activeCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const vatPrice = activeCard?.vatPrice ?? 0;
  const vatName = activeCard?.vatName || 'VAT';
  const total = price + vatPrice;
  const hasCards = cards.length > 0;
  const canConfirm = hasCards && !!activeCard;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      onSelectCard?.(value);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-border-color bg-panel p-6 text-text-primary shadow-2xl">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Confirm Message Purchase
        </h3>

        {isLoading && (
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-text-secondary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p>Fetching payment methods...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mt-6">
              <p className="text-sm text-text-secondary">You will be charged</p>
              <p className="text-2xl font-semibold text-text-primary">{formatCurrency(total)}</p>
              <p className="text-sm text-text-secondary">
                {formatCurrency(price)} + {formatCurrency(vatPrice)} {vatName}
              </p>
            </div>
            {hasCards ? (
              <>
                <div className="mt-5">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    Payment method
                  </label>
                  <div className="mt-2 relative">
                    <select
                      value={activeCard?.id ?? cards[0]?.id ?? ''}
                      onChange={handleSelectChange}
                      className="w-full appearance-none rounded-lg border border-border-color bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      {cards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {(card.brand || 'Card') + ' •••• ' + card.last4}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-secondary">
                      ▼
                    </span>
                  </div>
                </div>
                <PaymentMethodSummary card={activeCard} />
              </>
            ) : (
              <div className="mt-5 rounded-lg border border-border-color bg-surface px-4 py-3 text-sm text-text-secondary">
                No saved payment methods were returned from OnlyFans. Add a card in your OnlyFans account first.
              </div>
            )}
          </>
        )}

        <div className="mt-8 flex items-center justify-end gap-6 text-sm font-semibold uppercase tracking-wide">
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
              isLoading || !!error || !canConfirm
                ? 'cursor-not-allowed text-text-muted'
                : 'text-primary hover:text-primary/80'
            }`}
            disabled={isLoading || !!error || !canConfirm}
            onClick={() => {
              if (!isLoading && !error && canConfirm) {
                toast({
                  title: 'Payment Processing',
                  description: 'To complete payments, please navigate to the Clients view where you can manage all transactions directly.',
                  status: 'info',
                  duration: 5000,
                  isClosable: true,
                });
                onClose();
              }
            }}
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
};

