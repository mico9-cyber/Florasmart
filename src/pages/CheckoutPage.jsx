import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function CheckoutPage() {
  const { cart, products, createOrder } = useContext(AppContext);
  const navigate = useNavigate();

  // Address Fields
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Payment Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Logistics Options
  const [deliveryMethod, setDeliveryMethod] = useState('Standard Green Delivery');
  
  // Validation Errors
  const [errors, setErrors] = useState({});
  const [orderError, setOrderError] = useState('');

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = deliveryMethod === 'Express Eco-Courier' ? 9.99 : (subtotal > 40 ? 0 : 5.99);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  const unavailableItem = cart.find((item) => {
    const product = products.find((current) => current.id === item.id);
    return !product || product.stock < item.quantity;
  });

  const validate = () => {
    const tempErrors = {};
    if (cart.length === 0) tempErrors.cart = 'Your cart is empty.';
    if (unavailableItem) tempErrors.cart = `${unavailableItem.name} is no longer available in the requested quantity.`;
    if (!fullName.trim()) tempErrors.fullName = 'Full name is required.';
    if (!address.trim()) tempErrors.address = 'Street address is required.';
    if (!city.trim()) tempErrors.city = 'City is required.';
    if (!zip.trim()) tempErrors.zip = 'ZIP code is required.';
    if (!cardNumber.trim()) {
      tempErrors.cardNumber = 'Card number is required.';
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      tempErrors.cardNumber = 'Card number must be 16 digits.';
    }
    if (!cardExpiry.trim()) tempErrors.cardExpiry = 'Expiry is required.';
    if (!cardCvv.trim()) tempErrors.cardCvv = 'CVV is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = createOrder({
      total: grandTotal,
      address: `${address}, ${city}, ${zip}`,
      deliveryMethod: deliveryMethod
    });

    if (!result.ok) {
      setOrderError(result.error);
      return;
    }

    setOrderError('');
    navigate('/order-tracking');
  };

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Secure Checkout</h1>
      <p style={styles.subtitle}>Enter your delivery and billing credentials to complete purchase.</p>
      {(orderError || errors.cart) && (
        <div className="card" style={styles.errorSummary}>
          {orderError || errors.cart}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate style={styles.layout}>
        {/* Left Side: Delivery and Payment info */}
        <div style={styles.formCol}>
          {/* Shipping Address */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>
              <Truck size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />
              Shipping Destination
            </h3>
            <div style={styles.divider}></div>
            
            <FormInput
              label="Recipient Name"
              id="fullName"
              placeholder="e.g. Darrly Garden"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
            />

            <FormInput
              label="Street Address"
              id="address"
              placeholder="e.g. 123 Canopy Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={errors.address}
              required
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.5 }}>
                <FormInput
                  label="City"
                  id="city"
                  placeholder="e.g. Moss Town"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={errors.city}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="ZIP Code"
                  id="zip"
                  placeholder="e.g. 90210"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  error={errors.zip}
                  required
                />
              </div>
            </div>

            <FormInput
              label="Delivery Courier Method"
              id="delivery"
              type="select"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              options={[
                { value: 'Standard Green Delivery', label: 'Standard Green Delivery (3-5 business days) - Eco EV vehicles' },
                { value: 'Express Eco-Courier', label: 'Express Eco-Courier (1-2 business days) - Cargo bikes' }
              ]}
            />
          </div>

          {/* Payment Details */}
          <div className="card">
            <h3 style={styles.sectionTitle}>
              <CreditCard size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />
              Payment Billing
            </h3>
            <div style={styles.divider}></div>

            <FormInput
              label="Credit Card Number"
              id="cardNumber"
              placeholder="4000 1234 5678 9010"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              error={errors.cardNumber}
              required
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.2 }}>
                <FormInput
                  label="Expiry Date"
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  error={errors.cardExpiry}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="CVV Code"
                  id="cardCvv"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  error={errors.cardCvv}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div style={styles.summaryCol}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.divider}></div>

            {/* List of Cart Items */}
            <div style={styles.itemsSummary}>
              {cart.map((item) => (
                <div key={item.id} style={styles.summaryItem}>
                  <span style={styles.summaryItemEmoji}>{item.image}</span>
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.summaryItemName}>{item.name}</h5>
                    <span style={styles.summaryItemQty}>Qty: {item.quantity}</span>
                  </div>
                  <span style={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={styles.divider}></div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Eco-Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div style={styles.divider}></div>

            <div style={{ ...styles.summaryRow, fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--accent-lime)' }}>${grandTotal.toFixed(2)}</span>
            </div>

            <Button type="submit" variant="primary" style={styles.placeOrderBtn} disabled={cart.length === 0 || Boolean(unavailableItem)}>
              Place Secure Order (${grandTotal.toFixed(2)})
            </Button>

            <div style={styles.securitySeal}>
              <ShieldCheck size={16} color="var(--accent-lime)" />
              <span>Payments are SSL secured & PCI compliant.</span>
            </div>
          </div>
        </div>
      </form>
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
  errorSummary: {
    maxWidth: '720px',
    margin: '0 auto 24px',
    padding: '12px 16px',
    borderColor: 'var(--error)',
    color: 'var(--error)',
    textAlign: 'center',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: '2 0 450px',
  },
  summaryCol: {
    flex: '1 0 320px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '16px 0',
  },
  itemsSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  summaryItemEmoji: {
    fontSize: '24px',
  },
  summaryItemName: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--text-white)',
  },
  summaryItemQty: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  summaryItemPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-white)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--text-light)',
    marginBottom: '12px',
  },
  placeOrderBtn: {
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
  }
};

