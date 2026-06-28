import React, { useState } from 'react';
import { Flower, Ruler, Info, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function VaseMatchingPage() {
  // Form input states
  const [selectedBouquet, setSelectedBouquet] = useState('rose');
  const [vaseHeight, setVaseHeight] = useState('25');
  const [vaseDiameter, setVaseDiameter] = useState('10');
  const [vaseShape, setVaseShape] = useState('cylinder');

  // Diagnostics states
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  const handleMatch = (e) => {
    e.preventDefault();
    if (!vaseHeight || !vaseDiameter) {
      setValidationErr('Vase height and opening diameter measurements are required.');
      return;
    }
    setValidationErr('');
    setCalculating(true);

    setTimeout(() => {
      // Logic calculations
      const heightVal = parseFloat(vaseHeight);
      const diamVal = parseFloat(vaseDiameter);
      let score = 90;
      let advice = '';

      if (selectedBouquet === 'rose') {
        // Roses (average stem length 45cm)
        if (heightVal < 18) {
          score = 55;
          advice = 'Vase is too short. Heavy rose buds will cause the arrangement to tip. Cut stems to 25cm or find a taller vase (20-30cm).';
        } else if (heightVal > 35) {
          score = 65;
          advice = 'Vase is too tall. Roses will sink and become hidden. Propping or using filler foliage is required.';
        } else {
          score = heightVal >= 22 && heightVal <= 28 ? 98 : 88;
          advice = 'Ideal height pairing. Stems should sit roughly 1.5x the vase height. Trim lower leaves entirely to keep water clear.';
        }

        if (diamVal < 8) {
          score -= 15;
          advice += ' The narrow opening will choke the stems; limit arrangement to 6 roses.';
        } else if (diamVal > 15) {
          score -= 10;
          advice += ' Wide opening causes stems to splay outwards. Bind stems together to maintain structural integrity.';
        }
      } else {
        // Tulips (average stem length 32cm)
        if (heightVal < 12) {
          score = 50;
          advice = 'Vase is too shallow for tulips. Stems will bend and droop excessively.';
        } else if (heightVal > 22) {
          score = 60;
          advice = 'Tulips will be obscured inside. Trim vase selection down or fill base with glass pebbles.';
        } else {
          score = heightVal >= 14 && heightVal <= 18 ? 96 : 85;
          advice = 'Excellent height pairing. Tulips continue to grow in water; ensure indirect cool light is provided.';
        }
      }

      setResult({
        score: Math.max(20, score),
        advice,
        height: heightVal,
        diameter: diamVal,
        shape: vaseShape,
        bouquet: selectedBouquet === 'rose' ? 'Roses' : 'Tulips'
      });
      setCalculating(false);
    }, 800);
  };

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Flower size={28} color="var(--accent-lime)" />
        </div>
        <h1 style={styles.title}>AI Vase & Arrangement Calibration</h1>
        <p style={styles.subtitle}>
          Avoid arrangement tipping or stem choking. Calculate the structural fit index of your favorite arrangements and vases.
        </p>
      </div>

      <div style={styles.layout}>
        {/* Dimensions Form */}
        <div className="card" style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Input Specifications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
            Input floral selection and vase dimensions to compute fits.
          </p>

          {validationErr && (
            <div style={styles.errBanner}>
              <AlertCircle size={16} color="var(--error)" />
              <span>{validationErr}</span>
            </div>
          )}

          <form onSubmit={handleMatch}>
            <FormInput
              label="Selected Bouquet Arrangement"
              id="bouquet"
              type="select"
              value={selectedBouquet}
              onChange={(e) => setSelectedBouquet(e.target.value)}
              options={[
                { value: 'rose', label: 'Enchanted Rose Bouquet (Avg 45cm stems)' },
                { value: 'tulip', label: 'Golden Hour Tulip Bundle (Avg 32cm stems)' }
              ]}
            />

            <div style={styles.dimensionsRow}>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="Vase Height (cm)"
                  id="vase-height"
                  placeholder="e.g. 25"
                  value={vaseHeight}
                  onChange={(e) => setVaseHeight(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormInput
                  label="Opening Width (cm)"
                  id="vase-diameter"
                  placeholder="e.g. 10"
                  value={vaseDiameter}
                  onChange={(e) => setVaseDiameter(e.target.value)}
                  required
                />
              </div>
            </div>

            <FormInput
              label="Vase Structural Silhouette"
              id="vase-shape"
              type="select"
              value={vaseShape}
              onChange={(e) => setVaseShape(e.target.value)}
              options={[
                { value: 'cylinder', label: 'Cylinder (Straight edges)' },
                { value: 'flared', label: 'Flared (Wider at opening)' },
                { value: 'round', label: 'Globe/Urn (Bulbous center, medium collar)' },
                { value: 'bud', label: 'Bud (Extremely narrow neck)' }
              ]}
            />

            <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={calculating}>
              {calculating ? (
                <>
                  <RefreshCw size={16} className="pulse-light" />
                  <span>Calibrating arrangement...</span>
                </>
              ) : (
                'Compute Fit Diagnostics'
              )}
            </Button>
          </form>
        </div>

        {/* Results Graph & Visualizer */}
        <div style={styles.resultsCol}>
          {result ? (
            <div className="card" style={styles.resultsCard}>
              <div style={styles.resultsHeader}>
                <div>
                  <h3 style={{ color: 'var(--text-white)' }}>Fit Score: <span style={{ color: result.score >= 80 ? 'var(--success)' : result.score >= 60 ? 'var(--warning)' : 'var(--error)' }}>{result.score}%</span></h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Stem Ratio: <strong>{((result.bouquet === 'Roses' ? 45 : 32) / result.height).toFixed(1)}x</strong> Vase Height
                  </span>
                </div>
                <div style={{
                  ...styles.scoreBadge,
                  backgroundColor: result.score >= 80 ? 'rgba(34, 197, 94, 0.15)' : result.score >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: result.score >= 80 ? 'var(--success)' : result.score >= 60 ? 'var(--warning)' : 'var(--error)'
                }}>
                  {result.score >= 80 ? 'Optimal Fit' : result.score >= 60 ? 'Acceptable' : 'Poor Match'}
                </div>
              </div>

              {/* Graphic representation SVG */}
              <div style={styles.visualizerArea}>
                <svg viewBox="0 0 200 240" style={styles.visualizerSvg}>
                  {/* Stems inside vase */}
                  <g stroke="#15803D" strokeWidth="3" opacity="0.6">
                    {/* Diagonal crossing stems */}
                    <line x1="85" y1="20" x2="115" y2="200" />
                    <line x1="115" y1="20" x2="85" y2="200" />
                    <line x1="100" y1="10" x2="100" y2="200" />
                    {selectedBouquet === 'rose' ? (
                      <>
                        <circle cx="85" cy="20" r="10" fill="var(--error)" />
                        <circle cx="115" cy="20" r="10" fill="var(--error)" />
                        <circle cx="100" cy="10" r="10" fill="var(--error)" />
                      </>
                    ) : (
                      <>
                        <ellipse cx="85" cy="20" rx="6" ry="10" fill="var(--btn-yellow)" />
                        <ellipse cx="115" cy="20" rx="6" ry="10" fill="var(--btn-yellow)" />
                        <ellipse cx="100" cy="10" rx="6" ry="10" fill="var(--btn-yellow)" />
                      </>
                    )}
                  </g>

                  {/* Water level lines */}
                  <rect x="70" y="110" width="60" height="90" fill="rgba(56, 189, 248, 0.2)" rx="5" />

                  {/* Vase outlines based on selection */}
                  {result.shape === 'cylinder' && (
                    <path d="M 70 80 L 70 200 A 10 10 0 0 0 80 210 L 120 210 A 10 10 0 0 0 130 200 L 130 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />
                  )}
                  {result.shape === 'flared' && (
                    <path d="M 60 80 L 75 200 A 8 8 0 0 0 83 208 L 117 208 A 8 8 0 0 0 125 200 L 140 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />
                  )}
                  {result.shape === 'round' && (
                    <path d="M 80 80 C 50 110 50 170 80 200 L 120 200 C 150 170 150 110 120 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />
                  )}
                  {result.shape === 'bud' && (
                    <path d="M 90 80 L 90 110 C 70 120 60 170 80 200 L 120 200 C 140 170 130 120 110 110 L 110 80 Z" fill="none" stroke="var(--accent-lime)" strokeWidth="3" />
                  )}
                </svg>
                <div style={styles.overlayHelp}>
                  <Ruler size={14} color="var(--accent-lime)" />
                  <span>Blueprint Rendered: {result.shape.toUpperCase()}</span>
                </div>
              </div>

              {/* Advice box */}
              <div style={styles.adviceBox}>
                <Sparkles size={16} color="var(--accent-lime)" />
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                  <strong>Florist Arrangement Guide:</strong> {result.advice}
                </p>
              </div>
            </div>
          ) : (
            <div className="card" style={styles.emptyCard}>
              <Info size={48} color="var(--border-green)" />
              <h4 style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
                Run the calibration scanner to load architectural fits.
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
  formCard: {
    flex: '1 0 350px',
    padding: '32px',
  },
  dimensionsRow: {
    display: 'flex',
    gap: '16px',
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
  resultsCol: {
    flex: '1.5 0 400px',
  },
  resultsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-green)',
    paddingBottom: '16px',
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
  visualizerSvg: {
    height: '90%',
  },
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

