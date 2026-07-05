import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import { Search, MapPin, Truck, Calendar, Box, CheckCircle2, RefreshCw, Package, ChevronDown, ChevronUp, Filter, X, User, CreditCard } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { orderService } from '../services/orderService';

const ORDER_STATUS_LABELS = {
  PENDING: 'Order Placed',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const DELIVERY_STATUS_OPTIONS = [
  { value: '', label: 'All Deliveries' },
  { value: 'PENDING_ASSIGNMENT', label: 'Pending Assignment' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
];

const TRACKING_STAGES = [
  { label: 'Order Placed', icon: <Box size={16} /> },
  { label: 'Preparing', icon: <SproutIcon /> },
  { label: 'In Transit', icon: <Truck size={16} /> },
  { label: 'Delivered', icon: <CheckCircle2 size={16} /> },
];

function getTrackingStage(orderStatus, deliveryStatus) {
  if (orderStatus === 'DELIVERED' || deliveryStatus === 'DELIVERED') return 3;
  if (orderStatus === 'OUT_FOR_DELIVERY' || deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'PICKED_UP') return 2;
  if (orderStatus === 'PREPARING' || orderStatus === 'READY_FOR_DELIVERY' || orderStatus === 'PROCESSING' || orderStatus === 'CONFIRMED') return 1;
  return 0;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

function formatDateShort(d) {
  if (!d) return '—';
  return new Date(d).toISOString().substring(0, 10);
}

function formatAddress(order) {
  return [order.shippingAddress, order.shippingCity, order.shippingDistrict].filter(Boolean).join(', ') || '—';
}

function statusColor(status) {
  switch (status) {
    case 'PENDING': return 'var(--btn-yellow)';
    case 'PROCESSING':
    case 'CONFIRMED':
    case 'PREPARING':
    case 'READY_FOR_DELIVERY':
    case 'OUT_FOR_DELIVERY': return 'var(--accent-lime)';
    case 'DELIVERED': return 'var(--success)';
    case 'CANCELLED':
    case 'FAILED': return 'var(--error)';
    default: return 'var(--text-muted)';
  }
}

export default function OrderTrackingPage() {
  const { user, orders, refreshAppData } = useContext(AppContext);
  const addToast = useToast();
  const isAdmin = user.role === 'admin';

  const [searchId, setSearchId] = useState('');
  const [activeOrder, setActiveOrder] = useState(orders[0] || null);
  const [searchErr, setSearchErr] = useState('');
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);

  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (adminSearch) params.set('q', adminSearch);
    if (filterStatus) params.set('status', filterStatus);
    if (filterDelivery) params.set('deliveryStatus', filterDelivery);
    if (filterPayment) params.set('paymentStatus', filterPayment);
    if (filterDateFrom) { const d = new Date(filterDateFrom); if (!isNaN(d.getTime())) params.set('dateFrom', d.toISOString()); }
    if (filterDateTo) { const d = new Date(filterDateTo); if (!isNaN(d.getTime())) params.set('dateTo', d.toISOString()); }
    params.set('limit', '200');
    const qs = params.toString();
    return qs ? `?${qs}` : '?limit=200';
  }, [adminSearch, filterStatus, filterDelivery, filterPayment, filterDateFrom, filterDateTo]);

  const loadAdminOrders = useCallback(async () => {
    setAdminLoading(true);
    try {
      const res = await orderService.list(buildQuery());
      setAdminOrders(res?.data || []);
    } catch {
      addToast('Failed to load orders.', 'error');
    } finally {
      setAdminLoading(false);
    }
  }, [buildQuery, addToast]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminOrders();
      pollingRef.current = setInterval(loadAdminOrders, 10000);
      return () => clearInterval(pollingRef.current);
    }
  }, [isAdmin, loadAdminOrders]);

  useEffect(() => {
    if (!isAdmin) {
      pollingRef.current = setInterval(async () => {
        try { await refreshAppData(); } catch { /* silent */ }
      }, 10000);
      return () => clearInterval(pollingRef.current);
    }
  }, [isAdmin, refreshAppData]);

  useEffect(() => {
    if (!isAdmin) {
      if (!activeOrder) {
        setActiveOrder(orders[0] || null);
      } else {
        const updated = orders.find(o => o.id === activeOrder.id || o.backendId === activeOrder.backendId);
        if (updated) setActiveOrder(updated);
      }
    }
  }, [orders, activeOrder, isAdmin]);

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
      setSearchErr(`Order "${searchId}" not found.`);
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
    { label: 'Delivered', desc: 'Handed to recipient', icon: <CheckCircle2 size={16} /> },
  ];

  if (isAdmin) {
    const handleRowClick = async (order) => {
      setSelectedOrderId(order.id);
      setLoading(true);
      try {
        const res = await orderService.getById(order.id);
        const detail = res?.data || res;
        setActiveOrder({
          id: detail.orderNumber || detail.id,
          backendId: detail.id,
          date: formatDateShort(detail.createdAt),
          items: (detail.items || []).map(i => ({
            id: i.productSku || i.productName,
            name: i.productName,
            quantity: i.quantity,
            price: Number(i.unitPrice || 0),
          })),
          total: Number(detail.totalAmount),
          status: ORDER_STATUS_LABELS[detail.status] || detail.status,
          backendStatus: detail.status,
          address: formatAddress(detail),
          deliveryMethod: detail.deliveryMethod === 'EXPRESS' ? 'Express Eco-Courier' : detail.deliveryMethod === 'PICKUP' ? 'Pickup' : 'Standard Green Delivery',
          trackingNumber: detail.delivery?.id || detail.orderNumber,
          estimatedDelivery: detail.delivery?.scheduledAt ? formatDateShort(detail.delivery.scheduledAt) : '',
          customerName: detail.customer?.name || detail.shippingFullName || '—',
          customerEmail: detail.customer?.email || '—',
          paymentStatus: detail.paymentStatus || '—',
          courier: detail.delivery?.assignedTo?.name || 'Unassigned',
          deliveryStatus: detail.delivery?.status || null,
        });
      } catch {
        addToast('Failed to load order details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleBack = () => {
      setSelectedOrderId(null);
      setActiveOrder(null);
    };

    if (selectedOrderId && activeOrder) {
      const trackingIdx = getTrackingStage(activeOrder.backendStatus, activeOrder.deliveryStatus);
      return (
        <div style={styles.container} className="container">
          <div style={styles.adminBackRow}>
            <Button variant="secondary" onClick={handleBack} style={{ padding: '6px 14px', fontSize: '13px' }}>
              ← Back to All Orders
            </Button>
            <h2 style={{ ...styles.title, margin: 0, textAlign: 'left' }}>Order {activeOrder.id}</h2>
          </div>
          <div style={styles.layout}>
            <div className="card" style={styles.statusCard}>
              <div style={styles.metaRow}>
                <div>
                  <span style={styles.metaLabel}>Order ID</span>
                  <h3 style={styles.orderId}>{activeOrder.id}</h3>
                </div>
                <div>
                  <span style={styles.metaLabel}>Customer</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-white)', display: 'block' }}>{activeOrder.customerName}</span>
                </div>
                <div>
                  <span style={styles.metaLabel}>Email</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{activeOrder.customerEmail}</span>
                </div>
                <div>
                  <span style={styles.metaLabel}>Payment</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: activeOrder.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--btn-yellow)' }}>{activeOrder.paymentStatus}</span>
                </div>
                <div>
                  <span style={styles.metaLabel}>Est. Arrival</span>
                  <div style={styles.estDate}>
                    <Calendar size={14} color="var(--accent-lime)" />
                    <span>{activeOrder.estimatedDelivery || '—'}</span>
                  </div>
                </div>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.stepperContainer}>
                {steps.map((step, idx) => {
                  const isActive = idx <= trackingIdx;
                  const isCurrent = idx === trackingIdx;
                  return (
                    <div key={idx} style={styles.stepItem}>
                      <div style={styles.stepLeft}>
                        <div style={{ ...styles.stepNode, backgroundColor: isActive ? 'var(--accent-lime)' : 'var(--bg-darker)', borderColor: isActive ? 'var(--accent-lime)' : 'var(--border-green)', color: isActive ? 'var(--bg-darker)' : 'var(--text-muted)' }}>
                          {step.icon}
                        </div>
                        {idx < steps.length - 1 && (
                          <div style={{ ...styles.stepLine, backgroundColor: idx < trackingIdx ? 'var(--accent-lime)' : 'var(--border-green)' }}></div>
                        )}
                      </div>
                      <div style={styles.stepRight}>
                        <h4 style={{ ...styles.stepLabel, color: isCurrent ? 'var(--accent-lime)' : isActive ? 'var(--text-white)' : 'var(--text-muted)' }}>{step.label}</h4>
                        <p style={styles.stepDesc}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card" style={styles.detailsCard}>
              <h3 style={styles.detailsTitle}>Delivery Details</h3>
              <div style={styles.divider}></div>
              <div style={styles.detailRow}>
                <User size={18} color="var(--accent-lime)" style={{ marginTop: '2px' }} />
                <div>
                  <span style={styles.detailLabel}>Customer</span>
                  <p style={styles.detailVal}>{activeOrder.customerName}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeOrder.customerEmail}</p>
                </div>
              </div>
              <div style={{ ...styles.detailRow, marginTop: '16px' }}>
                <MapPin size={18} color="var(--accent-lime)" style={{ marginTop: '2px' }} />
                <div>
                  <span style={styles.detailLabel}>Delivery Address</span>
                  <p style={styles.detailVal}>{activeOrder.address}</p>
                </div>
              </div>
              <div style={{ ...styles.detailRow, marginTop: '16px' }}>
                <Truck size={18} color="var(--accent-lime)" />
                <div>
                  <span style={styles.detailLabel}>Courier</span>
                  <p style={styles.detailVal}>{activeOrder.courier}</p>
                </div>
              </div>
              <div style={{ ...styles.detailRow, marginTop: '16px' }}>
                <CreditCard size={18} color="var(--accent-lime)" />
                <div>
                  <span style={styles.detailLabel}>Payment</span>
                  <p style={styles.detailVal}>{activeOrder.paymentStatus}</p>
                </div>
              </div>
              <div style={{ ...styles.detailRow, marginTop: '16px' }}>
                <Calendar size={18} color="var(--accent-lime)" />
                <div>
                  <span style={styles.detailLabel}>Delivery Method</span>
                  <p style={styles.detailVal}>{activeOrder.deliveryMethod}</p>
                </div>
              </div>
              <div style={styles.divider}></div>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Items</h4>
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
                <span>Total</span>
                <span style={styles.totalPrice}>{formatCurrency(activeOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container} className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={styles.title}>All Orders</h1>
            <p style={styles.subtitle}>Track and manage every customer order in real time.</p>
          </div>
          <Button variant="secondary" onClick={loadAdminOrders} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Refresh
          </Button>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 0 200px', minWidth: '180px' }}>
              <FormInput
                id="admin-search"
                placeholder="Search by order ID, name, or email..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={loadAdminOrders} style={{ padding: '12px 20px' }}>
              <Search size={16} style={{ marginRight: '6px' }} /> Search
            </Button>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} style={{ padding: '12px 16px' }}>
              <Filter size={16} style={{ marginRight: '6px' }} /> Filters {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 0 140px', minWidth: '130px' }}>
                <FormInput id="filter-status" type="select" label="Order Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={ORDER_STATUS_OPTIONS} />
              </div>
              <div style={{ flex: '1 0 140px', minWidth: '130px' }}>
                <FormInput id="filter-payment" type="select" label="Payment Status" value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} options={PAYMENT_STATUS_OPTIONS} />
              </div>
              <div style={{ flex: '1 0 140px', minWidth: '130px' }}>
                <FormInput id="filter-delivery" type="select" label="Delivery Status" value={filterDelivery} onChange={(e) => setFilterDelivery(e.target.value)} options={DELIVERY_STATUS_OPTIONS} />
              </div>
              <div style={{ flex: '1 0 120px', minWidth: '100px' }}>
                <FormInput id="filter-date-from" type="text" label="Date From" placeholder="YYYY-MM-DD" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
              </div>
              <div style={{ flex: '1 0 120px', minWidth: '100px' }}>
                <FormInput id="filter-date-to" type="text" label="Date To" placeholder="YYYY-MM-DD" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
              </div>
              <Button variant="secondary" onClick={() => { setAdminSearch(''); setFilterStatus(''); setFilterDelivery(''); setFilterPayment(''); setFilterDateFrom(''); setFilterDateTo(''); }} style={{ padding: '8px 12px', fontSize: '12px', marginBottom: '2px' }}>
                <X size={14} /> Clear
              </Button>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {adminLoading && adminOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <RefreshCw size={28} className="spin" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading orders...</p>
            </div>
          ) : adminOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <Package size={48} color="var(--border-green)" />
              <h3 style={{ color: 'var(--text-white)', marginTop: '16px' }}>No Orders Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No orders match your search or filter criteria.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Address</th>
                    <th>Courier</th>
                    <th>ETA</th>
                    <th>Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map((order) => {
                    const trackingIdx = getTrackingStage(order.status, order.deliveryStatus);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(132,204,22,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                      >
                        <td style={{ fontWeight: '600' }}>{order.customer?.name || order.shippingFullName || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-lime)' }}>{order.orderNumber}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {(order.items || []).slice(0, 3).map(i => i.productName).join(', ')}{order.itemCount > 3 ? ` +${order.itemCount - 3} more` : ''}
                        </td>
                        <td>
                          <span style={{ color: statusColor(order.status), fontWeight: '600', fontSize: '12px' }}>{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                        </td>
                        <td>
                          <span style={{ color: order.paymentStatus === 'PAID' ? 'var(--success)' : order.paymentStatus === 'FAILED' ? 'var(--error)' : 'var(--btn-yellow)', fontWeight: '600', fontSize: '12px' }}>{order.paymentStatus || '—'}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatAddress(order)}</td>
                        <td style={{ fontSize: '12px' }}>{order.deliveryAssignedTo || '—'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.deliveryScheduledAt ? formatDateShort(order.deliveryScheduledAt) : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {TRACKING_STAGES.map((stage, idx) => (
                              <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx <= trackingIdx ? 'var(--accent-lime)' : 'var(--border-green)', flexShrink: 0 }} title={stage.label} />
                            ))}
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>{TRACKING_STAGES[trackingIdx]?.label}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-green)' }}>
                {adminOrders.length} order{adminOrders.length !== 1 ? 's' : ''} · Auto-refreshes every 10s
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <RefreshCw size={32} className="spin" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Loading order details...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Track Your Delivery</h1>
      <p style={styles.subtitle}>Track your smart florist and garden shipments in real-time.</p>

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

      {loading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <RefreshCw size={28} className="spin" />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Package size={56} color="var(--border-green)" />
          <h3 style={{ color: 'var(--text-white)', marginTop: '20px' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px', maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto' }}>
            You haven't placed any orders. Browse our catalog and start your green journey!
          </p>
          <Button variant="lime" onClick={() => window.location.href = '/catalog'}>
            Browse Catalog
          </Button>
        </div>
      ) : activeOrder ? (
        <div style={styles.layout}>
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

            <div style={styles.stepperContainer}>
              {steps.map((step, idx) => {
                const isActive = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={idx} style={styles.stepItem}>
                    <div style={styles.stepLeft}>
                      <div style={{ ...styles.stepNode, backgroundColor: isActive ? 'var(--accent-lime)' : 'var(--bg-darker)', borderColor: isActive ? 'var(--accent-lime)' : 'var(--border-green)', color: isActive ? 'var(--bg-darker)' : 'var(--text-muted)' }}>
                        {step.icon}
                      </div>
                      {idx < steps.length - 1 && (
                        <div style={{ ...styles.stepLine, backgroundColor: idx < stepIndex ? 'var(--accent-lime)' : 'var(--border-green)' }}></div>
                      )}
                    </div>
                    <div style={styles.stepRight}>
                      <h4 style={{ ...styles.stepLabel, color: isCurrent ? 'var(--accent-lime)' : isActive ? 'var(--text-white)' : 'var(--text-muted)' }}>{step.label}</h4>
                      <p style={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
          <p style={{ color: 'var(--text-muted)' }}>No order tracking details active. Use the search above or select an order from your history.</p>
        </div>
      )}
    </div>
  );
}

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
  container: { padding: '40px 24px' },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '40px' },
  searchCard: { maxWidth: '650px', margin: '0 auto 40px', padding: '20px 24px' },
  searchForm: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  searchBtn: { padding: '12px 24px' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  statusCard: { flex: '2 0 450px', padding: '32px' },
  detailsCard: { flex: '1 0 320px', alignSelf: 'flex-start', padding: '32px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  metaLabel: { display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' },
  orderId: { fontSize: '20px', fontWeight: '800', color: 'var(--text-white)' },
  trackingNo: { fontSize: '14px', fontWeight: '700', color: 'var(--accent-lime)' },
  estDate: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700' },
  divider: { height: '1px', backgroundColor: 'var(--border-green)', margin: '24px 0' },
  stepperContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  stepItem: { display: 'flex', gap: '16px', minHeight: '64px' },
  stepLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepNode: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepLine: { width: '2px', flex: 1, margin: '4px 0' },
  stepRight: { paddingTop: '4px' },
  stepLabel: { fontSize: '15px', fontWeight: '700' },
  stepDesc: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  detailsTitle: { fontSize: '18px', fontWeight: '700' },
  detailRow: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  detailLabel: { display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' },
  detailVal: { fontSize: '14px', color: 'var(--text-light)', marginTop: '2px', lineHeight: '1.4' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontSize: '20px', fontWeight: '800', color: 'var(--accent-lime)', fontFamily: 'var(--font-headings)' },
  adminBackRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
};
