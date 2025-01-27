
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
            purchaseLoading={purchaseLoading}
          />
        ))}
      </div>
    </div>
  );
});

CategorySection.propTypes = {
  category: PropTypes.string.isRequired, // Validate `category` as a required string
  products: PropTypes.arrayOf(PropTypes.object).isRequired, // Validate `products` as an array of objects
  onPurchase: PropTypes.func.isRequired, // Validate `onPurchase` as a required function
  purchaseLoading: PropTypes.bool.isRequired, // Validate `purchaseLoading` as a required boolean
};

export default CategorySection;
