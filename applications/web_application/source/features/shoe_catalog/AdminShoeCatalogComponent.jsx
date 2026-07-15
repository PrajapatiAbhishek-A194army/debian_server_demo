import React, { useState, useEffect } from 'react';
import ShoeCatalogApiClient from './ShoeCatalogApiClient';
import { Plus, Edit2, Trash2, X, Check, Eye } from 'lucide-react';

export const AdminShoeCatalogComponent = () => {
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadShoes = async () => {
    setLoading(true);
    try {
      const data = await ShoeCatalogApiClient.retrieveShoes();
      setShoes(data);
    } catch (apiException) {
      setError('Failed to load shoe inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShoes();
  }, []);

  const resetForm = () => {
    setName('');
    setBrand('');
    setDescription('');
    setPrice('');
    setSize('');
    setStockQuantity('');
    setImageUrl('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    const shoeData = {
      name,
      brand,
      description: description || undefined,
      price: parseFloat(price),
      size: parseFloat(size),
      stock_quantity: parseInt(stockQuantity),
      image_url: imageUrl || undefined
    };

    try {
      if (isEditing) {
        await ShoeCatalogApiClient.modifyShoe(editingId, shoeData);
        setSuccess('Product details updated successfully!');
      } else {
        await ShoeCatalogApiClient.createShoe(shoeData);
        setSuccess('New product added to catalog!');
      }
      resetForm();
      loadShoes();
    } catch (apiException) {
      setError(apiException.message || 'Operation failed. Please check inputs.');
    }
  };

  const handleEditClick = (shoe) => {
    setIsEditing(true);
    setEditingId(shoe.id);
    setName(shoe.name);
    setBrand(shoe.brand);
    setDescription(shoe.description || '');
    setPrice(shoe.price.toString());
    setSize(shoe.size.toString());
    setStockQuantity(shoe.stock_quantity.toString());
    setImageUrl(shoe.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (shoeId, shoeName) => {
    if (!window.confirm(`Are you sure you want to delete ${shoeName}?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await ShoeCatalogApiClient.deleteShoe(shoeId);
      setSuccess(`Successfully deleted ${shoeName}.`);
      loadShoes();
    } catch (apiException) {
      setError(apiException.message || 'Failed to delete product.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'var(--gradient-cyber-glow)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          Catalog Inventory Management
        </h2>
        <p style={{ color: 'var(--text-color-secondary)' }}>
          Create, edit, or delete items within the shoe catalog.
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

      {/* Editor Panel */}
      <div className="glass-card" style={{ marginBottom: '3rem', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditing ? <Edit2 size={20} color="var(--color-primary-accent)" /> : <Plus size={20} color="var(--color-neon-cyan)" />}
          {isEditing ? 'Modify Shoe Details' : 'Add New Shoe Product'}
        </h3>
        
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-name">Product Name</label>
              <input
                id="admin-shoe-name"
                type="text"
                className="form-input"
                placeholder="Air Max Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-brand">Brand Name</label>
              <input
                id="admin-shoe-brand"
                type="text"
                className="form-input"
                placeholder="Nike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-price">Price ($)</label>
              <input
                id="admin-shoe-price"
                type="number"
                step="0.01"
                className="form-input"
                placeholder="129.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-size">Shoe Size</label>
              <input
                id="admin-shoe-size"
                type="number"
                step="0.5"
                className="form-input"
                placeholder="9.5"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-stock">Stock Quantity</label>
              <input
                id="admin-shoe-stock"
                type="number"
                className="form-input"
                placeholder="10"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-shoe-image">Image URL</label>
              <input
                id="admin-shoe-image"
                type="url"
                className="form-input"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="admin-shoe-desc">Description</label>
            <textarea
              id="admin-shoe-desc"
              className="form-input"
              rows="3"
              placeholder="Provide a detailed description of features, materials, and suitability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={resetForm} style={{ padding: '0.65rem 1.25rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
              <Check size={18} /> {isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Grid listing */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Current Catalogue Inventory</h3>
      
      {loading ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : shoes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-color-secondary)' }}>
          Catalog is currently empty. Add shoes using the form above.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--background-color-surface)', borderRadius: '16px', border: '1px solid var(--border-color-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color-card)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Item</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Brand</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Size</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shoes.map((shoe) => (
                <tr key={shoe.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {shoe.image_url ? (
                      <img src={shoe.image_url} alt={shoe.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color-card)' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-color-muted)' }}>No Img</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-color-primary)' }}>{shoe.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-color-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shoe.description || 'No description provided.'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-color-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>{shoe.brand}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-color-primary)', fontWeight: 500 }}>{shoe.size}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-secondary-accent)', fontWeight: 700 }}>${shoe.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem', color: shoe.stock_quantity > 0 ? 'var(--text-color-primary)' : '#ef4444', fontWeight: 600 }}>
                    {shoe.stock_quantity === 0 ? 'OUT OF STOCK' : shoe.stock_quantity}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" onClick={() => handleEditClick(shoe)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Edit">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn-danger" onClick={() => handleDeleteClick(shoe.id, shoe.name)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Delete">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
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
