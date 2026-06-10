import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../../services/api';
import { useProducts } from '../../hooks/useProducts';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUiStore } from '../../store/uiStore';
import ProductCard from '../../components/ProductCard/ProductCard';
import { SkeletonGrid } from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import s from './ProductDetail.module.css';


function RelatedProducts({ category, currentId }) {
  const { products, loading } = useProducts({ category, limit: 5 });
  const related = products.filter(p => p.id !== Number(currentId)).slice(0, 4);
  if (loading) return <div className={s.relatedGrid}><SkeletonGrid count={4} /></div>;
  if (related.length === 0) return null;
  return (
    <section className={s.related}>
      <h2 className={s.relatedTitle}>Vous aimerez aussi</h2>
      <div className={s.relatedGrid}>
        {related.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  // Component remounts on id change (key={id} in App.jsx) — initial state is always fresh
  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [selectedSize,  setSelectedSize]  = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty,           setQty]           = useState(1);

  const addItem   = useCartStore(st => st.addItem);
  const toggle    = useWishlistStore(st => st.toggle);
  const wished    = useWishlistStore(st => st.has(product?.id));
  const showToast = useUiStore(st => st.showToast);

  useDocumentTitle(product?.name ?? null);

  useEffect(() => {
    let cancelled = false;
    productsApi.get(id)
      .then(res  => { if (!cancelled) { setProduct(res.data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setLoading(false); if (err.status === 404) setNotFound(true); } });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--muted)', fontSize: '2rem' }}>
        🌍
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <div>Produit introuvable.</div>
        <button className="btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/catalog')}>
          Retour au catalogue
        </button>
      </div>
    );
  }


  function handleAddToCart() {
    if (product.sizes.length > 1 && !selectedSize) {
      showToast('⚠️ Sélectionnez une taille');
      return;
    }
    if (product.stock === 0) {
      showToast('⚠️ Rupture de stock');
      return;
    }
    const color  = product.colors?.[selectedColor] ?? null;
    const added  = addItem(product, selectedSize, qty, color);
    if (added === 0) {
      showToast(`⚠️ Stock limité — ${product.stock} en stock`);
    } else {
      showToast(`✓ ${added}× ${product.name} ajouté au panier`);
    }
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.grid}>
          {/* Gallery */}
          <div className={s.gallery}>
            <div className={s.mainImg}>
              {product.image
                ? <img src={product.image} alt={product.name} className={s.mainImgPhoto} />
                : <div className={s.mainImgPlaceholder}>🛍️</div>
              }
            </div>
          </div>

          {/* Info */}
          <div>
            <button className={s.backBtn} onClick={() => navigate(-1)}>← Retour</button>

            <div className={s.cat}>{product.category}</div>
            <div className={s.title}>{product.name}</div>

            <div className={s.stars}>
              <span className={s.starsIcons}>
                {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              </span>
              <span className={s.reviewsLbl}>{product.rating} · {product.reviews} avis</span>
            </div>

            <div>
              <span className={s.price}>{Number(product.price).toFixed(2)}€</span>
              {product.oldPrice && <span className={s.priceOld}>{Number(product.oldPrice).toFixed(2)}€</span>}
            </div>

            <p className={s.desc}>{product.description}</p>

            <div className={s.label}>Couleur</div>
            <div className={s.colorOpts}>
              {product.colors.map((c, i) => (
                <div
                  key={i}
                  className={`${s.swatch} ${selectedColor === i ? s.active : ''}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(i)}
                />
              ))}
            </div>

            <div className={s.label}>Taille</div>
            <div className={s.sizeOpts}>
              {product.sizes.map(sz => (
                <button
                  key={sz}
                  className={`${s.sizeBtn} ${selectedSize === sz ? s.active : ''}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className={s.qtyRow}>
              <div className={s.label} style={{ margin: 0 }}>Qté</div>
              <div className={s.qtyCtrl}>
                <button className={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className={s.qtyVal}>{qty}</span>
                <button className={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <div className={s.stockWarn}>⚡ Plus que {product.stock} en stock !</div>
            )}

            <div className={s.actions}>
              <button className={s.cartBtn} onClick={handleAddToCart}>🛒 Ajouter au panier</button>
              <button
                className={s.wishBtn}
                onClick={() => {
                  toggle(product.id);
                  showToast(wished ? 'Retiré des favoris' : '❤️ Ajouté aux favoris');
                }}
              >
                {wished ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <RelatedProducts category={product.category} currentId={id} />
      <Footer />
    </>
  );
}
