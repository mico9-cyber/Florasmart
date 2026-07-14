import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { Star, ShoppingCart, Info, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import ImageWithFallback from './ImageWithFallback';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { addToCart } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(product, 1);
    if (!result?.ok) {
      window.alert(result?.error || 'Unable to add item to cart.');
    }
  };

  return (
    <div className="card" style={styles.card} onClick={() => navigate(`/catalog/${product.id}`)}>
      {product.isAIRecommended && (
        <div style={styles.aiBadge}>
          <Sparkles size={12} color="var(--bg-darker)" />
          <span>AI Rec</span>
        </div>
      )}
      <div style={styles.imageContainer}>
        <ImageWithFallback src={product.image || product.imageUrl} alt={product.name} category={product.category} fallbackSrc={product.imageUrl} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
      </div>
      <div style={styles.info}>
        <span style={styles.category}>{product.category.toUpperCase()}</span>
        <h4 style={styles.title}>{product.name}</h4>
        <div style={styles.ratingRow}>
          <div style={styles.stars}>
            <Star size={14} fill="var(--btn-yellow)" color="var(--btn-yellow)" />
            <span style={styles.ratingText}>{product.rating}</span>
          </div>
          <span style={styles.reviews}>({product.reviews} reviews)</span>
        </div>
        <div style={styles.priceRow}>
          <span style={styles.price}>{formatCurrency(product.price)}</span>
          <span style={{ ...styles.stock, color: product.stock > 5 ? 'var(--text-muted)' : product.stock > 0 ? 'var(--warning)' : 'var(--error)' }}>
            {product.stock > 5 ? `${product.stock} in stock` : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
          </span>
        </div>
        <div style={styles.actions}>
          <button className="btn btn-secondary" style={styles.detailBtn} onClick={(e) => { e.stopPropagation(); navigate(`/catalog/${product.id}`); }}>
            <Info size={16} />
            <span>Details</span>
          </button>
          <button className="btn btn-primary" style={styles.cartBtn} onClick={handleAddToCart} disabled={product.stock <= 0}>
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' },
  aiBadge: { position: 'absolute', top: '12px', left: '12px', backgroundColor: 'var(--accent-lime)', color: 'var(--bg-darker)', padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2, boxShadow: '0 2px 8px rgba(132, 204, 22, 0.3)' },
  imageContainer: { backgroundColor: 'var(--bg-darker)', borderRadius: 'var(--radius-md)', height: '160px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border-green)', position: 'relative' },
  info: { display: 'flex', flexDirection: 'column', flex: 1 },
  category: { fontSize: '11px', fontWeight: '700', color: 'var(--accent-lime)', letterSpacing: '1px', marginBottom: '4px' },
  title: { fontSize: '17px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '6px', lineHeight: '1.3' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  stars: { display: 'flex', alignItems: 'center', gap: '4px' },
  ratingText: { fontSize: '13px', fontWeight: '700', color: 'var(--text-white)' },
  reviews: { fontSize: '12px', color: 'var(--text-muted)' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '16px' },
  price: { fontSize: '20px', fontWeight: '800', color: 'var(--text-white)', fontFamily: 'var(--font-headings)' },
  stock: { fontSize: '12px', fontWeight: '600' },
  actions: { display: 'flex', gap: '8px' },
  detailBtn: { flex: 1, padding: '8px 12px', fontSize: '13px' },
  cartBtn: { flex: 1.2, padding: '8px 12px', fontSize: '13px' },
};
