import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { Truck, MapPin, Navigation, FileText, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCsv, downloadReport } from '../utils/exportUtils';

export default function DeliveryPage() {
  const { orders, updateOrderStatus } = useContext(AppContext);
  
  // Selected Order logic
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusVal, setStatusVal] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
    setModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, statusVal);
      setModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-delivery-report.txt', 'FloraSmart Delivery Logistics Report', [
      { heading: 'Dispatch Queue', lines: orders.map((order) => order.id + ' | ' + order.deliveryMethod + ' | ' + order.status + ' | ' + order.address) },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-delivery-routes.csv', [
      ['Order ID', 'Destination', 'Courier Method', 'Status'],
      ...orders.map((order) => [order.id, order.address, order.deliveryMethod, order.status]),
    ]);
  };

  return (
    <div className="dashboard-content">
        {/* Header Row */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Delivery & Logistics Panel</h2>
            <p style={{ color: 'var(--text-muted)' }}>Monitor courier dispatch queues, route coordinates, and update delivery completions.</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              Export Logistics PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              Export Routes Sheet
            </Button>
          </div>
        </div>

        {/* Vital logs statistics */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Total Deliveries"
            value={orders.length}
            icon={<Truck size={20} color="var(--accent-lime)" />}
            description="Historical logistics entries"
          />
          <DashboardCard
            title="Out for Delivery"
            value={orders.filter(o => o.status === 'Out for Delivery').length}
            icon={<Navigation size={20} color="var(--accent-lime)" />}
            description="Active vehicles on street routes"
          />
          <DashboardCard
            title="Completed Shipments"
            value={orders.filter(o => o.status === 'Delivered').length}
            icon={<MapPin size={20} color="var(--accent-lime)" />}
            description="Delivered to doorstep coordinates"
          />
        </div>

        <div style={styles.sectionsGrid}>
          {/* Active Deliveries Ledger */}
          <div className="card" style={{ flex: 1.5, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>Logistics Dispatch Queue</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Destination Coordinates</th>
                    <th>Courier Method</th>
                    <th>Shipment Status</th>
                    <th>Logistics Control</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                      <td>{order.address}</td>
                      <td>{order.deliveryMethod}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'Delivered' ? 'badge-success' :
                          order.status === 'Out for Delivery' ? 'badge-info' : 'badge-warning'
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
                          Modify Stage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Routing Blueprint Graphics */}
          <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={styles.sectionTitle}>Global Route Trace</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 16px' }}>
              Real-time green EV dispatch routes map coordinates.
            </p>
            <div style={styles.mapArea}>
              <svg viewBox="0 0 200 180" style={styles.mapSvg}>
                {/* Street lines grid */}
                <line x1="20" y1="20" x2="180" y2="20" stroke="var(--border-green)" strokeWidth="2" strokeDasharray="3" />
                <line x1="20" y1="90" x2="180" y2="90" stroke="var(--border-green)" strokeWidth="2" strokeDasharray="3" />
                <line x1="20" y1="160" x2="180" y2="160" stroke="var(--border-green)" strokeWidth="2" />

                <line x1="30" y1="10" x2="30" y2="170" stroke="var(--border-green)" strokeWidth="2" strokeDasharray="3" />
                <line x1="100" y1="10" x2="100" y2="170" stroke="var(--border-green)" strokeWidth="2" />
                <line x1="170" y1="10" x2="170" y2="170" stroke="var(--border-green)" strokeWidth="2" strokeDasharray="3" />

                {/* Warehouse Location node */}
                <circle cx="100" cy="90" r="8" fill="var(--accent-lime)" />
                <text x="100" y="80" fill="var(--text-white)" fontSize="8" fontWeight="bold" textAnchor="middle">
                  HQ GreenHouse
                </text>

                {/* Delivery coordinates nodes */}
                <g>
                  <circle cx="30" cy="20" r="5" fill="var(--btn-yellow)" className="pulse-light" />
                  <circle cx="170" cy="160" r="5" fill="var(--btn-yellow)" />
                  <circle cx="30" cy="90" r="5" fill="var(--success)" />
                </g>

                {/* Active route trace line */}
                <path d="M 100 90 L 100 20 L 30 20" fill="none" stroke="var(--accent-lime)" strokeWidth="2.5" />
              </svg>
              <div style={styles.mapMeta}>
                <Navigation size={12} color="var(--accent-lime)" />
                <span>EV Dispatch Route Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modify Stage Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Logistics Status: ${selectedOrder?.id}`}
        >
          <FormInput
            label="Shipment Phase"
            id="shipment-select"
            type="select"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
            options={[
              { value: 'Order Placed', label: 'Order Placed (In Warehouse)' },
              { value: 'Preparing Arrangement', label: 'Preparing Arrangement (Assigned to Florist)' },
              { value: 'Out for Delivery', label: 'Out for Delivery (Loaded on EV)' },
              { value: 'Delivered', label: 'Delivered (Completed)' }
            ]}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="lime" onClick={handleSaveStatus} style={{ flex: 1 }}>
              Update Logistics
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
  mapArea: {
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    height: '220px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSvg: {
    height: '90%',
  },
  mapMeta: {
    position: 'absolute',
    bottom: '8px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '700',
  }
};

