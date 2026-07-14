import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import { consultationService } from '../services/consultationService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { Calendar, Send, Clock, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookConsultationPage() {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);
  const addToast = useToast();

  const [purpose, setPurpose] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const res = await consultationService.listMyConsultations();
      setMyConsultations(res?.data || []);
    } catch {
      // silent
    } finally {
      setLoadingConsultations(false);
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!purpose.trim()) tempErrors.purpose = t('bookConsultation.validation.purposeRequired');
    if (!scheduledDate) {
      tempErrors.scheduledDate = t('bookConsultation.validation.dateRequired');
    } else {
      const selected = new Date(scheduledDate);
      const now = new Date();
      if (selected <= now) tempErrors.scheduledDate = t('bookConsultation.validation.dateMustBeFuture');
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await consultationService.book({ purpose: purpose.trim(), scheduledDate });
      addToast(t('bookConsultation.toast.bookedSuccessfully'), 'success');
      setPurpose('');
      setScheduledDate('');
      loadConsultations();
    } catch (err) {
      addToast(err.message || t('bookConsultation.toast.failedToBook'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="dashboard-content">
      <div style={styles.header}>
        <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('consultation.book.title')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('bookConsultation.subtitle')}</p>
      </div>

      <div style={styles.layout}>
        {/* Booking Form */}
        <div className="card" style={{ flex: 1, minWidth: '340px', alignSelf: 'flex-start' }}>
          <div style={styles.sectionHeader}>
            <Calendar size={20} color="var(--accent-lime)" />
            <h3 style={styles.sectionTitle}>{t('bookConsultation.newConsultation')}</h3>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('bookConsultation.purposeLabel')}</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t('bookConsultation.purposePlaceholder')}
                rows={4}
                style={{ ...styles.textarea, borderColor: errors.purpose ? 'var(--error)' : 'var(--border-green)' }}
              />
              {errors.purpose && <span style={styles.errorText}>{errors.purpose}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('bookConsultation.scheduleDateTime')}</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                style={{ ...styles.input, borderColor: errors.scheduledDate ? 'var(--error)' : 'var(--border-green)' }}
              />
              {errors.scheduledDate && <span style={styles.errorText}>{errors.scheduledDate}</span>}
            </div>

            <Button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? t('bookConsultation.booking') : t('bookConsultation.bookConsultation')}
              {!loading && <Send size={16} />}
            </Button>
          </form>
        </div>

        {/* My Consultations */}
        <div className="card" style={{ flex: 1.5, minWidth: '380px', alignSelf: 'flex-start' }}>
          <div style={styles.sectionHeader}>
            <Clock size={20} color="var(--accent-lime)" />
            <h3 style={styles.sectionTitle}>{t('bookConsultation.myConsultations')}</h3>
          </div>

          {loadingConsultations ? (
            <LoadingSpinner text={t('bookConsultation.loadingConsultations')} />
          ) : myConsultations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>{t('dashboard.gardener.noConsultations')}</p>
          ) : (
            <div style={styles.consultationsList}>
              {myConsultations.map((appt) => (
                <div key={appt.id} style={styles.consultationCard}>
                  <div style={styles.consultationHeader}>
                    <span style={{ ...styles.statusBadge, backgroundColor: statusColor(appt.status) }}>
                      {statusLabel(appt.status, t)}
                    </span>
                    <span style={styles.consultationDate}>{formatDate(appt.scheduledDate)}</span>
                  </div>
                  <p style={styles.consultationPurpose}>{appt.purpose}</p>

                  {appt.rescheduledDate && (
                    <div style={styles.rescheduleNotice}>
                      <CalendarClock size={14} color="var(--accent-lime)" />
                      <span>{t('bookConsultation.gardenerSuggested')} <strong>{formatDate(appt.rescheduledDate)}</strong></span>
                    </div>
                  )}

                  {appt.gardener && (
                    <p style={styles.gardenerInfo}>{t('bookConsultation.gardenerLabel')} {appt.gardener.name} ({appt.gardener.email})</p>
                  )}
                  {appt.rejectedReason && (
                    <p style={styles.rejectionReason}>{t('bookConsultation.reasonLabel')} {appt.rejectedReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  header: { marginBottom: '32px' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-white)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-light)' },
  input: {
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-white)',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-white)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  errorText: { color: 'var(--error)', fontSize: '12px' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', marginTop: '8px' },
  consultationsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  consultationCard: {
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
  },
  consultationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--bg-darker)',
    textTransform: 'uppercase',
  },
  consultationDate: { fontSize: '13px', color: 'var(--text-muted)' },
  consultationPurpose: { fontSize: '14px', color: 'var(--text-light)', margin: '8px 0' },
  rescheduleNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(132, 204, 22, 0.08)',
    border: '1px solid rgba(132, 204, 22, 0.3)',
    fontSize: '13px',
    color: 'var(--text-light)',
    marginTop: '8px',
  },
  gardenerInfo: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 },
  rejectionReason: { fontSize: '13px', color: 'var(--error)', marginTop: '4px', marginBottom: 0 },
};
