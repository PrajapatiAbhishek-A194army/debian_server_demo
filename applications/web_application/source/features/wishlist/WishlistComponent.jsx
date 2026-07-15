import React, { useState, useEffect } from 'react';
import WishlistApiClient from './WishlistApiClient';
import ShoppingCartApiClient from '../shopping_cart/ShoppingCartApiClient';
import { Heart, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WishlistComponent = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await WishlistApiClient.retrieveWishlist();
      setWishlist(data);
    } catch (apiException) {
      setError('Failed to retrieve wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (wishlistItemId) => {
    setError('');
    setSuccess('');
    try {
      await WishlistApiClient.removeFromWishlist(wishlistItemId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
      setSuccess('Item removed from wishlist.');
    } catch (apiException) {
      setError('Failed to remove item.');
    }
  };

  const handleAddToCart = async (shoeId, shoeName, wishlistItemId) => {
    setError('');
    setSuccess('');
    try {
      // Add to cart
      await ShoppingCartApiClient.addToCart(shoeId, 1);
      // Remove from wishlist
      await WishlistApiClient.removeFromWishlist(wishlistItemId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
      setSuccess(`Moved ${shoeName} to your cart successfully!`);
      // Update badge
      window.dispatchEvent(new Event('storage'));
    } catch (apiException) {
      setError(apiException.message || 'Failed to move item to cart.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-sunset-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          My Wishlist
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Items you have saved to purchase later.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--color-secondary-accent)', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Heart size={48} color="var(--text-color-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-color-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Mark footwear products as favorites to save them here.</p>
          <button className="btn-primary" onClick={() => navigate('/catalog')}>
            Explore Footwear <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {wishlist.map((item) => (
            <div key={item.id} className="glass-card shoe-card">
              <div className="shoe-image-container">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="shoe-image" />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', color: 'var(--text-color-muted)' }}>No Image</div>
                )}
                <button
                  className="shoe-wishlist-btn active"
                  onClick={() => handleRemove(item.id)}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <span className="shoe-brand">{item.brand}</span>
              <h3 className="shoe-title">{item.name}</h3>
              
              <div className="shoe-footer" style={{ marginTop: '1.5rem' }}>
                <span className="shoe-price">${item.price.toFixed(2)}</span>
                
                <button
                  className="btn-primary"
                  onClick={() => handleAddToCart(item.shoe_id, item.name, item.id)}
                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem' }}
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
