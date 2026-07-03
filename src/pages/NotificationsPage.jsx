import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppData';
import { notificationService } from '../services/notificationService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCheck, CheckCircle2, Trash2, Settings, RefreshCw, AlertCircle, Mail, MessageSquare } from 'lucide-react';

function formatTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function channelIcon(channel) {
  if (channel === 'EMAIL') return <Mail size={14} color="var(--accent-lime)" />;
  return <MessageSquare size={14} color="var(--accent-lime)" />;
}

export default function NotificationsPage() {
  const { user } = useContext(AppContext);
  const addToast = useToast();
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
      setNotifications(res?.data || []);
    } catch {
      setError('Failed to load notifications.');
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
      addToast('Notification marked as read.', 'success');
    } catch {
      addToast('Failed to mark notification as read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      addToast('All notifications marked as read.', 'success');
    } catch {
      addToast('Failed to mark all notifications as read.', 'error');
    }
  };

  const handleSavePreferences = async () => {
    try {
      await notificationService.updatePreferences(preferences);
      setPrefModal(false);
      addToast('Notification preferences saved.', 'success');
    } catch {
      addToast('Failed to save notification preferences.', 'error');
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
      addToast('Announcement sent successfully.', 'success');
    } catch {
      addToast('Failed to send announcement.', 'error');
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
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Notifications</h2>
          <p style={{ color: 'var(--text-muted)' }}>{unread > 0 ? `${unread} unread notifications` : 'All caught up'}</p>
        </div>
        <div style={styles.actions}>
          {unread > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <CheckCheck size={16} /> Mark All Read
            </Button>
          )}
          <Button variant="secondary" onClick={loadNotifications} style={{ padding: '6px 12px', fontSize: '13px' }}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="secondary" onClick={() => { loadPreferences(); setPrefModal(true); }} style={{ padding: '6px 12px', fontSize: '13px' }}>
            <Settings size={16} /> Preferences
          </Button>
          {user?.role === 'admin' && (
            <Button variant="lime" onClick={() => setAnnounceModal(true)} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <Bell size={16} /> Announce
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="secondary" onClick={() => { loadEmailLogs(); setShowEmailLogs(true); }} style={{ padding: '6px 12px', fontSize: '13px' }}>
              <Mail size={16} /> Email Logs
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
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Bell size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No notifications yet</h4>
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTime(n.createdAt)}</span>
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

      <Modal isOpen={prefModal} onClose={() => setPrefModal(false)} title="Notification Preferences">
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
            <Button variant="lime" onClick={handleSavePreferences} style={{ marginTop: '12px' }}>Save Preferences</Button>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Loading preferences...</p>
        )}
      </Modal>

      <Modal isOpen={announceModal} onClose={() => setAnnounceModal(false)} title="Send Announcement">
        <form onSubmit={handleSendAnnouncement}>
          <FormInput
            label="Title"
            id="announce-title"
            placeholder="Announcement title"
            value={announceTitle}
            onChange={(e) => setAnnounceTitle(e.target.value)}
            required
          />
          <FormInput
            label="Message"
            id="announce-body"
            type="textarea"
            placeholder="Announcement content"
            value={announceBody}
            onChange={(e) => setAnnounceBody(e.target.value)}
            required
          />
          <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={sending}>
            {sending ? 'Sending...' : 'Send Announcement'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showEmailLogs} onClose={() => setShowEmailLogs(false)} title="Email Logs">
        {emailLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No email logs.</p>
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
