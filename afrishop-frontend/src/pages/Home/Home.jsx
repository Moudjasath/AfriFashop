import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CATEGORIES } from '../../data/products';
import ProductCard from '../../components/ProductCard/ProductCard';
import { SkeletonGrid } from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import s from './Home.module.css';

const FEATURED_PARAMS = { limit: 4, sort: 'rating', order: 'DESC' };

export default function Home() {
  useDocumentTitle('Accueil');
  const navigate = useNavigate();
  const { products, loading } = useProducts(FEATURED_PARAMS);

  function filterAndGo(cat) {
    navigate(`/catalog?cat=${cat}`);
  }

  return (
    <>
      {/* ── HERO ── */}
      <div className={`${s.hero} kente-pattern`}>
        <div className={s.heroLeft}>
          <div className={s.heroTag}>✦ New Collection 2025</div>
          <h1 className={s.heroTitle}>
            Wear the<br />
            <span className="italic">Soul</span> of<br />
            <span className="underlineGold">Africa</span>
          </h1>
          <p className={s.heroDesc}>
            Discover authentic African wax prints, hand-crafted garments and contemporary fashion
            rooted in the rich textile traditions of West Africa.
          </p>
          <div className={s.heroCtas}>
            <button className="btn-gold" onClick={() => navigate('/catalog')}>Explore Collection →</button>
            <button className="btn-outline">Our Story</button>
          </div>
          <div className={s.heroStats}>
            <div className={s.heroStat}><div className="num">200+</div><div className="lbl">Unique Designs</div></div>
            <div className={s.heroStat}><div className="num">15</div><div className="lbl">African Countries</div></div>
            <div className={s.heroStat}><div className="num">5k+</div><div className="lbl">Happy Clients</div></div>
          </div>
        </div>

        <div className={s.heroRight}>
          <div className={s.heroImgWrap}>
            <div className={s.heroImgPattern} />
            <div className={s.heroImgCenter}>
              <div className="big">🪭</div>
              <div className="label">Wax &amp; Fashion</div>
            </div>
          </div>
          <div className={s.heroBadge}>
            <div className="icon">🌍</div>
            <div>
              <div className="title">Ethically Sourced</div>
              <div className="sub">From 15 African artisans</div>
            </div>
          </div>
          <div className={s.heroBadge2}>✦ Free Shipping over 50€</div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className={s.catSection}>
        <div className={s.catInner}>
          <div className={s.catHeader}>
            <div>
              <div className="section-tag">Browse by Category</div>
              <h2 className="section-title" style={{ color: 'var(--cream)' }}>Shop by Style</h2>
            </div>
            <button
              className="btn-outline"
              style={{ color: 'var(--cream)', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => navigate('/catalog')}
            >
              View All →
            </button>
          </div>

          <div className={s.catGrid}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.key}
                className={`${s.catCard} ${s[cat.colorClass]}`}
                onClick={() => filterAndGo(cat.key)}
              >
                <div className={s.catIcon}>{cat.icon}</div>
                <div className={s.catName}>{cat.label}</div>
                <div className={s.catCount}>{cat.count} items</div>
                <div className={s.catArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <div className={s.featuredSection}>
        <div className={s.sectionHeader}>
          <div>
            <div className="section-tag">Featured Collection</div>
            <h2 className="section-title">Trending Now</h2>
          </div>
          <button className="btn-outline" onClick={() => navigate('/catalog')}>View All Products →</button>
        </div>
        <div className={s.productsGrid}>
          {loading
            ? <SkeletonGrid count={4} />
            : products.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className={s.banner}>
        <div className={s.bannerText}>
          <div className="section-tag">✦ Special Offer</div>
          <div className={s.bannerTitle}>New Season,<br />New Wax Prints</div>
          <p className={s.bannerDesc}>
            Explore our latest collection of vibrant wax prints and contemporary African fashion.
            Free shipping on orders above 50€.
          </p>
          <button className="btn-gold" onClick={() => navigate('/catalog')}>Discover Collection →</button>
        </div>
        <div className={s.bannerRight}>
          <div className={s.bannerCircle}>🪭</div>
        </div>
      </div>

      <Footer />
    </>
  );
}
