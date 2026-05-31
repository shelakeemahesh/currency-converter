import React, { useState, useCallback, useEffect } from 'react';
import { CURRENCIES } from './constants';
import type { Currency } from './types';
import { fetchLatestRates } from './services/exchangeRateService';
import Spinner from './components/Spinner';
import SwapIcon from './components/SwapIcon';
import CurrencySelect from './components/CurrencySelect';
import CurrencyFlag from './components/CurrencyFlag';


const App: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    const loadRates = async () => {
      try {
        setIsRatesLoading(true);
        setRatesError(null);
        const baseCurrency = 'USD';
        const fetchedRates = await fetchLatestRates(baseCurrency);
        // The API returns rates relative to the base, so we add the base itself for calculations.
        fetchedRates[baseCurrency] = 1;
        setRates(fetchedRates);
      } catch (err) {
        setRatesError(err instanceof Error ? err.message : 'An unknown error occurred while fetching rates.');
      } finally {
        setIsRatesLoading(false);
      }
    };

    loadRates();
  }, []);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleConversion = useCallback(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      setConvertedAmount(null);
      return;
    }

    if (!rates) {
      setError("Exchange rates are not available. Please try again later.");
      setConvertedAmount(null);
      return;
    }

    setError(null);

    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];

    if (!rateFrom || !rateTo) {
      setError("Conversion for the selected currencies is not available.");
      setConvertedAmount(null);
      return;
    }

    // All rates are relative to the base currency (USD).
    // Convert amount from `fromCurrency` to USD, then from USD to `toCurrency`.
    const amountInBase = numericAmount / rateFrom;
    const result = amountInBase * rateTo;

    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency, rates]);

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return CURRENCIES.find(c => c.code === code);
  };

  if (isRatesLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4" aria-busy="true" aria-live="polite">
        <Spinner />
        <p className="text-slate-400 mt-4 text-lg">Fetching latest exchange rates...</p>
      </div>
    );
  }

  if (ratesError) {
    return (
       <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                <p className="font-bold text-lg mb-2">Failed to Load Exchange Rates</p>
                <p>{ratesError}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-slate-700">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-400">Currency Converter</h1>
          <p className="text-slate-400 mt-2">Up-to-date exchange rates</p>
        </header>

        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full bg-slate-700 border-slate-600 text-white rounded-lg p-3 text-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <CurrencySelect
              id="from"
              label="From"
              selectedValue={fromCurrency}
              onValueChange={setFromCurrency}
              currencies={CURRENCIES}
            />

            <div className="flex-shrink-0 pt-0 md:pt-7">
              <button
                onClick={handleSwapCurrencies}
                className="p-3 bg-slate-700 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-200"
                aria-label="Swap currencies"
              >
                <SwapIcon />
              </button>
            </div>

            <CurrencySelect
              id="to"
              label="To"
              selectedValue={toCurrency}
              onValueChange={setToCurrency}
              currencies={CURRENCIES}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleConversion}
            className="w-full bg-sky-600 text-white font-bold text-lg py-3 px-6 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          >
            Convert
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
            {error}
          </div>
        )}

        {convertedAmount !== null && (
          <div className="mt-6 p-6 bg-slate-900/70 border border-slate-700 rounded-lg text-center">
            <p className="text-lg text-slate-400 flex items-center justify-center gap-2">
              <CurrencyFlag countryCode={getCurrencyByCode(fromCurrency)?.countryCode || ''} />
              {amount} {getCurrencyByCode(fromCurrency)?.name} =
            </p>
            <p className="text-4xl font-bold text-sky-400 mt-2 flex items-center justify-center gap-3">
               <CurrencyFlag countryCode={getCurrencyByCode(toCurrency)?.countryCode || ''} className="w-9 h-9" />
              <span>
                {convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                {getCurrencyByCode(toCurrency)?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;