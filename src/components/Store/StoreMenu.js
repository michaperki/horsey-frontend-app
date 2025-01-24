
// src/components/Store/StoreMenu.js

import React from 'react';
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

export default StoreMenu;
