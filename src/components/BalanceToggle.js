
/* src/components/BalanceToggle.js */

import React from 'react';
import './BalanceToggle.css';
import { FaCoins } from 'react-icons/fa'; // Importing a coin icon
import { useSelectedToken } from '../contexts/SelectedTokenContext'; // Import the custom hook
import PropTypes from 'prop-types'; // For prop type validation

const BalanceToggle = ({ tokenBalance, sweepstakesBalance, onGetCoins }) => {
  // Define the two currencies
  const currencies = [
    { id: 'token', label: 'PTK', balance: tokenBalance },
    { id: 'sweepstakes', label: 'SWP', balance: sweepstakesBalance },
  ];

  // Consume the SelectedTokenContext
  const { selectedToken, updateSelectedToken } = useSelectedToken();

  // Handler to toggle currency
  const handleToggle = () => {
    const newToken = selectedToken === 'token' ? 'sweepstakes' : 'token';
    updateSelectedToken(newToken);
  };

  // Handler for "Get Coins" button to prevent toggling
  const handleGetCoins = (e) => {
    e.stopPropagation(); // Prevent the toggle when clicking the button
    onGetCoins();
  };

  // Format the balance based on the amount
  const formatBalance = (balance) => {
    if (balance >= 1000) {
      return Number(balance).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    return Number(balance).toFixed(2);
  };

  // Get the active and inactive currency details
  const activeCurrency = currencies.find((c) => c.id === selectedToken);
  const inactiveCurrency = currencies.find((c) => c.id !== selectedToken);

  return (
    <div className="balance-toggle" onClick={handleToggle}>
      <div className="balance-toggle__display">
        <FaCoins className="balance-toggle__icon" />
        <span className="balance-toggle__amount">
          {formatBalance(activeCurrency.balance)}{' '}
          <span className="balance-toggle__active-currency">
            {activeCurrency.label}
          </span>
          <span className="balance-toggle__inactive-currency">
            {inactiveCurrency.label}
          </span>
        </span>
      </div>
      <button
        className="balance-toggle__get-coins"
        onClick={handleGetCoins}
        type="button"
      >
        Get Coins
      </button>
    </div>
  );
};

// Prop type validation for better maintainability
BalanceToggle.propTypes = {
  tokenBalance: PropTypes.number.isRequired,
  sweepstakesBalance: PropTypes.number.isRequired,
  onGetCoins: PropTypes.func.isRequired,
};

export default BalanceToggle;
