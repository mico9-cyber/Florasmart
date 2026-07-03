import React, { useContext } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign, BarChart3, TrendingUp, Sparkles, FileText, Download, BarChart } from 'lucide-react';
import Button from '../components/Button';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatCurrency';

export default function AnalyticsPage() {
  const { analytics, user } = useContext(AppContext);

  const activeAnalytics = user?.role === 'admin' ? analytics.admin
    : user?.role === 'florist' ? analytics.florist
    : analytics.customer;

  if (activeAnalytics === null) {
    const header = (
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Horticultural Sales Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Perform revenue inspections, catalog conversions, and average order value (AOV) updates.</p>
        </div>
      </div>
    );
    return (
      <div className="dashboard-content">
        {header}
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <BarChart size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Analytics data unavailable</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px', margin: '8px auto 0' }}>
            {user?.role ? `The analytics backend for ${user.role} has not returned data yet.` : 'Sign in to view analytics.'}
          </p>
        </div>
      </div>
    );
  }

  const revenue = activeAnalytics?.totalRevenue || activeAnalytics?.totalSales || 0;
  const conversionRate = activeAnalytics?.conversionRate || 0;
  const totalOrders = activeAnalytics?.totalOrders || activeAnalytics?.orderCount || 0;
  const aov = activeAnalytics?.averageOrderValue || activeAnalytics?.aov || 0;
  const impressions = activeAnalytics?.totalViews || activeAnalytics?.impressions || 0;

  const salesData = activeAnalytics?.salesTrend || activeAnalytics?.weeklyRevenue || [];
  const ordersData = activeAnalytics?.ordersTrend || activeAnalytics?.weeklyOrders || [];

  const hasData = revenue > 0 || totalOrders > 0 || salesData.length > 0;

  const productRows = (activeAnalytics?.productPerformance || activeAnalytics?.topProducts || []).slice(0, 5);
  const displayRows = productRows.length > 0 ? productRows.map((p) => [
    p.name || p.category || p.productName,
    `${p.views || p.impressions || 0} views`,
    `${p.conversionRate || p.addToCartRate || 0}%`,
    `${p.sales || p.orders || p.unitsSold || 0} units`,
    (Number(p.conversionRate) > 15 || p.status === 'high') ? 'High Conversion' : 'Nominal',
  ]) : [];

  const handleExportPDF = () => {
    downloadReport('florasmart-analytics-report.txt', 'FloraSmart Analytics Report', [
      { heading: 'KPI Summary', lines: [`Revenue: ${formatCurrency(revenue)}`, `Conversion Rate: ${conversionRate}`, `Average Order Value: ${formatCurrency(aov)}`] },
      { heading: 'Conversion Performance', lines: displayRows.map((row) => row.join(' | ')) },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-analytics.csv', [
      ['Product Category', 'Impressions', 'Add To Cart Ratio', 'Order Completions', 'Conversion Status'],
      ...displayRows,
    ]);
  };

  return (
    <div className="dashboard-content">
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

        <div className="grid-cols-4" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Total Net Revenue"
            value={formatCurrency(revenue)}
            icon={<DollarSign size={20} color="var(--accent-lime)" />}
            description="All florist e-commerce nodes"
            trend="+12.4% MoM"
            trendType="positive"
          />
          <DashboardCard
            title="Conversion Rate"
            value={typeof conversionRate === 'number' ? `${conversionRate}%` : conversionRate}
            icon={<TrendingUp size={20} color="var(--accent-lime)" />}
            description="Visits converting to checkout"
            trend="+0.6% weekly"
            trendType="positive"
          />
          <DashboardCard
            title="Catalog Impressions"
            value={typeof impressions === 'number' ? `${impressions.toLocaleString()} views` : impressions}
            icon={<BarChart3 size={20} color="var(--accent-lime)" />}
            description="Specimen page details queried"
            trend="+8.2% views"
            trendType="positive"
          />
          <DashboardCard
            title="Avg Order Value"
            value={formatCurrency(aov)}
            icon={<Sparkles size={20} color="var(--accent-lime)" />}
            description="Mean e-commerce basket size"
            trend="Stable AOV"
            trendType="neutral"
          />
        </div>

        <div style={styles.chartsGrid}>
          <div style={{ flex: 1, minWidth: '350px' }}>
            <ChartCard
              title="Weekly Gross Revenue Volume (RWF)"
              type="line"
              data={salesData}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              valueCallout={`${formatCurrency(revenue)} Total`}
            />
          </div>

          <div style={{ flex: 1, minWidth: '350px' }}>
            <ChartCard
              title="E-Commerce Conversions & Checkout Completions"
              type="bar"
              data={ordersData}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              valueCallout={`${totalOrders} Orders Total`}
            />
          </div>
        </div>

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
                {displayRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 'bold' }}>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td><span className={`badge ${row[4] === 'High Conversion' ? 'badge-success' : row[4] === 'Underperforming' ? 'badge-warning' : 'badge-info'}`}>{row[4]}</span></td>
                  </tr>
                ))}
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

