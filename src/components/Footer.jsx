import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          {/* Column 1: Brand */}
          <div style={styles.col}>
            <div style={styles.logoContainer}>
              <Leaf size={24} color="var(--accent-lime)" />
              <span style={styles.logoText}>FloraSmart</span>
            </div>
            <p style={styles.tagline}>
              Empowering gardeners and florists with AI-driven plant care, vase matching, and ecological garden planning.
            </p>
            <div style={styles.socials}>
              <a href="#" style={styles.socialLink} title="FloraSmart Web"><Globe size={18} /></a>
              <a href="#" style={styles.socialLink} title="Contact Email"><Mail size={18} /></a>
              <a href="#" style={styles.socialLink} title="Support Hotline"><Phone size={18} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={styles.col}>
            <h4 style={styles.heading}>Explore</h4>
            <div style={styles.links}>
              <Link to="/catalog" style={styles.link}>Product Catalog</Link>
              <Link to="/recommendations" style={styles.link}>AI Care Advisor</Link>
              <Link to="/vase-matching" style={styles.link}>Vase STEM Matcher</Link>
              <Link to="/garden-planner" style={styles.link}>3D Garden Planner</Link>
              <Link to="/loyalty" style={styles.link}>Loyalty Program</Link>
            </div>
          </div>

          {/* Column 3: Dashboards */}
          <div style={styles.col}>
            <h4 style={styles.heading}>Workspaces</h4>
            <div style={styles.links}>
              <Link to="/customer-dashboard" style={styles.link}>Customer Portal</Link>
              <Link to="/florist-dashboard" style={styles.link}>Florist Studio</Link>
              <Link to="/gardener-dashboard" style={styles.link}>Gardener Sandbox</Link>
              <Link to="/admin-dashboard" style={styles.link}>Control Center</Link>
              <Link to="/security" style={styles.link}>Security & Auditing</Link>
            </div>
          </div>

          {/* Column 4: Contact */}
          <div style={styles.col}>
            <h4 style={styles.heading}>Get in Touch</h4>
            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <MapPin size={16} color="var(--accent-lime)" />
                <span style={styles.contactText}>123 Canopy Road, Moss Town</span>
              </div>
              <div style={styles.contactItem}>
                <Phone size={16} color="var(--accent-lime)" />
                <span style={styles.contactText}>+1 (555) 752-6800</span>
              </div>
              <div style={styles.contactItem}>
                <Mail size={16} color="var(--accent-lime)" />
                <span style={styles.contactText}>hello@florasmart.com</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.bottomBar}>
          <p>© 2026 FloraSmart Systems Inc. All rights reserved.</p>
          <div style={styles.bottomLinks}>
            <a href="#" style={styles.bottomLink}>Privacy Policy</a>
            <a href="#" style={styles.bottomLink}>Terms of Service</a>
            <a href="#" style={styles.bottomLink}>SLA Guarantee</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: 'var(--bg-darker)',
    borderTop: '1px solid var(--border-green)',
    padding: '64px 0 32px',
    marginTop: 'auto',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '40px',
    marginBottom: '48px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontFamily: 'var(--font-headings)',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-white)',
  },
  tagline: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  socials: {
    display: 'flex',
    gap: '12px',
  },
  socialLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    color: 'var(--text-light)',
    transition: 'var(--transition)',
  },
  heading: {
    fontSize: '15px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-white)',
    borderBottom: '2px solid var(--border-green)',
    paddingBottom: '8px',
    marginBottom: '4px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    transition: 'var(--transition)',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  contactText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '32px 0 24px',
  },
  bottomBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  bottomLinks: {
    display: 'flex',
    gap: '24px',
  },
  bottomLink: {
    color: 'var(--text-muted)',
  }
};

