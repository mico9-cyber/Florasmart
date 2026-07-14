import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, ArrowLeft, Sun, Droplets, ShieldAlert, MessageSquare } from 'lucide-react';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export default function ProductDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { products, addToCart } = useContext(AppContext);
  const addToast = useToast();
  const navigate = useNavigate();

  const isLoading = !Array.isArray(products);
  const product = !isLoading ? products.find((p) => String(p.id) === String(id)) : null;
  const [qty, setQty] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewText, setReviewText] = useState('');
  const [reviewErr, setReviewErr] = useState('');
  const [reviewsList, setReviewsList] = useState([]);

  if (isLoading) return <LoadingSpinner text={t('productDetails.loading')} />;

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-white)' }}>{t('productDetails.notFound')}</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>{t('productDetails.notFoundDesc')}</p>
        <Link to="/catalog"><Button variant="primary">{t('productDetails.backToCatalog')}</Button></Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const result = await addToCart(product, qty);
    if (!result?.ok) {
      addToast(result?.error || t('productDetails.toast.unableToAdd'), 'error');
      return;
    }
    addToast(t('productDetails.toast.addedToCart', { qty, name: product.name }), 'success');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      setReviewErr(t('productDetails.validation.reviewRequired'));
      return;
    }
    setReviewErr('');
    const newRev = { name: reviewName, rating: parseInt(reviewRating, 10), date: new Date().toISOString().substring(0, 10), text: reviewText };
    setReviewsList([newRev, ...reviewsList]);
    setReviewName('');
    setReviewText('');
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div style={styles.container} className="container">
      <Link to="/catalog" style={styles.backLink}><ArrowLeft size={16} /><span>{t('productDetails.backToCatalog')}</span></Link>
      <div style={styles.grid}>
        <div style={styles.imageCol}><div style={styles.imageWrapper}><ImageWithFallback src={product.image || product.imageUrl} alt={product.name} category={product.category} fallbackSrc={product.imageUrl} /></div></div>
        <div style={styles.infoCol}>
          <span style={styles.category}>{product.category.toUpperCase()}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <div style={styles.ratingRow}>
            <div style={styles.stars}>{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.round(product.rating) ? 'var(--btn-yellow)' : 'transparent'} color="var(--btn-yellow)" />)}</div>
            <span style={styles.ratingVal}>{product.rating}</span>
            <span style={styles.reviewsCount}>{t('productDetails.customerReviewsCount', { count: product.reviews })}</span>
          </div>
          <div style={styles.priceRow}><span style={styles.price}>{formatCurrency(product.price)}</span><span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>{product.stock > 0 ? t('productDetails.inStock') : t('productDetails.outOfStock')}</span></div>
          {product.stock > 0 && product.stock <= 5 && <span style={{ color: 'var(--warning)', fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'block' }}>{t('productDetails.onlyRemaining', { count: product.stock })}</span>}
          <p style={styles.desc}>{product.desc}</p>
          <div style={styles.divider}></div>
          {product.category === 'plants' && (
            <div style={styles.botanicalSpecs}>
              <h4 style={styles.specsTitle}>{t('productDetails.careDetails')}</h4>
              <div style={styles.specsGrid}>
                <div style={styles.specItem}><Sun size={18} color="var(--accent-lime)" /><div><span style={styles.specLabel}>{t('productDetails.sunlightNeed')}</span><span style={styles.specVal}>{product.sunlight}</span></div></div>
                <div style={styles.specItem}><Droplets size={18} color="#38BDF8" /><div><span style={styles.specLabel}>{t('productDetails.wateringCycle')}</span><span style={styles.specVal}>{product.water}</span></div></div>
                <div style={styles.specItem}><ShieldAlert size={18} color="var(--error)" /><div><span style={styles.specLabel}>{t('productDetails.petToxicity')}</span><span style={styles.specVal}>{product.toxic}</span></div></div>
              </div>
              <div style={styles.divider}></div>
            </div>
          )}
          <div style={styles.cartActions}>
            <div style={styles.qtyControl}><button onClick={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>-</button><span style={styles.qtyVal}>{qty}</span><button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={styles.qtyBtn} disabled={qty >= product.stock}>+</button></div>
            <Button onClick={handleAddToCart} variant="primary" disabled={product.stock <= 0} icon={<ShoppingCart size={18} />} style={{ flex: 1, padding: '14px' }}>{t('productDetails.addToShoppingCart')}</Button>
          </div>
        </div>
      </div>
      <div style={styles.sectionsLayout}>
        <div className="card" style={{ flex: 1.5, minWidth: '320px' }}>
          <h3 style={styles.sectionTitle}>{t('productDetails.customerReviews')}</h3>
          <div style={styles.reviewsList}>
            {reviewsList.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('productDetails.noReviewsSession')}</p> : reviewsList.map((rev, idx) => (
              <div key={idx} style={styles.reviewItem}>
                <div style={styles.reviewHeader}><h5 style={{ color: 'var(--text-white)', margin: 0 }}>{rev.name}</h5><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.date}</span></div>
                <div style={styles.stars}>{[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? 'var(--btn-yellow)' : 'transparent'} color="var(--btn-yellow)" />)}</div>
                <p style={styles.reviewText}>{rev.text}</p>
              </div>
            ))}
          </div>
          <div style={styles.addReviewForm}>
            <h4 style={{ color: 'var(--text-white)', marginBottom: '16px' }}>{t('productDetails.leaveReview')}</h4>
            {reviewErr && <span style={{ color: 'var(--error)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>{reviewErr}</span>}
            <form onSubmit={handleAddReview}>
              <FormInput label={t('productDetails.yourName')} id="rev-name" value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
              <FormInput label={t('productDetails.ratingScore')} id="rev-rating" type="select" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} options={[{ value: '5', label: t('productDetails.fiveStarsPerfect') }, { value: '4', label: t('productDetails.fourStarsGood') }, { value: '3', label: t('productDetails.threeStarsNeutral') }, { value: '2', label: t('productDetails.twoStarsPoor') }, { value: '1', label: t('productDetails.oneStarTerrible') }]} />
              <FormInput label={t('productDetails.reviewFeedback')} id="rev-text" type="textarea" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              <Button type="submit" variant="lime"><MessageSquare size={16} />{t('productDetails.submitReview')}</Button>
            </form>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={styles.sectionTitle}>{t('productDetails.similarProducts')}</h3>
          <div style={styles.relatedGrid}>
            {related.map((item) => (
              <div key={item.id} style={styles.relatedCard} className="card" onClick={() => { navigate(`/catalog/${item.id}`); setQty(1); }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}><ImageWithFallback src={item.image || item.imageUrl} alt={item.name} category={item.category} style={{ width: '100%', height: '100%' }} /></div>
                <div style={{ flex: 1 }}><h4 style={styles.relatedName}>{item.name}</h4><span style={styles.relatedPrice}>{formatCurrency(item.price)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--accent-lime)', marginBottom: '32px', fontWeight: '600' },
  grid: { display: 'flex', gap: '48px', flexWrap: 'wrap' },
  imageCol: { flex: '1 0 350px' },
  imageWrapper: { backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-lg)', height: '400px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' },
  infoCol: { flex: '1.2 0 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  category: { fontSize: '12px', fontWeight: '700', color: 'var(--accent-lime)', letterSpacing: '1.5px', marginBottom: '8px' },
  title: { fontSize: '36px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-white)' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  stars: { display: 'flex', gap: '4px' },
  ratingVal: { fontSize: '14px', fontWeight: '700', color: 'var(--text-white)' },
  reviewsCount: { fontSize: '13px', color: 'var(--text-muted)' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' },
  price: { fontSize: '28px', fontWeight: '800', color: 'var(--accent-lime)', fontFamily: 'var(--font-headings)' },
  desc: { color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' },
  divider: { height: '1px', backgroundColor: 'var(--border-green)', margin: '24px 0' },
  botanicalSpecs: { display: 'flex', flexDirection: 'column', gap: '12px' },
  specsTitle: { fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-white)', marginBottom: '8px' },
  specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  specItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  specLabel: { display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' },
  specVal: { fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' },
  cartActions: { display: 'flex', gap: '16px', marginTop: '12px' },
  qtyControl: { display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' },
  qtyBtn: { width: '40px', height: '100%', border: 'none', background: 'none', color: 'var(--text-white)', fontSize: '18px', cursor: 'pointer', transition: 'var(--transition)' },
  qtyVal: { width: '32px', textAlign: 'center', fontWeight: '700', color: 'var(--text-white)' },
  sectionsLayout: { display: 'flex', gap: '32px', marginTop: '64px', flexWrap: 'wrap' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '16px' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' },
  reviewItem: { borderBottom: '1px solid var(--border-green)', paddingBottom: '16px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  reviewText: { color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' },
  addReviewForm: { backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-md)', padding: '24px' },
  relatedGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  relatedCard: { display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '12px 16px' },
  relatedName: { fontSize: '15px', color: 'var(--text-white)', margin: 0 },
  relatedPrice: { fontSize: '13px', color: 'var(--accent-lime)', fontWeight: '700' },
};
