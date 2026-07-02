import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppData';
import { Search, MapPin, Truck, Calendar, Box, CheckCircle2 } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';

export default function OrderTrackingPage() {
  const { orders } = useContext(AppContext);

  // States
  const [searchId, setSearchId] = useState('');
  const [activeOrder, setActiveOrder] = useState(orders[0] || null);
  const [searchErr, setSearchErr] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setSearchErr('Please enter an Order ID.');
      return;
    }
    setSearchErr('');
    const found = orders.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase());
    if (found) {
      setActiveOrder(found);
    } else {
      setSearchErr(`Order "${searchId}" not found. Try searching e.g., "${orders[0]?.id || 'FL-9082'}"`);
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Order Placed') return 0;
    if (status === 'Preparing Arrangement') return 1;
    if (status === 'Out for Delivery') return 2;
    if (status === 'Delivered') return 3;
    return 0;
  };

  const stepIndex = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const steps = [
    { label: 'Order Placed', desc: 'Secure payment confirmed', icon: <Box size={16} /> },
    { label: 'Preparing', desc: 'Custom assembly by florist', icon: <SproutIcon /> },
    { label: 'In Transit', desc: 'Out for green EV courier delivery', icon: <Truck size={16} /> },
    { label: 'Delivered', desc: 'Handed to recipient', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Track Your Delivery</h1>
      <p style={styles.subtitle}>Track your smart florist and garden shipments in real-time.</p>

      {/* Search Header */}
      <div className="card" style={styles.searchCard}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={{ flex: 1 }}>
            <FormInput
              id="search-id"
              placeholder="e.g. FL-9082"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              error={searchErr}
            />
          </div>
          <Button type="submit" variant="primary" style={styles.searchBtn}>
            <Search size={18} />
            <span>Track Order</span>
          </Button>
        </form>
      </div>

      {activeOrder ? (
        <div style={styles.layout}>
          {/* Tracking Status Display */}
          <div className="card" style={styles.statusCard}>
            <div style={styles.metaRow}>
              <div>
                <span style={styles.metaLabel}>Order ID</span>
                <h3 style={styles.orderId}>{activeOrder.id}</h3>
              </div>
              <div>
                <span style={styles.metaLabel}>Carrier Code</span>
                <span style={styles.trackingNo}>{activeOrder.trackingNumber}</span>
              </div>
              <div>
                <span style={styles.metaLabel}>Est. Arrival</span>
                <div style={styles.estDate}>
                  <Calendar size={14} color="var(--accent-lime)" />
                  <span>{activeOrder.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* Stepper Timeline Graphics */}
            <div style={styles.stepperContainer}>
              {steps.map((step, idx) => {
                const isActive = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={idx} style={styles.stepItem}>
                    <div style={styles.stepLeft}>
                      <div style={{
                        ...styles.stepNode,
                        backgroundColor: isActive ? 'var(--accent-lime)' : 'var(--bg-darker)',
                        borderColor: isActive ? 'var(--accent-lime)' : 'var(--border-green)',
                        color: isActive ? 'var(--bg-darker)' : 'var(--text-muted)'
                      }}>
                        {step.icon}
                      </div>
                      {idx < steps.length - 1 && (
                        <div style={{
                          ...styles.stepLine,
                          backgroundColor: idx < stepIndex ? 'var(--accent-lime)' : 'var(--border-green)'
                        }}></div>
                      )}
                    </div>
                    <div style={styles.stepRight}>
                      <h4 style={{
                        ...styles.stepLabel,
                        color: isCurrent ? 'var(--accent-lime)' : isActive ? 'var(--text-white)' : 'var(--text-muted)'
                      }}>{step.label}</h4>
                      <p style={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Parameters Card */}
          <div className="card" style={styles.detailsCard}>
            <h3 style={styles.detailsTitle}>Delivery Details</h3>
            <div style={styles.divider}></div>

            <div style={styles.detailRow}>
              <MapPin size={18} color="var(--accent-lime)" style={{ marginTop: '2px' }} />
              <div>
                <span style={styles.detailLabel}>Destination Address</span>
                <p style={styles.detailVal}>{activeOrder.address}</p>
              </div>
            </div>

            <div style={{ ...styles.detailRow, marginTop: '16px' }}>
              <Truck size={18} color="var(--accent-lime)" />
              <div>
                <span style={styles.detailLabel}>Courier Method</span>
                <p style={styles.detailVal}>{activeOrder.deliveryMethod}</p>
              </div>
            </div>

            <div style={styles.divider}></div>

            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Shipment Items
            </h4>
            <div style={styles.itemsList}>
              {activeOrder.items.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <span>{item.name} <strong style={{ color: 'var(--accent-lime)' }}>x{item.quantity}</strong></span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={styles.divider}></div>

            <div style={styles.totalRow}>
              <span>Order Grand Total</span>
              <span style={styles.totalPrice}>{formatCurrency(activeOrder.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No order tracking details active. Place an order to review live routes.</p>
        </div>
      )}
    </div>
  );
}

// Helpers
function SproutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 9 2 2 3-3-3-3" />
      <path d="M12 22V12" />
      <path d="M12 12c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5h-5Z" />
      <path d="M12 12c0-2.8-2.2-5-5-5s-5 2.2-5 5 2.2 5 5 5h5Z" />
    </svg>
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
  searchCard: {
    maxWidth: '650px',
    margin: '0 auto 40px',
    padding: '20px 24px',
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  searchBtn: {
    padding: '12px 24px',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  statusCard: {
    flex: '2 0 450px',
    padding: '32px',
  },
  detailsCard: {
    flex: '1 0 320px',
    alignSelf: 'flex-start',
    padding: '32px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  metaLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '4px',
  },
  orderId: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-white)',
  },
  trackingNo: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
  },
  estDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '700',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '24px 0',
  },
  stepperContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stepItem: {
    display: 'flex',
    gap: '16px',
    minHeight: '64px',
  },
  stepLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepNode: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    width: '2px',
    flex: 1,
    margin: '4px 0',
  },
  stepRight: {
    paddingTop: '4px',
  },
  stepLabel: {
    fontSize: '15px',
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  detailsTitle: {
    fontSize: '18px',
    fontWeight: '700',
  },
  detailRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  detailLabel: {
    display: 'block',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  detailVal: {
    fontSize: '14px',
    color: 'var(--text-light)',
    marginTop: '2px',
    lineHeight: '1.4',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--accent-lime)',
    fontFamily: 'var(--font-headings)',
  }
};

