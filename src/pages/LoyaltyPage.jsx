import React, { useContext } from 'react';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import { Award, Zap, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function LoyaltyPage() {
  const { loyalty, subscriptionPlans, updateSubscription } = useContext(AppContext);
  const addToast = useToast();

  const handleSubscribeToggle = (planName, price) => {
    if (loyalty.isSubscribed && loyalty.subscriptionPlan === planName) {
      if (window.confirm(`Are you sure you want to cancel your ${planName}?`)) {
        updateSubscription(false);
        addToast(`Cancelled ${planName} subscription.`, 'success');
      }
    } else {
      updateSubscription(true, planName, price);
      addToast(`Successfully subscribed to ${planName}!`, 'success');
    }
  };

  const isLoading = !loyalty;
  const transactions = loyalty?.transactions;

  if (isLoading) return <LoadingSpinner text="Loading loyalty data..." />;

  return (
    <div className="dashboard-content">
        <div style={styles.header}>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Loyalty Rewards & Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage periodic flower drops, review green club levels, and claim shopping vouchers.</p>
        </div>

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
              {(subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : [
                { id: 'basic', name: 'Basic Garden Care', price: 5000, description: 'Monthly soil analysis card and one seasonal seedling.' },
                { id: 'premium', name: 'Premium Plant Club', price: 15000, description: 'Rare plant delivery every month with AI care sheets.' },
              ]).map((plan) => (
                <div key={plan.id} className="card" style={{
                  ...styles.planCard,
                  borderColor: loyalty.subscriptionPlan === plan.name ? 'var(--accent-lime)' : 'var(--border-green)'
                }}>
                  <span style={{ fontSize: '32px' }}>{plan.name?.includes('Premium') || plan.name?.includes('Plus') ? '🪴' : plan.name?.includes('Basic') ? '🌱' : '🌹'}</span>
                  <h4 style={styles.planName}>{plan.name}</h4>
                  <p style={styles.planPrice}>{formatCurrency(Number(plan.price || 0))} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ month</span></p>
                  <p style={styles.planDesc}>
                    {plan.description || 'Subscription plan'}
                  </p>
                  <Button
                    variant={loyalty.subscriptionPlan === plan.name ? 'secondary' : 'lime'}
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => handleSubscribeToggle(plan.name, plan.price)}
                  >
                    {loyalty.subscriptionPlan === plan.name ? 'Cancel Subscription' : 'Subscribe Now'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Point Ledger */}
          <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
            <h3 style={styles.sectionTitle}>Point Accrual Ledger</h3>
            <div style={styles.ledgerList}>
              {(transactions && transactions.length > 0 ? transactions : [
                { description: 'Order FL-9082', createdAt: '2026-06-22', points: 490 },
                { description: 'Order FL-8104', createdAt: '2026-06-15', points: 370 },
                { description: 'Account Registration', createdAt: '2026-06-10', points: 50 },
              ]).slice(0, 10).map((tx, i) => (
                <div key={i} style={styles.ledgerItem}>
                  <div>
                    <h5 style={styles.ledgerAction}>{tx.description || tx.reason || `Transaction #${tx.id}`}</h5>
                    <span style={styles.ledgerDate}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <span style={{
                    ...styles.ledgerPoints,
                    color: (tx.points || tx.amount || 0) >= 0 ? 'var(--accent-lime)' : 'var(--error)'
                  }}>
                    {(tx.points || tx.amount || 0) >= 0 ? '+' : ''}{tx.points || tx.amount || 0} pts
                  </span>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
                  No transaction history yet.
                </p>
              )}
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

