import React, { useState, useEffect } from 'react';
import ShoeCatalogApiClient from './ShoeCatalogApiClient';
import ShoppingCartApiClient from '../shopping_cart/ShoppingCartApiClient';
import WishlistApiClient from '../wishlist/WishlistApiClient';
import { Search, Filter, ShoppingCart, Heart, Tag } from 'lucide-react';

export const CustomerShoeCatalogComponent = () => {
  const [shoes, setShoes] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  
  // Notification banner
  const [infoMessage, setInfoMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        searchQuery,
        brand,
        size: size ? parseFloat(size) : undefined,
        minimumPrice: minimumPrice ? parseFloat(minimumPrice) : undefined,
        maximumPrice: maximumPrice ? parseFloat(maximumPrice) : undefined
      };
      const fetchedShoes = await ShoeCatalogApiClient.retrieveShoes(filters);
      setShoes(fetchedShoes);

      // Try fetching wishlist if user is authenticated
      const token = localStorage.getItem('token');
      if (token) {
        const fetchedWishlist = await WishlistApiClient.retrieveWishlist();
        setWishlist(fetchedWishlist);
      }
    } catch (apiException) {
      setError('Could not load products. Please check if backend is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brand, size, minimumPrice, maximumPrice]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadData();
  };

  const showNotification = (message) => {
    setInfoMessage(message);
    setTimeout(() => {
      setInfoMessage('');
    }, 3000);
  };

  const handleAddToCart = async (shoeId, shoeName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to add items to your cart.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      await ShoppingCartApiClient.addToCart(shoeId, 1);
      showNotification(`Added ${shoeName} to your cart successfully!`);
      // Dispatch a storage event to update the navbar cart badge count
      window.dispatchEvent(new Event('storage'));
    } catch (cartException) {
      setError(cartException.message || 'Failed to add item to cart.');
    }
  };

  const handleWishlistToggle = async (shoeId, shoeName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to manage your wishlist.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const wishlistItem = wishlist.find(item => item.shoe_id === shoeId);

    try {
      if (wishlistItem) {
        await WishlistApiClient.removeFromWishlist(wishlistItem.id);
        setWishlist(prev => prev.filter(item => item.id !== wishlistItem.id));
        showNotification(`Removed ${shoeName} from your wishlist.`);
      } else {
        const newWishlistItem = await WishlistApiClient.addToWishlist(shoeId);
        setWishlist(prev => [...prev, newWishlistItem]);
        showNotification(`Added ${shoeName} to your wishlist.`);
      }
    } catch (wishlistException) {
      setError('Failed to update wishlist.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-sunset-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          Find Your Perfect Fit
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Browse our high-performance athletic footwear and premium sneakers.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {infoMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--background-color-surface)', border: '1px solid var(--color-primary-accent)', color: 'var(--text-color-primary)', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-neon-glow)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideIn 0.3s ease-out' }}>
          <Tag size={18} color="var(--color-neon-cyan)" />
          {infoMessage}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="catalog-search-input">Search Footwear</label>
            <div style={{ position: 'relative' }}>
              <input
                id="catalog-search-input"
                type="text"
                className="form-input"
                placeholder="Air Max, Runner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-color-secondary)', cursor: 'pointer' }}>
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="catalog-brand-select">Brand</label>
            <select
              id="catalog-brand-select"
              className="form-input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={{ background: 'var(--background-color-base)' }}
            >
              <option value="">All Brands</option>
              <option value="Nike">Nike</option>
              <option value="Adidas">Adidas</option>
              <option value="Puma">Puma</option>
              <option value="Jordan">Jordan</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="catalog-size-input">Size</label>
            <input
              id="catalog-size-input"
              type="number"
              step="0.5"
              className="form-input"
              placeholder="e.g. 10"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="catalog-min-price">Price Limit (Min - Max)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="catalog-min-price"
                type="number"
                className="form-input"
                placeholder="Min"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(e.target.value)}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={maximumPrice}
                onChange={(e) => setMaximumPrice(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Catalog Render */}
      {loading ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : shoes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-color-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No shoes found</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-color-muted)' }}>Try resetting the filters or modifying your search query.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {shoes.map((shoe) => {
            const isFavorite = wishlist.some(item => item.shoe_id === shoe.id);
            return (
              <div key={shoe.id} className="glass-card shoe-card">
                <div className="shoe-image-container">
                  {shoe.image_url ? (
                    <img src={shoe.image_url} alt={shoe.name} className="shoe-image" />
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 100 + '%', height: 100 + '%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', color: 'var(--text-color-muted)' }}>No Image</div>
                  )}
                  <span className="shoe-tag">Size {shoe.size}</span>
                  <button
                    className={`shoe-wishlist-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => handleWishlistToggle(shoe.id, shoe.name)}
                    title="Add to Wishlist"
                  >
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                <span className="shoe-brand">{shoe.brand}</span>
                <h3 className="shoe-title">{shoe.name}</h3>
                <p className="shoe-description">{shoe.description}</p>
                
                <div className="shoe-footer">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="shoe-price">${shoe.price.toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', color: shoe.stock_quantity > 0 ? 'var(--text-color-secondary)' : '#ef4444', fontWeight: 600 }}>
                      {shoe.stock_quantity > 0 ? `${shoe.stock_quantity} available` : 'OUT OF STOCK'}
                    </span>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleAddToCart(shoe.id, shoe.name)}
                    disabled={shoe.stock_quantity <= 0}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
