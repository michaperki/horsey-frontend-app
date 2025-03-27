// src/features/store/components/ProductCard.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaCoins, FaShoppingCart, FaSpinner } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product, onPurchase, purchaseLoading }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: { 
      y: -10,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 200, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="store-product-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="product-image-wrapper">
        <img
          src={`/images/${product.imageFileName}`}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          <p>
            <span>Price:</span>
            <span className="price-value">${product.priceInUSD.toFixed(2)}</span>
          </p>
          <p>
            <span>Player Tokens:</span>
            <span className="tokens-value">
              {product.playerTokens} <FaCoins />
            </span>
          </p>
          <p>
            <span>Sweepstakes:</span>
            <span className="sweeps-value">
              {product.sweepstakesTokens} <FaCoins />
            </span>
          </p>
        </div>
        <motion.button
          className="purchase-button"
          onClick={() => onPurchase(product)}
          disabled={purchaseLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {purchaseLoading ? (
            <>
              <FaSpinner className="spinner" /> 
              Processing...
            </>
          ) : (
            <>
              <FaShoppingCart /> 
              Purchase
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// PropTypes validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageFileName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    priceInUSD: PropTypes.number.isRequired,
    playerTokens: PropTypes.number.isRequired,
    sweepstakesTokens: PropTypes.number.isRequired,
  }).isRequired,
  onPurchase: PropTypes.func.isRequired,
  purchaseLoading: PropTypes.bool.isRequired,
};

export default ProductCard;