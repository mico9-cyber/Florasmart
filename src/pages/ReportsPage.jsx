import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppData';
import { reportService } from '../services/reportService';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { FileText, Download, Trash2, RefreshCw, FileSpreadsheet, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { downloadReport } from '../utils/exportUtils';

const REPORT_TYPES = [
  { value: 'SALES', label: 'Sales Report' },
  { value: 'INVENTORY', label: 'Inventory Report' },
  { value: 'ORDERS', label: 'Orders Report' },
  { value: 'CUSTOMERS', label: 'Customer Report' },
  { value: 'DELIVERY', label: 'Delivery Report' },
  { value: 'PRODUCTS', label: 'Products Report' },
  { value: 'LOYALTY', label: 'Loyalty Report' },
  { value: 'GARDEN_PLANS', label: 'Garden Plans Report' },
  { value: 'CHATBOT', label: 'Chatbot Report' },
  { value: 'RECOMMENDATIONS', label: 'Recommendations Report' },
];

const FORMATS = [
  { value: 'CSV', label: 'CSV' },
  { value: 'PDF', label: 'PDF' },
];

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString();
}

function statusIcon(status) {
  if (status === 'COMPLETED') return <CheckCircle2 size={16} color="var(--success)" />;
  if (status === 'FAILED') return <AlertCircle size={16} color="var(--error)" />;
  return <RefreshCw size={16} color="var(--accent-lime)" className="pulse-light" style={{ animation: 'spin 1.5s linear infinite' }} />;
}

export default function ReportsPage() {
  const { user } = useContext(AppContext);
  const addToast = useToast();
  const [reportType, setReportType] = useState('SALES');
  const [format, setFormat] = useState('CSV');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.jobs();
      setJobs(res?.data?.jobs || []);
    } catch {
      setError('Failed to load report jobs.');
      addToast('Failed to load report jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    try {
      await reportService.generate({
        reportType,
        format,
        filters: {
          ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
          ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
        },
      });
      setSuccess('Report generation started!');
      addToast('Report generation started!', 'success');
      setReportType('SALES');
      setFormat('CSV');
      setDateFrom('');
      setDateTo('');
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
      addToast(err.message || 'Failed to generate report.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (jobId, filename) => {
    try {
      const res = await reportService.download(jobId);
      const blob = res instanceof Blob ? res : new Blob([JSON.stringify(res)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Report downloaded successfully.', 'success');
    } catch {
      addToast('Failed to download report. Using fallback.', 'warning');
      downloadReport(`report-${jobId}.txt`, `Report ${jobId}`, [
        { heading: 'Downloads', lines: ['Download via backend URL.'] },
      ]);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await reportService.remove(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setConfirmDelete(null);
      setSuccess('Report deleted.');
      addToast('Report deleted.', 'success');
    } catch {
      setError('Failed to delete report.');
      addToast('Failed to delete report.', 'error');
    }
  };

  const activeJobs = jobs.filter((j) => j.status === 'PENDING' || j.status === 'PROCESSING');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const failedJobs = jobs.filter((j) => j.status === 'FAILED');

  return (
    <div className="dashboard-content">
      <div style={styles.header}>
        <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Reports & Exports</h2>
        <p style={{ color: 'var(--text-muted)' }}>Generate and download business reports.</p>
      </div>

      {success && (
        <div style={styles.banner}>
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ ...styles.banner, borderColor: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} color="var(--error)" />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.grid}>
        <div className="card" style={{ flex: 1, minWidth: '350px', padding: '32px' }}>
          <h3 style={styles.sectionTitle}>Generate Report</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            Select report type and format to start generation.
          </p>
          <form onSubmit={handleGenerate}>
            <FormInput
              label="Report Type"
              id="report-type"
              type="select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={REPORT_TYPES}
            />
            <FormInput
              label="Format"
              id="report-format"
              type="select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={FORMATS}
            />
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="Date From"
                  id="date-from"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="Date To"
                  id="date-to"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={generating}>
              {generating ? <><RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> Generating...</> : 'Generate Report'}
            </Button>
          </form>
        </div>

        <div style={{ flex: 2, minWidth: '400px' }}>
          {activeJobs.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={styles.sectionTitle}>Processing</h3>
              {activeJobs.map((job) => (
                <div key={job.id} style={styles.jobRow}>
                  <div style={styles.jobInfo}>
                    <span style={styles.jobType}>{job.type || job.reportType}</span>
                    <span style={styles.jobDate}>{formatDate(job.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {statusIcon(job.status)}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Generated Reports</h3>
              <Button variant="secondary" onClick={loadJobs} style={{ padding: '4px 8px', fontSize: '12px' }}>
                <RefreshCw size={14} /> Refresh
              </Button>
            </div>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Loading...</p>
            ) : completedJobs.length === 0 && failedJobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No reports generated yet.</p>
            ) : (
              <div className="table-container" style={{ marginTop: '16px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Format</th>
                      <th>Generated</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...completedJobs, ...failedJobs].map((job) => (
                      <tr key={job.id}>
                        <td style={{ fontWeight: 'bold' }}>{job.type || job.reportType || 'Report'}</td>
                        <td>{job.format || 'CSV'}</td>
                        <td>{formatDate(job.createdAt)}</td>
                        <td>
                          <span className={`badge ${job.status === 'COMPLETED' ? 'badge-success' : 'badge-error'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {job.status === 'COMPLETED' && (
                              <Button
                                variant="secondary"
                                onClick={() => handleDownload(job.id, `${job.type || 'report'}-${job.id}.${(job.format || 'csv').toLowerCase()}`)}
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                              >
                                <Download size={14} />
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              onClick={() => setConfirmDelete(job.id)}
                              style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--error)' }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Report">
        <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
          Are you sure you want to delete this report?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="lime" onClick={() => handleDelete(confirmDelete)} style={{ flex: 1 }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  header: { marginBottom: '32px' },
  banner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)',
    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px',
  },
  grid: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-white)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  jobRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid var(--border-green)',
  },
  jobInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  jobType: { fontSize: '14px', fontWeight: '600', color: 'var(--text-white)' },
  jobDate: { fontSize: '11px', color: 'var(--text-muted)' },
};
