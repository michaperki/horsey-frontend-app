
// src/components/Store/PaymentMethodSelector.js

import React from 'react';
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

export default PaymentMethodSelector;
