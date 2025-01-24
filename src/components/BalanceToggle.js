
import React, { useState } from 'react';
import './BalanceToggle.css';
import { FaCoins } from 'react-icons/fa'; // Importing a coin icon

const BalanceToggle = ({ tokenBalance, sweepstakesBalance, onGetCoins }) => {
  // Define the two currencies
  const currencies = [
    { id: 'token', label: 'PTK', balance: tokenBalance, icon: <FaCoins /> },
    { id: 'sweepstakes', label: 'SWP', balance: sweepstakesBalance, icon: <FaCoins /> },
  ];

  // State to track the selected currency
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0].id);

  // Handler to switch currency
  const handleToggle = (currencyId) => {
    setSelectedCurrency(currencyId);
  };

  // Find the selected currency details
  const currentCurrency = currencies.find(
    (currency) => currency.id === selectedCurrency
  );

  return (
    <div className="balance-toggle">
      <div className="balance-toggle__switch">
        {currencies.map((currency) => (
          <button
            key={currency.id}
            className={`balance-toggle__button ${
              selectedCurrency === currency.id ? 'active' : ''
            }`}
            onClick={() => handleToggle(currency.id)}
          >
            {currency.icon}
            <span className="balance-toggle__label">{currency.label}</span>
          </button>
        ))}
      </div>
      <div className="balance-toggle__display">
        <FaCoins className="balance-toggle__icon" />
        <span className="balance-toggle__amount">
          {currentCurrency.balance} {currentCurrency.label}
        </span>
      </div>
      <button className="balance-toggle__get-coins" onClick={onGetCoins}>
        Get Coins
      </button>
    </div>
  );
};

export default BalanceToggle;

