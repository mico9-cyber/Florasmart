import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppData';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { Search, SlidersHorizontal, Leaf, Flower2, Archive } from 'lucide-react';

export default function ProductCatalogPage() {
  const { products } = useContext(AppContext);
  const addToast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam === 'plants' || categoryParam === 'flowers' || categoryParam === 'vases') {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const isLoading = !Array.isArray(products);

  if (isLoading) return <LoadingSpinner text="Loading catalog..." />;

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div style={styles.container} className="container">
      <div style={styles.header}>
        <h1 style={styles.title}>Product Catalog</h1>
        <p style={styles.subtitle}>Browse live FloraSmart products from the backend catalog.</p>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchContainer}>
          <Search size={18} color="var(--text-muted)" style={styles.searchIcon} />
          <input type="text" placeholder="Search catalog" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
        </div>
        <div style={styles.sortContainer}>
          <SlidersHorizontal size={16} color="var(--text-muted)" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.selectInput}>
            <option value="rating">Sort by: Top Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div style={styles.tabsRow}>
        <button onClick={() => setSelectedCategory('all')} style={{ ...styles.tab, backgroundColor: selectedCategory === 'all' ? 'var(--accent-lime)' : 'var(--bg-card)', color: selectedCategory === 'all' ? 'var(--bg-darker)' : 'var(--text-light)', borderColor: selectedCategory === 'all' ? 'var(--accent-lime)' : 'var(--border-green)' }}><Archive size={16} /><span>All Items</span></button>
        <button onClick={() => setSelectedCategory('plants')} style={{ ...styles.tab, backgroundColor: selectedCategory === 'plants' ? 'var(--accent-lime)' : 'var(--bg-card)', color: selectedCategory === 'plants' ? 'var(--bg-darker)' : 'var(--text-light)', borderColor: selectedCategory === 'plants' ? 'var(--accent-lime)' : 'var(--border-green)' }}><Leaf size={16} /><span>Plants</span></button>
        <button onClick={() => setSelectedCategory('flowers')} style={{ ...styles.tab, backgroundColor: selectedCategory === 'flowers' ? 'var(--accent-lime)' : 'var(--bg-card)', color: selectedCategory === 'flowers' ? 'var(--bg-darker)' : 'var(--text-light)', borderColor: selectedCategory === 'flowers' ? 'var(--accent-lime)' : 'var(--border-green)' }}><Flower2 size={16} /><span>Flowers</span></button>
        <button onClick={() => setSelectedCategory('vases')} style={{ ...styles.tab, backgroundColor: selectedCategory === 'vases' ? 'var(--accent-lime)' : 'var(--bg-card)', color: selectedCategory === 'vases' ? 'var(--bg-darker)' : 'var(--text-light)', borderColor: selectedCategory === 'vases' ? 'var(--accent-lime)' : 'var(--border-green)' }}><span>Vases</span></button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid-cols-4" style={styles.grid}>
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="card" style={styles.emptyCard}>
          <Search size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-white)', marginTop: '16px' }}>No products found.</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Try a different search term or category.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' },
  toolbar: { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' },
  searchContainer: { position: 'relative', flex: '1 0 280px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: { width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-green)', color: 'var(--text-white)', fontSize: '14px', outline: 'none', transition: 'var(--transition)' },
  sortContainer: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', padding: '0 12px', minWidth: '180px' },
  selectInput: { backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', color: 'var(--text-white)', fontSize: '14px', fontWeight: '600', padding: '8px 12px', outline: 'none', cursor: 'pointer' },
  tabsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' },
  tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-green)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' },
  grid: { marginTop: '16px' },
  emptyCard: { textAlign: 'center', padding: '64px 24px' },
};
