import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { Flower2, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import ImageWithFallback from '../components/ImageWithFallback';
import { useTranslation } from 'react-i18next';

export default function FloristDashboard() {
  const { t } = useTranslation();
  const { orders, products, updateOrderStatus, updateProductStock } = useContext(AppContext);
  const addToast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Filter floral items
  const floralInventory = products.filter(p => p.category === 'flowers' || p.category === 'vases');

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      try {
        updateOrderStatus(selectedOrder.id, newStatus);
        addToast(t('floristDashboard.toast.orderStatusUpdated', { orderId: selectedOrder.id, status: newStatus }), 'success');
      } catch {
        addToast(t('floristDashboard.toast.failedToUpdateStatus'), 'error');
      }
      setModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleRestock = (item) => {
    updateProductStock(item.id, item.stock + 10);
    addToast(t('floristDashboard.toast.restocked', { name: item.name }), 'success');
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-florist-orders-report.txt', 'FloraSmart Florist Orders Report', [
      { heading: 'Arrangement Queue', lines: orders.map((order) => order.id + ' | ' + order.status + ' | ' + order.address) },
      { heading: 'Floral Inventory', lines: floralInventory.map((item) => item.name + ' | ' + item.stock + ' left') },
    ]);
    addToast(t('floristDashboard.toast.reportExportedPdf'), 'success');
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-florist-orders.csv', [
      ['Order ID', 'Items', 'Destination', 'Status'],
      ...orders.map((order) => [order.id, order.items.map((item) => item.name + ' x' + item.quantity).join('; '), order.address, order.status]),
    ]);
    addToast(t('floristDashboard.toast.ordersExportedCsv'), 'success');
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <LoadingSpinner text={t('floristDashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
        {/* Title Header with Export Action buttons */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('floristDashboard.title')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('floristDashboard.subtitle')}</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              {t('floristDashboard.exportPdf')}
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              {t('floristDashboard.exportExcel')}
            </Button>
          </div>
        </div>

        {/* Dashboard statistics */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title={t('floristDashboard.arrangementsPending')}
            value={orders.filter(o => o.status === 'Preparing Arrangement' || o.status === 'Order Placed').length}
            icon={<Clock size={20} color="var(--accent-lime)" />}
            description={t('floristDashboard.awaitingHandTiedConstruction')}
            trend="+2 New"
            trendType="warning"
          />
          <DashboardCard
            title={t('floristDashboard.floralStemsHandled')}
            value={`${orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)} Stems`}
            icon={<Flower2 size={20} color="var(--accent-lime)" />}
            description={t('floristDashboard.processedAcrossAllOrders')}
            trend="+12% vs yday"
            trendType="positive"
          />
          <DashboardCard
            title={t('floristDashboard.lowStockWarnings')}
            value={floralInventory.filter(p => p.stock < 10).length}
            icon={<AlertTriangle size={20} color="var(--warning)" />}
            description={t('floristDashboard.itemsBelowReorderLimit')}
            trend="Needs Reorder"
            trendType="negative"
          />
        </div>

        <div style={styles.sectionsGrid}>
          {/* Active Orders Workspace */}
          <div className="card" style={{ flex: 1.5, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>{t('floristDashboard.floralArrangementQueue')}</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              {orders.length === 0 ? (
                <div style={styles.statePanel}>
                  <AlertTriangle size={20} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                  <span>{t('floristDashboard.noFloralOrdersYet')}</span>
                </div>
              ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{t('floristDashboard.orderId')}</th>
                    <th>{t('floristDashboard.stemsRequested')}</th>
                    <th>{t('floristDashboard.destination')}</th>
                    <th>{t('floristDashboard.orderStatus')}</th>
                    <th>{t('floristDashboard.modifyStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                      <td>
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td>{order.address}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'Delivered' ? 'badge-success' :
                          order.status === 'Preparing Arrangement' ? 'badge-info' : 'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="lime"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleOpenStatusModal(order)}
                        >
                          {t('floristDashboard.updateStatus')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* Floral Stock Monitor */}
          <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={styles.sectionTitle}>{t('floristDashboard.flowerVaseInventory')}</h3>
            <div style={styles.inventoryList}>
              {floralInventory.length === 0 ? (
                <div style={styles.statePanel}>
                  <span>{t('floristDashboard.noFloralInventoryItems')}</span>
                </div>
              ) : (
              floralInventory.map((item) => (
                <div key={item.id} style={styles.inventoryItem}>
                  <ImageWithFallback src={item.image} alt={item.name} category={item.category} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, fontSize: '14px', color: 'var(--text-white)' }}>{item.name}</h5>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.style || 'Foliage'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      ...styles.stockNum,
                      color: item.stock < 10 ? 'var(--error)' : 'var(--success)'
                    }}>
                      {item.stock} left
                    </span>
                    <button
                      onClick={() => handleRestock(item)}
                      style={styles.quickRestock}
                      title={t('floristDashboard.quicklyRestockTooltip')}
                    >
                      {t('floristDashboard.restock')}
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Arrangement Revenue chart */}
        <div style={{ marginTop: '32px' }}>
          <ChartCard
            title={t('floristDashboard.customFloristArrangementsChart')}
            type="bar"
            data={[12, 19, 15, 22, 28, 30, 18]}
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            valueCallout="174 Stems Custom Hand-tied"
          />
        </div>

        {/* Update Status Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t('floristDashboard.updateOrderStatusTitle', { orderId: selectedOrder?.id })}
        >
          <FormInput
            label={t('floristDashboard.orderStatusLabel')}
            id="order-status-select"
            type="select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'Order Placed', label: t('floristDashboard.orderPlacedAwaitingReview') },
              { value: 'Preparing Arrangement', label: t('floristDashboard.preparingArrangementInStudio') },
              { value: 'Out for Delivery', label: t('floristDashboard.outForDeliveryLoaded') },
              { value: 'Delivered', label: t('floristDashboard.deliveredHandedToRecipient') }
            ]}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
              {t('floristDashboard.cancel')}
            </Button>
            <Button variant="lime" onClick={handleUpdateStatus} style={{ flex: 1 }}>
              {t('floristDashboard.confirmChange')}
            </Button>
          </div>
        </Modal>
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
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  sectionsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  inventoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  inventoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
  },
  stockNum: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
  },
  quickRestock: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-lime)',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
  },
  statePanel: {
    padding: '18px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  }
};

