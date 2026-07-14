import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { Sprout, Sun, Droplets, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';
import { downloadCsv, downloadReport } from '../utils/exportUtils';
import { readJson, writeJson } from '../utils/storage';
import { useTranslation } from 'react-i18next';

export default function GardenerDashboard() {
  const { t } = useTranslation();
  const { gardenLayout } = useContext(AppContext);
  const addToast = useToast();

  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('indoor');
  const [sunlightNeeds, setSunlightNeeds] = useState('Bright Indirect');
  const [validationErr, setValidationErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [specimens, setSpecimens] = useState(() => readJson('flora_specimens', []));

  useEffect(() => {
    writeJson('flora_specimens', specimens);
  }, [specimens]);

  const occupiedCells = useMemo(() => gardenLayout.filter(cell => cell !== null), [gardenLayout]);

  const loggedToday = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return specimens.filter(s => s.loggedAt?.substring(0, 10) === today).length;
  }, [specimens]);

  const chartData = useMemo(() => {
    const months = [];
    const temps = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('en-US', { month: 'short' }));
      temps.push(22 + Math.round((Math.sin(i * 0.8) + 1) * 3));
    }
    return { labels: months, data: temps };
  }, []);

  const avgMoisture = useMemo(() => {
    const succulentCount = specimens.filter(s => s.type === 'succulent').length;
    return Math.min(95, 65 + succulentCount * 2).toFixed(1);
  }, [specimens]);

  const handleAddPlantRecord = useCallback((e) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setValidationErr(t('gardenerDashboard.validation.nameRequired'));
      return;
    }
    setSubmitting(true);
    setValidationErr('');
    const newSpecimen = {
      id: Date.now(),
      name: plantName.trim(),
      type: plantType,
      sunlight: sunlightNeeds,
      loggedAt: new Date().toISOString(),
    };
    setSpecimens(prev => [...prev, newSpecimen]);
    addToast(t('gardenerDashboard.toast.specimenLogged', { name: plantName.trim() }), 'success');
    setPlantName('');
    setPlantType('indoor');
    setSunlightNeeds('Bright Indirect');
    setSubmitting(false);
  }, [plantName, plantType, sunlightNeeds, addToast]);

  const handleDeleteSpecimen = useCallback((id) => {
    const specimen = specimens.find(s => s.id === id);
    setSpecimens(prev => prev.filter(s => s.id !== id));
    if (specimen) {
      addToast(t('gardenerDashboard.toast.specimenRemoved', { name: specimen.name }), 'info');
    }
  }, [specimens, addToast]);

  const handleExportReport = useCallback(() => {
    const sections = gardenLayout
      .map((cell, idx) => cell
        ? `Cell #${idx + 1} | ${cell.name} | ${cell.datePlanted || 'N/A'}`
        : null
      )
      .filter(Boolean);
    downloadReport(
      'florasmart-gardener-report.txt',
      'FloraSmart Gardener Diagnostics Report',
      [{ heading: 'Mapped Garden Cells', lines: sections }]
    );
    addToast(t('gardenerDashboard.toast.reportDownloaded'), 'success');
  }, [gardenLayout, addToast]);

  const handleExportCsv = useCallback(() => {
    const rows = gardenLayout
      .map((cell, idx) => cell ? [idx + 1, cell.name, cell.datePlanted || ''] : null)
      .filter(Boolean);
    downloadCsv('florasmart-gardener-layout.csv', [
      ['Cell', 'Specimen Name', 'Date Planted'],
      ...rows,
    ]);
    addToast(t('gardenerDashboard.toast.layoutExportedCsv'), 'success');
  }, [gardenLayout, addToast]);

  return (
    <div className="dashboard-content">
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>{t('gardenerDashboard.title')}</h2>
          <p style={styles.pageSubtitle}>
            {t('gardenerDashboard.subtitle')}
          </p>
        </div>
        <div style={styles.actionButtons}>
          <Button
            variant="secondary"
            onClick={handleExportReport}
            icon={<FileText size={16} />}
            aria-label="Export gardener report as text file"
          >
            {t('gardenerDashboard.exportReport')}
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            icon={<FileSpreadsheet size={16} />}
            aria-label="Export garden layout as CSV"
          >
            {t('gardenerDashboard.exportCsv')}
          </Button>
        </div>
      </div>

      <div className="grid-cols-3" style={{ margin: '32px 0' }}>
        <DashboardCard
          title={t('gardenerDashboard.plantsCultivated')}
          value={`${occupiedCells.length} Active`}
          icon={<Sprout size={20} color="var(--accent-lime)" />}
          description={t('gardenerDashboard.growingInGreenhouseTemplates')}
          trend="Stable Growth"
          trendType="positive"
        />
        <DashboardCard
          title={t('gardenerDashboard.avgSoilMoisture')}
          value={`${avgMoisture}%`}
          icon={<Droplets size={20} color="var(--accent-lime)" />}
          description={t('gardenerDashboard.optimalHydrationBounds')}
          trend="+1.4% vs yday"
          trendType="positive"
        />
        <DashboardCard
          title={t('gardenerDashboard.specimensLogged')}
          value={`${specimens.length} Total`}
          icon={<Sun size={20} color="var(--btn-yellow)" />}
          description={t('gardenerDashboard.loggedToday', { count: loggedToday })}
          trend={loggedToday > 0 ? 'Active Today' : 'No entries today'}
          trendType={loggedToday > 0 ? 'positive' : 'neutral'}
        />
      </div>

      <div style={styles.sectionsGrid}>

        <div className="card" style={{ flex: 1, minWidth: '300px' }} role="region" aria-label="Log new specimen form">
          <h3 style={styles.sectionTitle}>{t('gardenerDashboard.logNewSpecimen')}</h3>
          <p style={styles.sectionDesc}>
            {t('gardenerDashboard.logNewSpecimenDesc')}
          </p>
          <form onSubmit={handleAddPlantRecord} noValidate>
            <FormInput
              label={t('gardenerDashboard.specimenName')}
              id="specimen-name"
              placeholder={t('gardenerDashboard.specimenNamePlaceholder')}
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              error={validationErr}
              required
            />
            <FormInput
              label={t('gardenerDashboard.environmentCategory')}
              id="specimen-category"
              type="select"
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              options={[
                { value: 'indoor', label: t('gardenerDashboard.indoorFoliage') },
                { value: 'succulent', label: t('gardenerDashboard.cactiSucculent') },
                { value: 'outdoor', label: t('gardenerDashboard.outdoorShrubbery') },
              ]}
            />
            <FormInput
              label={t('gardenerDashboard.sunlightTolerance')}
              id="specimen-sunlight"
              type="select"
              value={sunlightNeeds}
              onChange={(e) => setSunlightNeeds(e.target.value)}
              options={[
                { value: 'Full Sun', label: t('gardenerDashboard.directSun') },
                { value: 'Bright Indirect', label: t('gardenerDashboard.indirectBrightLight') },
                { value: 'Partial Shade', label: t('gardenerDashboard.filteredShadeLowLight') },
              ]}
            />
            <Button
              type="submit"
              variant="lime"
              disabled={submitting}
              style={{ width: '100%', marginTop: '12px' }}
              aria-label={submitting ? 'Adding specimen...' : 'Add specimen record'}
            >
              {submitting ? t('gardenerDashboard.adding') : t('gardenerDashboard.addSpecimen')}
            </Button>
          </form>
        </div>

        <div className="card" style={{ flex: 1, minWidth: '300px' }} role="region" aria-label="Logged specimens list">
          <h3 style={styles.sectionTitle}>{t('gardenerDashboard.recentSpecimens')}</h3>
          <p style={styles.sectionDesc}>
            {specimens.length > 0
              ? t('gardenerDashboard.specimenCountOnRecord', { count: specimens.length, plural: specimens.length === 1 ? '' : 's' })
              : t('gardenerDashboard.noSpecimensLoggedYet')}
          </p>
          {specimens.length === 0 ? (
            <div style={styles.emptyState}>
              <Sprout size={40} color="var(--border-green)" />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                {t('gardenerDashboard.useFormToLogFirst')}
              </p>
            </div>
          ) : (
            <div style={styles.specimenList} role="list" aria-label="Logged specimens">
              {[...specimens].reverse().slice(0, 10).map((s) => (
                <div key={s.id} style={styles.specimenRow} role="listitem">
                  <div style={styles.specimenInfo}>
                    <span style={styles.specimenName}>{s.name}</span>
                    <span style={styles.specimenMeta}>
                      {s.type === 'indoor' ? t('gardenerDashboard.indoorFoliage') : s.type === 'succulent' ? t('gardenerDashboard.cactiSucculent') : t('gardenerDashboard.outdoorShrubbery')} &middot; {s.sunlight}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSpecimen(s.id)}
                    style={styles.deleteBtn}
                    aria-label={`Delete ${s.name}`}
                    title={`Remove ${s.name}`}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {specimens.length > 10 && (
                <p style={styles.moreNote}>
                  {t('gardenerDashboard.moreCount', { count: specimens.length - 10 })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <ChartCard
          title={t('gardenerDashboard.greenhouseTemperatureChart')}
          type="line"
          data={chartData.data}
          labels={chartData.labels}
          valueCallout={`${chartData.data[chartData.data.length - 1]}°C Current`}
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
  pageTitle: {
    fontSize: '28px',
    color: 'var(--text-white)',
    margin: 0,
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    margin: '4px 0 0',
    fontSize: '14px',
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
    margin: 0,
  },
  sectionDesc: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    margin: '4px 0 16px',
  },
  specimenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  specimenRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    transition: 'var(--transition)',
  },
  specimenInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  specimenName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-white)',
  },
  specimenMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
  moreNote: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '8px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
  },
};
