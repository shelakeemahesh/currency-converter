import React, { useState, useCallback, useEffect } from 'react';
import { CURRENCIES } from './constants';
import type { Currency } from './types';
import { fetchLatestRates } from './services/exchangeRateService';
import Spinner from './components/Spinner';
import SwapIcon from './components/SwapIcon';
import CurrencySelect from './components/CurrencySelect';
import CurrencyFlag from './components/CurrencyFlag';

interface HistoryItem {
  id: string;
  from: string;
  to: string;
  amount: string;
  result: number;
}

const App: React.FC = () => {
  // Core Conversion State
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  // Exchange Rates State
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load rates on mount
  useEffect(() => {
    const loadRates = async () => {
      try {
        setIsRatesLoading(true);
        setRatesError(null);
        const baseCurrency = 'USD';
        const fetchedRates = await fetchLatestRates(baseCurrency);
        fetchedRates[baseCurrency] = 1;
        setRates(fetchedRates);
      } catch (err) {
        setRatesError(err instanceof Error ? err.message : 'An unknown error occurred while fetching rates.');
      } finally {
        setIsRatesLoading(false);
      }
    };

    loadRates();

    // Load History from LocalStorage
    const storedHistory = localStorage.getItem('currency_converter_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Error parsing conversion history', e);
      }
    }
  }, []);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Perform conversion reactively
  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      setConvertedAmount(null);
      return;
    }

    if (!rates) {
      setError('Exchange rates are not available. Please try again later.');
      setConvertedAmount(null);
      return;
    }

    setError(null);

    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];

    if (!rateFrom || !rateTo) {
      setError('Conversion for the selected currencies is not available.');
      setConvertedAmount(null);
      return;
    }

    const amountInBase = numericAmount / rateFrom;
    const result = amountInBase * rateTo;

    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency, rates]);

  // Pin a conversion to history
  const handlePinConversion = () => {
    if (convertedAmount === null) return;
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
      result: convertedAmount
    };

    // Keep unique calculations, move to front if duplicate
    const filteredHistory = history.filter(
      item => !(item.from === fromCurrency && item.to === toCurrency && item.amount === amount)
    );
    const newHistory = [newItem, ...filteredHistory].slice(0, 5); // Keep last 5

    setHistory(newHistory);
    localStorage.setItem('currency_converter_history', JSON.stringify(newHistory));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setAmount(item.amount);
    setFromCurrency(item.from);
    setToCurrency(item.to);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('currency_converter_history');
  };

  const handleCopyResult = () => {
    if (convertedAmount === null) return;
    const fromSymbol = getCurrencyByCode(fromCurrency)?.code || fromCurrency;
    const toSymbol = getCurrencyByCode(toCurrency)?.code || toCurrency;
    const textToCopy = `${amount} ${fromSymbol} = ${convertedAmount.toFixed(4)} ${toSymbol}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return CURRENCIES.find(c => c.code === code);
  };

  // Quick select amounts handler
  const handleQuickSelectAmount = (value: number) => {
    setAmount(value.toString());
  };

  if (isRatesLoading) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center p-4" aria-busy="true" aria-live="polite">
        <Spinner />
        <p className="text-slate-400 mt-4 text-lg font-medium">Fetching latest exchange rates...</p>
      </div>
    );
  }

  if (ratesError) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-red-950/60 border border-red-800/80 text-red-300 rounded-2xl text-center backdrop-blur-md shadow-2xl">
          <p className="font-bold text-lg mb-2">Failed to Load Exchange Rates</p>
          <p className="text-slate-400 mb-4">{ratesError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden select-none">
      {/* Background Decorative Radial Glows */}
      <div className="glow-accent w-[300px] h-[300px] bg-sky-500/10 top-1/4 left-1/4"></div>
      <div className="glow-accent w-[400px] h-[400px] bg-indigo-500/10 bottom-1/4 right-1/4"></div>

      <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 border border-slate-800/60 z-10 relative animate-slide-up">
        
        {/* Header */}
        <header className="text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs font-semibold text-sky-400 mb-3 select-none">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Up-to-date Exchange Rates
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            ForexFlow
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Quick, reliable currency conversions with real-time exchange rates
          </p>
        </header>

        {/* Converter Panel */}
        <div className="space-y-6">
          {/* Amount & Quick Selects */}
          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-semibold text-slate-300">
              Amount
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.00"
                className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl p-4 text-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 pl-5 pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">
                {fromCurrency}
              </span>
            </div>
            
            {/* Quick Selects */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[10, 50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickSelectAmount(val)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-sky-500 hover:bg-slate-800 transition duration-200"
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selects */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <CurrencySelect
              id="from"
              label="From"
              selectedValue={fromCurrency}
              onValueChange={setFromCurrency}
              currencies={CURRENCIES}
            />

            {/* Swap Button */}
            <div className="flex-shrink-0 pt-0 md:pt-7">
              <button
                onClick={handleSwapCurrencies}
                className="p-3.5 bg-slate-800 hover:bg-sky-600 rounded-full border border-slate-700/60 hover:border-sky-400 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 transform hover:rotate-180"
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

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePinConversion}
              disabled={convertedAmount === null}
              className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold py-3.5 px-6 rounded-xl border border-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition duration-200"
            >
              📌 Pin to History
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl text-center text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Main Result Display */}
          {convertedAmount !== null && (
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center relative overflow-hidden group animate-fade-in">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none transition duration-300 group-hover:scale-125"></div>
              
              <p className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-2">
                <CurrencyFlag countryCode={getCurrencyByCode(fromCurrency)?.countryCode || ''} />
                <span>
                  {parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} {getCurrencyByCode(fromCurrency)?.name} =
                </span>
              </p>
              <div className="text-3xl md:text-4xl font-black text-sky-400 mt-3 flex items-center justify-center gap-3 flex-wrap">
                <CurrencyFlag countryCode={getCurrencyByCode(toCurrency)?.countryCode || ''} className="w-9 h-9 md:w-10 md:h-10 shadow-md" />
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {convertedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
                <span className="text-slate-300 text-2xl md:text-3xl font-bold">
                  {toCurrency}
                </span>
              </div>
              
              {/* Result utility bar */}
              <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-slate-800/60">
                <button
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition duration-200 focus:outline-none"
                >
                  {showCopied ? '✅ Copied!' : '📋 Copy Formula'}
                </button>
                <span className="text-slate-700">|</span>
                <span className="text-xs text-slate-500">
                  1 {fromCurrency} = {(convertedAmount / parseFloat(amount)).toFixed(4)} {toCurrency}
                </span>
              </div>
            </div>
          )}

          {/* History Panel */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-800/60 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400">Pinned Conversions</h3>
                <button 
                  onClick={handleClearHistory}
                  className="text-xs text-red-400 hover:text-red-300 transition duration-200"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    className="w-full p-3 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/50 hover:border-slate-700/60 rounded-xl text-left transition duration-200 flex items-center justify-between text-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <CurrencyFlag countryCode={getCurrencyByCode(item.from)?.countryCode || ''} className="w-5 h-5 border border-slate-800" />
                        <CurrencyFlag countryCode={getCurrencyByCode(item.to)?.countryCode || ''} className="w-5 h-5 border border-slate-800" />
                      </div>
                      <span className="text-slate-300 font-medium">
                        {parseFloat(item.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} {item.from} → {item.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold group-hover:text-sky-400 transition duration-200">
                        {item.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.to}
                      </span>
                      <span className="text-slate-600 group-hover:text-slate-400">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;