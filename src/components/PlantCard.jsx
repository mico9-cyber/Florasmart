import React from 'react';
import { Sun, Droplet, AlertTriangle, Check, Sprout } from 'lucide-react';

export default function PlantCard({ plant, onSelect, isSelected }) {
  return (
    <div
      className="card"
      style={{
        ...styles.card,
        borderColor: isSelected ? 'var(--accent-lime)' : 'var(--border-green)',
        backgroundColor: isSelected ? 'rgba(132, 204, 22, 0.03)' : 'var(--bg-card)'
      }}
    >
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <span style={styles.emoji}>{plant.image || '🪴'}</span>
        </div>
        <div style={styles.titleArea}>
          <h4 style={styles.name}>{plant.name}</h4>
          <span style={styles.type}>Houseplant</span>
        </div>
      </div>

      <div style={styles.divider}></div>

      {/* Care Details */}
      <div style={styles.careGrid}>
        <div style={styles.careItem}>
          <Sun size={14} color="var(--btn-yellow)" />
          <div style={styles.careInfo}>
            <span style={styles.careLabel}>Sunlight</span>
            <span style={styles.careVal}>{plant.sunlight}</span>
          </div>
        </div>

        <div style={styles.careItem}>
          <Droplet size={14} color="#38BDF8" />
          <div style={styles.careInfo}>
            <span style={styles.careLabel}>Watering</span>
            <span style={styles.careVal}>{plant.water}</span>
          </div>
        </div>

        <div style={styles.careItem}>
          <AlertTriangle size={14} color={plant.toxic === 'No' ? 'var(--success)' : 'var(--error)'} />
          <div style={styles.careInfo}>
            <span style={styles.careLabel}>Toxic to Pets</span>
            <span style={styles.careVal}>{plant.toxic}</span>
          </div>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(plant)}
          className={`btn ${isSelected ? 'btn-lime' : 'btn-secondary'}`}
          style={styles.selectBtn}
        >
          {isSelected ? (
            <>
              <Check size={16} />
              <span>Selected</span>
            </>
          ) : (
            <>
              <Sprout size={16} />
              <span>Select for Planner</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  type: {
    fontSize: '12px',
    color: 'var(--accent-lime)',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
  },
  careGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  careItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  careInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  careLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  careVal: {
    fontSize: '12px',
    color: 'var(--text-light)',
  },
  selectBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '8px 16px',
    fontSize: '13px',
  }
};

