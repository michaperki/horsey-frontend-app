
// src/features/store/components/PaymentMethodSelector.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaCreditCard, FaBitcoin, FaPaypal, FaApplePay, FaGooglePay, FaExclamationTriangle } from 'react-icons/fa';
import './PaymentMethodSelector.css';

const paymentOptions = [
  { id: 'credit', label: 'Credit Card', icon: <FaCreditCard /> },
  { id: 'paypal', label: 'PayPal', icon: <FaPaypal /> },
  { id: 'crypto', label: 'Cryptocurrency', icon: <FaBitcoin /> },
  { id: 'apple_pay', label: 'Apple Pay', icon: <FaApplePay /> },
  { id: 'google_pay', label: 'Google Pay', icon: <FaGooglePay /> }
];

const PaymentMethodSelector = ({ paymentMethod, onChange }) => {
  // Check if the selected payment method is valid
  const isValidPaymentMethod = paymentOptions.some(option => option.id === paymentMethod);

  return (
    <div className="payment-method-selector">
      <div className="payment-options">
        {paymentOptions.map((option) => (
          <motion.div
            key={option.id}
            className={`payment-option ${paymentMethod === option.id ? 'active' : ''}`}
            onClick={() => onChange(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="payment-icon">{option.icon}</div>
            <span className="payment-label">{option.label}</span>
            {paymentMethod === option.id && (
              <motion.div 
                className="selected-indicator"
                layoutId="selectedPayment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>
      
      {!isValidPaymentMethod && (
        <div className="payment-warning">
          <FaExclamationTriangle className="warning-icon" /> Invalid payment method selected.
        </div>
      )}
      
      <div className="payment-info">
        <p>All transactions are secure and encrypted</p>
        <div className="security-badges">
          <span className="badge">SSL Secured</span>
          <span className="badge">PCI Compliant</span>
        </div>
      </div>
    </div>
  );
};

PaymentMethodSelector.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;

