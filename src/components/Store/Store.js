
// src/components/Store/Store.js

import React, { useEffect, useState, useRef } from 'react';
import './Store.css';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProducts, purchaseTokens } from '../../services/api';
import StoreMenu from './StoreMenu';
import PaymentMethodSelector from './PaymentMethodSelector';
import CategorySection from './CategorySection';

const Store = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const sections = useRef({});
  const storeContentRef = useRef(null); // Ref to the scrollable container

  // Fetch products from the API
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [token]);

  // Handle purchase action
  const handlePurchase = async (product) => {
    setPurchaseLoading((prev) => ({ ...prev, [product._id]: true }));
    try {
      const purchaseData = await purchaseTokens(paymentMethod, product.priceInUSD);
      console.log('Purchase successful:', purchaseData);
      // Optionally, update the UI or store updated balances here
    } catch (error) {
      console.error('Error purchasing tokens:', error);
    } finally {
      setPurchaseLoading((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  // Handle scrolling to a category section within the store-content container
  const scrollToSection = (category) => {
    if (sections.current[category] && storeContentRef.current) {
      const section = sections.current[category];
      const container = storeContentRef.current;

      // Get the position of the section relative to the container
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      // Calculate the top position relative to the container
      const offset = sectionRect.top - containerRect.top + container.scrollTop;

      // Scroll the container to the calculated position
      container.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }
  };

  // Categorize products
  const categorizedProducts = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const categoryList = Object.keys(categorizedProducts);

  if (loading) {
    return <div className="store-loading">Loading Store...</div>;
  }

  return (
    <div className="store-container">
      <h1 className="store-title">Store</h1>
      <div className="store-layout">
        {/* Left Menu */}
        <StoreMenu categories={categoryList} onSelectCategory={scrollToSection} />

        {/* Right Panel */}
        <div className="store-content" ref={storeContentRef}>
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onChange={setPaymentMethod}
          />

          {categoryList.map((category) => (
            <CategorySection
              key={category}
              category={category}
              products={categorizedProducts[category]}
              onPurchase={handlePurchase}
              purchaseLoading={purchaseLoading[category]}
              ref={(el) => (sections.current[category] = el)}
            />
          ))}

          <p className="store-note">
            *To enjoy premium features, make sure to check out our membership options!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Store;

