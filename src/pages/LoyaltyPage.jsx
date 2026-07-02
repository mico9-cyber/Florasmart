import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppData';

import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import { Award, Zap, Calendar, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function LoyaltyPage() {
  const { loyalty, updateSubscription } = useContext(AppContext);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubscribeToggle = (planName, price) => {
    if (loyalty.isSubscribed && loyalty.subscriptionPlan === planName) {
      // Cancel
      if (window.confirm(`Are you sure you want to cancel your ${planName}?`)) {
        updateSubscription(false);
        setSuccessMsg(`Cancelled ${planName} subscription.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } else {
      // Subscribe
      updateSubscription(true, planName, price);
      setSuccessMsg(`Successfully subscribed to ${planName}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="dashboard-content">
        {/* Title Header */}
        <div style={styles.header}>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Loyalty Rewards & Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage periodic flower drops, review green club levels, and claim shopping vouchers.</p>
        </div>

        {successMsg && (
          <div style={styles.successBanner}>
            <CheckCircle size={18} color="var(--success)" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Loyalty details */}
        <div className="grid-cols-3" style={{ margin: '32px 0' }}>
          <DashboardCard
            title="Club Level Status"
            value={loyalty.tier}
            icon={<Award size={20} color="var(--btn-yellow)" />}
            description="Gold level benefits activated"
          />
          <DashboardCard
            title="Reward Point Balance"
            value={`${loyalty.points} Points`}
            icon={<Zap size={20} color="var(--accent-lime)" />}
            description="Earned on e-commerce checkouts"
          />
          <DashboardCard
            title="Upcoming Billing"
            value={loyalty.isSubscribed ? formatCurrency(loyalty.subscriptionPrice) : "No Subscriptions"}
            icon={<Calendar size={20} color="var(--accent-lime)" />}
            description={loyalty.isSubscribed ? `Next Renewal: ${loyalty.nextBillingDate}` : "Inactive plans"}
          />
        </div>

        <div style={styles.sectionsLayout}>
          {/* Subscription Offer Cards */}
          <div style={{ flex: 1.5 }}>
            <h3 style={styles.sectionTitle}>Subscribe to Premium Botanicals</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
              Periodic florist bouquets or air-purifier specimens dispatched directly to your destination coordinates.
            </p>

            <div className="grid-cols-2" style={{ gap: '20px' }}>
              {/* Plan 1 */}
              <div className="card" style={{
                ...styles.planCard,
                borderColor: loyalty.subscriptionPlan === 'Weekly Flower Drop' ? 'var(--accent-lime)' : 'var(--border-green)'
              }}>
                <span style={{ fontSize: '32px' }}>🌹</span>
                <h4 style={styles.planName}>Weekly Flower Drop</h4>
                <p style={styles.planPrice}>{formatCurrency(30000)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ month</span></p>
                <p style={styles.planDesc}>
                  Receive a hand-tied seasonal bouquet crafted by professional florists every Friday. Perfect for office decorations.
                </p>
                <Button
                  variant={loyalty.subscriptionPlan === 'Weekly Flower Drop' ? 'secondary' : 'lime'}
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => handleSubscribeToggle('Weekly Flower Drop', 29.99)}
                >
                  {loyalty.subscriptionPlan === 'Weekly Flower Drop' ? 'Cancel Subscription' : 'Subscribe Now'}
                </Button>
              </div>

              {/* Plan 2 */}
              <div className="card" style={{
                ...styles.planCard,
                borderColor: loyalty.subscriptionPlan === 'Monthly Green Refresh' ? 'var(--accent-lime)' : 'var(--border-green)'
              }}>
                <span style={{ fontSize: '32px' }}>🪴</span>
                <h4 style={styles.planName}>Monthly Green Refresh</h4>
                <p style={styles.planPrice}>{formatCurrency(40000)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ month</span></p>
                <p style={styles.planDesc}>
                  A unique pet-safe air-purifying houseplant shipped directly in clay pots. Includes custom AI diagnostics sheets.
                </p>
                <Button
                  variant={loyalty.subscriptionPlan === 'Monthly Green Refresh' ? 'secondary' : 'lime'}
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => handleSubscribeToggle('Monthly Green Refresh', 39.99)}
                >
                  {loyalty.subscriptionPlan === 'Monthly Green Refresh' ? 'Cancel Subscription' : 'Subscribe Now'}
                </Button>
              </div>
            </div>
          </div>

          {/* Point Ledger */}
          <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
            <h3 style={styles.sectionTitle}>Point Accrual Ledger</h3>
            <div style={styles.ledgerList}>
              <div style={styles.ledgerItem}>
                <div>
                  <h5 style={styles.ledgerAction}>Order FL-9082</h5>
                  <span style={styles.ledgerDate}>June 22, 2026</span>
                </div>
                <span style={styles.ledgerPoints}>+490 pts</span>
              </div>

              <div style={styles.ledgerItem}>
                <div>
                  <h5 style={styles.ledgerAction}>Order FL-8104</h5>
                  <span style={styles.ledgerDate}>June 15, 2026</span>
                </div>
                <span style={styles.ledgerPoints}>+370 pts</span>
              </div>

              <div style={styles.ledgerItem}>
                <div>
                  <h5 style={styles.ledgerAction}>Account Registration</h5>
                  <span style={styles.ledgerDate}>June 10, 2026</span>
                </div>
                <span style={styles.ledgerPoints}>+50 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

const styles = {
  header: {
    marginBottom: '32px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '14px',
    marginBottom: '24px',
  },
  sectionsLayout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  planCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    height: '100%',
  },
  planName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  planPrice: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--accent-lime)',
    fontFamily: 'var(--font-headings)',
  },
  planDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    flex: 1,
  },
  ledgerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  ledgerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-green)',
    paddingBottom: '12px',
  },
  ledgerAction: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--text-white)',
  },
  ledgerDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  ledgerPoints: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
  }
};

