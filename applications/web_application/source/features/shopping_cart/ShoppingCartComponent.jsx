import React, { useState, useEffect } from 'react';
import ShoppingCartApiClient from './ShoppingCartApiClient';
import OrderManagementApiClient from '../order_management/OrderManagementApiClient';
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShoppingCartComponent = () => {
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await ShoppingCartApiClient.retrieveCart();
      setCart(data);
    } catch (apiException) {
      setError('Failed to retrieve shopping cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (cartItemId, currentQuantity, delta) => {
    const targetQuantity = currentQuantity + delta;
    if (targetQuantity <= 0) return;
    setError('');
    try {
      await ShoppingCartApiClient.updateQuantity(cartItemId, targetQuantity);
      loadCart();
      // Dispatch storage event to trigger any badge listener update
      window.dispatchEvent(new Event('storage'));
    } catch (apiException) {
      setError(apiException.message || 'Failed to update quantity.');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setError('');
    try {
      await ShoppingCartApiClient.removeFromCart(cartItemId);
      loadCart();
      window.dispatchEvent(new Event('storage'));
    } catch (apiException) {
      setError('Failed to remove item from cart.');
    }
  };

  // Helper to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://checkout.razorpay.com/v1/checkout.js';
      scriptElement.onload = () => resolve(true);
      scriptElement.onerror = () => resolve(false);
      document.body.appendChild(scriptElement);
    });
  };

  const handleCheckout = async (useMock = false) => {
    setError('');
    setProcessingCheckout(true);

    try {
      // 1. Initialize checkout on backend (registers transaction, creates Razorpay Order)
      const checkoutDetails = await OrderManagementApiClient.checkout();
      const { order_id, razorpay_order_id, amount, key_id } = checkoutDetails;
      
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');

      // 2. Perform Mock checkout only if user explicitly clicked "Simulate Mock Checkout"
      if (useMock) {
        // Direct verify on backend using simulated verification details
        const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
        const mockSignature = `mock_signature_${Math.random().toString(36).substr(2, 16)}`;
        
        const verifiedOrder = await OrderManagementApiClient.verifyPayment(
          razorpay_order_id,
          mockPaymentId,
          mockSignature
        );

        setSuccessOrder(verifiedOrder);
        setCart({ items: [], total_amount: 0 });
        window.dispatchEvent(new Event('storage'));
        setProcessingCheckout(false);
        return;
      }

      // 3. Validate that real Razorpay keys are configured
      if (!key_id || key_id.startsWith('rzp_test_placeholder')) {
        throw new Error('Razorpay API keys are not configured. Please set your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment, or use "Simulate Mock Checkout" for testing.');
      }

      // 3. Load Razorpay overlay for live/test online transactions
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay payment gateway failed to load. Please try Mock Checkout.');
      }

      const checkoutOptions = {
        key: key_id,
        amount: amount * 100, // paise
        currency: 'INR',
        name: 'SoleVault Footwear',
        description: 'Premium Footwear Purchase',
        image: '/shoe_store_logo.png',
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            setProcessingCheckout(true);
            const verifiedOrder = await OrderManagementApiClient.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            setSuccessOrder(verifiedOrder);
            setCart({ items: [], total_amount: 0 });
            window.dispatchEvent(new Event('storage'));
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed.');
          } finally {
            setProcessingCheckout(false);
          }
        },
        prefill: {
          name: userProfile.name || '',
          email: userProfile.email || '',
          contact: ''
        },
        notes: {
          company: 'SoleVault Footwear Pvt Ltd',
          order_source: 'web_application'
        },
        theme: {
          color: '#6366f1',
          backdrop_color: 'rgba(15, 12, 41, 0.85)'
        },
        config: {
          display: {
            language: 'en'
          }
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            setProcessingCheckout(false);
          }
        }
      };

      const razorpayWindowInstance = new window.Razorpay(checkoutOptions);
      razorpayWindowInstance.open();

    } catch (checkoutException) {
      setError(checkoutException.message || 'Checkout failed. Please try again.');
      setProcessingCheckout(false);
    }
  };

  if (successOrder) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <CheckCircle size={64} color="var(--color-secondary-accent)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', background: 'var(--gradient-cyber-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--text-color-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Thank you for your purchase. Your order has been placed successfully and database inventory levels have been updated.
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color-card)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-color-muted)' }}>Order ID:</span>
              <span style={{ fontWeight: 600 }}>#{successOrder.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-color-muted)' }}>Razorpay Order ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{successOrder.razorpay_order_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-color-secondary)', fontWeight: 600 }}>Total Paid:</span>
              <span style={{ color: 'var(--color-secondary-accent)', fontWeight: 700 }}>${successOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/orders')} style={{ flex: 1, padding: '0.75rem' }}>
              View Orders
            </button>
            <button className="btn-primary" onClick={() => navigate('/catalog')} style={{ flex: 1, padding: '0.75rem' }}>
              Keep Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-sunset-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          Your Shopping Cart
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Review selected items and proceed to secure Razorpay checkout.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <ShoppingBag size={48} color="var(--text-color-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-color-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>You have not added any footwear products yet.</p>
          <button className="btn-primary" onClick={() => navigate('/catalog')}>
            Browse Shoe Catalog <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cart.items.map((item) => (
              <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.25rem', flexWrap: 'wrap' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color-card)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-color-muted)' }}>No Img</div>
                )}
                
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-color-muted)', letterSpacing: '0.05em' }}>{item.brand}</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color-primary)', marginTop: '0.15rem' }}>{item.name}</h4>
                  <div style={{ color: 'var(--color-secondary-accent)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>
                    ${item.price.toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color-card)', borderRadius: '8px', padding: '0.25rem' }}>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity, -1)} disabled={item.quantity <= 1} style={{ background: 'none', border: 'none', color: 'var(--text-color-secondary)', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '1.5rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-color-secondary)', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ width: '100px', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-color-muted)' }}>Subtotal</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color-primary)' }}>
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>

                <button className="btn-secondary" onClick={() => handleRemoveItem(item.id)} style={{ padding: '0.6rem', minWidth: 'auto', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171' }} title="Remove Item">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="glass-card" style={{ height: 'fit-content', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              Summary
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-color-secondary)' }}>Total Items:</span>
              <span style={{ fontWeight: 600 }}>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Total Amount:</span>
              <span style={{ color: 'var(--color-secondary-accent)', fontWeight: 800 }}>
                ${cart.total_amount.toFixed(2)}
              </span>
            </div>

            {/* Checkouts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                className="btn-primary"
                onClick={() => handleCheckout(false)}
                disabled={processingCheckout}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                <CreditCard size={18} /> {processingCheckout ? 'Processing...' : 'Pay with Razorpay'}
              </button>

              <button
                className="btn-secondary"
                onClick={() => handleCheckout(true)}
                disabled={processingCheckout}
                style={{ width: '100%', padding: '0.85rem', borderColor: 'var(--color-primary-accent)', color: 'var(--color-neon-cyan)' }}
              >
                Simulate Mock Checkout
              </button>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-color-muted)', textAlign: 'center', marginTop: '1.25rem', lineHeight: '1.4' }}>
              * Simulated Checkout tests signature verification and inventory adjustments locally without requiring live payment credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
