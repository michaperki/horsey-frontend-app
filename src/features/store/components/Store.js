// src/features/store/components/Store.js

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaShoppingCart, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaSpinner,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useToken } from 'features/token/contexts/TokenContext';
import { fetchProducts, purchaseTokens } from '../services/api';
import StoreMenu from './StoreMenu';
import PaymentMethodSelector from './PaymentMethodSelector';
import CategorySection from './CategorySection';
import './Store.css';

const Store = () => {
  const { token } = useAuth();
  const { tokenBalance, sweepstakesBalance, updateTokenBalance, updateSweepstakesBalance } = useToken();
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [checkoutStep, setCheckoutStep] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [animation, setAnimation] = useState('fadeIn');
  
  const sections = useRef({});
  const storeContentRef = useRef(null);

  // Fetch products from the API
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
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

  // Handle initiating the purchase flow
  const handleInitiatePurchase = (product) => {
    setSelectedProduct(product);
    setCheckoutStep('confirm');
    setAnimation('slideRight');
  };

  // Handle cancelling the purchase flow
  const handleCancelPurchase = () => {
    setAnimation('slideLeft');
    setTimeout(() => {
      setCheckoutStep(null);
      setSelectedProduct(null);
      setCheckoutError(null);
      setCheckoutSuccess(false);
    }, 300);
  };

  // Handle confirming purchase
  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    
    setCheckoutError(null);
    setPurchaseLoading(prev => ({ ...prev, [selectedProduct._id]: true }));
    
    try {
      const purchaseData = await purchaseTokens(paymentMethod, selectedProduct.priceInUSD);
      console.log('Purchase successful:', purchaseData);
      
      // Update balances
      updateTokenBalance(purchaseData.tokenBalance || (tokenBalance + selectedProduct.playerTokens));
      updateSweepstakesBalance(purchaseData.sweepstakesBalance || (sweepstakesBalance + selectedProduct.sweepstakesTokens));
      
      // Show success
      setCheckoutSuccess(true);
      setCheckoutStep('success');
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setCheckoutError(error.message || 'Failed to complete purchase. Please try again.');
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [selectedProduct._id]: false }));
    }
  };

  // Handle scrolling to a category section
  const scrollToSection = (category) => {
    if (sections.current[category] && storeContentRef.current) {
      const section = sections.current[category];
      const container = storeContentRef.current;
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const offset = sectionRect.top - containerRect.top + container.scrollTop;
      
      container.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }
  };

  // Group products by category
  const categorizedProducts = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const categoryList = Object.keys(categorizedProducts);

  // Animation variants
  const containerVariants = {
    fadeIn: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 }
    },
    fadeVisible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    slideRight: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.3 }
    },
    slideLeft: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.3 }
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="store-loading">
        <div className="store-loading-spinner"></div>
        <p>Loading Store...</p>
      </div>
    );
  }

  // Render checkout confirmation step
  const renderConfirmStep = () => (
    <motion.div 
      className="checkout-container"
      initial={animation === 'slideRight' ? 'slideRight' : 'fadeIn'}
      animate="center"
      exit="slideLeft"
      variants={containerVariants}
    >
      <div className="checkout-header">
        <button className="back-button" onClick={handleCancelPurchase}>
          <FaArrowLeft /> Back to Store
        </button>
      </div>
      
      {selectedProduct && (
        <div className="checkout-content">
          <h2>Confirm Purchase</h2>
          
          <div className="checkout-product">
            <div className="product-image-wrapper checkout-image">
              <img
                src={`/images/${selectedProduct.imageFileName}`}
                alt={selectedProduct.name}
                className="product-image"
              />
            </div>
            <div className="checkout-details">
              <h3>{selectedProduct.name}</h3>
              <p>{selectedProduct.description}</p>
              <div className="checkout-items">
                <div className="checkout-item">
                  <span>Price:</span>
                  <span className="value">${selectedProduct.priceInUSD.toFixed(2)}</span>
                </div>
                <div className="checkout-item">
                  <span>Player Tokens:</span>
                  <span className="value tokens">{selectedProduct.playerTokens} <FaCoins /></span>
                </div>
                <div className="checkout-item">
                  <span>Sweepstakes Tokens:</span>
                  <span className="value sweeps">{selectedProduct.sweepstakesTokens} <FaCoins /></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="checkout-payment">
            <h3>Payment Method</h3>
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>
          
          {checkoutError && (
            <div className="checkout-error">
              <FaExclamationTriangle />
              <span>{checkoutError}</span>
            </div>
          )}
          
          <div className="checkout-actions">
            <button 
              className="cancel-button" 
              onClick={handleCancelPurchase}
              disabled={purchaseLoading[selectedProduct._id]}
            >
              <FaTimes /> Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={handleConfirmPurchase}
              disabled={purchaseLoading[selectedProduct._id]}
            >
              {purchaseLoading[selectedProduct._id] ? (
                <>
                  <FaSpinner className="spinner" /> Processing...
                </>
              ) : (
                <>
                  <FaShoppingCart /> Confirm Purchase
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Render checkout success step
  const renderSuccessStep = () => (
    <motion.div 
      className="checkout-container success-container"
      initial="fadeIn"
      animate="center"
      exit="fadeIn"
      variants={containerVariants}
    >
      <div className="success-content">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h2>Purchase Successful!</h2>
        <p>Thank you for your purchase. Your tokens have been added to your account.</p>
        <div className="success-details">
          <div className="success-item">
            <span>Player Tokens:</span>
            <span className="value tokens">+{selectedProduct.playerTokens} <FaCoins /></span>
          </div>
          <div className="success-item">
            <span>Sweepstakes Tokens:</span>
            <span className="value sweeps">+{selectedProduct.sweepstakesTokens} <FaCoins /></span>
          </div>
        </div>
        <button className="return-button" onClick={handleCancelPurchase}>
          Return to Store
        </button>
      </div>
    </motion.div>
  );

  // Render main store content
  const renderStoreContent = () => (
    <motion.div 
      className="store-container"
      initial={animation === 'slideLeft' ? 'slideLeft' : 'fadeIn'}
      animate="center"
      exit="slideRight"
      variants={containerVariants}
    >
      <h1 className="store-title">Token Store</h1>
      <p className="store-subtitle">Purchase tokens to place bets and unlock premium features</p>
      
      <div className="store-balances">
        <div className="balance-card">
          <div className="balance-icon token-icon">
            <FaCoins />
          </div>
          <div className="balance-info">
            <span className="balance-label">Player Tokens</span>
            <span className="balance-value">{tokenBalance}</span>
          </div>
        </div>
        <div className="balance-card">
          <div className="balance-icon sweeps-icon">
            <FaCoins />
          </div>
          <div className="balance-info">
            <span className="balance-label">Sweepstakes Tokens</span>
            <span className="balance-value">{sweepstakesBalance}</span>
          </div>
        </div>
      </div>
      
      <div className="store-layout">
        <StoreMenu categories={categoryList} onSelectCategory={scrollToSection} />
        
        <div className="store-content" ref={storeContentRef}>
          {categoryList.map((category) => (
            <CategorySection
              key={category}
              category={category}
              products={categorizedProducts[category]}
              onPurchase={handleInitiatePurchase}
              purchaseLoading={categorizedProducts[category].reduce(
                (acc, product) => ({
                  ...acc,
                  [product._id]: purchaseLoading[product._id] || false,
                }),
                {}
              )}
              ref={(el) => (sections.current[category] = el)}
            />
          ))}
          
          <div className="store-info">
            <h3>Why Buy Tokens?</h3>
            <ul className="store-benefits">
              <li>Place bets against other players</li>
              <li>Enter tournaments with bigger prize pools</li>
              <li>Unlock exclusive customizations</li>
              <li>Support the Horsey platform</li>
            </ul>
            
            <p className="store-note">
              *All purchases are final. Tokens have no cash value and cannot be converted back to real currency.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="store-wrapper">
      <AnimatePresence mode="wait">
        {checkoutStep === 'confirm' && renderConfirmStep()}
        {checkoutStep === 'success' && renderSuccessStep()}
        {!checkoutStep && renderStoreContent()}
      </AnimatePresence>
    </div>
  );
};

export default Store;