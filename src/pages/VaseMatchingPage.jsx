import React, { useContext, useMemo, useState } from 'react';
import { Flower, Ruler, Info, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import { AppContext } from '../context/AppData';
import { recommendationService } from '../services/recommendationService';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

function resolveObject(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

export default function VaseMatchingPage() {
  const { t } = useTranslation();
  const { products } = useContext(AppContext);

  const bouquetOptions = useMemo(() => {
    const backendFlowers = products
      .filter((item) => item.category === 'flowers')
      .map((item) => ({ value: item.backendId || item.id, label: item.name }));
    return backendFlowers.length > 0
      ? [{ value: '', label: t('vaseMatchingPage.noBouquetSelected') }, ...backendFlowers]
      : [{ value: '', label: t('vaseMatchingPage.noBouquetSelected') }];
  }, [products]);

  const [selectedBouquet, setSelectedBouquet] = useState('');
  const [vaseHeight, setVaseHeight] = useState('25');
  const [vaseDiameter, setVaseDiameter] = useState('10');
  const [vaseShape, setVaseShape] = useState('CYLINDER');
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [validationErr, setValidationErr] = useState('');
  const [error, setError] = useState('');

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!vaseHeight || !vaseDiameter) {
      setValidationErr(t('vaseMatchingPage.validation.dimensionsRequired'));
      return;
    }
    setValidationErr('');
    setError('');
    setCalculating(true);

    try {
      const payload = resolveObject(await recommendationService.vaseMatch({
        bouquetProductId: selectedBouquet || undefined,
        vaseHeightCm: Number(vaseHeight),
        openingWidthCm: Number(vaseDiameter),
        vaseShape,
      }));
      setResult(payload);
    } catch (err) {
      setError(err.message || t('vaseMatchingPage.toast.failedToCalculate'));
      setResult(null);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Flower size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>{t('vaseMatchingPage.title')}</h1>
        <p style={styles.subtitle}>
          {t('vaseMatchingPage.subtitle')}
        </p>
      </div>

      {error && (
        <div style={styles.errBanner}>
          <AlertCircle size={16} color="var(--error)" />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.layout}>
        <div className="card" style={styles.formCard}>
          <h3 style={styles.sectionTitle}>{t('vaseMatchingPage.inputSpecifications')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            {t('vaseMatchingPage.submitDimensionsHint')}
          </p>

          {validationErr && (
            <div style={styles.errBanner}>
              <AlertCircle size={16} color="var(--error)" />
              <span>{validationErr}</span>
            </div>
          )}

          <form onSubmit={handleMatch}>
            <FormInput
              label={t('vaseMatchingPage.selectedBouquetArrangement')}
              id="bouquet"
              type="select"
              value={selectedBouquet}
              onChange={(e) => setSelectedBouquet(e.target.value)}
              options={bouquetOptions}
            />

            <div style={styles.dimensionsRow}>
              <div style={{ flex: 1 }}>
                <FormInput
                  label={t('vaseMatchingPage.vaseHeightCm')}
                  id="vase-height"
                  placeholder={t('vaseMatchingPage.vaseHeightPlaceholder')}
                  value={vaseHeight}
                  onChange={(e) => setVaseHeight(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormInput
                  label={t('vaseMatchingPage.openingWidthCm')}
                  id="vase-diameter"
                  placeholder={t('vaseMatchingPage.openingWidthPlaceholder')}
                  value={vaseDiameter}
                  onChange={(e) => setVaseDiameter(e.target.value)}
                  required
                />
              </div>
            </div>

            <FormInput
              label={t('vaseMatchingPage.vaseStructuralSilhouette')}
              id="vase-shape"
              type="select"
              value={vaseShape}
              onChange={(e) => setVaseShape(e.target.value)}
              options={[
                { value: 'CYLINDER', label: t('vaseMatchingPage.cylinder') },
                { value: 'FLARED', label: t('vaseMatchingPage.flared') },
                { value: 'ROUND', label: t('vaseMatchingPage.round') },
                { value: 'BUD', label: t('vaseMatchingPage.bud') },
                { value: 'SQUARE', label: t('vaseMatchingPage.square') }
              ]}
            />

            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={calculating}>
              {calculating ? (
                <>
                  <RefreshCw size={16} className="pulse-light" />
                  <span>{t('vaseMatchingPage.calibratingArrangement')}</span>
                </>
              ) : (
                t('vaseMatchingPage.computeFitDiagnostics')
              )}
            </Button>
          </form>
        </div>

        <div style={styles.resultsCol}>
          {result ? (
            <div className="card" style={styles.resultsCard}>
              <div style={styles.resultsHeader}>
                <div>
                  <h3 style={{ color: 'var(--text-white)' }}>{t('vaseMatchingPage.fitScoreLabel', { score: result.fitScore })}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('vaseMatchingPage.heightRatioLabel', { ratio: result.heightRatio })}
                  </span>
                </div>
                <div style={{
                  ...styles.scoreBadge,
                  backgroundColor: result.structuralFit === 'EXCELLENT' ? 'rgba(34, 197, 94, 0.15)' : result.structuralFit === 'GOOD' ? 'rgba(132, 204, 22, 0.15)' : result.structuralFit === 'FAIR' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: result.structuralFit === 'EXCELLENT' ? 'var(--success)' : result.structuralFit === 'GOOD' ? 'var(--accent-lime)' : result.structuralFit === 'FAIR' ? 'var(--warning)' : 'var(--error)'
                }}>
                  {result.structuralFit}
                </div>
              </div>

              <div style={styles.visualizerArea}>
                <svg viewBox="0 0 200 240" style={styles.visualizerSvg}>
                  <g stroke="#15803D" strokeWidth="3" opacity="0.6">
                    <line x1="85" y1="20" x2="115" y2="200" />
                    <line x1="115" y1="20" x2="85" y2="200" />
                    <line x1="100" y1="10" x2="100" y2="200" />
                    <circle cx="85" cy="20" r="10" fill="var(--accent-lime)" />
                    <circle cx="115" cy="20" r="10" fill="var(--accent-lime)" />
                    <circle cx="100" cy="10" r="10" fill="var(--accent-lime)" />
                  </g>
                  <rect x="70" y="110" width="60" height="90" fill="rgba(56, 189, 248, 0.2)" rx="5" />
                  {vaseShape === 'CYLINDER' && <path d="M 70 80 L 70 200 A 10 10 0 0 0 80 210 L 120 210 A 10 10 0 0 0 130 200 L 130 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />}
                  {vaseShape === 'FLARED' && <path d="M 60 80 L 75 200 A 8 8 0 0 0 83 208 L 117 208 A 8 8 0 0 0 125 200 L 140 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />}
                  {vaseShape === 'ROUND' && <path d="M 80 80 C 50 110 50 170 80 200 L 120 200 C 150 170 150 110 120 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />}
                  {vaseShape === 'BUD' && <path d="M 90 80 L 90 110 C 70 120 60 170 80 200 L 120 200 C 140 170 130 120 110 110 L 110 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />}
                  {vaseShape === 'SQUARE' && <path d="M 70 80 L 70 205 L 130 205 L 130 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />}
                </svg>
                <div style={styles.overlayHelp}>
                  <Ruler size={14} color="var(--accent-lime)" />
                  <span>{t('vaseMatchingPage.visualBalanceLabel', { balance: result.visualBalance })}</span>
                </div>
              </div>

              <div style={styles.adviceBox}>
                <Sparkles size={16} color="var(--accent-lime)" />
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>{t('vaseMatchingPage.backendMatchSummary')}</strong> {t('vaseMatchingPage.matchSummaryDetail', { stemLength: result.stemLengthCm, vaseHeight: result.vaseHeightCm, openingWidth: result.openingWidthCm || vaseDiameter })}
                </p>
              </div>

              {(result.warnings || []).length > 0 && (
                <div style={styles.warningBox}>
                  <strong>{t('vaseMatchingPage.warningsLabel')}</strong> {result.warnings.join(' • ')}
                </div>
              )}

              <div style={styles.recommendSection}>
                <h4 style={{ color: 'var(--text-white)', margin: 0 }}>{t('vaseMatchingPage.recommendedVases')}</h4>
                <div style={styles.productGrid}>
                  {(result.recommendedVases || []).map((item) => (
                    <div key={item.id} style={styles.productCard}>
                      <ImageWithFallback src={item.imageUrl} alt={item.name} category="vases" style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-sm)' }} />
                      <div style={styles.productInfo}>
                        <strong style={{ color: 'var(--text-white)' }}>{item.name}</strong>
                        <span style={{ color: 'var(--btn-yellow)', fontWeight: 700 }}>{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.recommendSection}>
                <h4 style={{ color: 'var(--text-white)', margin: 0 }}>{t('vaseMatchingPage.recommendedArrangements')}</h4>
                <div style={styles.productGrid}>
                  {(result.recommendedArrangements || []).map((item) => (
                    <div key={item.id} style={styles.productCard}>
                      <ImageWithFallback src={item.imageUrl} alt={item.name} category="flowers" style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-sm)' }} />
                      <div style={styles.productInfo}>
                        <strong style={{ color: 'var(--text-white)' }}>{item.name}</strong>
                        <span style={{ color: 'var(--btn-yellow)', fontWeight: 700 }}>{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={styles.emptyCard}>
              <Info size={48} color="var(--border-green)" />
              <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                {t('vaseMatchingPage.runCalibrationHint')}
              </h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: '40px' },
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
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  formCard: { flex: '1 0 350px', padding: '32px' },
  dimensionsRow: { display: 'flex', gap: '16px' },
  errBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--error)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    fontSize: '13px',
    color: 'var(--text-light)',
  },
  resultsCol: { flex: '1.5 0 400px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700' },
  resultsCard: { display: 'flex', flexDirection: 'column', gap: '20px' },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-green)',
    paddingBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  scoreBadge: {
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  visualizerArea: {
    height: '240px',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  visualizerSvg: { height: '90%' },
  overlayHelp: {
    position: 'absolute',
    bottom: '10px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  adviceBox: {
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    padding: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid var(--warning)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px 16px',
    color: 'var(--text-light)',
    fontSize: '13px',
  },
  recommendSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' },
  productCard: { padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)' },
  productInfo: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' },
  emptyCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: '2px',
    padding: '80px 20px',
  }
};
