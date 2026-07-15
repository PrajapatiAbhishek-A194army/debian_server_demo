import React, { useState, useEffect } from 'react';
import OrderManagementApiClient from './OrderManagementApiClient';
import { Calendar, DollarSign, Package, Check } from 'lucide-react';

export const CustomerOrderHistoryComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await OrderManagementApiClient.retrieveOrderHistory();
        setOrders(data);
      } catch (apiException) {
        setError('Failed to retrieve order history.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-sunset-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          My Purchase Orders
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Track past payments, order statuses, and receipts.
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
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-color-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No orders found</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-color-muted)' }}>You have not completed any payments yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ padding: '2rem' }}>
              
              {/* Order Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color-primary)' }}>
                    Order #{order.id}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color-secondary)', marginTop: '0.4rem' }}>
                    <Calendar size={14} />
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={getStatusBadgeClass(order.payment_status)}>
                    {order.payment_status}
                  </span>
                  {order.razorpay_order_id && (
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-color-muted)' }}>
                      txn: {order.razorpay_order_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.line_items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Package size={16} color="var(--color-primary-accent)" />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-color-primary)' }}>{item.shoe_name}</span>
                        {item.brand && <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-color-muted)', marginLeft: '0.5rem' }}>({item.brand})</span>}
                      </div>
                      <span style={{ color: 'var(--text-color-muted)', fontSize: '0.85rem' }}>x {item.quantity}</span>
                    </div>

                    <div style={{ fontWeight: 600, color: 'var(--text-color-primary)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-color-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>Total Order Value</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-secondary-accent)' }}>
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
