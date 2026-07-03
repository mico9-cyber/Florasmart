import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Trash2, Plus, FileText, Download, Edit3, RefreshCw, AlertTriangle, Package2, ArrowRightLeft, MapPin } from 'lucide-react';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatCurrency';
import { inventoryService } from '../services/inventoryService';

function parseCategory(product) {
  return product?.category?.slug || String(product?.productType || '').toLowerCase() || 'plants';
}

function resolveRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function resolveObject(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

function statusTone(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('out')) return 'var(--error)';
  if (value.includes('low')) return 'var(--warning)';
  return 'var(--success)';
}

function formatStatus(status) {
  return String(status || 'in_stock').replace(/_/g, ' ');
}

export default function InventoryPage() {
  const { updateProductStock, addProduct, updateProduct, deleteProduct } = useContext(AppContext);
  const addToast = useToast();

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('plants');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({});
  const [stockRows, setStockRows] = useState([]);
  const [lowStockRows, setLowStockRows] = useState([]);
  const [movementRows, setMovementRows] = useState([]);
  const [locations, setLocations] = useState([]);

  const loadInventoryData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [summaryRes, stockRes, lowStockRes, movementRes, locationRes] = await Promise.all([
        inventoryService.summary(),
        inventoryService.stock('?limit=100'),
        inventoryService.lowStock(),
        inventoryService.movements('?limit=20'),
        inventoryService.locations(),
      ]);

      setSummary(resolveObject(summaryRes));
      setStockRows(resolveRows(stockRes));
      setLowStockRows(resolveRows(lowStockRes));
      setMovementRows(resolveRows(movementRes));
      setLocations(resolveRows(locationRes));
    } catch (err) {
      setError(err.message || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const inventoryProducts = useMemo(() => stockRows.map((row) => {
    const product = row.product || {};
    return {
      id: product.id || row.productId,
      backendId: product.id || row.productId,
      inventoryId: row.id,
      name: product.name || 'Unnamed product',
      category: parseCategory(product),
      price: Number(product.discountPrice ?? product.price ?? 0),
      stock: Number(row.quantity ?? 0),
      availableQuantity: Number(row.availableQuantity ?? row.quantity ?? 0),
      reservedQuantity: Number(row.reservedQuantity ?? 0),
      status: row.stockStatus || product.stockStatus || 'in_stock',
      image: product.imageUrl || product.images?.[0]?.url || '',
      sku: product.sku || '-',
      locationName: row.location?.name || 'Unassigned',
    };
  }), [stockRows]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('plants');
    setPrice('');
    setStock('');
    setImageUrl('');
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Product name is required.';
        break;
      case 'price':
        if (!value) error = 'Price is required.';
        else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Price must be greater than 0.';
        break;
      case 'stock':
        if (!value) error = 'Stock quantity is required.';
        else if (isNaN(Number(value)) || Number(value) < 0) error = 'Stock must be 0 or more.';
        break;
      case 'category':
        if (!value) error = 'Category is required.';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name) => (e) => {
    validateField(name, e.target.value);
  };

  const handleRestock = async (id, newStock) => {
    setError('');
    try {
      await updateProductStock(id, newStock);
      addToast('Stock adjusted successfully', 'success');
      await loadInventoryData(true);
    } catch (err) {
      addToast(err.message || 'Failed to adjust stock.', 'error');
    }
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item from inventory?')) return;
    setError('');
    try {
      await deleteProduct(id);
      if (editingId === id) resetForm();
      addToast('Product deleted successfully', 'success');
      await loadInventoryData(true);
    } catch (err) {
      addToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const isValid = ['name', 'price', 'stock', 'category'].every((f) => validateField(f, f === 'name' ? name : f === 'price' ? price : f === 'stock' ? stock : category));
    if (!isValid) return;

    setSubmitting(true);
    setError('');

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

    try {
      if (editingId) {
        await updateProduct(editingId, productDetails);
        addToast('Product updated successfully', 'success');
      } else {
        await addProduct(productDetails);
        addToast('Product saved successfully', 'success');
      }
      resetForm();
      await loadInventoryData(true);
    } catch (err) {
      addToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-inventory-report.txt', 'FloraSmart Inventory Report', [
      { heading: 'Inventory Summary', lines: inventoryProducts.map((item) => item.name + ' | ' + item.category + ' | ' + formatCurrency(item.price) + ' | ' + item.stock + ' units | ' + item.locationName) },
      { heading: 'Low Stock Alerts', lines: lowStockRows.map((row) => (row.product?.name || 'Product') + ' | ' + (row.location?.name || 'Unassigned') + ' | ' + (row.availableQuantity ?? row.quantity ?? 0) + ' available') },
    ]);
    addToast('Inventory report exported as PDF', 'success');
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-inventory.csv', [
      ['ID', 'Name', 'Category', 'Price', 'Stock', 'Available', 'Reserved', 'Status', 'Location'],
      ...inventoryProducts.map((item) => [item.id, item.name, item.category, item.price, item.stock, item.availableQuantity, item.reservedQuantity, item.status, item.locationName]),
    ]);
    addToast('Inventory data exported as CSV', 'success');
  };

  return (
    <div className="dashboard-content">
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Inventory Management Central</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit warehouse items, restock floral stems, and review live backend inventory activity.</p>
        </div>
        <div style={styles.actionButtons}>
          <Button variant="secondary" onClick={() => loadInventoryData(true)} icon={<RefreshCw size={16} />}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
            Export PDF
          </Button>
          <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
            Export CSV
          </Button>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="card" style={styles.summaryCard}>
          <Package2 size={18} color="var(--accent-lime)" />
          <div>
            <div style={styles.summaryValue}>{Number(summary.totalProducts || inventoryProducts.length || 0)}</div>
            <div style={styles.summaryLabel}>Tracked Products</div>
          </div>
        </div>
        <div className="card" style={styles.summaryCard}>
          <ArrowRightLeft size={18} color="var(--info)" />
          <div>
            <div style={styles.summaryValue}>{Number(summary.totalStockQuantity || 0)}</div>
            <div style={styles.summaryLabel}>Units in Stock</div>
          </div>
        </div>
        <div className="card" style={styles.summaryCard}>
          <AlertTriangle size={18} color="var(--warning)" />
          <div>
            <div style={styles.summaryValue}>{Number(summary.lowStockCount || lowStockRows.length || 0)}</div>
            <div style={styles.summaryLabel}>Low Stock Alerts</div>
          </div>
        </div>
        <div className="card" style={styles.summaryCard}>
          <MapPin size={18} color="var(--success)" />
          <div>
            <div style={styles.summaryValue}>{locations.length}</div>
            <div style={styles.summaryLabel}>Inventory Locations</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <Trash2 size={16} color="var(--error)" />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.layout}>
        <div className="card" style={{ flex: 2, minWidth: '400px' }}>
          <h3 style={styles.sectionTitle}>Physical Assets Ledger</h3>
          <p style={styles.sectionHint}>Live stock quantities, reserve levels, and per-location availability from the backend.</p>

          {loading ? (
            <LoadingSpinner text="Loading inventory data..." />
          ) : inventoryProducts.length === 0 ? (
            <div style={styles.statePanel}>No inventory records were returned by the backend.</div>
          ) : (
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity Stock</th>
                    <th>Available</th>
                    <th>Adjust Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryProducts.map((prod) => (
                    <tr key={prod.inventoryId || prod.id}>
                      <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.imageWrap}>
                          {prod.image ? (
                            <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <span style={styles.imageFallback}></span>
                          )}
                        </div>
                        <div>
                          <div>{prod.name}</div>
                          <div style={styles.metaText}>{prod.sku} · {prod.locationName}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          prod.category === 'plants' ? 'badge-success' :
                          prod.category === 'flowers' ? 'badge-info' : 'badge-warning'
                        }`}>{prod.category}</span>
                      </td>
                      <td>{formatCurrency(prod.price)}</td>
                      <td>
                        <span style={{ color: statusTone(prod.status), fontWeight: '700' }}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: 'var(--text-light)', fontWeight: '700' }}>{prod.availableQuantity} free</span>
                          <span style={styles.metaText}>{prod.reservedQuantity} reserved</span>
                        </div>
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
          )}
        </div>

        <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
          <h3 style={styles.sectionTitle}>{editingId ? 'Edit Listing' : 'Add New Listing'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            {editingId ? 'Update this catalog record and stock balance in the backend.' : 'Add a new catalog listing to the shared backend product inventory.'}
          </p>

          <form onSubmit={handleSubmitProduct} noValidate>
            <FormInput label="Product Name" id="prod-name" placeholder="e.g. ZZ Plant" value={name} onChange={(e) => { setName(e.target.value); if (fieldErrors.name) validateField('name', e.target.value); }} onBlur={handleBlur('name')} error={fieldErrors.name} ariaInvalid={!!fieldErrors.name} ariaDescribedby={fieldErrors.name ? 'error-prod-name' : undefined} required />
            {fieldErrors.name && <span id="error-prod-name" style={styles.fieldError}>{fieldErrors.name}</span>}
            <FormInput
              label="Listing Category"
              id="prod-cat"
              type="select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); if (fieldErrors.category) validateField('category', e.target.value); }}
              error={fieldErrors.category}
              ariaInvalid={!!fieldErrors.category}
              ariaDescribedby={fieldErrors.category ? 'error-prod-cat' : undefined}
              options={[
                { value: 'plants', label: 'Plants (Indoor/Outdoor)' },
                { value: 'flowers', label: 'Flowers (Bouquets/Baskets)' },
                { value: 'vases', label: 'Vases (Ceramic/Glass)' }
              ]}
            />
            {fieldErrors.category && <span id="error-prod-cat" style={styles.fieldError}>{fieldErrors.category}</span>}
            <FormInput
              label="Image URL"
              id="prod-image"
              placeholder="https://images.example.com/product.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.2 }}>
                <FormInput label="Price (RWF)" id="prod-price" placeholder="24000" value={price} onChange={(e) => { setPrice(e.target.value); if (fieldErrors.price) validateField('price', e.target.value); }} onBlur={handleBlur('price')} error={fieldErrors.price} ariaInvalid={!!fieldErrors.price} ariaDescribedby={fieldErrors.price ? 'error-prod-price' : undefined} required />
                {fieldErrors.price && <span id="error-prod-price" style={styles.fieldError}>{fieldErrors.price}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <FormInput label={editingId ? 'Target Stock' : 'Initial Stock'} id="prod-stock" placeholder="20" value={stock} onChange={(e) => { setStock(e.target.value); if (fieldErrors.stock) validateField('stock', e.target.value); }} onBlur={handleBlur('stock')} error={fieldErrors.stock} ariaInvalid={!!fieldErrors.stock} ariaDescribedby={fieldErrors.stock ? 'error-prod-stock' : undefined} required />
                {fieldErrors.stock && <span id="error-prod-stock" style={styles.fieldError}>{fieldErrors.stock}</span>}
              </div>
            </div>

            <div style={styles.formActions}>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm} style={{ flex: 1 }}>
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="lime" style={{ flex: 1 }} disabled={submitting}>
                <Plus size={16} />
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Record'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        <div className="card" style={{ flex: 1, minWidth: '320px' }}>
          <h3 style={styles.sectionTitle}>Low Stock Alerts</h3>
          <p style={styles.sectionHint}>Backend-generated alerts for items that need replenishment.</p>
          {loading ? (
            <LoadingSpinner text="Loading low stock alerts..." />
          ) : lowStockRows.length === 0 ? (
            <div style={styles.statePanel}>No low stock alerts from the backend.</div>
          ) : (
            <div style={styles.listWrap}>
              {lowStockRows.map((row) => (
                <div key={row.id || `${row.productId}-${row.locationId}`} style={styles.alertRow}>
                  <div>
                    <div style={{ color: 'var(--text-white)', fontWeight: 700 }}>{row.product?.name || 'Product'}</div>
                    <div style={styles.metaText}>{row.location?.name || 'Unassigned'} · {formatStatus(row.stockStatus || 'low_stock')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: statusTone(row.stockStatus), fontWeight: 700 }}>{row.availableQuantity ?? row.quantity ?? 0} free</div>
                    <div style={styles.metaText}>{row.reservedQuantity ?? 0} reserved</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ flex: 1.3, minWidth: '360px' }}>
          <h3 style={styles.sectionTitle}>Inventory Movement History</h3>
          <p style={styles.sectionHint}>Latest stock adjustments recorded by the backend.</p>
          {loading ? (
            <LoadingSpinner text="Loading movement history..." />
          ) : movementRows.length === 0 ? (
            <div style={styles.statePanel}>No inventory movements were returned by the backend.</div>
          ) : (
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Movement</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movementRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.product?.name || row.productName || 'Product'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{formatStatus(row.movementType || row.type)}</td>
                      <td>{row.quantity}</td>
                      <td>{row.location?.name || row.locationName || 'Unassigned'}</td>
                      <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    marginBottom: '24px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-white)',
  },
  summaryLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  bottomGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  sectionHint: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    margin: '4px 0 0',
  },
  statePanel: {
    marginTop: '16px',
    padding: '18px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    color: 'var(--text-muted)',
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
  },
  imageWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #166534, #22C55E)',
  },
  imageFallback: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  metaText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  listWrap: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  alertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },
};
