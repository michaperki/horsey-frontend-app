
import React, { useEffect, useState } from 'react';
import './Store.css';
import { useAuth } from '../contexts/AuthContext';
import { fetchProducts, purchaseTokens } from '../services/api'; // Import fetchProducts from the new api service

const Store = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false); // Track loading state for purchase
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // Default to stripe

  // Fetch products from the API
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const productsData = await fetchProducts(); // Fetch products from the API service
        setProducts(productsData); // Set products in state
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
    setPurchaseLoading(true);
    try {
      const purchaseData = await purchaseTokens(paymentMethod, product.priceInUSD); // Pass product price for the purchase
      console.log('Purchase successful:', purchaseData);
      // Optionally, update the UI or store updated balances here
    } catch (error) {
      console.error('Error purchasing tokens:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <div className="store-loading">Loading Store...</div>;
  }

  return (
    <div className="store-container">
      <h1 className="store-title">Store</h1>

      <div className="payment-method-selector">
        <label>Select Payment Method: </label>
        <select onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
          <option value="stripe">Stripe</option>
          <option value="crypto">Crypto (Mock)</option>
        </select>
      </div>

      <div className="store-products">
        {products.map((product) => (
          <div key={product._id} className="store-product-card">
            <img
              src={`/images/${product.imageFileName}`} // Example: product.imageFileName = 'basic-token-pack.png'
              alt={product.name}
              className="product-image"
            />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <div className="product-price">
              Price: ${product.priceInUSD} | Player Tokens: {product.playerTokens} | Sweepstakes Tokens: {product.sweepstakesTokens}
            </div>
            <button
              className="purchase-button"
              onClick={() => handlePurchase(product)} // Trigger purchase for the selected product
              disabled={purchaseLoading} // Disable button if purchasing
            >
              {purchaseLoading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>

      <p className="store-note">
        *To enjoy premium features, make sure to check out our membership options!
      </p>
    </div>
  );
};

export default Store;

