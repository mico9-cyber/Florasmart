import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import { ShieldCheck, ShieldAlert, Key, FileText, Download } from 'lucide-react';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { useTranslation } from 'react-i18next';

export default function SecurityPage() {
  const { t } = useTranslation();
  const { auditLogs } = useContext(AppContext);
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction === 'all') return true;
    if (filterAction === 'auth') return log.action.includes('Login') || log.action.includes('Sign');
    if (filterAction === 'cart') return log.action.includes('Cart') || log.action.includes('Order');
    if (filterAction === 'admin') return log.action.includes('Role') || log.action.includes('Inventory') || log.action.includes('Deleted');
    return true;
  });

  const handleExportPDF = () => {
    downloadReport('florasmart-security-report.txt', 'FloraSmart Security Audit Report', [
      { heading: 'Filtered Audit Events', lines: filteredLogs.map((log) => log.timestamp + ' | ' + log.user + ' | ' + log.action + ' | ' + log.status) },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-security-audit.csv', [
      ['Timestamp', 'Identity', 'Action Event', 'IP Address', 'Status'],
      ...filteredLogs.map((log) => [log.timestamp, log.user, log.action, log.ipAddress, log.status]),
    ]);
  };

  return (
    <div className="dashboard-content">
        {/* Header Row */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('securityPage.title')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('securityPage.subtitle')}</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              {t('securityPage.exportAuditPdf')}
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<Download size={16} />}>
              {t('securityPage.exportAuditCsv')}
            </Button>
          </div>
        </div>

        {/* Security statistics */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title={t('securityPage.rbacComplianceLevel')}
            value={t('securityPage.levelA')}
            icon={<ShieldCheck size={20} color="var(--success)" />}
            description={t('securityPage.allApiRequestsEncrypted')}
            trend={t('securityPage.pctSecure')}
            trendType="positive"
          />
          <DashboardCard
            title={t('securityPage.suspiciousAttempts')}
            value={t('securityPage.zeroAlerts')}
            icon={<ShieldAlert size={20} color="var(--success)" />}
            description={t('securityPage.bruteForceBlocksTriggered')}
            trend={t('securityPage.nominal')}
            trendType="positive"
          />
          <DashboardCard
            title={t('securityPage.activeSessions')}
            value={t('securityPage.sessionsCount', { count: 3 })}
            icon={<Key size={20} color="var(--accent-lime)" />}
            description={t('securityPage.authenticationsActiveInNetwork')}
          />
        </div>

        <div style={styles.sectionsGrid}>
          {/* Security Log Table */}
          <div className="card" style={{ flex: 1.8, minWidth: '400px' }}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sectionTitle}>{t('securityPage.realTimeSecurityEventLogs')}</h3>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">{t('securityPage.filterAllEvents')}</option>
                <option value="auth">{t('securityPage.filterLoginAuth')}</option>
                <option value="cart">{t('securityPage.filterEcommerce')}</option>
                <option value="admin">{t('securityPage.filterWorkspaceChanges')}</option>
              </select>
            </div>
            
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{t('securityPage.timestamp')}</th>
                    <th>{t('securityPage.identity')}</th>
                    <th>{t('securityPage.actionEvent')}</th>
                    <th>{t('securityPage.ipAddress')}</th>
                    <th>{t('securityPage.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.timestamp}</td>
                      <td>{log.user}</td>
                      <td style={{ fontWeight: '600' }}>{log.action}</td>
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

          {/* RBAC Policies Help Card */}
          <div className="card" style={{ flex: 1, minWidth: '280px', alignSelf: 'flex-start' }}>
            <h3 style={styles.sectionTitle}>{t('securityPage.rbacPoliciesSchema')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
              {t('securityPage.rbacPoliciesSchemaHint')}
            </p>
            <div style={styles.policiesList}>
              <div style={styles.policyItem}>
                <h5 style={styles.policyTitle}>{t('securityPage.customerWorkspace')}</h5>
                <p style={styles.policyDesc}>{t('securityPage.customerWorkspaceDesc')}</p>
              </div>

              <div style={styles.policyItem}>
                <h5 style={styles.policyTitle}>{t('securityPage.floristStudio')}</h5>
                <p style={styles.policyDesc}>{t('securityPage.floristStudioDesc')}</p>
              </div>

              <div style={styles.policyItem}>
                <h5 style={styles.policyTitle}>{t('securityPage.gardenerSandbox')}</h5>
                <p style={styles.policyDesc}>{t('securityPage.gardenerSandboxDesc')}</p>
              </div>

              <div style={styles.policyItem}>
                <h5 style={styles.policyTitle}>{t('securityPage.systemAdministrator')}</h5>
                <p style={styles.policyDesc}>{t('securityPage.systemAdministratorDesc')}</p>
              </div>
            </div>
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
  sectionsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '32px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  filterSelect: {
    backgroundColor: 'var(--bg-darker)',
    color: 'var(--accent-lime)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  policiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  policyItem: {
    borderBottom: '1px solid var(--border-green)',
    paddingBottom: '12px',
  },
  policyTitle: {
    fontSize: '14px',
    color: 'var(--accent-lime)',
    fontWeight: '700',
    marginBottom: '4px',
  },
  policyDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  }
};

