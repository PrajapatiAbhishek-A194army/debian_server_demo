import React, { useState } from 'react';
import { useAuthentication } from './UserAuthenticationContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export const UserRegistrationComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { registerUser } = useAuthentication();
  const navigate = useNavigate();

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await registerUser(name, email, password, role);
      setSuccessMessage('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (authException) {
      setErrorMessage(authException.message || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', background: 'var(--gradient-cyber-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Join Shoe ERP
          </h2>
          <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9rem' }}>
            Create an account to start shopping or managing catalog
          </p>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--color-secondary-accent)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name-input">Full Name</label>
            <input
              id="register-name-input"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email-input">Email Address</label>
            <input
              id="register-email-input"
              type="email"
              className="form-input"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password-input">Password (min 6 chars)</label>
            <input
              id="register-password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="register-role-select">Account Type</label>
            <select
              id="register-role-select"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ background: 'rgba(15, 23, 42, 0.9)' }}
            >
              <option value="customer">Customer (Store Portal)</option>
              <option value="admin">Administrator (ERP Catalog Dashboard)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <UserPlus size={18} /> Register Account
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-color-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-neon-cyan)', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
