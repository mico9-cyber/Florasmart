import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { Sprout, Sun, Droplets, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import FormInput from '../components/FormInput';

export default function GardenerDashboard() {
  const { gardenLayout } = useContext(AppContext);

  // States
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('indoor');
  const [sunlightNeeds, setSunlightNeeds] = useState('Bright Indirect');
  const [validationErr, setValidationErr] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const occupiedCells = gardenLayout.filter(cell => cell !== null);

  const handleAddPlantRecord = (e) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setValidationErr('Plant classification name is required.');
      return;
    }
    setValidationErr('');
    setShowSuccess(true);
    setPlantName('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    downloadReport('florasmart-gardener-report.txt', 'FloraSmart Gardener Diagnostics Report', [
      { heading: 'Mapped Garden Cells', lines: gardenLayout.map((cell, idx) => cell ? 'Cell #' + (idx + 1) + ' | ' + cell.name + ' | ' + cell.datePlanted : null).filter(Boolean) },
    ]);
  };

  const handleExportExcel = () => {
    downloadCsv('florasmart-gardener-layout.csv', [
      ['Cell', 'Specimen Name', 'Date Planted'],
      ...gardenLayout.map((cell, idx) => cell ? [idx + 1, cell.name, cell.datePlanted] : null).filter(Boolean),
    ]);
  };

  return (
    <div className="dashboard-content">
        {/* Header Row */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Gardener Landscaping Sandbox</h2>
            <p style={{ color: 'var(--text-muted)' }}>Monitor greenhouse microclimates, plan crop grids, and review air-purifier plant health profiles.</p>
          </div>
          <div style={styles.actionButtons}>
            <Button variant="secondary" onClick={handleExportPDF} icon={<FileText size={16} />}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel} icon={<FileSpreadsheet size={16} />}>
              Export Excel
            </Button>
          </div>
        </div>

        {/* Vital stats cards */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Plants Cultivated"
            value={`${occupiedCells.length} Active`}
            icon={<Sprout size={20} color="var(--accent-lime)" />}
            description="Growing in greenhouse templates"
            trend="Stable Growth"
            trendType="positive"
          />
          <DashboardCard
            title="Avg Soil Moisture"
            value="68.2%"
            icon={<Droplets size={20} color="var(--accent-lime)" />}
            description="Optimal hydration bounds"
            trend="+1.4% vs yday"
            trendType="positive"
          />
          <DashboardCard
            title="Luminosity Threshold"
            value="3500 lm"
            icon={<Sun size={20} color="var(--btn-yellow)" />}
            description="Bright indirect target active"
            trend="Nominal Light"
            trendType="positive"
          />
        </div>

        <div style={styles.sectionsGrid}>
          {/* Garden Planner Grid Visual Mock */}
          <div className="card" style={{ flex: 1.5, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>Sandbox Grid Alignment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 16px' }}>
              Map coordinates of the smart garden layout. Click "Planner" on sidebar to edit.
            </p>
            <div style={styles.miniGrid}>
              {gardenLayout.slice(0, 32).map((cell, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.miniCell,
                    backgroundColor: cell ? 'rgba(132, 204, 22, 0.25)' : 'var(--bg-darker)',
                    borderColor: cell ? 'var(--accent-lime)' : 'var(--border-green)'
                  }}
                  title={cell ? `${cell.name} planted on ${cell.datePlanted}` : 'Unplanted grid'}
                >
                  {cell ? cell.name[0] : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Cultivation Log Form */}
          <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={styles.sectionTitle}>Log New Specimen</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 16px' }}>
              Log external specimens into horticultural databases.
            </p>

            {showSuccess && (
              <div style={styles.successBanner}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Specimen logged successfully!</span>
              </div>
            )}

            <form onSubmit={handleAddPlantRecord}>
              <FormInput
                label="Specimen Botanical Name"
                id="plant-name"
                placeholder="e.g. Aloe Vera"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                error={validationErr}
                required
              />

              <FormInput
                label="Environment Category"
                id="plant-cat"
                type="select"
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                options={[
                  { value: 'indoor', label: 'Indoor Foliage' },
                  { value: 'succulent', label: 'Cacti & Succulent' },
                  { value: 'outdoor', label: 'Outdoor Shrubbery' }
                ]}
              />

              <FormInput
                label="Sunlight Tolerance"
                id="plant-sun"
                type="select"
                value={sunlightNeeds}
                onChange={(e) => setSunlightNeeds(e.target.value)}
                options={[
                  { value: 'Full Sun', label: 'Direct Sun (6+ hrs)' },
                  { value: 'Bright Indirect', label: 'Indirect Bright Light' },
                  { value: 'Partial Shade', label: 'Filtered Shade/Low Light' }
                ]}
              />

              <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }}>
                Add Specimen
              </Button>
            </form>
          </div>
        </div>

        {/* Moisture chart */}
        <div style={{ marginTop: '32px' }}>
          <ChartCard
            title="Greenhouse Temperature & Humidity Calibrations (Monthly Avg)"
            type="line"
            data={[22, 24, 23, 25, 26, 28, 25]}
            labels={['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            valueCallout="25°C Nominal Temperature"
          />
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
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  miniGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '6px',
    backgroundColor: 'var(--bg-darker)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-green)',
  },
  miniCell: {
    aspectRatio: '1',
    border: '1px solid var(--border-green)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '13px',
    marginBottom: '16px',
  }
};

