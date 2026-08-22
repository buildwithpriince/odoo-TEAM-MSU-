import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInUSD: number) => string;
  convertCostToCurrentCurrency: (cost: number, itemCurrency?: string) => number;
  formatCurrentCurrency: (cost: number) => string;
  formatAsEnteredCost: (cost: number, itemCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const USD_TO_INR_RATE = 83;

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app_currency') as Currency;
    if (savedCurrency === 'USD' || savedCurrency === 'INR') {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app_currency', newCurrency);
  };

  const convertCostToCurrentCurrency = (cost: number, itemCurrency?: string) => {
    if (!itemCurrency) {
      return currency === 'INR' ? cost * USD_TO_INR_RATE : cost;
    }
    if (itemCurrency === currency) return cost;
    if (itemCurrency === 'INR' && currency === 'USD') return cost / USD_TO_INR_RATE;
    if (itemCurrency === 'USD' && currency === 'INR') return cost * USD_TO_INR_RATE;
    return cost;
  };

  const formatCurrentCurrency = (cost: number): string => {
    return currency === 'INR' 
      ? `₹${Math.round(cost).toLocaleString('en-IN')}` 
      : `$${Math.round(cost).toLocaleString('en-US')}`;
  };

  const formatPrice = (amountInUSD: number): string => {
    if (currency === 'INR') {
      const amountInINR = Math.round(amountInUSD * USD_TO_INR_RATE);
      return `₹${amountInINR.toLocaleString('en-IN')}`;
    }
    return `$${Math.round(amountInUSD).toLocaleString('en-US')}`;
  };

  const formatAsEnteredCost = (cost: number, itemCurrency?: string): string => {
    if (!itemCurrency) return formatPrice(cost);
    if (itemCurrency === currency) {
      return currency === 'INR' ? `₹${cost.toLocaleString('en-IN')}` : `$${cost.toLocaleString('en-US')}`;
    }
    if (itemCurrency === 'INR' && currency === 'USD') {
      return `$${Math.round(cost / USD_TO_INR_RATE).toLocaleString('en-US')}`;
    }
    if (itemCurrency === 'USD' && currency === 'INR') {
      return `₹${Math.round(cost * USD_TO_INR_RATE).toLocaleString('en-IN')}`;
    }
    return formatPrice(cost);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertCostToCurrentCurrency, formatCurrentCurrency, formatAsEnteredCost }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
