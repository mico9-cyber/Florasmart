import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import { useToast } from '../context/ToastContext';
import { Sparkles, AlertCircle, ShoppingCart, Sun, Droplet, ShieldCheck, ShieldAlert, Eye, RefreshCw, History, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { recommendationService } from '../services/recommendationService';
import { useTranslation } from 'react-i18next';

function resolveObject(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

function resolveRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function PlantRecommendationPage() {
  const { addToCart } = useContext(AppContext);
  const addToast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sunlight, setSunlight] = useState('');
  const [water, setWater] = useState('');
  const [hasPets, setHasPets] = useState('');
  const [purpose, setPurpose] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [spaceType, setSpaceType] = useState('');
  const [matchedPlants, setMatchedPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [requestMeta, setRequestMeta] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [validationErr, setValidationErr] = useState('');
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const rows = resolveRows(await recommendationService.history());
      setHistory(rows);
    } catch (err) {
      setError(err.message || 'Failed to load recommendation history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();

    const missing = [];
    if (!sunlight) missing.push('Sunlight');
    if (!water) missing.push('Watering');
    if (!hasPets) missing.push('Pet Safety');
    if (!purpose) missing.push('Purpose');

    if (missing.length > 0) {
      setValidationErr(t('plantRecommendation.validation.selectCriteria', { criteria: missing.join(', ') }));
      return;
    }

    setValidationErr('');
    setError('');
    setLoading(true);

    try {
      const payload = resolveObject(await recommendationService.plants({
        sunlightLevel: sunlight,
        wateringLevel: water,
        petSafeRequired: hasPets === 'yes',
        purpose,
        experienceLevel: experienceLevel || undefined,
        spaceType: spaceType || undefined,
      }));

      setMatchedPlants(payload.recommendations || []);
      setRequestMeta({ requestId: payload.requestId, matchesFound: payload.matchesFound || 0 });
      setSearched(true);
      await loadHistory();
    } catch (err) {
      const msg = err.message || 'Failed to generate recommendations.';
      setError(msg);
      addToast(msg, 'error');
      setMatchedPlants([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (recommendation) => {
    const plant = {
      id: recommendation.product.id,
      backendId: recommendation.product.id,
      name: recommendation.product.name,
      category: 'plants',
      price: Number(recommendation.product.price || 0),
      image: recommendation.product.imageUrl || '',
    };
    const result = await addToCart(plant, 1);
    if (result.ok) {
      addToast(t('plantRecommendation.toast.addedToCart', { name: recommendation.product.name }), 'success');
    } else {
      addToast(result.error || t('plantRecommendation.toast.failedToAddToCart', { name: recommendation.product.name }), 'error');
    }
  };

  const handleAddAllToCart = async () => {
    let added = 0;
    for (const recommendation of matchedPlants) {
      const result = await addToCart({
        id: recommendation.product.id,
        backendId: recommendation.product.id,
        name: recommendation.product.name,
        category: 'plants',
        price: Number(recommendation.product.price || 0),
        image: recommendation.product.imageUrl || '',
      }, 1);
      if (result.ok) added += 1;
    }
    addToast(t('plantRecommendation.toast.addedAllToCart', { added, total: matchedPlants.length }), 'success');
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Sparkles size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>{t('plantRecommendation.title')}</h1>
        <p style={styles.subtitle}>
          {t('plantRecommendation.subtitle')}
        </p>
      </div>

      {error && <div style={styles.errBanner}><AlertCircle size={16} color="var(--error)" /><span>{error}</span></div>}

      <div style={styles.layout}>
        <div className="card" style={styles.scannerCard}>
          <h3 style={styles.sectionTitle}>{t('plantRecommendation.suitabilityDiagnostics')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            {t('plantRecommendation.submitCriteriaHint')}
          </p>

          {validationErr && (
            <div style={styles.errBanner}>
              <AlertCircle size={16} color="var(--error)" />
              <span>{validationErr}</span>
            </div>
          )}

          <form onSubmit={handleScan}>
            <FormInput
              label={t('plantRecommendation.sunlightExposureLevels')}
              id="sunlight"
              type="select"
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              options={[
                { value: '', label: t('plantRecommendation.selectLighting') },
                { value: 'full sun', label: t('plantRecommendation.fullSun') },
                { value: 'bright indirect light', label: t('plantRecommendation.brightIndirectLight') },
                { value: 'partial shade', label: t('plantRecommendation.partialShade') },
                { value: 'low light', label: t('plantRecommendation.lowLight') },
              ]}
              required
            />

            <FormInput
              label={t('plantRecommendation.wateringDedication')}
              id="water"
              type="select"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              options={[
                { value: '', label: t('plantRecommendation.selectWateringSchedule') },
                { value: 'low', label: t('plantRecommendation.low') },
                { value: 'moderate', label: t('plantRecommendation.moderate') },
                { value: 'high', label: t('plantRecommendation.high') },
              ]}
              required
            />

            <FormInput
              label={t('plantRecommendation.householdPetSafety')}
              id="hasPets"
              type="select"
              value={hasPets}
              onChange={(e) => setHasPets(e.target.value)}
              options={[
                { value: '', label: t('plantRecommendation.arePetsPresent') },
                { value: 'yes', label: t('plantRecommendation.yesShowPetSafe') },
                { value: 'no', label: t('plantRecommendation.noAllPlantsEligible') },
              ]}
              required
            />

            <FormInput
              label={t('plantRecommendation.growthStrategyPurpose')}
              id="purpose"
              type="select"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              options={[
                { value: '', label: t('plantRecommendation.selectPrimaryGoal') },
                { value: 'air purification', label: t('plantRecommendation.airPurification') },
                { value: 'indoor beauty', label: t('plantRecommendation.indoorBeauty') },
                { value: 'flowering decoration', label: t('plantRecommendation.floweringDecoration') },
                { value: 'low maintenance', label: t('plantRecommendation.lowMaintenance') },
                { value: 'outdoor garden', label: t('plantRecommendation.outdoorGarden') },
              ]}
              required
            />

            <FormInput
              label={t('plantRecommendation.experienceLevel')}
              id="experience"
              type="select"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              options={[
                { value: '', label: t('plantRecommendation.optional') },
                { value: 'beginner', label: t('plantRecommendation.beginner') },
                { value: 'intermediate', label: t('plantRecommendation.intermediate') },
                { value: 'expert', label: t('plantRecommendation.expert') },
              ]}
            />

            <FormInput
              label={t('plantRecommendation.spaceType')}
              id="space-type"
              value={spaceType}
              onChange={(e) => setSpaceType(e.target.value)}
              placeholder={t('plantRecommendation.spaceTypePlaceholder')}
            />

            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              {loading ? <><RefreshCw size={16} className="pulse-light" /><span>{t('plantRecommendation.processingBackendMatches')}</span></> : t('plantRecommendation.processMatchingMatrices')}
            </Button>
          </form>
        </div>

        <div style={styles.resultsContainer}>
          {searched ? (
            <div>
              <div style={styles.resultsHeader}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-white)' }}>
                    {t('plantRecommendation.matchesFound', { count: requestMeta?.matchesFound || matchedPlants.length })}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {requestMeta?.requestId ? t('plantRecommendation.backendRequest', { requestId: requestMeta.requestId }) : t('plantRecommendation.liveBackendRecommendations')}
                  </p>
                </div>
                {matchedPlants.length > 1 && (
                  <Button onClick={handleAddAllToCart} variant="secondary" icon={<ShoppingCart size={16} />}>
                    {t('plantRecommendation.addAllToCart')}
                  </Button>
                )}
              </div>

              {matchedPlants.length > 0 ? (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchedPlants.map((recommendation) => (
                    <div key={recommendation.product.id} className="card" style={styles.resultCard}>
                      <div style={styles.resultCardTop}>
                        <div style={styles.resultImageWrap}>
                          <ImageWithFallback
                            src={recommendation.product.imageUrl}
                            alt={recommendation.product.name}
                            category="plants"
                            style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)' }}
                          />
                        </div>
                        <div style={styles.resultInfo}>
                          <h4 style={styles.resultName}>{recommendation.rank}. {recommendation.product.name}</h4>
                          <span style={styles.resultCategory}>{recommendation.product.category?.name || 'Plant'}</span>
                          <span style={styles.resultPrice}>{formatCurrency(recommendation.product.price)}</span>
                        </div>
                      </div>

                      <div style={styles.resultDivider} />

                      <div style={styles.resultDetails}>
                        <div style={styles.detailItem}>
                          <Sun size={13} color="var(--btn-yellow)" />
                          <span style={styles.detailLabel}>{t('plantRecommendation.sunlightLabel')}</span>
                          <span style={styles.detailValue}>{recommendation.product.lightRequirement || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <Droplet size={13} color="#38BDF8" />
                          <span style={styles.detailLabel}>{t('plantRecommendation.wateringLabel')}</span>
                          <span style={styles.detailValue}>{recommendation.product.waterRequirement || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          {(recommendation.warnings || []).some((warning) => warning.toLowerCase().includes('pet')) ? (
                            <ShieldAlert size={13} color="var(--error)" />
                          ) : (
                            <ShieldCheck size={13} color="var(--success)" />
                          )}
                          <span style={styles.detailLabel}>{t('plantRecommendation.scoreLabel')}</span>
                          <span style={styles.detailValue}>{recommendation.score}</span>
                        </div>
                      </div>

                      <div style={styles.reasonBlock}>
                        <strong>{t('plantRecommendation.whyItMatched')}</strong> {(recommendation.reasons || []).join(' • ') || t('plantRecommendation.generalSuitability')}
                      </div>
                      {(recommendation.careNotes || []).length > 0 && (
                        <div style={styles.reasonBlock}>                        <strong>{t('plantRecommendation.careNotesLabel')}</strong> {recommendation.careNotes.join(' • ')}</div>
                      )}
                      {(recommendation.warnings || []).length > 0 && (
                        <div style={{ ...styles.reasonBlock, borderColor: 'rgba(245, 158, 11, 0.35)' }}>                        <strong>{t('plantRecommendation.warningsLabel')}</strong> {recommendation.warnings.join(' • ')}</div>
                      )}

                      <div style={styles.resultActions}>
                        <Button
                          variant="secondary"
                          icon={<Eye size={14} />}
                          onClick={() => navigate(`/catalog/${recommendation.product.id}`)}
                          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        >
                          {t('plantRecommendation.details')}
                        </Button>
                        <Button
                          variant="lime"
                          icon={<ShoppingCart size={14} />}
                          onClick={() => handleAddToCart(recommendation)}
                          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        >
                          {t('shop.addToCart')}
                        </Button>
                        <Button
                          variant="secondary"
                          icon={<MessageSquare size={14} />}
                          onClick={() => navigate(`/chatbot?q=How do I care for my ${encodeURIComponent(recommendation.product.name)}`) }
                          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        >
                          {t('plantRecommendation.askCareBot')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={styles.noMatchesCard}>
                  <AlertCircle size={36} color="var(--warning)" />
                  <h4 style={{ color: 'var(--text-white)', margin: '12px 0 4px' }}>{t('plantRecommendation.noPlantsFound')}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                    {t('plantRecommendation.noResultsBackend')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={styles.emptyResults}>
              <Sparkles size={48} color="var(--border-green)" />
              <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                {t('plantRecommendation.fillQuestionnaireHint')}
              </h4>
            </div>
          )}

          <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
            <div style={styles.historyHeader}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-white)' }}>{t('plantRecommendation.recommendationHistory')}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>{t('plantRecommendation.recentBackendRequests')}</p>
              </div>
              <Button variant="secondary" onClick={loadHistory} icon={<History size={16} />}>
                {t('plantRecommendation.refresh')}
              </Button>
            </div>
            {historyLoading ? (
              <div style={styles.historyEmpty}>{t('plantRecommendation.loadingHistory')}</div>
            ) : history.length > 0 ? (
              <div style={styles.historyList}>
                {history.map((item) => (
                  <div key={item.id} style={styles.historyItem}>
                    <div>
                      <div style={{ color: 'var(--text-white)', fontWeight: 700 }}>{String(item.type || '').replace(/_/g, ' ')}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : t('plantRecommendation.unknownTime')}</div>
                    </div>
                    <div style={{ color: 'var(--accent-lime)', fontSize: '12px' }}>{t('plantRecommendation.resultsCount', { count: (item.results || []).length })}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.historyEmpty}>{t('plantRecommendation.noHistoryYet')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  iconContainer: {
    width: '56px', height: '56px', borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-green)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  scannerCard: { flex: '1 0 350px', padding: '32px' },
  resultsContainer: { flex: '1.5 0 400px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700' },
  errBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)',
    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    marginBottom: '16px', fontSize: '13px', color: 'var(--text-light)',
  },
  resultsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--border-green)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px',
  },
  resultCard: { display: 'flex', flexDirection: 'column', gap: '0', padding: '16px' },
  resultCardTop: { display: 'flex', gap: '14px', alignItems: 'center' },
  resultImageWrap: {
    width: '80px', height: '80px', borderRadius: 'var(--radius-sm)',
    overflow: 'hidden', border: '1px solid var(--border-green)', flexShrink: 0,
  },
  resultInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  resultName: { fontSize: '16px', fontWeight: '700', color: 'var(--text-white)', margin: 0 },
  resultCategory: { fontSize: '12px', color: 'var(--accent-lime)', fontWeight: '600' },
  resultPrice: { fontSize: '15px', fontWeight: '800', color: 'var(--btn-yellow)' },
  resultDivider: { height: '1px', backgroundColor: 'var(--border-green)', margin: '12px 0' },
  resultDetails: { display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginBottom: '12px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  detailLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' },
  detailValue: { fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' },
  reasonBlock: { marginBottom: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(132, 204, 22, 0.18)', color: 'var(--text-light)', fontSize: '13px' },
  resultActions: { display: 'flex', gap: '10px' },
  noMatchesCard: { textAlign: 'center', padding: '48px 24px', marginTop: '20px' },
  emptyResults: {
    height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed',
    borderWidth: '2px', padding: '80px 20px',
  },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-darker)' },
  historyEmpty: { marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' },
};
