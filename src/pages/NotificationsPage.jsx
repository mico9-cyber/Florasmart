import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppData';
import { notificationService } from '../services/notificationService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCheck, CheckCircle2, Trash2, Settings, RefreshCw, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatTime(d, t) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return t('notificationsPage.justNow');
  if (diff < 3600000) return t('notificationsPage.minutesAgo', { minutes: Math.floor(diff / 60000) });
  if (diff < 86400000) return t('notificationsPage.hoursAgo', { hours: Math.floor(diff / 3600000) });
  return date.toLocaleDateString();
}

function channelIcon(channel) {
  if (channel === 'EMAIL') return <Mail size={14} color="var(--accent-lime)" />;
  return <MessageSquare size={14} color="var(--accent-lime)" />;
}

export default function NotificationsPage() {
  const { user } = useContext(AppContext);
  const addToast = useToast();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState(null);
  const [prefModal, setPrefModal] = useState(false);
  const [announceModal, setAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [sending, setSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [showEmailLogs, setShowEmailLogs] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.list();
      const payload = res?.data;
      const items = Array.isArray(payload)
        ? payload
        : payload?.notifications || [];
      setNotifications(items);
    } catch {
      setError(t('notificationsPage.toast.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await notificationService.preferences();
      setPreferences(res?.data || null);
    } catch {
    }
  };

  const loadEmailLogs = async () => {
    try {
      const res = await notificationService.emailLogs();
      setEmailLogs(res?.data || []);
    } catch {
    }
  };

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      addToast(t('notificationsPage.toast.markedAsRead'), 'success');
    } catch {
      addToast(t('notificationsPage.toast.failedToMarkRead'), 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      addToast(t('notificationsPage.toast.allMarkedRead'), 'success');
    } catch {
      addToast(t('notificationsPage.toast.failedToMarkAllRead'), 'error');
    }
  };

  const handleSavePreferences = async () => {
    try {
      await notificationService.updatePreferences(preferences);
      setPrefModal(false);
      addToast(t('notificationsPage.toast.preferencesSaved'), 'success');
    } catch {
      addToast(t('notificationsPage.toast.failedToSavePreferences'), 'error');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationService.sendAnnouncement({ title: announceTitle, message: announceBody });
      setAnnounceTitle('');
      setAnnounceBody('');
      setAnnounceModal(false);
      addToast(t('notificationsPage.toast.announcementSent'), 'success');
    } catch {
      addToast(t('notificationsPage.toast.failedToSendAnnouncement'), 'error');
    } finally {
      setSending(false);
    }
  };

  const togglePref = (key) => {
    setPreferences((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="dashboard-content">
      <div style={styles.header}>
        <div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('notifications.title')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{unread > 0 ? t('notificationsPage.unreadCount', { count: unread }) : t('notificationsPage.allCaughtUp')}</p>
        </div>
        <div style={styles.actions}>
          {unread > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <CheckCheck size={16} /> {t('notificationsPage.markAllRead')}
            </Button>
          )}
          <Button variant="secondary" onClick={loadNotifications} style={{ padding: '6px 12px', fontSize: '13px' }}>
            <RefreshCw size={16} /> {t('notificationsPage.refresh')}
          </Button>
          <Button variant="secondary" onClick={() => { loadPreferences(); setPrefModal(true); }} style={{ padding: '6px 12px', fontSize: '13px' }}>
            <Settings size={16} /> {t('notificationsPage.preferences')}
          </Button>
          {user?.role === 'admin' && (
            <Button variant="lime" onClick={() => setAnnounceModal(true)} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <Bell size={16} /> {t('notificationsPage.announce')}
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="secondary" onClick={() => { loadEmailLogs(); setShowEmailLogs(true); }} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <Mail size={16} /> {t('notificationsPage.emailLogs')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ ...styles.banner, borderColor: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} color="var(--error)" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>{t('notificationsPage.loadingNotifications')}</p>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Bell size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>{t('notificationsPage.noNotificationsYet')}</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                ...styles.notifCard,
                borderLeft: n.readAt ? '3px solid transparent' : '3px solid var(--accent-lime)',
                opacity: n.readAt ? 0.7 : 1,
              }}
            >
              <div style={styles.notifHeader}>
                <div style={styles.notifTitleRow}>
                  {channelIcon(n.channel || n.type)}
                  <strong style={{ color: 'var(--text-white)', fontSize: '14px' }}>{n.title || 'Notification'}</strong>
                  {!n.readAt && <span style={styles.unreadDot} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTime(n.createdAt, t)}</span>
                  {!n.readAt && (
                    <button onClick={() => handleMarkRead(n.id)} style={styles.markReadBtn} title="Mark as read">
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '8px 0 0', lineHeight: '1.5' }}>
                {n.message || n.body || n.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={prefModal} onClose={() => setPrefModal(false)} title={t('notificationsPage.preferencesTitle')}>
        {preferences ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(preferences).filter(([k]) => k !== 'id' && k !== 'userId' && k !== 'createdAt' && k !== 'updatedAt').map(([key, val]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--text-light)', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={() => togglePref(key)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-lime)' }}
                />
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </label>
            ))}
            <Button variant="lime" onClick={handleSavePreferences} style={{ marginTop: '12px' }}>{t('notificationsPage.savePreferences')}</Button>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>{t('notificationsPage.loadingPreferences')}</p>
        )}
      </Modal>

      <Modal isOpen={announceModal} onClose={() => setAnnounceModal(false)} title={t('notificationsPage.sendAnnouncementTitle')}>
        <form onSubmit={handleSendAnnouncement}>
          <FormInput
            label={t('notificationsPage.titleLabel')}
            id="announce-title"
            placeholder={t('notificationsPage.announcementTitlePlaceholder')}
            value={announceTitle}
            onChange={(e) => setAnnounceTitle(e.target.value)}
            required
          />
          <FormInput
            label={t('notificationsPage.messageLabel')}
            id="announce-body"
            type="textarea"
            placeholder={t('notificationsPage.announcementContentPlaceholder')}
            value={announceBody}
            onChange={(e) => setAnnounceBody(e.target.value)}
            required
          />
          <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={sending}>
            {sending ? t('common.sending') : t('notificationsPage.sendAnnouncement')}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showEmailLogs} onClose={() => setShowEmailLogs(false)} title={t('notificationsPage.emailLogsTitle')}>
        {emailLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('notificationsPage.noEmailLogs')}</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {emailLogs.map((log) => (
              <div key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-green)', fontSize: '13px' }}>
                <div style={{ color: 'var(--text-white)', fontWeight: '600' }}>{log.to || log.recipient}</div>
                <div style={{ color: 'var(--text-muted)' }}>{log.subject || log.template}</div>
                <div style={{ color: log.status === 'SENT' ? 'var(--success)' : 'var(--error)', fontSize: '11px' }}>
                  {log.status} — {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  banner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    border: '1px solid var(--success)', padding: '12px 16px',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px',
  },
  notifCard: { padding: '16px', transition: 'var(--transition)' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  notifTitleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  unreadDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: 'var(--accent-lime)', display: 'inline-block',
  },
  markReadBtn: {
    background: 'none', border: 'none', color: 'var(--accent-lime)',
    cursor: 'pointer', padding: '2px',
  },
};
