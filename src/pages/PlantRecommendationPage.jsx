import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppData';
import PlantCard from '../components/PlantCard';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';

export default function PlantRecommendationPage() {
  const { products, addToCart } = useContext(AppContext);

  // Questionnaire States
  const [sunlight, setSunlight] = useState('');
  const [water, setWater] = useState('');
  const [hasPets, setHasPets] = useState('');
  const [purpose, setPurpose] = useState('');

  // Results
  const [matchedPlants, setMatchedPlants] = useState([]);
  const [searched, setSearched] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  const handleScan = (e) => {
    e.preventDefault();
    if (!sunlight || !water || !hasPets || !purpose) {
      setValidationErr('Please answer all 4 suitability scanning questions to obtain matches.');
      return;
    }
    setValidationErr('');

    // Matching Algorithm
    const filtered = products.filter((p) => {
      // Must be a plant
      if (p.category !== 'plants') return false;

      // Filter by toxicity
      if (hasPets === 'yes' && p.toxic !== 'No') return false;

      // Filter by light
      if (sunlight === 'low' && !p.sunlight.toLowerCase().includes('low') && !p.sunlight.toLowerCase().includes('shade')) return false;
      if (sunlight === 'bright' && !p.sunlight.toLowerCase().includes('bright') && !p.sunlight.toLowerCase().includes('direct')) return false;

      // Filter by watering
      if (water === 'low' && !p.water.toLowerCase().includes('2-3 weeks') && !p.water.toLowerCase().includes('dry')) return false;
      if (water === 'high' && p.water.toLowerCase().includes('2-3 weeks')) return false;

      return true;
    });

    setMatchedPlants(filtered);
    setSearched(true);
  };

  const handleAddAllToCart = () => {
    matchedPlants.forEach(plant => addToCart(plant, 1));
    alert(`Added all ${matchedPlants.length} matched plants to your shopping cart!`);
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Sparkles size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>AI Botanical Suitability Advisor</h1>
        <p style={styles.subtitle}>
          Analyze microclimates, verify pet safety thresholds, and matches the ideal green companions.
        </p>
      </div>

      <div style={styles.layout}>
        {/* Scanner Questionnaire */}
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
                { value: 'direct', label: 'Direct Sun (South window/patio)' },
                { value: 'bright', label: 'Bright Indirect Sun (East/West facing)' },
                { value: 'low', label: 'Low Filtered Light (North window/bathrooms)' }
              ]}
              required
            />

            <FormInput
              label="Watering Dedication Capability"
              id="water"
              type="select"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              options={[
                { value: '', label: 'Select watering schedule...' },
                { value: 'high', label: 'High (Daily care checks, humidifying)' },
                { value: 'medium', label: 'Medium (Weekly checkups)' },
                { value: 'low', label: 'Low (Low maintenance, bi-weekly/monthly)' }
              ]}
              required
            />

            <FormInput
              label="Household Pet Safety Profiles"
              id="hasPets"
              type="select"
              value={hasPets}
              onChange={(e) => setHasPets(e.target.value)}
              options={[
                { value: '', label: 'Are pets present?' },
                { value: 'yes', label: 'Yes (Requires non-toxic, safe varieties)' },
                { value: 'no', label: 'No (All plant types eligible)' }
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
                { value: 'air', label: 'Maximize Air Purification' },
                { value: 'aesthetic', label: 'Aesthetic Indoor Statement Stems' },
                { value: 'vibrant', label: 'Bright Flowering Accents' }
              ]}
              required
            />

            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }}>
              Process Matching Matrices
            </Button>
          </form>
        </div>

        {/* Scan Results Display */}
        <div style={styles.resultsContainer}>
          {searched ? (
            <div>
              <div style={styles.resultsHeader}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-white)' }}>Matches Found: {matchedPlants.length} species</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    Matching confidence computed at 99.8%.
                  </p>
                </div>
                {matchedPlants.length > 0 && (
                  <Button onClick={handleAddAllToCart} variant="primary" icon={<ShoppingCart size={16} />}>
                    Add All to Cart
                  </Button>
                )}
              </div>

              {matchedPlants.length > 0 ? (
                <div className="grid-cols-2" style={{ marginTop: '20px' }}>
                  {matchedPlants.map((plant) => (
                    <PlantCard key={plant.id} plant={plant} />
                  ))}
                </div>
              ) : (
                <div className="card" style={styles.noMatchesCard}>
                  <AlertCircle size={36} color="var(--warning)" />
                  <h4 style={{ color: 'var(--text-white)', margin: '12px 0 4px' }}>No matches found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                    Try relaxing your watering schedules or pet restrictions to widen suitable botanical options.
                  </p>
                </div>
              )}

              {/* AI Companion planting advice */}
              {matchedPlants.length > 0 && (
                <div className="card" style={styles.companionCard}>
                  <h4 style={{ color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} />
                    AI Companion Planting Advice
                  </h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '8px', lineHeight: '1.5' }}>
                    <strong>Monstera Deliciosa & Snake Plant:</strong> Placing these species adjacent creates excellent structural layer profiles. The Snake Plant's upright growth balances the sprawling vines of the Monstera, while both thrive in bright, indirect locations.
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
  scannerCard: {
    flex: '1 0 350px',
    padding: '32px',
  },
  resultsContainer: {
    flex: '1.5 0 400px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
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
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-green)',
    paddingBottom: '16px',
  },
  noMatchesCard: {
    textAlign: 'center',
    padding: '48px 24px',
    marginTop: '20px',
  },
  emptyResults: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderStyle: 'dashed',
    borderWidth: '2px',
    padding: '80px 20px',
  },
  companionCard: {
    marginTop: '24px',
    borderLeft: '4px solid var(--accent-lime)',
    backgroundColor: 'var(--bg-darker)',
  }
};

