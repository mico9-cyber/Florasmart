import React from 'react';

export default function ChartCard({ title, type = 'line', data = [], labels = [], valueCallout }) {
  // Compute bounds
  const maxVal = data.length > 0 ? Math.max(...data) * 1.15 : 100;
  
  return (
    <div className="card" style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>{title}</h4>
        {valueCallout && <span style={styles.callout}>{valueCallout}</span>}
      </div>

      <div style={styles.chartContainer}>
        {type === 'line' && (
          <svg viewBox="0 0 400 160" style={styles.svg}>
            {/* Grid Lines */}
            <line x1="10" y1="20" x2="390" y2="20" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="70" x2="390" y2="70" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="120" x2="390" y2="120" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="140" x2="390" y2="140" stroke="var(--border-green)" strokeWidth="1" />

            {/* Area under curve */}
            <path
              d={
                `M 10 140 ` +
                data.map((val, idx) => {
                  const x = 10 + (idx * 380) / (data.length - 1);
                  const y = 140 - (val * 110) / maxVal;
                  return `L ${x} ${y}`;
                }).join(' ') +
                ` L 390 140 Z`
              }
              fill="rgba(132, 204, 22, 0.08)"
            />

            {/* Glowing Line */}
            <path
              d={data.map((val, idx) => {
                const x = 10 + (idx * 380) / (data.length - 1);
                const y = 140 - (val * 110) / maxVal;
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--accent-lime)"
              strokeWidth="2.5"
              filter="drop-shadow(0 2px 4px rgba(132, 204, 22, 0.4))"
            />

            {/* Data Dots */}
            {data.map((val, idx) => {
              const x = 10 + (idx * 380) / (data.length - 1);
              const y = 140 - (val * 110) / maxVal;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4" fill="var(--btn-yellow)" />
                  <circle cx={x} cy={y} r="7" fill="transparent" stroke="var(--accent-lime)" strokeWidth="1" style={styles.pulsePoint} />
                </g>
              );
            })}
          </svg>
        )}

        {type === 'bar' && (
          <svg viewBox="0 0 400 160" style={styles.svg}>
            <line x1="10" y1="20" x2="390" y2="20" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="70" x2="390" y2="70" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="120" x2="390" y2="120" stroke="var(--border-green)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="10" y1="140" x2="390" y2="140" stroke="var(--border-green)" strokeWidth="1" />

            {data.map((val, idx) => {
              const barWidth = 24;
              const spacing = (380 - barWidth * data.length) / (data.length - 1 || 1);
              const x = 10 + idx * (barWidth + spacing);
              const barHeight = (val * 110) / maxVal;
              const y = 140 - barHeight;

              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="var(--accent-lime)"
                    rx="3"
                    style={{ transition: 'var(--transition)' }}
                  />
                  <text x={x + barWidth / 2} y={y - 6} fill="var(--text-white)" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Axis Labels */}
      {labels.length > 0 && (
        <div style={styles.labelRow}>
          {labels.map((label, idx) => (
            <span key={idx} style={styles.axisLabel}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  callout: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--accent-lime)',
    fontFamily: 'var(--font-headings)',
  },
  chartContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: '160px',
  },
  svg: {
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 4px',
    borderTop: '1px solid var(--border-green)',
    paddingTop: '8px',
  },
  axisLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pulsePoint: {
    animation: 'pulse-glow 2s infinite ease-in-out',
  }
};

