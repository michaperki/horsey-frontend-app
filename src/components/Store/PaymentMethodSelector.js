
// src/components/Store/PaymentMethodSelector.js

import React from 'react';
import PropTypes from 'prop-types';
import './PaymentMethodSelector.css';

const PaymentMethodSelector = ({ paymentMethod, onChange }) => {
  return (
    <div className="payment-method-selector">
      <label>Select Payment Method: </label>
      <select onChange={(e) => onChange(e.target.value)} value={paymentMethod}>
        <option value="stripe">Stripe</option>
        <option value="crypto">Crypto (Mock)</option>
      </select>
    </div>
  );
};

// PropTypes validation
PaymentMethodSelector.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;
