import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AirtelMoneyPayment from '../components/AirtelMoneyPayment';
import { ShieldCheck, Truck, CreditCard, Smartphone, RefreshCw } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import ImageWithFallback from '../components/ImageWithFallback';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../services/paymentService';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cart, products, createOrder, refreshAppData } = useContext(AppContext);
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
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [airtelPhone, setAirtelPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [airtelTransactionId, setAirtelTransactionId] = useState(null);
  const [airtelPaymentActive, setAirtelPaymentActive] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = deliveryMethod === 'Express Eco-Courier' ? 10000 : (subtotal > 40000 ? 0 : 5000);
  const tax = subtotal * 0.08;

  const DISCOUNT_RULES = [
    { productType: 'plant', label: t('productCatalog.plants'), minQuantity: 50, discountPercent: 5 },
    { productType: 'flower', label: t('productCatalog.flowers'), minQuantity: 50, discountPercent: 5 },
    { productType: 'vase', label: t('productCatalog.vases'), minQuantity: 20, discountPercent: 5 },
  ];

  const typeQuantities = {};
  const typeSubtotals = {};
  for (const item of cart) {
    const product = products.find((p) => String(p.id) === String(item.id));
    const type = (product?.productType || '').toLowerCase();
    if (!type) continue;
    typeQuantities[type] = (typeQuantities[type] || 0) + item.quantity;
    typeSubtotals[type] = (typeSubtotals[type] || 0) + item.price * item.quantity;
  }

  let totalDiscount = 0;
  const discountMessages = [];
  for (const rule of DISCOUNT_RULES) {
    const qty = typeQuantities[rule.productType] || 0;
    if (qty >= rule.minQuantity) {
      const categorySubtotal = typeSubtotals[rule.productType] || 0;
      const discount = Math.round(categorySubtotal * rule.discountPercent / 100);
      if (discount > 0) {
        totalDiscount += discount;
        discountMessages.push(t('checkout.discountMessage', { minQuantity: rule.minQuantity, label: rule.label, discountPercent: rule.discountPercent, saved: formatCurrency(discount) }));
      }
    }
  }

  const grandTotal = subtotal + shipping + tax - totalDiscount;

  const unavailableItem = cart.find((item) => {
    const product = products.find((current) => String(current.id) === String(item.id));
    const maxAllowed = item.stock ?? product?.stock ?? 0;
    return !product || maxAllowed < item.quantity;
  });

  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = t('checkout.fullNameRequired');
        break;
      case 'address':
        if (!value.trim()) error = t('checkout.addressRequired');
        break;
      case 'city':
        if (!value.trim()) error = t('checkout.cityRequired');
        break;
      case 'zip':
        if (!value.trim()) error = t('checkout.zipRequired');
        break;
      case 'phone':
        if (!value.trim()) error = t('checkout.phoneRequired');
        else if (!/^\+?[\d\s\-()]{7,15}$/.test(value)) error = t('checkout.phoneInvalid');
        break;
      case 'cardNumber':
        if (paymentMethod === 'AIRTEL_MONEY') break;
        if (!value.trim()) error = t('checkout.cardRequired');
        else if (value.replace(/\s/g, '').length !== 16) error = t('checkout.cardInvalid');
        break;
      case 'cardExpiry':
        if (paymentMethod === 'AIRTEL_MONEY') break;
        if (!value.trim()) error = t('checkout.expiryRequired');
        break;
      case 'cardCvv':
        if (paymentMethod === 'AIRTEL_MONEY') break;
        if (!value.trim()) error = t('checkout.cvvRequired');
        break;
      case 'airtelPhone':
        if (paymentMethod !== 'AIRTEL_MONEY') break;
        if (!value.trim()) error = t('checkout.phoneRequired');
        else if (!/^(\+?250|0)7[0-9]{8}$/.test(value.replace(/[\s\-()]/g, ''))) error = 'Enter a valid Airtel Money number (e.g. 07XX XXX XXX)';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, [paymentMethod, t]);

  const handleBlur = (name) => (e) => {
    validateField(name, e.target.value);
  };

  const validate = useCallback(() => {
    const tempErrors = {};
    if (cart.length === 0) tempErrors.cart = t('checkout.cartEmpty');
    if (unavailableItem) {
      const maxAllowed = unavailableItem.stock ?? 0;
      tempErrors.cart = t('checkout.onlyAvailable', { name: unavailableItem.name, count: maxAllowed, qty: unavailableItem.quantity });
    }
    if (!fullName.trim()) tempErrors.fullName = t('checkout.fullNameRequired');
    if (!address.trim()) tempErrors.address = t('checkout.addressRequired');
    if (!city.trim()) tempErrors.city = t('checkout.cityRequired');
    if (!zip.trim()) tempErrors.zip = t('checkout.zipRequired');
    if (!phone.trim()) tempErrors.phone = t('checkout.phoneRequired');
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) tempErrors.phone = t('checkout.phoneInvalid');

    if (paymentMethod === 'CARD') {
      if (!cardNumber.trim()) tempErrors.cardNumber = t('checkout.cardRequired');
      else if (cardNumber.replace(/\s/g, '').length !== 16) tempErrors.cardNumber = t('checkout.cardInvalid');
      if (!cardExpiry.trim()) tempErrors.cardExpiry = t('checkout.expiryRequired');
      if (!cardCvv.trim()) tempErrors.cardCvv = t('checkout.cvvRequired');
    } else if (paymentMethod === 'AIRTEL_MONEY') {
      if (!airtelPhone.trim()) tempErrors.airtelPhone = 'Airtel Money phone number is required';
      else if (!/^(\+?250|0)7[0-9]{8}$/.test(airtelPhone.replace(/[\s\-()]/g, ''))) tempErrors.airtelPhone = 'Enter a valid Airtel Money number (e.g. 07XX XXX XXX)';
    }

    setFieldErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [cart, unavailableItem, fullName, address, city, zip, phone, paymentMethod, cardNumber, cardExpiry, cardCvv, airtelPhone, t]);

  const handleAirtelComplete = useCallback(async (paymentData) => {
    setAirtelPaymentActive(false);
    setAirtelTransactionId(null);
    setSubmitting(false);

    if (paymentData?.status === 'COMPLETED') {
      try { await refreshAppData(); } catch { /* best-effort */ }
      addToast(t('checkout.orderSuccess'), 'success');
      navigate('/order-tracking');
      return;
    }

    if (paymentData?.status === 'FAILED') {
      setOrderError(t('checkout.paymentFailed'));
      addToast(t('checkout.paymentFailed'), 'error');
      return;
    }

    if (paymentData?.status === 'CANCELLED') {
      setOrderError(t('checkout.paymentCancelled'));
      addToast(t('checkout.paymentCancelled'), 'error');
      return;
    }

    if (paymentData?.status === 'EXPIRED') {
      setOrderError(t('checkout.paymentExpired'));
      addToast(t('checkout.paymentExpired'), 'error');
      return;
    }

    setOrderError(t('checkout.orderFailed'));
    addToast(t('checkout.orderFailed'), 'error');
  }, [addToast, navigate, refreshAppData, t]);

  const handleAirtelCancel = useCallback(() => {
    setAirtelPaymentActive(false);
    setAirtelTransactionId(null);
    setSubmitting(false);
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setOrderError('');

    if (paymentMethod === 'AIRTEL_MONEY') {
      try {
        const cleanPhone = airtelPhone.replace(/[\s\-()]/g, '');
        const fullPhone = cleanPhone.startsWith('250') ? cleanPhone : `250${cleanPhone.replace(/^0/, '')}`;
        const mappedDelivery = deliveryMethod === 'Express Eco-Courier' ? 'EXPRESS' : 'STANDARD';

        const result = await paymentService.initiateAirtelPayment({
          phone: fullPhone,
          deliveryMethod: mappedDelivery,
          shippingFullName: fullName,
          shippingPhone: phone,
          shippingAddress: address,
          shippingCity: city,
          shippingDistrict: zip,
          total: grandTotal,
        });

        const txnId = result?.data?.transactionId;
        if (!txnId) {
          throw new Error(t('checkout.paymentInitFailed'));
        }

        setAirtelTransactionId(txnId);
        setAirtelPaymentActive(true);
      } catch (err) {
        const errorCode = err.code || '';
        const errorMap = {
          'EMPTY_CART': t('checkout.cartEmpty'),
          'INSUFFICIENT_STOCK': t('checkout.inventoryChanged'),
          'AUTH_TOKEN_EXPIRED': t('checkout.sessionExpired'),
          'UNAUTHORIZED': t('checkout.sessionExpired'),
        };
        const msg = errorMap[errorCode] || err.message || t('checkout.orderFailed');
        setOrderError(msg);
        addToast(msg, 'error');
        setSubmitting(false);
      }
    } else {
      const result = await createOrder({ total: grandTotal, fullName, address, city, zip, deliveryMethod, phone, paymentMethod: 'CARD' });
      setSubmitting(false);
      if (!result.ok) {
        const errorCode = result.code || '';
        const errorMap = {
          'EMPTY_CART': t('checkout.cartEmpty'),
          'INSUFFICIENT_STOCK': t('checkout.inventoryChanged'),
          'AUTH_TOKEN_EXPIRED': t('checkout.sessionExpired'),
          'UNAUTHORIZED': t('checkout.sessionExpired'),
          'CHECKOUT_FAILED': t('checkout.serverError'),
        };
        const msg = errorMap[errorCode] || result.error || t('checkout.orderFailed');
        setOrderError(msg);
        addToast(msg, 'error');
        return;
      }
      setOrderError('');
      addToast(t('checkout.orderSuccess'), 'success');
      navigate('/order-tracking');
    }
  };

  const isAirtel = paymentMethod === 'AIRTEL_MONEY';

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>{t('checkout.title')}</h1>
      <p style={styles.subtitle}>{t('checkout.subtitle')}</p>
      {(orderError || fieldErrors.cart) && <div className="card" style={styles.errorSummary}>{orderError || fieldErrors.cart}</div>}

      {submitting && !airtelPaymentActive && (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <RefreshCw size={24} className="spin" />
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{t('checkout.processing')}</p>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate style={(submitting && !airtelPaymentActive) ? { ...styles.layout, opacity: 0.5, pointerEvents: 'none' } : styles.layout}>
        <div style={styles.formCol}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}><Truck size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />{t('checkout.shippingDestination')}</h3>
            <div style={styles.divider}></div>
            <FormInput label={t('checkout.recipientNameLabel')} id="fullName" value={fullName} onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) validateField('fullName', e.target.value); }} onBlur={handleBlur('fullName')} error={fieldErrors.fullName} ariaInvalid={!!fieldErrors.fullName} ariaDescribedby={fieldErrors.fullName ? 'error-fullName' : undefined} required />
            {fieldErrors.fullName && <span id="error-fullName" style={styles.fieldError}>{fieldErrors.fullName}</span>}
            <FormInput label={t('checkout.streetAddressLabel')} id="address" value={address} onChange={(e) => { setAddress(e.target.value); if (fieldErrors.address) validateField('address', e.target.value); }} onBlur={handleBlur('address')} error={fieldErrors.address} ariaInvalid={!!fieldErrors.address} ariaDescribedby={fieldErrors.address ? 'error-address' : undefined} required />
            {fieldErrors.address && <span id="error-address" style={styles.fieldError}>{fieldErrors.address}</span>}
            <FormInput label={t('checkout.phoneNumberLabel')} id="phone" type="tel" placeholder="+250 7XX XXX XXX" value={phone} onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) validateField('phone', e.target.value); }} onBlur={handleBlur('phone')} error={fieldErrors.phone} ariaInvalid={!!fieldErrors.phone} ariaDescribedby={fieldErrors.phone ? 'error-phone' : undefined} required />
            {fieldErrors.phone && <span id="error-phone" style={styles.fieldError}>{fieldErrors.phone}</span>}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1.5 }}><FormInput label={t('checkout.cityLabel')} id="city" value={city} onChange={(e) => { setCity(e.target.value); if (fieldErrors.city) validateField('city', e.target.value); }} onBlur={handleBlur('city')} error={fieldErrors.city} ariaInvalid={!!fieldErrors.city} ariaDescribedby={fieldErrors.city ? 'error-city' : undefined} required /></div>
              <div style={{ flex: 1 }}><FormInput label={t('checkout.zipCodeLabel')} id="zip" value={zip} onChange={(e) => { setZip(e.target.value); if (fieldErrors.zip) validateField('zip', e.target.value); }} onBlur={handleBlur('zip')} error={fieldErrors.zip} ariaInvalid={!!fieldErrors.zip} ariaDescribedby={fieldErrors.zip ? 'error-zip' : undefined} required /></div>
            </div>
            {fieldErrors.city && <span id="error-city" style={styles.fieldError}>{fieldErrors.city}</span>}
            {fieldErrors.zip && <span id="error-zip" style={styles.fieldError}>{fieldErrors.zip}</span>}
            <FormInput label={t('checkout.deliveryCourierMethod')} id="delivery" type="select" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} options={[{ value: 'Standard Green Delivery', label: t('checkout.standardDeliveryOption') }, { value: 'Express Eco-Courier', label: t('checkout.expressDeliveryOption') }]} />
          </div>

          <div className="card">
            <h3 style={styles.sectionTitle}><CreditCard size={18} color="var(--accent-lime)" style={{ marginRight: '8px' }} />{t('checkout.paymentBilling')}</h3>
            <div style={styles.divider}></div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button type="button" onClick={() => { setPaymentMethod('CARD'); setFieldErrors({}); }} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${paymentMethod === 'CARD' ? 'var(--accent-lime)' : 'var(--border-green)'}`,
                background: paymentMethod === 'CARD' ? 'rgba(132, 204, 22, 0.1)' : 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: paymentMethod === 'CARD' ? 'var(--accent-lime)' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px',
                transition: 'var(--transition)',
              }}>
                <CreditCard size={18} /> Card Payment
              </button>
              <button type="button" onClick={() => { setPaymentMethod('AIRTEL_MONEY'); setFieldErrors({}); }} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `2px solid ${paymentMethod === 'AIRTEL_MONEY' ? 'var(--accent-lime)' : 'var(--border-green)'}`,
                background: paymentMethod === 'AIRTEL_MONEY' ? 'rgba(132, 204, 22, 0.1)' : 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: paymentMethod === 'AIRTEL_MONEY' ? 'var(--accent-lime)' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px',
                transition: 'var(--transition)',
              }}>
                <Smartphone size={18} /> Airtel Money
              </button>
            </div>

            {paymentMethod === 'CARD' && (
              <>
                <FormInput label={t('checkout.creditCardNumber')} id="cardNumber" placeholder="4000 1234 5678 9010" value={cardNumber} onChange={(e) => { setCardNumber(e.target.value); if (fieldErrors.cardNumber) validateField('cardNumber', e.target.value); }} onBlur={handleBlur('cardNumber')} error={fieldErrors.cardNumber} ariaInvalid={!!fieldErrors.cardNumber} ariaDescribedby={fieldErrors.cardNumber ? 'error-cardNumber' : undefined} required />
                {fieldErrors.cardNumber && <span id="error-cardNumber" style={styles.fieldError}>{fieldErrors.cardNumber}</span>}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1.2 }}><FormInput label={t('checkout.expiryDate')} id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => { setCardExpiry(e.target.value); if (fieldErrors.cardExpiry) validateField('cardExpiry', e.target.value); }} onBlur={handleBlur('cardExpiry')} error={fieldErrors.cardExpiry} ariaInvalid={!!fieldErrors.cardExpiry} ariaDescribedby={fieldErrors.cardExpiry ? 'error-cardExpiry' : undefined} required /></div>
                  <div style={{ flex: 1 }}><FormInput label={t('checkout.cvvCode')} id="cardCvv" placeholder="123" value={cardCvv} onChange={(e) => { setCardCvv(e.target.value); if (fieldErrors.cardCvv) validateField('cardCvv', e.target.value); }} onBlur={handleBlur('cardCvv')} error={fieldErrors.cardCvv} ariaInvalid={!!fieldErrors.cardCvv} ariaDescribedby={fieldErrors.cardCvv ? 'error-cardCvv' : undefined} required /></div>
                </div>
                {fieldErrors.cardExpiry && <span id="error-cardExpiry" style={styles.fieldError}>{fieldErrors.cardExpiry}</span>}
                {fieldErrors.cardCvv && <span id="error-cardCvv" style={styles.fieldError}>{fieldErrors.cardCvv}</span>}
              </>
            )}

            {paymentMethod === 'AIRTEL_MONEY' && (
              <>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(132, 204, 22, 0.06)', border: '1px solid rgba(132, 204, 22, 0.2)', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <Smartphone size={16} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-lime)' }} />
                  You will receive a payment request on your Airtel Money number. Open the message and enter your PIN to authorize the payment.
                </div>
                <FormInput
                  label="Airtel Money Number"
                  id="airtelPhone"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={airtelPhone}
                  onChange={(e) => { setAirtelPhone(e.target.value); if (fieldErrors.airtelPhone) validateField('airtelPhone', e.target.value); }}
                  onBlur={handleBlur('airtelPhone')}
                  error={fieldErrors.airtelPhone}
                  ariaInvalid={!!fieldErrors.airtelPhone}
                  ariaDescribedby={fieldErrors.airtelPhone ? 'error-airtelPhone' : undefined}
                  required
                />
                {fieldErrors.airtelPhone && <span id="error-airtelPhone" style={styles.fieldError}>{fieldErrors.airtelPhone}</span>}
              </>
            )}
          </div>
        </div>

        <div style={styles.summaryCol}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={styles.sectionTitle}>{t('checkout.orderSummary')}</h3>
            <div style={styles.divider}></div>
            <div style={styles.itemsSummary}>
              {cart.map((item) => (
                <div key={item.id} style={styles.summaryItem}>
                  <ImageWithFallback src={item.image} alt={item.name} category={item.category} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.summaryItemName}>{item.name}</h5>
                    <span style={styles.summaryItemQty}>{t('checkout.qtyLabel', { quantity: item.quantity })}</span>
                  </div>
                  <span style={styles.summaryItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={styles.divider}></div>
            <div style={styles.summaryRow}><span>{t('checkout.subtotal')}</span><span>{formatCurrency(subtotal)}</span></div>
            <div style={styles.summaryRow}><span>{t('checkout.ecoShipping')}</span><span>{shipping === 0 ? t('cart.free') : formatCurrency(shipping)}</span></div>
            <div style={styles.summaryRow}><span>{t('checkout.tax')}</span><span>{formatCurrency(tax)}</span></div>
            {totalDiscount > 0 && (
              <>
                <div style={{ ...styles.summaryRow, color: 'var(--accent-lime)', fontWeight: '600' }}>
                  <span>{t('checkout.quantityDiscount')}</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(132, 204, 22, 0.08)', border: '1px solid rgba(132, 204, 22, 0.3)', fontSize: '12px', color: 'var(--accent-lime)', marginBottom: '12px' }}>
                  {discountMessages.map((msg, i) => <div key={i}>{msg}</div>)}
                </div>
              </>
            )}
            <div style={styles.divider}></div>
            <div style={{ ...styles.summaryRow, fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}><span>{t('cart.grandTotal')}</span><span style={{ color: totalDiscount > 0 ? 'var(--accent-lime)' : 'var(--text-white)' }}>{formatCurrency(grandTotal)}</span></div>
            <Button type="submit" variant="primary" style={styles.placeOrderBtn} disabled={submitting || cart.length === 0 || Boolean(unavailableItem)}>
              {submitting
                ? (isAirtel ? 'Sending Payment Request...' : t('checkout.placingOrder'))
                : (isAirtel ? `Pay with Airtel Money (${formatCurrency(grandTotal)})` : t('checkout.placeSecureOrder', { total: formatCurrency(grandTotal) }))}
            </Button>
            <div style={styles.securitySeal}><ShieldCheck size={16} color="var(--accent-lime)" /><span>{t('checkout.sslNotice')}</span></div>
          </div>
        </div>
      </form>

      {airtelPaymentActive && airtelTransactionId && (
        <AirtelMoneyPayment
          transactionId={airtelTransactionId}
          amount={grandTotal}
          phone={airtelPhone}
          onComplete={handleAirtelComplete}
          onCancel={handleAirtelCancel}
          t={t}
        />
      )}
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
