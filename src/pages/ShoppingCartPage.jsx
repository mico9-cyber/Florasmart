import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import ImageWithFallback from '../components/ImageWithFallback';

export default function ShoppingCartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpdateQty = (id, qty, maxStock) => {
    if (qty < 1) return;
    if (maxStock !== undefined && qty > maxStock) {
      addToast(`Only ${maxStock} units available.`, 'warning');
      return;
    }
    setLoading(true);
    updateCartQuantity(id, qty);
    setLoading(false);
    addToast('Cart quantity updated.', 'info');
  };

  const handleRemoveItem = (id) => {
    setLoading(true);
    removeFromCart(id);
    setLoading(false);
    addToast('Item removed from cart.', 'warning');
  };

  const handleClearCart = () => {
    if (clearCart) {
      setLoading(true);
      clearCart();
      setLoading(false);
      addToast('Cart cleared.', 'warning');
    }
  };

  // Price Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 40000 || subtotal === 0 ? 0 : 5000;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Your Shopping Cart</h1>
      <p style={styles.subtitle}>Review your items, adjust quantities, and proceed to checkout.</p>

      {cart.length > 0 ? (
        <div style={styles.layout}>
          {/* Cart Items List */}
          <div style={styles.itemsCol}>
              {cart.map((item) => {
                const maxStock = item.stock ?? Infinity;
                return (
              <div key={item.id} className="card" style={styles.itemCard}>
                <ImageWithFallback src={item.image} alt={item.name} category={item.category} style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)' }} />
                <div style={styles.itemMeta}>
                  <span style={styles.itemCategory}>{item.category.toUpperCase()}</span>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <span style={styles.itemPrice}>{formatCurrency(item.price)} each</span>
                  {item.stock !== undefined && item.stock <= 5 && (
                    <span style={{ color: item.stock <= 0 ? 'var(--error)' : 'var(--warning)', fontSize: '12px', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      {item.stock <= 0 ? 'Out of Stock' : `Only ${item.stock} remaining`}
                    </span>
                  )}
                </div>

                {/* Qty Adjustment */}
                <div style={styles.qtyControl}>
                  <button onClick={() => handleUpdateQty(item.id, item.quantity - 1, maxStock)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyVal}>{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item.id, item.quantity + 1, maxStock)} style={styles.qtyBtn} disabled={item.quantity >= maxStock}>+</button>
                </div>
                {item.quantity >= maxStock - 2 && item.quantity < maxStock && maxStock < Infinity && (
                  <span style={{ color: 'var(--warning)', fontSize: '11px', textAlign: 'right', width: '100%', marginTop: '-8px' }}>
                    Approaching stock limit ({maxStock} available)
                  </span>
                )}
                {item.quantity >= maxStock && maxStock < Infinity && (
                  <span style={{ color: 'var(--error)', fontSize: '11px', textAlign: 'right', width: '100%', marginTop: '-8px' }}>
                    Maximum available quantity reached
                  </span>
                )}

                {/* Total Price */}
                <div style={styles.totalBlock}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</span>
                  <span style={styles.totalPrice}>{formatCurrency(item.price * item.quantity)}</span>
                </div>

                {/* Remove Btn */}
                <button onClick={() => handleRemoveItem(item.id)} style={styles.removeBtn} title="Remove item">
                  <Trash2 size={18} />
                </button>
              </div>
            );})}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <Link to="/catalog" style={styles.continueLink}>
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
              {cart.length > 1 && (
                <button onClick={handleClearCart} style={styles.clearCartBtn}>
                  <Trash2 size={14} /> Clear Cart
                </button>
              )}
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="card" style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Cart Summary</h3>
            <div style={styles.divider}></div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Green Delivery</span>
              <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Estimated Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            <div style={styles.divider}></div>

            <div style={{ ...styles.summaryRow, fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--accent-lime)' }}>{formatCurrency(grandTotal)}</span>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <RefreshCw size={20} className="spin" />
              </div>
            )}

            {shipping > 0 && (
              <p style={styles.freeShippingAlert}>
                Add <strong>{formatCurrency(40000 - subtotal)}</strong> more to unlock FREE green delivery!
              </p>
            )}

            <Button
              onClick={() => navigate('/checkout')}
              variant="primary"
              style={styles.checkoutBtn}
              icon={<ArrowRight size={18} />}
            >
              Proceed to Checkout
            </Button>

            <div style={styles.securitySeal}>
              <ShieldCheck size={16} color="var(--accent-lime)" />
              <span>Checkout is secured with RBAC encryption.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={styles.emptyCard}>
          <ShoppingBag size={56} color="var(--border-green)" />
          <h3 style={{ color: 'var(--text-white)', marginTop: '20px' }}>Your Cart is Empty</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px', maxWidth: '300px' }}>
            It looks like you haven't added any plants or vases to your greenhouse cart yet.
          </p>
          <Link to="/catalog">
            <Button variant="lime">Browse Shop Items</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '40px',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  itemsCol: {
    flex: '2 0 450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 24px',
    flexWrap: 'wrap',
  },
  itemMeta: {
    flex: 1,
    minWidth: '150px',
  },
  itemCategory: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
    letterSpacing: '1px',
  },
  itemName: {
    fontSize: '16px',
    color: 'var(--text-white)',
    margin: '2px 0 4px',
  },
  itemPrice: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'none',
    color: 'var(--text-white)',
    fontSize: '16px',
    cursor: 'pointer',
  },
  qtyVal: {
    width: '24px',
    textAlign: 'center',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  totalBlock: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    minWidth: '80px',
  },
  totalPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-white)',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    transition: 'var(--transition)',
  },
  continueLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--accent-lime)',
    fontWeight: '600',
  },
  clearCartBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid var(--error)',
    color: 'var(--error)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  summaryCard: {
    flex: '1 0 300px',
    alignSelf: 'flex-start',
    padding: '32px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '16px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--text-light)',
    marginBottom: '12px',
  },
  freeShippingAlert: {
    fontSize: '12px',
    color: 'var(--warning)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    marginTop: '12px',
    lineHeight: '1.4',
  },
  checkoutBtn: {
    width: '100%',
    marginTop: '20px',
    padding: '14px',
  },
  securitySeal: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    justifyContent: 'center',
    marginTop: '16px',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '80px 24px',
  }
};

