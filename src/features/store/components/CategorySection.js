// src/features/store/components/CategorySection.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import './CategorySection.css';

const CategorySection = React.forwardRef(({ category, products, onPurchase, purchaseLoading }, ref) => {
  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 50, 
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const getCategoryIcon = () => {
    // Return different decorative elements based on category
    switch(category.toLowerCase()) {
      case 'beginner packs':
        return '🔰';
      case 'standard packs':
        return '🏆';
      case 'premium packs':
        return '💎';
      case 'memberships':
        return '👑';
      default:
        return '🎁';
    }
  };

  return (
    <motion.div 
      ref={ref} 
      className="store-category"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <h2>
        <span className="category-icon">{getCategoryIcon()}</span> 
        {category}
      </h2>
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
    </motion.div>
  );
});

CategorySection.displayName = 'CategorySection';

CategorySection.propTypes = {
  category: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPurchase: PropTypes.func.isRequired,
  purchaseLoading: PropTypes.object.isRequired,
};

export default CategorySection;