import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Trash2, Plus, FileText, Download, CheckCircle2, Edit3 } from 'lucide-react';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatCurrency';

export default function InventoryPage() {
  const { products, updateProductStock, addProduct, updateProduct, deleteProduct } = useContext(AppContext);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('plants');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('plants');
    setPrice('');
    setStock('');
    setImageUrl('');
  };

  const handleRestock = (id, newStock) => {
    updateProductStock(id, newStock);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImageUrl(product.image || '');
    setError('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item from inventory?')) {
      deleteProduct(id);
      if (editingId === id) resetForm();
    }
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) {
      setError('Please fill out all product details.');
      return;
    }

    const productDetails = {
      name: name.trim(),
      category,
      price,
      stock,
      image: imageUrl || '',
    };

    if (!editingId) {
      productDetails.desc = 'Custom inventory item added by studio operator.';
    }

    if (editingId) {
      updateProduct(editingId, productDetails);
    } else {
      addProduct(productDetails);
    }

    setError('');
    setSuccess(true);
    resetForm();
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-inventory-report.txt', 'FloraSmart Inventory Report', [
      { heading: 'Inventory Summary', lines: products.map((item) => `${item.name} | ${item.category} | ${formatCurrency(item.price)} | ${item.stock} units`) }
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-inventory.csv', [
      ['ID', 'Name', 'Category', 'Price', 'Stock', 'Rating'],
      ...products.map((item) => [item.id, item.name, item.category, item.price, item.stock, item.rating])
    ]);
  };

  return (
    <div className="dashboard-content">
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Inventory Management Central</h2>
            <p style={{ color: 'var(--text-muted)' }}>Audit warehouse items, restock floral stems, and add new e-commerce listings.</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              Export CSV
            </Button>
          </div>
        </div>

        <div style={styles.layout}>
          <div className="card" style={{ flex: 2, minWidth: '400px' }}>
            <h3 style={styles.sectionTitle}>Physical Assets Ledger</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity Stock</th>
                    <th>Adjust Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-darker)' }}>
                          {prod.image && prod.image.startsWith('http') ? (
                            <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; e.target.parentElement.style.background='linear-gradient(135deg, #166534, #22C55E)' }} />
                          ) : null}
                          <span style={{ display: prod.image?.startsWith('http') ? 'none' : 'flex', fontSize: '16px', background: 'linear-gradient(135deg, #166534, #22C55E)', width: '100%', height: '100%', borderRadius: '4px' }}></span>
                        </div>
                        <span>{prod.name}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          prod.category === 'plants' ? 'badge-success' :
                          prod.category === 'flowers' ? 'badge-info' : 'badge-warning'
                        }`}>{prod.category}</span>
                      </td>
                      <td>{formatCurrency(prod.price)}</td>
                      <td>
                        <span style={{
                          color: prod.stock > 10 ? 'var(--text-light)' : prod.stock > 0 ? 'var(--warning)' : 'var(--error)',
                          fontWeight: '700'
                        }}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td>
                        <div style={styles.adjustGroup}>
                          <button onClick={() => handleRestock(prod.id, Math.max(0, prod.stock - 5))} style={styles.adjustBtn}>-5</button>
                          <button onClick={() => handleRestock(prod.id, prod.stock + 5)} style={styles.adjustBtn}>+5</button>
                        </div>
                      </td>
                      <td>
                        <div style={styles.rowActions}>
                          <button onClick={() => handleEdit(prod)} style={styles.editBtn} title="Edit item">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(prod.id)} style={styles.deleteBtn} title="Delete item">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
            <h3 style={styles.sectionTitle}>{editingId ? 'Edit Listing' : 'Add New Listing'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
              {editingId ? 'Update this catalog record everywhere it appears.' : 'Add a new catalog listing to the shared product data.'}
            </p>

            {success && (
              <div style={styles.successBanner}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Product saved successfully!</span>
              </div>
            )}

            {error && (
              <div style={styles.errorBanner}>
                <Trash2 size={16} color="var(--error)" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduct}>
              <FormInput label="Product Name" id="prod-name" placeholder="e.g. ZZ Plant" value={name} onChange={(e) => setName(e.target.value)} required />
              <FormInput
                label="Listing Category"
                id="prod-cat"
                type="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'plants', label: 'Plants (Indoor/Outdoor)' },
                  { value: 'flowers', label: 'Flowers (Bouquets/Baskets)' },
                  { value: 'vases', label: 'Vases (Ceramic/Glass)' }
                ]}
              />
              <FormInput
                label="Image URL"
                id="prod-image"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1.2 }}>
                  <FormInput label="Price (RWF)" id="prod-price" placeholder="24000" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <FormInput label="Initial Stock" id="prod-stock" placeholder="20" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div style={styles.formActions}>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="lime" style={{ flex: 1 }}>
                  <Plus size={16} />
                  {editingId ? 'Save Changes' : 'Create Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  adjustGroup: {
    display: 'flex',
    gap: '8px',
  },
  rowActions: {
    display: 'flex',
    gap: '8px',
  },
  adjustBtn: {
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-light)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-lime)',
    cursor: 'pointer',
    padding: '6px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error)',
    cursor: 'pointer',
    padding: '6px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '13px',
    marginBottom: '16px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--error)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '13px',
    marginBottom: '16px',
  }
};


