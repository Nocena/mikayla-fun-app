import { needSignTimeHeaders } from "../lib/requestHelpers";

const baseUrl = 'https://onlyfans.com';

export interface OnlyFansPaymentCard {
  id: number;
  brand: string;
  last4: string;
  isDefault?: boolean;
  canPayInContext?: boolean;
  verificationStatus?: string;
  vatPrice?: number;
  vatName?: string;
  vatState?: string | null;
  vatCountry?: string | null;
  taxPrice?: number;
  taxName?: string;
  taxState?: string | null;
  taxCountry?: string | null;
  mediaTaxPrice?: number;
  mediaTaxName?: string;
  mediaTaxState?: string | null;
  mediaTaxCountry?: string | null;
}

export interface OnlyFansPaymentMethodsVatResponse {
  cards: OnlyFansPaymentCard[];
  alternatives: any[];
}

export const getPaymentMethodsVatScript = (
  headers: Record<string, string>,
  userId: string,
  price: number,
  toUserId: string | number,
): string => {
  const params = new URLSearchParams({
    type: 'message',
    price: price.toString(),
    toUser: toUserId.toString(),
  }).toString();
  const subUrl = `/api2/v2/payments/methods-vat?${params}`;
  const updatedHeaders = needSignTimeHeaders(headers, subUrl, userId);

  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(updatedHeaders)};
        const res = await fetch('${baseUrl}${subUrl}', {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

