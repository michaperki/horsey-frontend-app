
// src/components/Store/ProductCard.js

import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';

const ProductCard = ({ product, onPurchase, purchaseLoading }) => {
  return (
    <div className="store-product-card">
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
          <p><strong>Price:</strong> ${product.priceInUSD}</p>
          <p><strong>Player Tokens:</strong> {product.playerTokens}</p>
          <p><strong>Sweepstakes Tokens:</strong> {product.sweepstakesTokens}</p>
        </div>
        <button
          className="purchase-button"
          onClick={() => onPurchase(product)}
          disabled={purchaseLoading}
        >
          {purchaseLoading ? 'Processing...' : 'Purchase'}
        </button>
      </div>
    </div>
  );
};

// PropTypes validation
ProductCard.propTypes = {
  product: PropTypes.shape({
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
