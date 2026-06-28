import React from 'react';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { DollarSign, BarChart3, TrendingUp, Sparkles, FileText, Download } from 'lucide-react';
import Button from '../components/Button';
import { downloadCsv, downloadReport } from '../utils/exportUtils';

export default function AnalyticsPage() {
  const analyticsRows = [
    ['Indoor Plants', '5,420 views', '18.4%', '112 units', 'High Conversion'],
    ['Flower Bouquets', '4,210 views', '12.2%', '54 units', 'Nominal'],
    ['Ceramic Vases', '2,870 views', '8.5%', '8 units', 'Underperforming'],
  ];

  const handleExportPDF = () => {
    downloadReport('florasmart-analytics-report.txt', 'FloraSmart Analytics Report', [
      { heading: 'KPI Summary', lines: ['Revenue: $1,248.50', 'Conversion Rate: 3.48%', 'Average Order Value: $48.20'] },
      { heading: 'Conversion Performance', lines: analyticsRows.map((row) => row.join(' | ')) },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-analytics.csv', [
      ['Product Category', 'Impressions', 'Add To Cart Ratio', 'Order Completions', 'Conversion Status'],
      ...analyticsRows,
    ]);
  };

  return (
    <div className="dashboard-content">
        {/* Header Row */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Horticultural Sales Analytics</h2>
            <p style={{ color: 'var(--text-muted)' }}>Perform revenue inspections, catalog conversions, and average order value (AOV) updates.</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              Export Sheets
            </Button>
          </div>
        </div>

        {/* Analytics stats */}
        <div className="grid-cols-4" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Total Net Revenue"
            value="$1,248.50"
            icon={<DollarSign size={20} color="var(--accent-lime)" />}
            description="All florist e-commerce nodes"
            trend="+12.4% MoM"
            trendType="positive"
          />
          <DashboardCard
            title="Conversion Rate"
            value="3.48%"
            icon={<TrendingUp size={20} color="var(--accent-lime)" />}
            description="Visits converting to checkout"
            trend="+0.6% weekly"
            trendType="positive"
          />
          <DashboardCard
            title="Catalog Impressions"
            value="12.5K views"
            icon={<BarChart3 size={20} color="var(--accent-lime)" />}
            description="Specimen page details queried"
            trend="+8.2% views"
            trendType="positive"
          />
          <DashboardCard
            title="Avg Order Value"
            value="$48.20"
            icon={<Sparkles size={20} color="var(--accent-lime)" />}
            description="Mean e-commerce basket size"
            trend="Stable AOV"
            trendType="neutral"
          />
        </div>

        {/* Double charts layouts */}
        <div style={styles.chartsGrid}>
          <div style={{ flex: 1, minWidth: '350px' }}>
            <ChartCard
              title="Weekly Gross Revenue Volume ($ USD)"
              type="line"
              data={[450, 780, 620, 920, 1100, 1248, 980]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              valueCallout="$1,248 Peak Day"
            />
          </div>

          <div style={{ flex: 1, minWidth: '350px' }}>
            <ChartCard
              title="E-Commerce Conversions & Checkout Completions"
              type="bar"
              data={[14, 22, 19, 28, 35, 42, 30]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              valueCallout="174 Orders Total"
            />
          </div>
        </div>

        {/* Ledger logs below */}
        <div className="card" style={{ marginTop: '32px' }}>
          <h3 style={styles.sectionTitle}>Conversion Performance Summary</h3>
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Category</th>
                  <th>Impressions</th>
                  <th>Add To Cart Ratio</th>
                  <th>Order Completions</th>
                  <th>Conversion Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>🌿 Indoor Plants</td>
                  <td>5,420 views</td>
                  <td>18.4%</td>
                  <td>112 units</td>
                  <td><span className="badge badge-success">High Conversion</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>🌹 Flower Bouquets</td>
                  <td>4,210 views</td>
                  <td>12.2%</td>
                  <td>54 units</td>
                  <td><span className="badge badge-info">Nominal</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>🏺 Ceramic Vases</td>
                  <td>2,870 views</td>
                  <td>8.5%</td>
                  <td>8 units</td>
                  <td><span className="badge badge-warning">Underperforming</span></td>
                </tr>
              </tbody>
            </table>
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
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  chartsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  }
};

