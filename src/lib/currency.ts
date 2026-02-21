export type CurrencyCode = "CHF" | "EUR" | "USD" | "GBP" | "TRY";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  position: "before" | "after";
  decimals: number;
  stripeCode: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", position: "before", decimals: 2, stripeCode: "chf" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", position: "before", decimals: 2, stripeCode: "eur" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", position: "before", decimals: 2, stripeCode: "usd" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", position: "before", decimals: 2, stripeCode: "gbp" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", position: "after", decimals: 2, stripeCode: "try" },
};

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  // Swiss Franc
  CH: "CHF", LI: "CHF",
  // Euro
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR",
  PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR",
  EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
  // British Pound
  GB: "GBP",
  // US Dollar
  US: "USD",
  // Turkish Lira
  TR: "TRY",
};

export const DEFAULT_CURRENCY: CurrencyCode = "CHF";

export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  CHF: 1,
  EUR: 0.94,
  USD: 1.08,
  GBP: 0.82,
  TRY: 37.0,
};

function roundToNearest50(value: number): number {
  return Math.round(value * 2) / 2;
}

export function formatPrice(
  chfAmount: number,
  rate: number,
  currency: CurrencyInfo
): string {
  const raw = chfAmount * rate;
  const rounded = rate === 1 ? raw : roundToNearest50(raw);
  const formatted = rounded.toFixed(currency.decimals);

  if (currency.code === "CHF") {
    return `CHF ${formatted}`;
  }

  if (currency.position === "after") {
    return `${formatted}${currency.symbol}`;
  }

  return `${currency.symbol}${formatted}`;
}

export function convertPrice(chfAmount: number, rate: number): number {
  const raw = chfAmount * rate;
  return rate === 1 ? raw : roundToNearest50(raw);
}

export function getCurrencyForCountry(countryCode: string): CurrencyCode {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}
