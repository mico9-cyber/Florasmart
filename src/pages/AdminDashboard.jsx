import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { ShieldAlert, Users, DollarSign, Activity, FileDown, Package2 } from 'lucide-react';
import Button from '../components/Button';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { auditLogs, orders, registeredUsers, analytics } = useContext(AppContext);
  const addToast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const adminAnalytics = analytics?.admin;
  const totalRevenue = adminAnalytics?.totalRevenue || orders.reduce((acc, order) => acc + order.total, 0);
  const pendingCount = adminAnalytics?.pendingOrders ?? orders.filter((order) => order.status !== 'Delivered').length;
  const totalUsers = adminAnalytics?.totalUsers ?? registeredUsers.length;
  const healthStatus = adminAnalytics?.systemHealth ?? '99.98%';

  const roleCounts = Object.keys(adminAnalytics?.usersByRole || {}).length > 0
    ? adminAnalytics.usersByRole
    : registeredUsers.reduce((acc, account) => {
        acc[account.role] = (acc[account.role] || 0) + 1;
        return acc;
      }, {});

  const chartData = adminAnalytics?.weeklySales || [1200, 1500, 1800, 1400, 2200, 2600, 2400];
  const chartLabels = adminAnalytics?.weeklyLabels || ['Wk 21', 'Wk 22', 'Wk 23', 'Wk 24', 'Wk 25', 'Wk 26', 'Wk 27'];

  const handleExportPDF = () => {
    downloadReport('florasmart-admin-report.txt', 'FloraSmart Admin System Report', [
      { heading: 'System Summary', lines: ['Gross Sales: ' + formatCurrency(totalRevenue), 'Open Orders: ' + pendingCount, 'System API Health: ' + healthStatus] },
      { heading: 'Recent Audit Events', lines: auditLogs.slice(0, 10).map((log) => log.timestamp + ' | ' + log.user + ' | ' + log.action + ' | ' + log.status) },
    ]);
    addToast(t('adminDashboard.toast.reportExportedPdf'), 'success');
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-admin-audit.csv', [
      ['Timestamp', 'User', 'Action', 'IP Address', 'Status'],
      ...auditLogs.map((log) => [log.timestamp, log.user, log.action, log.ipAddress, log.status]),
    ]);
    addToast(t('adminDashboard.toast.auditExportedCsv'), 'success');
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <LoadingSpinner text={t('adminDashboard.loading')} />
      </div>
    );
  }

  if (totalRevenue === 0 && orders.length === 0) {
    return (
      <div className="dashboard-content">
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('adminDashboard.title')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('adminDashboard.subtitle')}</p>
          </div>
        </div>
        <div style={styles.statePanel}>
          <Package2 size={20} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <span>{t('adminDashboard.noData')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('adminDashboard.title')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('adminDashboard.subtitle')}</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileDown size={16} />}>
              {t('adminDashboard.exportPdf')}
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<FileDown size={16} />}>
              {t('adminDashboard.exportSheets')}
            </Button>
          </div>
        </div>

        <div className="grid-cols-4" style={{ margin: '32px 0' }}>
          <DashboardCard title={t('adminDashboard.globalGrossSales')} value={formatCurrency(totalRevenue)} icon={<DollarSign size={20} color="var(--accent-lime)" />} description={t('adminDashboard.combinedStoreEarnings')} trend="+18.4%" trendType="positive" />
          <DashboardCard title={t('adminDashboard.registeredUsers')} value={`${totalUsers} Users`} icon={<Users size={20} color="var(--accent-lime)" />} description={t('adminDashboard.registeredAccountsAllRoles')} trend="Active" trendType="positive" />
          <DashboardCard title={t('adminDashboard.openOrders')} value={pendingCount} icon={<ShieldAlert size={20} color="var(--warning)" />} description={t('adminDashboard.awaitingLogisticsRelease')} trend="Needs dispatch" trendType="warning" />
          <DashboardCard title={t('adminDashboard.systemApiHealth')} value={healthStatus} icon={<Activity size={20} color="var(--accent-lime)" />} description={t('adminDashboard.allBackendServicesOperational')} trend="Nominal" trendType="positive" />
        </div>

        <div style={styles.sectionsGrid}>
          <div className="card" style={{ flex: 1.5, minWidth: '350px' }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>{t('adminDashboard.globalSystemAuditLog')}</h3>
              <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => navigate('/security')}>
                {t('adminDashboard.viewFullAudits')}
              </Button>
            </div>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{t('adminDashboard.timestamp')}</th>
                    <th>{t('adminDashboard.user')}</th>
                    <th>{t('adminDashboard.action')}</th>
                    <th>{t('adminDashboard.ipAddress')}</th>
                    <th>{t('adminDashboard.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 4).map((log) => (
                    <tr key={log.id}>
                      <td>{log.timestamp}</td>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{log.ipAddress}</td>
                      <td>
                        <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-error'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={styles.sectionTitle}>{t('adminDashboard.userRoleBreakdown')}</h3>
            <div style={styles.roleBreakdown}>
              {['customer', 'florist', 'gardener', 'admin'].map((role) => {
                const count = roleCounts[role] || 0;
                const totalCount = Object.values(roleCounts).reduce((a, b) => a + b, 0);
                const width = totalCount ? Math.max(4, Math.round((count / totalCount) * 100)) : 4;
                return (
                  <React.Fragment key={role}>
                    <div style={styles.roleRow}>
                      <span>{t('adminDashboard.accounts', { role: role.charAt(0).toUpperCase() + role.slice(1) })}</span>
                      <span style={styles.roleValue}>{t('adminDashboard.accounts', { role: count })}</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${width}%`, backgroundColor: role === 'admin' ? '#F87171' : role === 'florist' ? '#60A5FA' : role === 'gardener' ? 'var(--btn-yellow)' : 'var(--accent-lime)' }}></div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
          <ChartCard title={t('adminDashboard.globalSalesVolumesTraffic')} type="line" data={chartData} labels={chartLabels} valueCallout={`${formatCurrency(totalRevenue)} Total`} />
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
  sectionsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  roleBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  roleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-light)',
  },
  roleValue: {
    fontWeight: '700',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--bg-darker)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  statePanel: {
    marginTop: '32px',
    padding: '24px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  }
};
