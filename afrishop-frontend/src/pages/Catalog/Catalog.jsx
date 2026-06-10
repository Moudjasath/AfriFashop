import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import ProductCard from '../../components/ProductCard/ProductCard';
import { SkeletonGrid } from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import s from './Catalog.module.css';

const PILLS = [
  { label: 'Tout',            value: '' },
  { label: '👗 Robes',        value: 'Dresses' },
  { label: '👕 Hauts',        value: 'Tops' },
  { label: '👜 Accessoires',  value: 'Accessories' },
  { label: '🥻 Ensembles',    value: 'Sets' },
];

const SORT_MAP = {
  'default':    { sort: 'id',    order: 'ASC' },
  'price-asc':  { sort: 'price', order: 'ASC' },
  'price-desc': { sort: 'price', order: 'DESC' },
  'name':       { sort: 'name',  order: 'ASC' },
  'rating':     { sort: 'rating', order: 'DESC' },
};

export default function Catalog() {
  useDocumentTitle('Catalogue');
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cat,    setCat]    = useState(searchParams.get('cat')    || '');
  const [sort,   setSort]   = useState('default');
  const [page,   setPage]   = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const apiParams = useMemo(() => {
    const { sort: s, order } = SORT_MAP[sort] ?? SORT_MAP.default;
    const p = { page, limit: 12, sort: s, order };
    if (cat)            p.category = cat;
    if (debouncedSearch) p.search  = debouncedSearch;
    return p;
  }, [cat, debouncedSearch, sort, page]);

  const { products, pagination, loading, error } = useProducts(apiParams);

  function handleCatChange(val) {
    setCat(val);
    setPage(1);
    setSearchParams(val ? { cat: val } : {});
  }

  function handleSearch(val) {
    setSearch(val);
    setPage(1);
  }

  function handleSort(val) {
    setSort(val);
    setPage(1);
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.header}>
          <div className="section-tag">Nos produits</div>
          <h1 className="section-title">Catalogue complet</h1>
        </div>

        <div className={s.controls}>
          <div className={s.searchWrap}>
            <span style={{ color: 'var(--muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          <select className={s.select} value={cat} onChange={e => handleCatChange(e.target.value)}>
            <option value="">Toutes catégories</option>
            <option value="Dresses">Robes</option>
            <option value="Tops">Hauts</option>
            <option value="Accessories">Accessoires</option>
            <option value="Sets">Ensembles</option>
          </select>

          <select className={s.select} value={sort} onChange={e => handleSort(e.target.value)}>
            <option value="default">Tri : En vedette</option>
            <option value="price-asc">Prix : Croissant</option>
            <option value="price-desc">Prix : Décroissant</option>
            <option value="name">Nom A–Z</option>
            <option value="rating">Mieux notés</option>
          </select>

          {pagination && (
            <span className={s.resultsCount}>
              {pagination.total} produit{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className={s.pills}>
          {PILLS.map(pill => (
            <button
              key={pill.value}
              className={`${s.pill} ${cat === pill.value ? s.active : ''}`}
              onClick={() => handleCatChange(pill.value)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={s.error}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className={s.grid}>
          {loading ? (
            <SkeletonGrid count={12} />
          ) : products.length === 0 ? (
            <div className={s.empty}>
              <div className={s.icon}>🔍</div>
              <div>Aucun produit trouvé</div>
            </div>
          ) : (
            products.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className={s.pagination}>
            <button
              className={s.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Précédent
            </button>
            <span className={s.pageInfo}>
              Page {pagination.page} / {pagination.pages}
            </span>
            <button
              className={s.pageBtn}
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
