import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import ImageWithFallback from '../components/ImageWithFallback';

export default function CheckoutPage() {
  const { cart, products, createOrder } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Standard Green Delivery');
  const [fieldErrors, setFieldErrors] = useState({});
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = deliveryMethod === 'Express Eco-Courier' ? 10000 : (subtotal > 40000 ? 0 : 5000);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  const unavailableItem = cart.find((item) => {
    const product = products.find((current) => current.id === item.id);
    return !product || product.stock < item.quantity;
  });

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required.';
        break;
      case 'address':
        if (!value.trim()) error = 'Street address is required.';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required.';
        break;
      case 'zip':
        if (!value.trim()) error = 'ZIP code is required.';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required.';
        else if (!/^\+?[\d\s\-()]{7,15}$/.test(value)) error = 'Enter a valid phone number.';
        break;
      case 'cardNumber':
        if (!value.trim()) error = 'Card number is required.';
        else if (value.replace(/\s/g, '').length !== 16) error = 'Card number must be 16 digits.';
        break;
      case 'cardExpiry':
        if (!value.trim()) error = 'Expiry is required.';
        break;
      case 'cardCvv':
        if (!value.trim()) error = 'CVV is required.';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name) => (e) => {
    validateField(name, e.target.value);
  };

  const validate = () => {
    const tempErrors = {};
    if (cart.length === 0) tempErrors.cart = 'Your cart is empty.';
    if (unavailableItem) tempErrors.cart = `${unavailableItem.name} is no longer available in the requested quantity.`;
    if (!fullName.trim()) tempErrors.fullName = 'Full name is required.';
    if (!address.trim()) tempErrors.address = 'Street address is required.';
    if (!city.trim()) tempErrors.city = 'City is required.';
    if (!zip.trim()) tempErrors.zip = 'ZIP code is required.';
    if (!phone.trim()) tempErrors.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) tempErrors.phone = 'Enter a valid phone number.';
    if (!cardNumber.trim()) tempErrors.cardNumber = 'Card number is required.';
    else if (cardNumber.replace(/\s/g, '').length !== 16) tempErrors.cardNumber = 'Card number must be 16 digits.';
    if (!cardExpiry.trim()) tempErrors.cardExpiry = 'Expiry is required.';
    if (!cardCvv.trim()) tempErrors.cardCvv = 'CVV is required.';
    setFieldErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await createOrder({ total: grandTotal, fullName, address, city, zip, deliveryMethod });
    setSubmitting(false);
    if (!result.ok) {
      setOrderError(result.error);
      addToast(result.error || 'Failed to place order.', 'error');
      return;
    }
    setOrderError('');
    addToast('Order placed successfully!', 'success');
    navigate('/order-tracking');
  };

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Secure Checkout</h1>
      <p style={styles.subtitle}>Enter your delivery and billing credentials to complete purchase.</p>
      {(orderError || fieldErrors.cart) && <div className="card" style={styles.errorSummary}>{orderError || fieldErrors.cart}</div>}

      {submitting && (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <RefreshCw size={24} className="spin" />
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Processing your order...</p>
        </div>
      )}
      <form onSubmit={handlePlaceOrder} noValidate style={submitting ? { ...styles.layout, opacity: 0.5, pointerEvents: 'none' } : styles.layout}>
        <div style={styles.formCol}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}><Truck size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />Shipping Destination</h3>
            <div style={styles.divider}></div>
            <FormInput label="Recipient Name" id="fullName" value={fullName} onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) validateField('fullName', e.target.value); }} onBlur={handleBlur('fullName')} error={fieldErrors.fullName} ariaInvalid={!!fieldErrors.fullName} ariaDescribedby={fieldErrors.fullName ? 'error-fullName' : undefined} required />
            {fieldErrors.fullName && <span id="error-fullName" style={styles.fieldError}>{fieldErrors.fullName}</span>}
            <FormInput label="Street Address" id="address" value={address} onChange={(e) => { setAddress(e.target.value); if (fieldErrors.address) validateField('address', e.target.value); }} onBlur={handleBlur('address')} error={fieldErrors.address} ariaInvalid={!!fieldErrors.address} ariaDescribedby={fieldErrors.address ? 'error-address' : undefined} required />
            {fieldErrors.address && <span id="error-address" style={styles.fieldError}>{fieldErrors.address}</span>}
            <FormInput label="Phone Number" id="phone" type="tel" placeholder="+250 7XX XXX XXX" value={phone} onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) validateField('phone', e.target.value); }} onBlur={handleBlur('phone')} error={fieldErrors.phone} ariaInvalid={!!fieldErrors.phone} ariaDescribedby={fieldErrors.phone ? 'error-phone' : undefined} required />
            {fieldErrors.phone && <span id="error-phone" style={styles.fieldError}>{fieldErrors.phone}</span>}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.5 }}><FormInput label="City" id="city" value={city} onChange={(e) => { setCity(e.target.value); if (fieldErrors.city) validateField('city', e.target.value); }} onBlur={handleBlur('city')} error={fieldErrors.city} ariaInvalid={!!fieldErrors.city} ariaDescribedby={fieldErrors.city ? 'error-city' : undefined} required /></div>
              <div style={{ flex: 1 }}><FormInput label="ZIP Code" id="zip" value={zip} onChange={(e) => { setZip(e.target.value); if (fieldErrors.zip) validateField('zip', e.target.value); }} onBlur={handleBlur('zip')} error={fieldErrors.zip} ariaInvalid={!!fieldErrors.zip} ariaDescribedby={fieldErrors.zip ? 'error-zip' : undefined} required /></div>
            </div>
            {fieldErrors.city && <span id="error-city" style={styles.fieldError}>{fieldErrors.city}</span>}
            {fieldErrors.zip && <span id="error-zip" style={styles.fieldError}>{fieldErrors.zip}</span>}
            <FormInput label="Delivery Courier Method" id="delivery" type="select" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} options={[{ value: 'Standard Green Delivery', label: 'Standard Green Delivery (3-5 business days)' }, { value: 'Express Eco-Courier', label: 'Express Eco-Courier (1-2 business days)' }]} />
          </div>

          <div className="card">
            <h3 style={styles.sectionTitle}><CreditCard size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />Payment Billing</h3>
            <div style={styles.divider}></div>
            <FormInput label="Credit Card Number" id="cardNumber" placeholder="4000 1234 5678 9010" value={cardNumber} onChange={(e) => { setCardNumber(e.target.value); if (fieldErrors.cardNumber) validateField('cardNumber', e.target.value); }} onBlur={handleBlur('cardNumber')} error={fieldErrors.cardNumber} ariaInvalid={!!fieldErrors.cardNumber} ariaDescribedby={fieldErrors.cardNumber ? 'error-cardNumber' : undefined} required />
            {fieldErrors.cardNumber && <span id="error-cardNumber" style={styles.fieldError}>{fieldErrors.cardNumber}</span>}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.2 }}><FormInput label="Expiry Date" id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => { setCardExpiry(e.target.value); if (fieldErrors.cardExpiry) validateField('cardExpiry', e.target.value); }} onBlur={handleBlur('cardExpiry')} error={fieldErrors.cardExpiry} ariaInvalid={!!fieldErrors.cardExpiry} ariaDescribedby={fieldErrors.cardExpiry ? 'error-cardExpiry' : undefined} required /></div>
              <div style={{ flex: 1 }}><FormInput label="CVV Code" id="cardCvv" placeholder="123" value={cardCvv} onChange={(e) => { setCardCvv(e.target.value); if (fieldErrors.cardCvv) validateField('cardCvv', e.target.value); }} onBlur={handleBlur('cardCvv')} error={fieldErrors.cardCvv} ariaInvalid={!!fieldErrors.cardCvv} ariaDescribedby={fieldErrors.cardCvv ? 'error-cardCvv' : undefined} required /></div>
            </div>
            {fieldErrors.cardExpiry && <span id="error-cardExpiry" style={styles.fieldError}>{fieldErrors.cardExpiry}</span>}
            {fieldErrors.cardCvv && <span id="error-cardCvv" style={styles.fieldError}>{fieldErrors.cardCvv}</span>}
          </div>
        </div>

        <div style={styles.summaryCol}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.divider}></div>
            <div style={styles.itemsSummary}>
              {cart.map((item) => (
                <div key={item.id} style={styles.summaryItem}>
                  <ImageWithFallback src={item.image} alt={item.name} category={item.category} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.summaryItemName}>{item.name}</h5>
                    <span style={styles.summaryItemQty}>Qty: {item.quantity}</span>
                  </div>
                  <span style={styles.summaryItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={styles.divider}></div>
            <div style={styles.summaryRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div style={styles.summaryRow}><span>Eco-Shipping</span><span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
            <div style={styles.summaryRow}><span>Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
            <div style={styles.divider}></div>
            <div style={{ ...styles.summaryRow, fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}><span>Grand Total</span><span style={{ color: 'var(--accent-lime)' }}>{formatCurrency(grandTotal)}</span></div>
            <Button type="submit" variant="primary" style={styles.placeOrderBtn} disabled={submitting || cart.length === 0 || Boolean(unavailableItem)}>
              {submitting ? 'Placing Order...' : `Place Secure Order (${formatCurrency(grandTotal)})`}
            </Button>
            <div style={styles.securitySeal}><ShieldCheck size={16} color="var(--accent-lime)" /><span>Payments are SSL secured & PCI compliant.</span></div>
          </div>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '40px' },
  errorSummary: { maxWidth: '720px', margin: '0 auto 24px', padding: '12px 16px', borderColor: 'var(--error)', color: 'var(--error)', textAlign: 'center' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  formCol: { flex: '2 0 450px' },
  summaryCol: { flex: '1 0 320px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-white)', display: 'flex', alignItems: 'center' },
  divider: { height: '1px', backgroundColor: 'var(--border-green)', margin: '16px 0' },
  itemsSummary: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  summaryItemName: { margin: 0, fontSize: '14px', color: 'var(--text-white)' },
  summaryItemQty: { fontSize: '12px', color: 'var(--text-muted)' },
  summaryItemPrice: { fontSize: '14px', fontWeight: '600', color: 'var(--text-white)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-light)', marginBottom: '12px' },
  fieldError: { color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' },
  placeOrderBtn: { width: '100%', marginTop: '20px', padding: '14px' },
  securitySeal: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center', marginTop: '16px' },
};
