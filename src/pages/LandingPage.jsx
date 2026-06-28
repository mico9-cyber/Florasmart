import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Sprout, Flower2, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSuccess(true);
    setEmail('');
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroText}>
            <div style={styles.badge}>
              <Sparkles size={14} color="var(--bg-darker)" />
              <span>Next-Gen Gardening AI</span>
            </div>
            <h1 style={styles.heroTitle}>
              Grow Smarter, <br />
              <span style={{ color: 'var(--accent-lime)' }}>Bloom Brighter.</span>
            </h1>
            <p style={styles.heroDescription}>
              Experience FloraSmart: An AI-powered ecosystem combining botanical intelligence, vase stem matching, and professional garden planners.
            </p>
            <div style={styles.heroActions}>
              <Button onClick={() => navigate('/register')} variant="primary" icon={<ArrowRight size={18} />}>
                Get Started Free
              </Button>
              <Button onClick={() => navigate('/catalog')} variant="secondary">
                Browse Shop
              </Button>
            </div>
          </div>

          <div style={styles.heroImageContainer}>
            <img
              src="/hero_garden_florist.jpg"
              alt="Smart Greenhouse"
              style={styles.heroImage}
            />
            {/* Overlay card */}
            <div style={styles.heroFloatingCard} className="pulse-light">
              <Sprout size={24} color="var(--accent-lime)" />
              <div>
                <h4 style={{ margin: 0, fontSize: '14px' }}>AI Recommended</h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Peace Lily: Match Found</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={styles.statsBar}>
        <div className="container" style={styles.statsContainer}>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>99.4%</h3>
            <span style={styles.statLabel}>AI Matching Accuracy</span>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>15K+</h3>
            <span style={styles.statLabel}>Gardens Guided</span>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>250+</h3>
            <span style={styles.statLabel}>Stems & Vases Calibrated</span>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>24/7</h3>
            <span style={styles.statLabel}>Autonomous Care Diagnostics</span>
          </div>
        </div>
      </section>

      {/* Feature Section with Green/White Contrast */}
      <section style={styles.featuresSection}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Smart Garden Core Systems</h2>
          <p style={styles.sectionSubtitle}>
            Our unified platform is tailored for customers, professional florists, garden planners, and store managers.
          </p>

          <div className="grid-cols-3" style={{ marginTop: '48px' }}>
            <div className="card" style={styles.featureCard}>
              <div style={styles.featureIconContainer}>
                <Sparkles size={24} color="var(--accent-lime)" />
              </div>
              <h3 style={styles.featureTitle}>AI Recommendation Engine</h3>
              <p style={styles.featureText}>
                Analyze your environment's sunlight, watering capacities, and safety profile to receive customized, toxicity-vetted plant matches.
              </p>
              <Link to="/recommendations" style={styles.featureLink}>
                Learn More <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card" style={styles.featureCard}>
              <div style={styles.featureIconContainer}>
                <Flower2 size={24} color="var(--accent-lime)" />
              </div>
              <h3 style={styles.featureTitle}>Vase & Floral Matcher</h3>
              <p style={styles.featureText}>
                Select bouquets and input vase sizes. Our system calculates structural fits and matching arrangements to keep flowers fresh.
              </p>
              <Link to="/vase-matching" style={styles.featureLink}>
                Learn More <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card" style={styles.featureCard}>
              <div style={styles.featureIconContainer}>
                <Sprout size={24} color="var(--accent-lime)" />
              </div>
              <h3 style={styles.featureTitle}>3D Garden Grid Planner</h3>
              <p style={styles.featureText}>
                Plan your landscaping layouts interactively. Map coordinates, track planting records, and monitor growth metrics in real-time.
              </p>
              <Link to="/garden-planner" style={styles.featureLink}>
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Middle banner section with light background to provide contrast */}
      <section style={styles.whiteContrastSection}>
        <div className="container" style={styles.contrastContainer}>
          <div style={styles.contrastTextCol}>
            <h2 style={styles.contrastTitle}>Designed for Both Enthusiasts and Experts</h2>
            <p style={styles.contrastText}>
              Whether you are looking to purchase your first houseplant, build custom floral displays for events, manage physical inventory in greenhouses, or track delivery vehicles out on the road, FloraSmart provides dedicated dashboard workspaces for every role.
            </p>
            <div style={styles.roleGrid}>
              <div style={styles.roleItem}>
                <CheckCircle2 size={18} color="var(--accent-lime)" />
                <span>Florist Order Handlers</span>
              </div>
              <div style={styles.roleItem}>
                <CheckCircle2 size={18} color="var(--accent-lime)" />
                <span>Landscaping Gardeners</span>
              </div>
              <div style={styles.roleItem}>
                <CheckCircle2 size={18} color="var(--accent-lime)" />
                <span>Global Store Administrators</span>
              </div>
              <div style={styles.roleItem}>
                <CheckCircle2 size={18} color="var(--accent-lime)" />
                <span>E-commerce Customers</span>
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <Button onClick={() => navigate('/login')} variant="lime">
                Access Dashboard
              </Button>
            </div>
          </div>
          <div style={styles.contrastImageCol}>
            <div style={styles.contrastCard}>
              <ShieldCheck size={48} color="var(--accent-lime)" />
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-white)' }}>Enterprise Grade Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                All role permissions are governed by role-based access controls (RBAC) and monitored through real-time security audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={styles.newsletterSection}>
        <div className="container" style={styles.newsletterContainer}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={styles.newsletterTitle}>Get Botanical Insights in Your Inbox</h2>
            <p style={styles.newsletterSubtitle}>
              Subscribe to receive weekly care sheets, early access florist drops, and intelligence updates on plant health.
            </p>

            {success ? (
              <div style={styles.successContainer}>
                <CheckCircle2 size={24} color="var(--success)" />
                <span>Success! You have been subscribed to our mailing list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={styles.form}>
                <div style={{ flex: 1 }}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      ...styles.newsletterInput,
                      borderColor: error ? 'var(--error)' : 'var(--border-green)'
                    }}
                  />
                  {error && <span style={styles.errorText}>{error}</span>}
                </div>
                <button type="submit" className="btn btn-primary" style={styles.subscribeBtn}>
                  <Mail size={16} />
                  <span>Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: 'var(--bg-dark)',
  },
  heroSection: {
    padding: '80px 0',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid var(--border-green)',
    background: 'radial-gradient(circle at top right, rgba(132, 204, 22, 0.06), transparent 60%)',
  },
  heroContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  },
  heroText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '20px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--accent-lime)',
    color: 'var(--bg-darker)',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: '54px',
    lineHeight: '1.1',
    fontFamily: 'var(--font-headings)',
    fontWeight: '800',
  },
  heroDescription: {
    fontSize: '17px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '520px',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
  },
  heroImageContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-green)',
  },
  heroFloatingCard: {
    position: 'absolute',
    bottom: '-20px',
    left: '20px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--accent-lime)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: 'var(--shadow-lg)',
  },
  statsBar: {
    backgroundColor: 'var(--bg-darker)',
    borderBottom: '1px solid var(--border-green)',
    padding: '32px 0',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '24px',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--accent-lime)',
    fontFamily: 'var(--font-headings)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  featuresSection: {
    padding: '80px 0',
  },
  sectionTitle: {
    fontSize: '32px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    maxWidth: '620px',
    margin: '0 auto 48px',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    height: '100%',
  },
  featureIconContainer: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(132, 204, 22, 0.05)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  featureText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    flex: 1,
  },
  featureLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
    marginTop: '8px',
  },
  whiteContrastSection: {
    backgroundColor: '#07160F', /* Slightly darker tone for design contrast */
    borderTop: '1px solid var(--border-green)',
    borderBottom: '1px solid var(--border-green)',
    padding: '80px 0',
  },
  contrastContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '68px',
  },
  contrastTextCol: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  contrastTitle: {
    fontSize: '32px',
    lineHeight: '1.2',
  },
  contrastText: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 24px',
    marginTop: '8px',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'var(--text-light)',
    fontWeight: '500',
  },
  contrastImageCol: {
    flex: 0.8,
  },
  contrastCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 32px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  newsletterSection: {
    padding: '80px 0',
    background: 'radial-gradient(circle at bottom center, rgba(132, 204, 22, 0.05), transparent 50%)',
  },
  newsletterTitle: {
    fontSize: '30px',
    marginBottom: '12px',
  },
  newsletterSubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    width: '100%',
  },
  newsletterInput: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-white)',
    fontSize: '15px',
    outline: 'none',
    transition: 'var(--transition)',
  },
  subscribeBtn: {
    padding: '14px 28px',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '12px',
    marginTop: '6px',
    display: 'block',
    textAlign: 'left',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '16px 24px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-light)',
  }
};

