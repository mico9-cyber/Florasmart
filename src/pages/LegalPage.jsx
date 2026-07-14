import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle } from 'lucide-react';
import { writeJson } from '../utils/storage';
import { useTranslation } from 'react-i18next';

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'privacy-policy', label: 'Privacy Policy', isHeader: true },
  { id: 'info-collect', label: 'Information We Collect' },
  { id: 'info-use', label: 'How We Use Information' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'user-rights', label: 'User Rights' },
  { id: 'contact-info', label: 'Contact Information' },
  { id: 'terms-of-service', label: 'Terms of Service', isHeader: true },
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'user-accounts', label: 'User Accounts' },
  { id: 'user-responsibilities', label: 'User Responsibilities' },
  { id: 'acceptable-use', label: 'Acceptable Use' },
  { id: 'orders-payments', label: 'Orders and Payments' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'termination', label: 'Account Termination' },
  { id: 'changes', label: 'Changes to the Terms' },
  { id: 'governing-law', label: 'Governing Law' },
];

export default function LegalPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAgree = () => {
    writeJson('flora_legal_consent', true);
    navigate('/register?consent=true');
  };

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* Sticky TOC - desktop */}
        <nav style={styles.toc} className="legal-toc">
          <h3 style={styles.tocTitle}>{t('legalPage.contents')}</h3>
          {sections.map(({ id, label, isHeader }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={scrollTo(id)}
              style={{
                ...styles.tocLink,
                ...(isHeader ? styles.tocHeader : {}),
                color: activeSection === id ? 'var(--accent-lime)' : isHeader ? 'var(--text-white)' : 'var(--text-muted)',
                fontWeight: activeSection === id ? '700' : isHeader ? '700' : '400',
                borderLeftColor: activeSection === id ? 'var(--accent-lime)' : 'transparent',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Main content */}
        <div style={styles.content}>
          <Link to="/" style={styles.backLink}>
            <ArrowLeft size={16} /> {t('legalPage.backToHome')}
          </Link>

          <div style={styles.hero}>
            <div style={styles.heroIcon}>
              <Shield size={28} color="var(--accent-lime)" />
            </div>
            <h1 style={styles.heroTitle}>{t('legalPage.heroTitle')}</h1>
            <p style={styles.heroSubtitle}>{t('legalPage.heroSubtitle')}</p>
          </div>

          {/* Mobile TOC */}
          <div className="legal-mobile-toc" style={styles.mobileToc}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('legalPage.contents')}</h4>
            <div style={styles.mobileTocGrid}>
              {sections.filter(s => !s.isHeader).map(({ id, label }) => (
                <a key={id} href={`#${id}`} onClick={scrollTo(id)} style={styles.mobileTocLink}>{label}</a>
              ))}
            </div>
          </div>

          {/* Introduction */}
          <section id="introduction" style={styles.section}>
            <h2 style={styles.sectionTitle}>{t('legalPage.introduction')}</h2>
            <p style={styles.body}>
              Welcome to FloraSmart (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy & Terms of Service document explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website, mobile application, and related services (collectively, the &quot;Service&quot;).
            </p>
            <p style={styles.body}>
              By accessing or using FloraSmart, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our Service.
            </p>
          </section>

          {/* Privacy Policy Header */}
          <section id="privacy-policy" style={styles.section}>
            <div style={styles.sectionHeaderRow}>
              <Shield size={20} color="var(--accent-lime)" />
              <h2 style={styles.sectionTitle}>{t('legal.privacyPolicy')}</h2>
            </div>
          </section>

          {/* Info We Collect */}
          <section id="info-collect" style={styles.section}>
            <h3 style={styles.subTitle}>Information We Collect</h3>
            <p style={styles.body}>We collect several types of information to provide and improve our Service:</p>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>Personal Data</h4>
              <ul style={styles.list}>
                <li>Full name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Payment information (processed securely via third-party providers)</li>
              </ul>
            </div>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>Usage Data</h4>
              <ul style={styles.list}>
                <li>Pages visited, features used, and time spent on the Service</li>
                <li>Device type, browser, operating system, and IP address</li>
                <li>Interaction with products, recommendations, and AI features</li>
              </ul>
            </div>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>Garden & Plant Data</h4>
              <ul style={styles.list}>
                <li>Garden dimensions, soil type, and climate zone</li>
                <li>Plant preferences and care history</li>
                <li>Consultation details with gardeners</li>
              </ul>
            </div>
          </section>

          {/* How We Use Info */}
          <section id="info-use" style={styles.section}>
            <h3 style={styles.subTitle}>How We Use Information</h3>
            <ul style={styles.list}>
              <li>To provide, maintain, and improve our Service</li>
              <li>To process transactions and send related information</li>
              <li>To personalize plant recommendations and AI advisor responses</li>
                <li>To schedule and manage gardener consultations</li>
              <li>To send administrative notifications and service updates</li>
              <li>To detect, prevent, and address technical issues and fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Cookies */}
          <section id="cookies" style={styles.section}>
            <h3 style={styles.subTitle}>Cookies</h3>
            <p style={styles.body}>
              We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of the Service may not function properly without cookies.
            </p>
            <p style={styles.body}>
              We use session cookies for authentication and preference cookies to remember your theme settings and language preferences.
            </p>
          </section>

          {/* Data Security */}
          <section id="data-security" style={styles.section}>
            <h3 style={styles.subTitle}>Data Security</h3>
            <p style={styles.body}>
              We implement industry-standard security measures including:
            </p>
            <ul style={styles.list}>
              <li>Bcrypt encryption for all passwords (12 salt rounds)</li>
              <li>JWT-based authentication with refresh token rotation</li>
              <li>HTTPS/TLS encryption for all data in transit</li>
              <li>Role-based access control for all API endpoints</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>
            <p style={styles.body}>
              While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          {/* Data Retention */}
          <section id="data-retention" style={styles.section}>
            <h3 style={styles.subTitle}>Data Retention</h3>
            <p style={styles.body}>
              We retain your personal information only for as long as necessary for the purposes outlined in this policy. Account data is retained until you request deletion. Transaction records are retained for 7 years as required by law. Usage analytics are retained in anonymized form indefinitely.
            </p>
          </section>

          {/* User Rights */}
          <section id="user-rights" style={styles.section}>
            <h3 style={styles.subTitle}>User Rights</h3>
            <p style={styles.body}>You have the right to:</p>
            <ul style={styles.list}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p style={styles.body}>
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          {/* Contact Info */}
          <section id="contact-info" style={styles.section}>
            <h3 style={styles.subTitle}>Contact Information</h3>
            <div style={styles.card}>
              <p style={styles.body}><strong>FloraSmart Privacy Team</strong></p>
              <p style={styles.body}>Email: privacy@florasmart.com</p>
              <p style={styles.body}>Phone: +1 (800) FLORA-SM</p>
              <p style={styles.body}>Address: 123 Garden Avenue, Greenfield, CA 94301</p>
            </div>
          </section>

          <div style={styles.divider} />

          {/* Terms of Service Header */}
          <section id="terms-of-service" style={styles.section}>
            <div style={styles.sectionHeaderRow}>
              <FileText size={20} color="var(--accent-lime)" />
              <h2 style={styles.sectionTitle}>{t('legal.termsOfService')}</h2>
            </div>
          </section>

          {/* Acceptance */}
          <section id="acceptance" style={styles.section}>
            <h3 style={styles.subTitle}>Acceptance of Terms</h3>
            <p style={styles.body}>
              By creating an account, accessing, or using FloraSmart, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
          </section>

          {/* User Accounts */}
          <section id="user-accounts" style={styles.section}>
            <h3 style={styles.subTitle}>User Accounts</h3>
            <ul style={styles.list}>
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your credentials</li>
              <li>You must provide accurate and complete registration information</li>
              <li>One person may not maintain more than one account</li>
              <li>You must verify your email address via the OTP sent during registration</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section id="user-responsibilities" style={styles.section}>
            <h3 style={styles.subTitle}>User Responsibilities</h3>
            <p style={styles.body}>As a user of FloraSmart, you agree to:</p>
            <ul style={styles.list}>
              <li>Use the Service in compliance with all applicable laws</li>
              <li>Not share your account credentials with any third party</li>
              <li>Promptly notify us of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section id="acceptable-use" style={styles.section}>
            <h3 style={styles.subTitle}>Acceptable Use</h3>
            <p style={styles.body}>You agree NOT to:</p>
            <ul style={styles.list}>
              <li>Use the Service for any unlawful purpose or in violation of any regulation</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without written permission</li>
              <li>Transmit any malware, viruses, or harmful code</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or harvest user data without consent</li>
            </ul>
          </section>

          {/* Orders and Payments */}
          <section id="orders-payments" style={styles.section}>
            <h3 style={styles.subTitle}>Orders and Payments</h3>
            <ul style={styles.list}>
              <li>All prices are displayed in the applicable currency and include taxes unless stated otherwise</li>
              <li>Payment must be received in full before order processing</li>
              <li>We reserve the right to cancel orders due to pricing errors or product unavailability</li>
              <li>Refunds are processed within 5-10 business days of approval</li>
              <li>Shipping times are estimates and not guaranteed</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section id="intellectual-property" style={styles.section}>
            <h3 style={styles.subTitle}>Intellectual Property</h3>
            <p style={styles.body}>
              The Service and its original content, features, functionality, and design are owned by FloraSmart and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section id="liability" style={styles.section}>
            <h3 style={styles.subTitle}>Limitation of Liability</h3>
            <p style={styles.body}>
              To the maximum extent permitted by law, FloraSmart shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill, arising out of or related to your use of the Service.
            </p>
            <p style={styles.body}>
              Our total liability for any claims related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* Termination */}
          <section id="termination" style={styles.section}>
            <h3 style={styles.subTitle}>Account Termination</h3>
            <p style={styles.body}>
              We may suspend or terminate your account at our sole discretion, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, third parties, or the business interests of FloraSmart. You may also delete your account at any time through your profile settings.
            </p>
          </section>

          {/* Changes */}
          <section id="changes" style={styles.section}>
            <h3 style={styles.subTitle}>Changes to the Terms</h3>
            <p style={styles.body}>
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on this page and updating the &quot;Last Updated&quot; date. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section id="governing-law" style={styles.section}>
            <h3 style={styles.subTitle}>Governing Law</h3>
            <p style={styles.body}>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of San Francisco County, California.
            </p>
          </section>

          {/* Last Updated */}
          <div style={styles.lastUpdated}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('legalPage.lastUpdatedDate')}
            </p>
          </div>

          <div style={styles.agreeSection}>
            <p style={styles.body}>{t('legalPage.agreeConsentText')}</p>
            <button onClick={handleAgree} style={styles.agreeBtn}>
              <CheckCircle size={18} />
              {t('legalPage.agree')}
            </button>
          </div>

          <div style={styles.bottomBack}>
            <Link to="/" style={styles.backLink}>
            <ArrowLeft size={16} /> {t('legalPage.backToHome')}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .legal-toc { display: block; }
        .legal-mobile-toc { display: none; }
        @media (max-width: 900px) {
          .legal-toc { display: none !important; }
          .legal-mobile-toc { display: block !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 144px)',
    padding: '40px 20px',
  },
  layout: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
  },
  toc: {
    position: 'sticky',
    top: '100px',
    minWidth: '220px',
    maxWidth: '240px',
    flexShrink: 0,
    padding: '20px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
  },
  tocTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-white)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  tocLink: {
    display: 'block',
    fontSize: '13px',
    textDecoration: 'none',
    padding: '5px 0 5px 12px',
    borderLeft: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tocHeader: {
    marginTop: '12px',
    fontSize: '13px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--accent-lime)',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
    marginBottom: '24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--text-white)',
    marginBottom: '8px',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
  },
  mobileToc: {
    padding: '20px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '32px',
  },
  mobileTocGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '6px',
  },
  mobileTocLink: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    padding: '4px 0',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-white)',
  },
  subTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
    marginBottom: '8px',
  },
  body: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  card: {
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
    padding: '20px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
    marginBottom: '8px',
  },
  list: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: 'var(--text-light)',
    paddingLeft: '20px',
    marginBottom: '8px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '40px 0',
  },
  lastUpdated: {
    textAlign: 'center',
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-green)',
  },
  bottomBack: {
    textAlign: 'center',
    marginTop: '20px',
  },
  agreeSection: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '28px',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)',
  },
  agreeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '14px 36px',
    backgroundColor: 'var(--accent-lime)',
    color: 'var(--bg-darker)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
};
