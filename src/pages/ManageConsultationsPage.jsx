import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { consultationService } from '../services/consultationService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { ClipboardCheck, Clock, User, Mail, Calendar, Check, X, RefreshCw, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ManageConsultationsPage() {
  const { t } = useTranslation();
  const addToast = useToast();

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes] = await Promise.all([
        consultationService.listPending(),
        consultationService.listMyAssigned(),
      ]);
      setPendingConsultations(pendingRes?.data || []);
      setMyConsultations(myRes?.data || []);
    } catch {
      addToast(t('manageConsultations.toast.failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await consultationService.accept(id);
      addToast(t('manageConsultations.toast.accepted'), 'success');
      loadConsultations();
    } catch (err) {
      addToast(err.message || t('manageConsultations.toast.failedToAccept'), 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await consultationService.reject(id, rejectReason);
      addToast(t('manageConsultations.toast.rejected'), 'success');
      setRejectingId(null);
      setRejectReason('');
      loadConsultations();
    } catch (err) {
      addToast(err.message || t('manageConsultations.toast.failedToReject'), 'error');
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate) {
      addToast(t('manageConsultations.toast.selectNewDate'), 'error');
      return;
    }
    try {
      await consultationService.reschedule(id, rescheduleDate, rescheduleReason);
      addToast(t('manageConsultations.toast.rescheduled'), 'success');
      setReschedulingId(null);
      setRescheduleDate('');
      setRescheduleReason('');
      loadConsultations();
    } catch (err) {
      addToast(err.message || t('manageConsultations.toast.failedToReschedule'), 'error');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const displayConsultations = activeTab === 'pending' ? pendingConsultations : myConsultations;

  return (
    <div className="dashboard-content">
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('consultation.manage.title')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('manageConsultations.subtitle')}</p>
          </div>
          <Button onClick={loadConsultations} variant="secondary" style={{ padding: '10px 16px' }}>
            <RefreshCw size={16} /> {t('manageConsultations.refresh')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{ ...styles.tab, borderColor: activeTab === 'pending' ? 'var(--accent-lime)' : 'var(--border-green)', backgroundColor: activeTab === 'pending' ? 'rgba(132, 204, 22, 0.05)' : 'var(--bg-card)', color: activeTab === 'pending' ? 'var(--accent-lime)' : 'var(--text-muted)' }}
        >
          <Clock size={16} /> {t('manageConsultations.pendingTab', { count: pendingConsultations.length })}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={{ ...styles.tab, borderColor: activeTab === 'my' ? 'var(--accent-lime)' : 'var(--border-green)', backgroundColor: activeTab === 'my' ? 'rgba(132, 204, 22, 0.05)' : 'var(--bg-card)', color: activeTab === 'my' ? 'var(--accent-lime)' : 'var(--text-muted)' }}
        >
          <ClipboardCheck size={16} /> {t('manageConsultations.myConsultationsTab', { count: myConsultations.length })}
        </button>
      </div>

      {/* Consultations List */}
      {loading ? (
        <LoadingSpinner text={t('manageConsultations.loadingConsultations')} />
      ) : displayConsultations.length === 0 ? (
        <div className="card" style={styles.emptyCard}>
          <ClipboardCheck size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-white)', marginTop: '16px' }}>
            {activeTab === 'pending' ? t('manageConsultations.noPendingConsultations') : t('manageConsultations.noAssignedConsultations')}
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            {activeTab === 'pending' ? t('manageConsultations.checkBackLater') : t('manageConsultations.acceptToSeeHere')}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {displayConsultations.map((appt) => (
            <div key={appt.id} className="card" style={styles.card}>
              {/* Customer Info */}
              <div style={styles.customerInfo}>
                <div style={styles.avatar}>
                  <User size={20} color="var(--accent-lime)" />
                </div>
                <div>
                  <h4 style={styles.customerName}>{appt.customer?.name || t('manageConsultations.customerLabel')}</h4>
                  <p style={styles.customerEmail}>
                    <Mail size={12} /> {appt.customer?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Consultation Details */}
              <div style={styles.detailRow}>
                <Calendar size={14} color="var(--text-muted)" />
                <span style={styles.detailLabel}>{t('manageConsultations.scheduledLabel')}</span>
                <span style={styles.detailValue}>{formatDate(appt.scheduledDate)}</span>
              </div>

              {appt.rescheduledDate && (
                <div style={styles.detailRow}>
                  <CalendarClock size={14} color="var(--accent-lime)" />
                  <span style={styles.detailLabel}>{t('manageConsultations.rescheduledToLabel')}</span>
                  <span style={{ ...styles.detailValue, color: 'var(--accent-lime)' }}>{formatDate(appt.rescheduledDate)}</span>
                </div>
              )}

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>{t('manageConsultations.purposeLabel')}</span>
              </div>
              <p style={styles.purposeText}>{appt.purpose}</p>

              {appt.status !== 'PENDING' && (
                <div style={{ ...styles.statusBadge, backgroundColor: statusColor(appt.status) }}>
                  {statusLabel(appt.status, t)}
                </div>
              )}

              {appt.rejectedReason && (
                <p style={styles.rejectionReason}>{t('bookConsultation.reasonLabel')} {appt.rejectedReason}</p>
              )}

              {/* Actions - only for PENDING consultations */}
              {appt.status === 'PENDING' && (
                <div style={styles.actions}>
                  {reschedulingId === appt.id ? (
                    <div style={styles.rescheduleForm}>
                      <label style={styles.fieldLabel}>{t('manageConsultations.newDateTimeLabel')}</label>
                      <input
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        style={styles.dateInput}
                      />
                      <label style={styles.fieldLabel}>{t('manageConsultations.reasonOptionalLabel')}</label>
                      <input
                        type="text"
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder={t('manageConsultations.reasonPlaceholder')}
                        style={styles.rejectInput}
                      />
                      <div style={styles.rejectActions}>
                        <Button onClick={() => handleReschedule(appt.id)} style={{ padding: '8px 12px', fontSize: '12px' }}>
                          <CalendarClock size={14} /> {t('manageConsultations.sendReschedule')}
                        </Button>
                          <button onClick={() => { setReschedulingId(null); setRescheduleDate(''); setRescheduleReason(''); }} style={styles.cancelBtn}>
                            {t('manageConsultations.cancel')}
                          </button>
                      </div>
                    </div>
                  ) : rejectingId === appt.id ? (
                    <div style={styles.rejectForm}>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t('manageConsultations.rejectReasonPlaceholder')}
                        style={styles.rejectInput}
                      />
                      <div style={styles.rejectActions}>
                        <Button onClick={() => handleReject(appt.id)} variant="secondary" style={{ padding: '8px 12px', fontSize: '12px' }}>
                          {t('manageConsultations.confirmReject')}
                        </Button>
                        <button onClick={() => { setRejectingId(null); setRejectReason(''); }} style={styles.cancelBtn}>
                          {t('manageConsultations.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button onClick={() => handleAccept(appt.id)} style={{ ...styles.actionBtn, backgroundColor: 'var(--success)' }}>
                        <Check size={14} /> {t('manageConsultations.accept')}
                      </Button>
                      <button onClick={() => setReschedulingId(appt.id)} style={{ ...styles.actionBtn, backgroundColor: 'var(--accent-lime)', color: 'var(--bg-darker)' }}>
                        <CalendarClock size={14} /> {t('manageConsultations.reschedule')}
                      </button>
                      <button onClick={() => setRejectingId(appt.id)} style={{ ...styles.actionBtn, backgroundColor: 'var(--error)' }}>
                        <X size={14} /> {t('manageConsultations.reject')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusColor(status) {
  if (status === 'PENDING') return 'var(--warning, #f59e0b)';
  if (status === 'ACCEPTED') return 'var(--success, #22c55e)';
  if (status === 'REJECTED') return 'var(--error, #ef4444)';
  if (status === 'RESCHEDULED') return 'var(--accent-lime, #84cc16)';
  return 'var(--text-muted)';
}

function statusLabel(status, t) {
  if (status === 'RESCHEDULED') return t ? t('bookConsultation.rescheduled') : 'Rescheduled';
  return status;
}

const styles = {
  header: { marginBottom: '24px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px' },
  tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-green)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' },
  card: { display: 'flex', flexDirection: 'column', gap: '12px' },
  customerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: '16px', fontWeight: '700', color: 'var(--text-white)', margin: 0 },
  customerEmail: { fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 },
  divider: { height: '1px', backgroundColor: 'var(--border-green)', opacity: 0.3 },
  detailRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  detailLabel: { fontSize: '13px', color: 'var(--text-muted)' },
  detailValue: { fontSize: '13px', color: 'var(--text-light)' },
  purposeText: { fontSize: '14px', color: 'var(--text-light)', margin: '4px 0 0', lineHeight: '1.5' },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: 'var(--bg-darker)', textTransform: 'uppercase', alignSelf: 'flex-start' },
  rejectionReason: { fontSize: '13px', color: 'var(--error)', margin: 0 },
  actions: { display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  rescheduleForm: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
  fieldLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', margin: 0 },
  dateInput: { padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', color: 'var(--text-white)', fontSize: '13px', outline: 'none', width: '100%' },
  rejectForm: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
  rejectInput: { padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', color: 'var(--text-white)', fontSize: '13px', outline: 'none', width: '100%' },
  rejectActions: { display: 'flex', gap: '8px' },
  cancelBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '8px' },
  emptyCard: { textAlign: 'center', padding: '64px 24px' },
};
