import React, { useState } from 'react';
import { useAuthentication } from './UserAuthenticationContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export const UserLoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { loginUser } = useAuthentication();
  const navigate = useNavigate();

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      const user = await loginUser(email, password);
      if (user.role === 'admin') {
        navigate('/admin/catalog');
      } else {
        navigate('/catalog');
      }
    } catch (authException) {
      setErrorMessage(authException.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', background: 'var(--gradient-cyber-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your Shoe ERP account
          </p>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email-input">Email Address</label>
            <input
              id="login-email-input"
              type="email"
              className="form-input"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="login-password-input">Password</label>
            <input
              id="login-password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-color-muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--color-neon-cyan)', textDecoration: 'none', fontWeight: '600' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
