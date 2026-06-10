import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore }    from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUiStore }      from '../../store/uiStore';
import { useAuthStore }    from '../../store/authStore';
import s from './Navbar.module.css';

const LINKS = [
  { label: 'Accueil',     path: '/' },
  { label: 'Catalogue',   path: '/catalog' },
  { label: 'Collections', path: '/collections' },
  { label: 'À propos',    path: '/about' },
];

export default function Navbar() {
  const navigate      = useNavigate();
  const { pathname }  = useLocation();
  const count         = useCartStore(st => st.items.reduce((s, i) => s + i.qty, 0));
  const wishCount     = useWishlistStore(st => st.ids.length);
  const toggleCart    = useUiStore(st => st.toggleCart);
  const openAuth      = useUiStore(st => st.openAuth);
  const showToast     = useUiStore(st => st.showToast);
  const user          = useAuthStore(st => st.user);
  const logout        = useAuthStore(st => st.logout);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const menuRef   = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    showToast('À bientôt ! 👋');
    navigate('/');
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/catalog?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery('');
  }

  function openSearch() {
    setSearchOpen(true);
    // Focus the input on next tick
    setTimeout(() => searchRef.current?.querySelector('input')?.focus(), 50);
  }

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?';

  return (
    <nav className={s.nav}>
      <button className={s.logo} onClick={() => navigate('/')}>
        <div className={s.logoDot} />
        AfriShop
      </button>

      <div className={s.links}>
        {LINKS.map(l => (
          <button
            key={l.path}
            className={`${s.link} ${pathname === l.path ? s.active : ''}`}
            onClick={() => navigate(l.path)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className={s.right}>
        {/* Search */}
        <div className={s.searchWrap} ref={searchRef}>
          {searchOpen ? (
            <form className={s.searchForm} onSubmit={handleSearch}>
              <input
                className={s.searchInput}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un produit…"
                aria-label="Recherche"
              />
              <button type="submit" className={s.searchSubmit} aria-label="Lancer la recherche">🔍</button>
              <button type="button" className={s.searchClose} onClick={() => { setSearchOpen(false); setQuery(''); }}>✕</button>
            </form>
          ) : (
            <button className={s.iconBtn} onClick={openSearch} aria-label="Rechercher">🔍</button>
          )}
        </div>

        {/* Wishlist */}
        <button className={s.iconBtn} onClick={() => navigate('/wishlist')} aria-label="Favoris">
          {wishCount > 0 ? '❤️' : '🤍'}
          {wishCount > 0 && <span className={s.cartCount}>{wishCount}</span>}
        </button>

        {/* Cart */}
        <button className={s.iconBtn} onClick={toggleCart} aria-label="Panier">
          🛒
          {count > 0 && <span className={s.cartCount}>{count}</span>}
        </button>

        {/* Auth area */}
        {user ? (
          <div className={s.userWrap} ref={menuRef}>
            <button
              className={s.avatar}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Mon compte"
              aria-expanded={menuOpen}
            >
              {initial}
            </button>

            {menuOpen && (
              <div className={s.dropdown}>
                <div className={s.dropHeader}>
                  <div className={s.dropName}>{user.fullName}</div>
                  <div className={s.dropEmail}>{user.email}</div>
                </div>

                <button className={s.dropItem} onClick={() => { setMenuOpen(false); navigate('/account'); }}>
                  👤 Mon compte
                </button>
                <button className={s.dropItem} onClick={() => { setMenuOpen(false); navigate('/orders'); }}>
                  📦 Mes commandes
                </button>
                <button className={s.dropItem} onClick={() => { setMenuOpen(false); navigate('/wishlist'); }}>
                  ❤️ Ma wishlist {wishCount > 0 && `(${wishCount})`}
                </button>
                <button className={s.dropItem} onClick={() => { setMenuOpen(false); toggleCart(); }}>
                  🛒 Mon panier {count > 0 && `(${count})`}
                </button>

                <div className={s.dropDivider} />

                <button className={`${s.dropItem} ${s.danger}`} onClick={handleLogout}>
                  🚪 Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className={s.iconBtn} onClick={openAuth} aria-label="Connexion">👤</button>
            <button className="btn-primary" onClick={openAuth}>Connexion</button>
          </>
        )}
      </div>
    </nav>
  );
}
