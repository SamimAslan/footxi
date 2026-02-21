"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type CurrencyCode,
  type CurrencyInfo,
  CURRENCIES,
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  formatPrice as formatPriceUtil,
  convertPrice,
  getCurrencyForCountry,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyInfo;
  currencyCode: CurrencyCode;
  rate: number;
  loading: boolean;
  formatPrice: (chfAmount: number) => string;
  convertFromCHF: (chfAmount: number) => number;
  setCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: CURRENCIES.CHF,
  currencyCode: "CHF",
  rate: 1,
  loading: true,
  formatPrice: (amount) => `CHF ${amount.toFixed(2)}`,
  convertFromCHF: (amount) => amount,
  setCurrency: () => {},
});

const CACHE_KEY = "footxi_exchange_rates";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const CURRENCY_PREF_KEY = "footxi_currency_pref";

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

function getCachedRates(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION) return null;
    return cached.rates;
  } catch {
    return null;
  }
}

function setCachedRates(rates: Record<string, number>) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rates, timestamp: Date.now() })
    );
  } catch {
    // localStorage may be full or disabled
  }
}

function getSavedCurrencyPref(): CurrencyCode | null {
  try {
    const saved = localStorage.getItem(CURRENCY_PREF_KEY);
    if (saved && saved in CURRENCIES) return saved as CurrencyCode;
  } catch {
    // ignore
  }
  return null;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Check for saved preference
      const savedPref = getSavedCurrencyPref();

      // 2. Load cached rates first
      const cached = getCachedRates();
      if (cached) {
        setRates({ CHF: 1, ...cached } as Record<CurrencyCode, number>);
      }

      // 3. If no saved preference, detect country
      if (!savedPref) {
        try {
          const geoRes = await fetch("https://ipapi.co/json/", {
            signal: AbortSignal.timeout(3000),
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const detected = getCurrencyForCountry(geoData.country_code || "");
            if (!cancelled) setCurrencyCode(detected);
          }
        } catch {
          // Fallback to CHF on error
        }
      } else {
        setCurrencyCode(savedPref);
      }

      // 4. Fetch fresh exchange rates (if cache expired or missing)
      if (!cached) {
        try {
          const rateRes = await fetch(
            "https://api.frankfurter.app/latest?from=CHF&to=EUR,USD,GBP,TRY",
            { signal: AbortSignal.timeout(5000) }
          );
          if (rateRes.ok) {
            const rateData = await rateRes.json();
            const freshRates = { CHF: 1, ...rateData.rates } as Record<CurrencyCode, number>;
            if (!cancelled) {
              setRates(freshRates);
              setCachedRates(rateData.rates);
            }
          }
        } catch {
          // Use fallback rates
        }
      }

      if (!cancelled) setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyCode(code);
    try {
      localStorage.setItem(CURRENCY_PREF_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const currency = CURRENCIES[currencyCode];
  const rate = rates[currencyCode] ?? FALLBACK_RATES[currencyCode] ?? 1;

  const formatPriceFn = useCallback(
    (chfAmount: number) => formatPriceUtil(chfAmount, rate, currency),
    [rate, currency]
  );

  const convertFromCHF = useCallback(
    (chfAmount: number) => convertPrice(chfAmount, rate),
    [rate]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode,
        rate,
        loading,
        formatPrice: formatPriceFn,
        convertFromCHF,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
