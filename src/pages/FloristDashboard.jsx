import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { Flower2, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { downloadCsv, downloadReport } from '../utils/exportUtils';

export default function FloristDashboard() {
  const { orders, products, updateOrderStatus, updateProductStock } = useContext(AppContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Filter floral items
  const floralInventory = products.filter(p => p.category === 'flowers' || p.category === 'vases');

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, newStatus);
      setModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-florist-orders-report.txt', 'FloraSmart Florist Orders Report', [
      { heading: 'Arrangement Queue', lines: orders.map((order) => order.id + ' | ' + order.status + ' | ' + order.address) },
      { heading: 'Floral Inventory', lines: floralInventory.map((item) => item.name + ' | ' + item.stock + ' left') },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-florist-orders.csv', [
      ['Order ID', 'Items', 'Destination', 'Status'],
      ...orders.map((order) => [order.id, order.items.map((item) => item.name + ' x' + item.quantity).join('; '), order.address, order.status]),
    ]);
  };

  return (
    <div className="dashboard-content">
        {/* Title Header with Export Action buttons */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Florist Studio Dashboard</h2>
            <p style={{ color: 'var(--text-muted)' }}>Manage bouquet custom arrangements, vase matching diagnostics, and floral deliveries.</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              Export Excel
            </Button>
          </div>
        </div>

        {/* Dashboard statistics */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Arrangements Pending"
            value={orders.filter(o => o.status === 'Preparing Arrangement' || o.status === 'Order Placed').length}
            icon={<Clock size={20} color="var(--accent-lime)" />}
            description="Awaiting hand-tied construction"
            trend="+2 New"
            trendType="warning"
          />
          <DashboardCard
            title="Floral Stems Handled"
            value="142 Stems"
            icon={<Flower2 size={20} color="var(--accent-lime)" />}
            description="Processed in last 24 hours"
            trend="+12% vs yday"
            trendType="positive"
          />
          <DashboardCard
            title="Low-Stock warnings"
            value={floralInventory.filter(p => p.stock < 10).length}
            icon={<AlertTriangle size={20} color="var(--warning)" />}
            description="Items below reorder limit"
            trend="Needs Reorder"
            trendType="negative"
          />
        </div>

        <div style={styles.sectionsGrid}>
          {/* Active Orders Workspace */}
          <div className="card" style={{ flex: 1.5, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>Floral Arrangement Queue</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Stems Requested</th>
                    <th>Destination</th>
                    <th>Order Status</th>
                    <th>Modify Status</th>
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
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floral Stock Monitor */}
          <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={styles.sectionTitle}>Flower & Vase Inventory</h3>
            <div style={styles.inventoryList}>
              {floralInventory.map((item) => (
                <div key={item.id} style={styles.inventoryItem}>
                  <span style={{ fontSize: '24px' }}>{item.image}</span>
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
                      onClick={() => updateProductStock(item.id, item.stock + 10)}
                      style={styles.quickRestock}
                      title="Quickly restock +10 units"
                    >
                      + Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Arrangement Revenue chart */}
        <div style={{ marginTop: '32px' }}>
          <ChartCard
            title="Custom Florist Arrangements Assembled (Daily Output)"
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
          title={`Update Order Status: ${selectedOrder?.id}`}
        >
          <FormInput
            label="Order Status"
            id="order-status-select"
            type="select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'Order Placed', label: 'Order Placed (Awaiting Review)' },
              { value: 'Preparing Arrangement', label: 'Preparing Arrangement (In Florist Studio)' },
              { value: 'Out for Delivery', label: 'Out for Delivery (Loaded on vehicle)' },
              { value: 'Delivered', label: 'Delivered (Handed to recipient)' }
            ]}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="lime" onClick={handleUpdateStatus} style={{ flex: 1 }}>
              Confirm Change
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
  }
};

