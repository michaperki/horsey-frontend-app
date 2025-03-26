
// src/components/Store/CategorySection.js

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import ProductCard from './ProductCard';
import './CategorySection.css';

const CategorySection = React.forwardRef(({ category, products, onPurchase, purchaseLoading }, ref) => {
  return (
    <div ref={ref} className="store-category">
      <h2>{category}</h2>
      <div className="store-products">
        {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onPurchase={onPurchase}
          purchaseLoading={purchaseLoading[product._id]}
        />
        ))}
      </div>
    </div>
  );
});

CategorySection.propTypes = {
  category: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPurchase: PropTypes.func.isRequired,
  purchaseLoading: PropTypes.object.isRequired, // Update to object
};

export default CategorySection;
