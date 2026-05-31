import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Currency } from '../types';
import CurrencyFlag from './CurrencyFlag';

interface CurrencySelectProps {
  id: string;
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  currencies: Currency[];
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ id, label, selectedValue, onValueChange, currencies }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedCurrency = currencies.find(c => c.code === selectedValue);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (isOpen) {
      // Focus the search input when the dropdown is opened
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (currencyCode: string) => {
    onValueChange(currencyCode);
    closeDropdown();
  };
  
  const filteredCurrencies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return currencies.filter(currency =>
        currency.name.toLowerCase().includes(term) ||
        currency.code.toLowerCase().includes(term)
    );
  }, [currencies, searchTerm]);

  return (
    <div className="w-full" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="relative">
        <button
          id={id}
          type="button"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 flex items-center text-left"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center flex-grow">
            {selectedCurrency && <CurrencyFlag countryCode={selectedCurrency.countryCode} />}
            <span className="ml-3 block truncate">{selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name}`: 'Select Currency'}</span>
          </span>
           <svg className="ml-2 h-5 w-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.5 9a.75.75 0 011.06 0L10 15.19l2.97-2.97a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full bg-slate-800 shadow-lg rounded-md ring-1 ring-slate-700"
          >
            <div className="p-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country or currency..."
                className="w-full bg-slate-900 border-slate-600 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
              />
            </div>
            <ul
              className="max-h-60 overflow-auto py-1 text-base focus:outline-none sm:text-sm"
              role="listbox"
              tabIndex={-1}
            >
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <li
                    key={currency.code}
                    className="text-white cursor-pointer select-none relative py-2 px-3 hover:bg-sky-600"
                    onClick={() => handleSelect(currency.code)}
                    role="option"
                    aria-selected={currency.code === selectedValue}
                  >
                    <div className="flex items-center">
                      <CurrencyFlag countryCode={currency.countryCode} />
                      <span className="ml-3 block font-normal truncate">
                        {currency.code} - {currency.name}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 text-center py-2 px-3">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySelect;
