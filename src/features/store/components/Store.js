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
    }, 300);
  };

  // Handle confirming purchase
  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    
    setCheckoutError(null);
    setPurchaseLoading(prev => ({ ...prev, [selectedProduct._id]: true }));
    
    try {
      const purchaseData = await purchaseTokens(paymentMethod, selectedProduct.priceInUSD);
      
      // Update balances
      updateTokenBalance(purchaseData.tokenBalance || (tokenBalance + selectedProduct.playerTokens));
      updateSweepstakesBalance(purchaseData.sweepstakesBalance || (sweepstakesBalance + selectedProduct.sweepstakesTokens));
      
      // Show success
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

  // Enhanced Animation variants
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
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="store-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="store-loading-spinner"></div>
        <p>Loading Store...</p>
      </motion.div>
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
        <motion.div 
          className="checkout-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h2>Confirm Purchase</h2>
          
          <div className="checkout-product">
            <motion.div 
              className="product-image-wrapper checkout-image"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={`/images/${selectedProduct.imageFileName}`}
                alt={selectedProduct.name}
                className="product-image"
              />
            </motion.div>
            <div className="checkout-details">
              <h3>{selectedProduct.name}</h3>
              <p>{selectedProduct.description}</p>
              <div className="checkout-items">
                <motion.div 
                  className="checkout-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span>Price:</span>
                  <span className="value">${selectedProduct.priceInUSD.toFixed(2)}</span>
                </motion.div>
                <motion.div 
                  className="checkout-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span>Player Tokens:</span>
                  <span className="value tokens">{selectedProduct.playerTokens} <FaCoins /></span>
                </motion.div>
                <motion.div 
                  className="checkout-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>Sweepstakes Tokens:</span>
                  <span className="value sweeps">{selectedProduct.sweepstakesTokens} <FaCoins /></span>
                </motion.div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="checkout-payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Payment Method</h3>
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </motion.div>
          
          {checkoutError && (
            <motion.div 
              className="checkout-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FaExclamationTriangle />
              <span>{checkoutError}</span>
            </motion.div>
          )}
          
          <motion.div 
            className="checkout-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button 
              className="cancel-button" 
              onClick={handleCancelPurchase}
              disabled={purchaseLoading[selectedProduct._id]}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaTimes /> Cancel
            </motion.button>
            <motion.button 
              className="confirm-button"
              onClick={handleConfirmPurchase}
              disabled={purchaseLoading[selectedProduct._id]}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
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
            </motion.button>
          </motion.div>
        </motion.div>
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
      <motion.div 
        className="success-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
      >
        <motion.div 
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <FaCheckCircle />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Purchase Successful!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Thank you for your purchase. Your tokens have been added to your account.
        </motion.p>
        <motion.div 
          className="success-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="success-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>Player Tokens:</span>
            <span className="value tokens">+{selectedProduct.playerTokens} <FaCoins /></span>
          </motion.div>
          <motion.div 
            className="success-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span>Sweepstakes Tokens:</span>
            <span className="value sweeps">+{selectedProduct.sweepstakesTokens} <FaCoins /></span>
          </motion.div>
        </motion.div>
        <motion.button 
          className="return-button" 
          onClick={handleCancelPurchase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Return to Store
        </motion.button>
      </motion.div>
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
      <motion.h1 
        className="store-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Token Store
      </motion.h1>
      <motion.p 
        className="store-subtitle"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Purchase tokens to place bets and unlock premium features
      </motion.p>
      
      <motion.div 
        className="store-balances"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="balance-card"
          whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)" }}
        >
          <div className="balance-icon token-icon">
            <FaCoins />
          </div>
          <div className="balance-info">
            <span className="balance-label">Player Tokens</span>
            <span className="balance-value">{tokenBalance}</span>
          </div>
        </motion.div>
        <motion.div 
          className="balance-card"
          whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)" }}
        >
          <div className="balance-icon sweeps-icon">
            <FaCoins />
          </div>
          <div className="balance-info">
            <span className="balance-label">Sweepstakes Tokens</span>
            <span className="balance-value">{sweepstakesBalance}</span>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="store-layout">
        <StoreMenu categories={categoryList} onSelectCategory={scrollToSection} />
        
        <motion.div 
          className="store-content" 
          ref={storeContentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {categoryList.map((category, index) => (
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
          
          <motion.div 
            className="store-info"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Why Buy Tokens?</h3>
            <ul className="store-benefits">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >Place bets against other players</motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >Enter tournaments with bigger prize pools</motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >Unlock exclusive customizations</motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >Support the Horsey platform</motion.li>
            </ul>
            
            <motion.p 
              className="store-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              *All purchases are final. Tokens have no cash value and cannot be converted back to real currency.
            </motion.p>
          </motion.div>
        </motion.div>
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