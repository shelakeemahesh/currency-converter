import React from 'react';

interface CurrencyFlagProps {
  countryCode: string;
  className?: string;
}

const CurrencyFlag: React.FC<CurrencyFlagProps> = ({ countryCode, className }) => {
  return (
    <img
      src={`https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`}
      alt={`${countryCode} flag`}
      className={`w-6 h-6 rounded-full ${className || ''}`}
      width="24"
      height="24"
    />
  );
};

export default CurrencyFlag;