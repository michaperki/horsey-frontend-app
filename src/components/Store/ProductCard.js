
// src/components/Store/ProductCard.js

import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onPurchase, purchaseLoading }) => {
  return (
    <div className="store-product-card">
      <img
        src={`/images/${product.imageFileName}`}
        alt={product.name}
        className="product-image"
      />
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          Price: ${product.priceInUSD} | Player Tokens: {product.playerTokens} | Sweepstakes Tokens: {product.sweepstakesTokens}
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

export default ProductCard;

