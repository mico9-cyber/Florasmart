import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppData';
import { Grid, Trash2, CheckSquare, Square } from 'lucide-react';
import Button from '../components/Button';

const PLANT_TYPES = [
  { name: 'Monstera Deliciosa', color: '#22C55E', emoji: '🌿' },
  { name: 'Red Rose Bush', color: '#EF4444', emoji: '🌹' },
  { name: 'Golden Tulip', color: '#EAB308', emoji: '🌷' },
  { name: 'Sunflowers', color: '#F59E0B', emoji: '🌻' }
];

export default function GardenPlannerPage() {
  const { gardenLayout, updateGardenCell } = useContext(AppContext);

  // States
  const [selectedPlant, setSelectedPlant] = useState(PLANT_TYPES[0]);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Water Monstera at cell #10', done: false },
    { id: 2, text: 'Prune Red Rose Bush at cell #18', done: true },
    { id: 3, text: 'Verify Tulips soil moisture at cell #29', done: false }
  ]);

  const handleCellClick = (idx) => {
    const existing = gardenLayout[idx];
    if (existing) {
      // Clear cell if already occupied
      updateGardenCell(idx, null);
    } else {
      // Plant new specimen
      updateGardenCell(idx, {
        name: selectedPlant.name,
        color: selectedPlant.color,
        emoji: selectedPlant.emoji,
        datePlanted: new Date().toISOString().substring(0, 10)
      });
    }
  };

  const toggleChecklist = (id) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleResetGrid = () => {
    if (window.confirm("Are you sure you want to clear your entire greenhouse grid?")) {
      gardenLayout.forEach((_, idx) => updateGardenCell(idx, null));
    }
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Grid size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>Smart Garden Planner</h1>
        <p style={styles.subtitle}>
          Map out crops, assign greenhouse coordinates, and monitor daily cultivation schedules interactively.
        </p>
      </div>

      <div style={styles.layout}>
        {/* Plant Selector & Checklist Left side */}
        <div style={styles.controlCol}>
          {/* Plant variety selector */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>Select Plant Variety</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 16px' }}>
              Choose a flower/plant species to plant in the coordinate grid.
            </p>
            <div style={styles.plantsList}>
              {PLANT_TYPES.map((plant) => (
                <div
                  key={plant.name}
                  onClick={() => setSelectedPlant(plant)}
                  style={{
                    ...styles.plantOption,
                    borderColor: selectedPlant.name === plant.name ? 'var(--accent-lime)' : 'var(--border-green)',
                    backgroundColor: selectedPlant.name === plant.name ? 'rgba(132, 204, 22, 0.05)' : 'var(--bg-darker)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{plant.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, color: 'var(--text-white)' }}>{plant.name}</h5>
                    <span style={{ fontSize: '11px', color: plant.color, fontWeight: '700' }}>Active Tag</span>
                  </div>
                  <div style={{ ...styles.colorDot, backgroundColor: plant.color }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Gardening Care Task Checklist */}
          <div className="card">
            <h3 style={styles.sectionTitle}>Greenhouse Care Tasks</h3>
            <div style={styles.divider}></div>
            <div style={styles.checklistGroup}>
              {checklist.map((item) => (
                <div key={item.id} onClick={() => toggleChecklist(item.id)} style={styles.checkItem}>
                  {item.done ? (
                    <CheckSquare size={18} color="var(--accent-lime)" />
                  ) : (
                    <Square size={18} color="var(--border-green)" />
                  )}
                  <span style={{
                    fontSize: '13px',
                    color: item.done ? 'var(--text-muted)' : 'var(--text-light)',
                    textDecoration: item.done ? 'line-through' : 'none'
                  }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8x8 Interactive Grid Map */}
        <div style={styles.gridCol}>
          <div className="card" style={{ height: '100%' }}>
            <div style={styles.gridHeader}>
              <div>
                <h3 style={{ color: 'var(--text-white)' }}>Greenhouse Floor Layout</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Click a cell to plant <strong>{selectedPlant.name}</strong>, or click an occupied cell to harvest/clear it.
                </span>
              </div>
              <Button onClick={handleResetGrid} variant="secondary" icon={<Trash2 size={16} />}>
                Clear Grid
              </Button>
            </div>

            <div className="planner-grid" style={{ marginTop: '24px' }}>
              {gardenLayout.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`planner-cell ${cell ? 'occupied' : ''}`}
                  style={{
                    backgroundColor: cell ? `${cell.color}25` : '',
                    borderColor: cell ? cell.color : '',
                  }}
                  title={cell ? `${cell.name} (Planted: ${cell.datePlanted})` : `Cell #${idx + 1}`}
                >
                  {cell ? (
                    <span style={{ fontSize: '18px' }}>{cell.emoji || '🌱'}</span>
                  ) : (
                    idx + 1
                  )}
                </div>
              ))}
            </div>

            {/* Planting Logs Table below */}
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ color: 'var(--text-white)', marginBottom: '12px' }}>Greenhouse Specimen Records</h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Coordinate</th>
                      <th>Specimen Name</th>
                      <th>Date Planted</th>
                      <th>Tag Color</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gardenLayout.some(cell => cell !== null) ? (
                      gardenLayout.map((cell, idx) => {
                        if (!cell) return null;
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 'bold' }}>Cell #{idx + 1}</td>
                            <td>{cell.name}</td>
                            <td>{cell.datePlanted}</td>
                            <td>
                              <span style={{
                                ...styles.tableColorBadge,
                                backgroundColor: cell.color
                              }}>{cell.name.split(' ')[0]}</span>
                            </td>
                            <td>
                              <button onClick={() => updateGardenCell(idx, null)} style={styles.clearCellBtn}>
                                Clear
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No plants are currently mapped onto the greenhouse coordinates.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  controlCol: {
    flex: '1 0 300px',
  },
  gridCol: {
    flex: '2.2 0 450px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
  },
  plantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  plantOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-green)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '16px 0',
  },
  checklistGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tableColorBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--bg-darker)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  clearCellBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

