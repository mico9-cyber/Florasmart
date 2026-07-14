import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import {
  ShoppingBag, ArrowRight, Sparkles,
  MessageSquare, ClipboardList, User, Leaf, Package
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import ImageWithFallback from '../components/ImageWithFallback';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user, orders, products } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading] = useState(false);

  const recommendedItems = products.filter(p => p.isAIRecommended).slice(0, 4);
  const recentOrders = orders.slice(0, 3);
  const activeOrders = orders.filter(o => o.status !== 'Delivered');

  const features = [
    { to: '/catalog', icon: ShoppingBag, title: t('dashboard.customer.features.browseCatalog.title'), desc: t('dashboard.customer.features.browseCatalog.desc') },
    { to: '/recommendations', icon: Sparkles, title: t('dashboard.customer.features.aiAdvisor.title'), desc: t('dashboard.customer.features.aiAdvisor.desc') },
    { to: '/chatbot', icon: MessageSquare, title: t('dashboard.customer.features.careBot.title'), desc: t('dashboard.customer.features.careBot.desc') },
    { to: '/order-tracking', icon: ClipboardList, title: t('dashboard.customer.features.orders.title'), desc: t('dashboard.customer.features.orders.desc') },
    { to: '/profile', icon: User, title: t('dashboard.customer.features.profile.title'), desc: t('dashboard.customer.features.profile.desc') },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* A. Welcome Section */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)', margin: 0 }}>
            {t('dashboard.customer.welcome', { name: user.name || 'User' })}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
            {t('dashboard.customer.subtitle')}
          </p>
        </div>

      </div>

      {/* Stats Row */}
      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        <DashboardCard
          title={t('dashboard.customer.totalOrders')}
          value={activeOrders.length}
          icon={<Package size={20} color="var(--accent-lime)" />}
          description={t('dashboard.customer.pendingDeliveries')}
        />


        <DashboardCard
          title={t('dashboard.customer.gardenPlants')}
          value={products.length}
          icon={<Leaf size={20} color="var(--accent-lime)" />}
          description={t('dashboard.customer.aiRecommendations')}
        />
      </div>

        {/* B. Recommended Plants Section */}
        <div style={styles.sectionWrapper}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>{t('recommendations.results')}</h3>
            <Link to="/catalog?category=plants" style={styles.sectionLink}>
              {t('dashboard.customer.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
        <div className="customer-plant-grid" style={styles.plantGrid}>
          {recommendedItems.map(item => (
              <div key={item.id} style={styles.plantCard} onClick={() => navigate(`/catalog/${item.id}`)}>
              <ImageWithFallback src={item.image} alt={item.name} category={item.category} style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-sm)' }} />
              <div style={styles.plantInfo}>
                <h4 style={styles.plantName}>{item.name}</h4>
                <span style={styles.plantCare}>{item.sunlight}</span>
                <div style={styles.plantFooter}>
                  <span style={styles.plantPrice}>{formatCurrency(item.price)}</span>
                  <Button variant="secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    {t('shop.viewDetails')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C. Recent Orders Section */}
      <div style={styles.sectionWrapper}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>{t('dashboard.customer.recentOrders')}</h3>
          <Link to="/order-tracking" style={styles.sectionLink}>
            {t('dashboard.customer.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('orders.orderNumber')}</th>
                  <th>{t('orders.date')}</th>
                  <th>{t('orders.total')}</th>
                  <th>{t('orders.status')}</th>
                  <th>{t('common.action')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : order.status === 'Preparing Arrangement' ? 'badge-warning' : 'badge-info'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => navigate('/order-tracking')}>
                        {t('orders.viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <ShoppingBag size={40} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 16px' }}>{t('orders.noOrders')}</p>
            <Button variant="lime" onClick={() => navigate('/catalog')}>
              {t('dashboard.customer.shopNow')}
            </Button>
          </div>
        )}
      </div>

      {/* D. Available System Features */}
      <div style={styles.sectionWrapper}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>{t('landing.featuresTitle')}</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('landing.featuresSubtitle')}</span>
        </div>
        <div className="grid-cols-4" style={{ marginTop: '16px' }}>
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.to} className="card" style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <Icon size={22} color="var(--accent-lime)" />
                </div>
                <h4 style={styles.featureTitle}>{f.title}</h4>
                <p style={styles.featureDesc}>{f.desc}</p>
                <Button variant="secondary" style={{ width: '100%', fontSize: '13px', padding: '8px 16px' }} onClick={() => navigate(f.to)}>
                  {t('common.viewAll')}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  welcomeBanner: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  welcomeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--bg-darker)',
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-green)',
  },
  sectionWrapper: {
    marginBottom: '36px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
    margin: 0,
  },
  sectionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent-lime)',
    textDecoration: 'none',
  },
  plantGrid: {
    marginTop: '16px',
  },
  plantCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  plantInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  plantName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-white)',
    margin: 0,
  },
  plantCare: {
    fontSize: '12px',
    color: 'var(--accent-lime)',
    fontWeight: 500,
  },
  plantFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  plantPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--btn-yellow)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-lg)',
    marginTop: '16px',
    textAlign: 'center',
  },
  gardenPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)',
    borderRadius: 'var(--radius-lg)',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  gardenIcon: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gardenInfo: {
    flex: 1,
    minWidth: '200px',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '20px',
  },
  featureIcon: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--feature-icon-bg)',
    border: '1px solid var(--feature-icon-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-white)',
    margin: 0,
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: '1.4',
    flex: 1,
  },
};
