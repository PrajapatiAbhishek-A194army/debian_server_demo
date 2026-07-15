import React, { useState, useEffect } from 'react';
import { useAuthentication } from '../features/user_authentication/UserAuthenticationContext';
import ShoppingCartApiClient from '../features/shopping_cart/ShoppingCartApiClient';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Heart, ClipboardList, LogOut, ShieldAlert, LogIn, UserPlus } from 'lucide-react';

export const GlobalLayout = () => {
  const { user, isAuthenticated, logoutUser } = useAuthentication();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const fetchCartCount = async () => {
    if (!isAuthenticated || (user && user.role === 'admin')) {
      setCartCount(0);
      return;
    }
    try {
      const cartData = await ShoppingCartApiClient.retrieveCart();
      const count = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      // Quietly ignore failed cart count fetches (e.g. before backend is up)
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Listen to local changes (e.g. item added in catalog)
    window.addEventListener('storage', fetchCartCount);
    return () => {
      window.removeEventListener('storage', fetchCartCount);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="navbar-brand">
            <ShoppingBag size={24} color="var(--color-neon-cyan)" />
            <span>Shoe ERP</span>
          </NavLink>

          <div className="navbar-links">
            {/* 1. Public Links */}
            <NavLink to="/catalog" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
              Catalog
            </NavLink>

            {/* 2. Customer Only Links */}
            {isAuthenticated && user && user.role === 'customer' && (
              <>
                <NavLink to="/wishlist" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
                  <Heart size={16} /> Wishlist
                </NavLink>
                
                <NavLink to="/cart" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
                  <ShoppingCart size={16} /> Cart
                  {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
                </NavLink>

                <NavLink to="/orders" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
                  <ClipboardList size={16} /> My Orders
                </NavLink>
              </>
            )}

            {/* 3. Admin Only Links */}
            {isAuthenticated && user && user.role === 'admin' && (
              <>
                <NavLink to="/admin/catalog" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
                  <ShieldAlert size={16} /> Manage Catalog
                </NavLink>
                
                <NavLink to="/admin/orders" className={({ active }) => active ? 'navbar-link active' : 'navbar-link'}>
                  <ClipboardList size={16} /> Manage Orders
                </NavLink>
              </>
            )}

            {/* 4. Auth Buttons */}
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="navbar-user-tag" style={{ borderLeft: `3px solid ${user.role === 'admin' ? 'var(--color-neon-pink)' : 'var(--color-secondary-accent)'}` }}>
                  {user.name} ({user.role})
                </span>
                <button className="btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <NavLink to="/login" className="btn-secondary" style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LogIn size={14} /> Sign In
                </NavLink>
                <NavLink to="/register" className="btn-primary" style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: 'none' }}>
                  <UserPlus size={14} /> Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
