import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import { Sparkles, AlertCircle, ShoppingCart, Sun, Droplet, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

function scorePlant(plant, sunlight, water, hasPets, purpose) {
  let score = 0;

  const plantLight = (plant.sunlight || '').toLowerCase();
  const plantWater = (plant.water || '').toLowerCase();
  const plantPurposes = (plant.purpose || '').toLowerCase().split(',').map(s => s.trim());

  const lightMap = {
    direct: ['full sun', 'bright', 'direct'],
    bright: ['bright', 'indirect', 'full sun'],
    low: ['low', 'shade', 'dim'],
  };
  const lightKw = lightMap[sunlight] || [sunlight];
  if (lightKw.some(k => plantLight.includes(k))) score += 3;

  const waterMap = {
    low: ['low', 'bi-weekly', 'every 2-3 weeks', '2-3 weeks', 'minimal'],
    medium: ['moderate', 'medium', 'once a week', 'weekly', 'keep soil moist'],
    high: ['high', 'daily', 'keep soil moist', 'moderate', 'water frequently'],
  };
  const waterKw = waterMap[water] || [water];
  if (waterKw.some(k => plantWater.includes(k))) score += 3;

  const isPetSafe = !plant.toxic || plant.toxic.toLowerCase().includes('no') || plant.petSafe === true;
  if (hasPets === 'yes' && isPetSafe) score += 3;
  else if (hasPets === 'no') score += 1;

  const purposeMap = {
    air: ['air purification', 'purify air', 'air quality'],
    aesthetic: ['indoor beauty', 'aesthetic', 'ornamental', 'statement'],
    vibrant: ['flowering', 'vibrant', 'colorful', 'flower'],
    'low-maintenance': ['low maintenance', 'low care', 'beginner'],
    'outdoor': ['outdoor garden', 'garden', 'outdoor'],
  };
  const purposeKw = purposeMap[purpose] || [purpose];
  if (purposeKw.some(k => plantPurposes.some(p => p.includes(k)))) score += 3;

  return score;
}

function matchPlants(products, sunlight, water, hasPets, purpose) {
  const plants = products.filter(p => p.category === 'plants' && p.stock > 0);

  const strictMatches = plants.filter(p => {
    if (hasPets === 'yes') {
      const isPetSafe = !p.toxic || p.toxic.toLowerCase().includes('no') || p.petSafe === true;
      if (!isPetSafe) return false;
    }

    const plantLight = (p.sunlight || '').toLowerCase();
    const lightMatch = (() => {
      if (sunlight === 'direct') return plantLight.includes('full sun') || plantLight.includes('bright') || plantLight.includes('direct');
      if (sunlight === 'bright') return plantLight.includes('bright') || plantLight.includes('indirect');
      if (sunlight === 'low') return plantLight.includes('low') || plantLight.includes('shade');
      return true;
    })();
    if (!lightMatch) return false;

    const plantWater = (p.water || '').toLowerCase();
    const waterMatch = (() => {
      if (water === 'low') return plantWater.includes('low') || plantWater.includes('bi-weekly') || plantWater.includes('2-3 weeks') || plantWater.includes('every 2-3') || plantWater.includes('minimal');
      if (water === 'medium') return plantWater.includes('moderate') || plantWater.includes('once a week') || plantWater.includes('weekly') || plantWater.includes('keep soil moist') || plantWater.includes('medium');
      if (water === 'high') return plantWater.includes('daily') || plantWater.includes('high') || plantWater.includes('keep soil moist') || plantWater.includes('moist') || plantWater.includes('frequent');
      return true;
    })();
    if (!waterMatch) return false;

    const plantPurposes = (p.purpose || '').toLowerCase().split(',').map(s => s.trim());
    const purposeMap = {
      air: ['air purification', 'purify air', 'air quality'],
      aesthetic: ['indoor beauty', 'aesthetic', 'ornamental', 'statement'],
      vibrant: ['flowering', 'vibrant', 'colorful', 'flower'],
      'low-maintenance': ['low maintenance', 'low care', 'beginner'],
      'outdoor': ['outdoor garden', 'garden', 'outdoor'],
    };
    const purposeKw = purposeMap[purpose] || [purpose];
    if (!purposeKw.some(k => plantPurposes.some(pu => pu.includes(k)))) return false;

    return true;
  });

  if (strictMatches.length > 0) {
    return { matches: strictMatches, isCloseMatch: false };
  }

  const scored = plants.map(p => ({ plant: p, score: scorePlant(p, sunlight, water, hasPets, purpose) }));
  scored.sort((a, b) => b.score - a.score);
  const closeMatches = scored.filter(s => s.score >= 3).slice(0, 6).map(s => s.plant);

  if (closeMatches.length > 0) {
    return { matches: closeMatches, isCloseMatch: true };
  }

  return { matches: scored.slice(0, 3).map(s => s.plant), isCloseMatch: true };
}

export default function PlantRecommendationPage() {
  const { products, addToCart } = useContext(AppContext);
  const navigate = useNavigate();

  const [sunlight, setSunlight] = useState('');
  const [water, setWater] = useState('');
  const [hasPets, setHasPets] = useState('');
  const [purpose, setPurpose] = useState('');

  const [matchedPlants, setMatchedPlants] = useState([]);
  const [isCloseMatch, setIsCloseMatch] = useState(false);
  const [searched, setSearched] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  const handleScan = useCallback((e) => {
    e.preventDefault();

    const missing = [];
    if (!sunlight) missing.push('Sunlight');
    if (!water) missing.push('Watering');
    if (!hasPets) missing.push('Pet Safety');
    if (!purpose) missing.push('Purpose');

    if (missing.length > 0) {
      setValidationErr(`Please select: ${missing.join(', ')}.`);
      return;
    }
    setValidationErr('');

    const { matches, isCloseMatch: close } = matchPlants(products, sunlight, water, hasPets, purpose);
    setMatchedPlants(matches);
    setIsCloseMatch(close);
    setSearched(true);
  }, [sunlight, water, hasPets, purpose, products]);

  const handleAddToCart = useCallback((plant) => {
    const result = addToCart(plant, 1);
    if (result.ok) {
      alert(`${plant.name} added to cart.`);
    } else {
      alert(result.error || `Could not add ${plant.name} to cart.`);
    }
  }, [addToCart]);

  const handleAddAllToCart = useCallback(() => {
    let added = 0;
    matchedPlants.forEach(plant => {
      const result = addToCart(plant, 1);
      if (result.ok) added++;
    });
    alert(`Added ${added} of ${matchedPlants.length} matched plants to your shopping cart!`);
  }, [matchedPlants, addToCart]);

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Sparkles size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>AI Botanical Suitability Advisor</h1>
        <p style={styles.subtitle}>
          Analyze microclimates, verify pet safety thresholds, and match the ideal green companions.
        </p>
      </div>

      <div style={styles.layout}>
        <div className="card" style={styles.scannerCard}>
          <h3 style={styles.sectionTitle}>Suitability Diagnostics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            Answer these 4 attributes to calibrate the matching matrix.
          </p>

          {validationErr && (
            <div style={styles.errBanner}>
              <AlertCircle size={16} color="var(--error)" />
              <span>{validationErr}</span>
            </div>
          )}

          <form onSubmit={handleScan}>
            <FormInput
              label="Sunlight Exposure Levels"
              id="sunlight"
              type="select"
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              options={[
                { value: '', label: 'Select lighting...' },
                { value: 'direct', label: 'Full Sun / Direct Sun' },
                { value: 'bright', label: 'Bright Indirect Light' },
                { value: 'low', label: 'Low / Shade' },
              ]}
              required
            />

            <FormInput
              label="Watering Dedication"
              id="water"
              type="select"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              options={[
                { value: '', label: 'Select watering schedule...' },
                { value: 'low', label: 'Low (Bi-weekly / Monthly)' },
                { value: 'medium', label: 'Medium (Weekly)' },
                { value: 'high', label: 'High (Frequent / Daily)' },
              ]}
              required
            />

            <FormInput
              label="Household Pet Safety"
              id="hasPets"
              type="select"
              value={hasPets}
              onChange={(e) => setHasPets(e.target.value)}
              options={[
                { value: '', label: 'Are pets present?' },
                { value: 'yes', label: 'Yes (Show only pet-safe plants)' },
                { value: 'no', label: 'No (All plant types eligible)' },
              ]}
              required
            />

            <FormInput
              label="Growth Strategy Purpose"
              id="purpose"
              type="select"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              options={[
                { value: '', label: 'Select primary goal...' },
                { value: 'air', label: 'Air Purification' },
                { value: 'aesthetic', label: 'Indoor Beauty / Decoration' },
                { value: 'vibrant', label: 'Flowering / Vibrant Accents' },
                { value: 'low-maintenance', label: 'Low Maintenance' },
                { value: 'outdoor', label: 'Outdoor Garden' },
              ]}
              required
            />

            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }}>
              Process Matching Matrices
            </Button>
          </form>
        </div>

        <div style={styles.resultsContainer}>
          {searched ? (
            <div>
              <div style={styles.resultsHeader}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-white)' }}>
                    {matchedPlants.length} {matchedPlants.length === 1 ? 'Match' : 'Matches'} Found
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {isCloseMatch
                      ? 'No exact matches. Showing closest suitable plants.'
                      : 'Exact matches based on your criteria.'}
                  </p>
                </div>
                {matchedPlants.length > 1 && (
                  <Button onClick={handleAddAllToCart} variant="secondary" icon={<ShoppingCart size={16} />}>
                    Add All to Cart
                  </Button>
                )}
              </div>

              {matchedPlants.length > 0 ? (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchedPlants.map((plant) => (
                    <div key={plant.id} className="card" style={styles.resultCard}>
                      <div style={styles.resultCardTop}>
                        <div style={styles.resultImageWrap}>
                          <ImageWithFallback
                            src={plant.image}
                            alt={plant.name}
                            category={plant.category}
                            style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)' }}
                          />
                        </div>
                        <div style={styles.resultInfo}>
                          <h4 style={styles.resultName}>{plant.name}</h4>
                          <span style={styles.resultCategory}>{plant.category}</span>
                          <span style={styles.resultPrice}>{formatCurrency(plant.price)}</span>
                        </div>
                      </div>

                      <div style={styles.resultDivider} />

                      <div style={styles.resultDetails}>
                        <div style={styles.detailItem}>
                          <Sun size={13} color="var(--btn-yellow)" />
                          <span style={styles.detailLabel}>Sunlight:</span>
                          <span style={styles.detailValue}>{plant.sunlight || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <Droplet size={13} color="#38BDF8" />
                          <span style={styles.detailLabel}>Watering:</span>
                          <span style={styles.detailValue}>{plant.water || 'N/A'}</span>
                        </div>
                        <div style={styles.detailItem}>
                          {(plant.petSafe || (plant.toxic && plant.toxic.toLowerCase().includes('no'))) ? (
                            <ShieldCheck size={13} color="var(--success)" />
                          ) : (
                            <ShieldAlert size={13} color="var(--error)" />
                          )}
                          <span style={styles.detailLabel}>Pet Safe:</span>
                          <span style={{
                            ...styles.detailValue,
                            color: (plant.petSafe || (plant.toxic && plant.toxic.toLowerCase().includes('no')))
                              ? 'var(--success)' : 'var(--error)'
                          }}>
                            {(plant.petSafe || (plant.toxic && plant.toxic.toLowerCase().includes('no')))
                              ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

                      <div style={styles.resultActions}>
                        <Button
                          variant="secondary"
                          icon={<Eye size={14} />}
                          onClick={() => navigate(`/catalog/${plant.id}`)}
                          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        >
                          Details
                        </Button>
                        <Button
                          variant="lime"
                          icon={<ShoppingCart size={14} />}
                          onClick={() => handleAddToCart(plant)}
                          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={styles.noMatchesCard}>
                  <AlertCircle size={36} color="var(--warning)" />
                  <h4 style={{ color: 'var(--text-white)', margin: '12px 0 4px' }}>No plants found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                    Try relaxing your criteria to widen suitable botanical options.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={styles.emptyResults}>
              <Sparkles size={48} color="var(--border-green)" />
              <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Fill out the questionnaire to launch matching algorithms.
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
  resultCard: {
    display: 'flex', flexDirection: 'column', gap: '0', padding: '16px',
  },
  resultCardTop: { display: 'flex', gap: '14px', alignItems: 'center' },
  resultImageWrap: {
    width: '80px', height: '80px', borderRadius: 'var(--radius-sm)',
    overflow: 'hidden', border: '1px solid var(--border-green)', flexShrink: 0,
  },
  resultInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  resultName: { fontSize: '16px', fontWeight: '700', color: 'var(--text-white)', margin: 0 },
  resultCategory: { fontSize: '12px', color: 'var(--accent-lime)', fontWeight: '600', textTransform: 'capitalize' },
  resultPrice: { fontSize: '15px', fontWeight: '800', color: 'var(--btn-yellow)' },
  resultDivider: { height: '1px', backgroundColor: 'var(--border-green)', margin: '12px 0' },
  resultDetails: { display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginBottom: '12px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  detailLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' },
  detailValue: { fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' },
  resultActions: { display: 'flex', gap: '10px' },
  noMatchesCard: { textAlign: 'center', padding: '48px 24px', marginTop: '20px' },
  emptyResults: {
    height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed',
    borderWidth: '2px', padding: '80px 20px',
  },
};
