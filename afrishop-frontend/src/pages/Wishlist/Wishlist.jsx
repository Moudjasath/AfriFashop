import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useWishlistStore } from '../../store/wishlistStore';
import { productsApi } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import { SkeletonGrid } from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import s from './Wishlist.module.css';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const navigate  = useNavigate();
  const ids      = useWishlistStore(st => st.ids);
  const clearAll = useWishlistStore(st => st.clearAll);

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const idsKey = ids.join(',');

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all(ids.map(id => productsApi.get(id).then(r => r.data).catch(() => null)))
      .then(results => { if (!cancelled) setProducts(results.filter(Boolean)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <>
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.left}>
            <div className={s.tag}>Ma Liste</div>
            <div className={s.title}>Wishlist ❤️</div>
          </div>
          {ids.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={s.count}>{ids.length} article{ids.length > 1 ? 's' : ''}</span>
              <button className={s.clearBtn} onClick={clearAll}>Tout supprimer</button>
            </div>
          )}
        </div>

        {ids.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🤍</div>
            <div className={s.emptyTitle}>Votre wishlist est vide</div>
            <div className={s.emptyDesc}>Ajoutez des articles que vous aimez pour les retrouver ici.</div>
            <button className="btn-gold" onClick={() => navigate('/catalog')}>Explorer le catalogue →</button>
          </div>
        ) : (
          <div className={s.grid}>
            {loading ? <SkeletonGrid count={ids.length} /> : products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
