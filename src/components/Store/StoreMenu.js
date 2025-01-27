
// src/components/Store/StoreMenu.js

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import './StoreMenu.css';

const StoreMenu = ({ categories, onSelectCategory }) => {
  return (
    <div className="store-menu">
      <h3>Categories</h3>
      <ul>
        {categories.map((category) => (
          <li key={category}>
            <button onClick={() => onSelectCategory(category)}>
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Add PropTypes validation
StoreMenu.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired, // categories should be an array of strings and is required
  onSelectCategory: PropTypes.func.isRequired, // onSelectCategory should be a function and is required
};

export default StoreMenu;
