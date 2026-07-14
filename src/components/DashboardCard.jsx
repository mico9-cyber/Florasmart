import React from 'react';

export default function DashboardCard({ title, value, icon, trend, trendType = 'neutral', description }) {
  return (
    <div className="card" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.textGroup}>
          <span style={styles.title}>{title}</span>
          <h3 style={styles.value}>{value}</h3>
        </div>
        <div style={styles.iconContainer}>
          {icon}
        </div>
      </div>
      {(trend || description) && (
        <div style={styles.footer}>
          {trend && (
            <span style={{
              ...styles.trend,
              color: trendType === 'positive' ? 'var(--success)' : trendType === 'negative' ? 'var(--error)' : 'var(--text-muted)'
            }}>
              {trend}
            </span>
          )}
          {description && <span style={styles.desc}>{description}</span>}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '130px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'var(--font-headings)',
    color: 'var(--text-white)',
  },
  iconContainer: {
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  trend: {
    fontWeight: '700',
  },
  desc: {
    color: 'var(--text-muted)',
  }
};

