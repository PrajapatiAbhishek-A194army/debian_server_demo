import React, { useState, useEffect } from 'react';
import OrderManagementApiClient from './OrderManagementApiClient';
import { DollarSign, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

export const AdminOrderManagementComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        const data = await OrderManagementApiClient.retrieveAllOrdersForAdmin();
        setOrders(data);
      } catch (apiException) {
        setError('Failed to retrieve system order records.');
      } finally {
        setLoading(false);
      }
    };
    loadAllOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === 'PAID') return 'badge-status badge-paid';
    if (normalizedStatus === 'PENDING') return 'badge-status badge-pending';
    return 'badge-status badge-failed';
  };

  const formatDate = (dateString) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute Dashboard Statistics
  const paidOrders = orders.filter(o => o.payment_status.toUpperCase() === 'PAID');
  const pendingOrders = orders.filter(o => o.payment_status.toUpperCase() === 'PENDING');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-cyber-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          Sales & Order Transactions Dashboard
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Monitor ERP transactions, payment status, and system revenue.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '0.75rem', color: 'var(--color-secondary-accent)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>Total Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color-primary)', marginTop: '0.15rem' }}>
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', padding: '0.75rem', color: 'var(--color-primary-accent)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>Total Transactions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color-primary)', marginTop: '0.15rem' }}>
              {orders.length}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '0.75rem', color: 'var(--color-secondary-accent)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>Paid Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color-primary)', marginTop: '0.15rem' }}>
              {paidOrders.length}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '0.75rem', color: '#f59e0b' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>Pending Checkouts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color-primary)', marginTop: '0.15rem' }}>
              {pendingOrders.length}
            </div>
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Transaction Histories</h3>
      
      {loading ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-color-secondary)' }}>
          No order transactions have been initialized in the system yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--background-color-surface)', borderRadius: '16px', border: '1px solid var(--border-color-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color-card)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Customer ID</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Date/Time</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Purchased Items</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Razorpay Order ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>#{order.id}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)' }}>User #{order.customer_id}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontSize: '0.9rem' }}>{formatDate(order.created_at)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {order.line_items.map((item) => (
                        <div key={item.id} style={{ fontSize: '0.85rem', color: 'var(--text-color-primary)' }}>
                          • {item.shoe_name} <span style={{ color: 'var(--text-color-muted)' }}>(x{item.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-secondary-accent)', fontWeight: 700 }}>
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={getStatusBadgeClass(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-color-muted)' }}>
                    {order.razorpay_order_id || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
