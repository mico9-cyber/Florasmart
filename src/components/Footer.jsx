import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);
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
              {t('app.tagline')}
            </p>
            <div style={styles.socials}>
              <a href="mailto:hello@florasmart.com" style={styles.socialLink} title="Contact Email"><Mail size={18} /></a>
              <a href="tel:+15557526800" style={styles.socialLink} title="Support Hotline"><Phone size={18} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={styles.col}>
            <h4 style={styles.heading}>{t('footer.explore')}</h4>
            <div style={styles.links}>
              {user.loggedIn && user.role === 'gardener' ? (
                <Link to="/manage-consultations" style={styles.link}>{t('footer.consultations')}</Link>
              ) : (
                <>
                  <Link to="/catalog" style={styles.link}>{t('footer.productCatalog')}</Link>
                  <Link to="/recommendations" style={styles.link}>{t('footer.aiCareAdvisor')}</Link>
                </>
              )}
            </div>
          </div>

          {/* Column 3: Dashboards */}
          <div style={styles.col}>
            <h4 style={styles.heading}>{t('footer.workspaces')}</h4>
            <div style={styles.links}>
              <Link to="/customer-dashboard" style={styles.link}>{t('footer.customer')}</Link>
              <Link to="/florist-dashboard" style={styles.link}>{t('footer.florist')}</Link>
              <Link to="/gardener-dashboard" style={styles.link}>{t('footer.gardener')}</Link>
              <Link to="/admin-dashboard" style={styles.link}>{t('footer.admin')}</Link>
            </div>
          </div>

          {/* Column 4: Contact */}
          <div style={styles.col}>
            <h4 style={styles.heading}>{t('footer.getInTouch')}</h4>
            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <MapPin size={16} color="var(--accent-lime)" />
                <span style={styles.contactText}>123 Canopy Road, Moss Town</span>
              </div>
              <div style={styles.contactItem}>
                <Phone size={16} color="var(--accent-lime)" />
                <a href="tel:+15557526800" style={styles.contactText}>+1 (555) 752-6800</a>
              </div>
              <div style={styles.contactItem}>
                <Mail size={16} color="var(--accent-lime)" />
                <a href="mailto:hello@florasmart.com" style={styles.contactText}>hello@florasmart.com</a>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.bottomBar}>
          <p>{t('footer.allRights', { year: 2026 })}</p>
          <div style={styles.bottomLinks}>
            <Link to="/legal#privacy-policy" style={styles.bottomLink}>{t('legal.privacyPolicy')}</Link>
            <Link to="/legal#terms-of-service" style={styles.bottomLink}>{t('legal.termsOfService')}</Link>
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
    textDecoration: 'none',
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
    textDecoration: 'none',
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
    textDecoration: 'none',
  }
};

