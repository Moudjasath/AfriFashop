import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const user     = useAuthStore(st => st.user);
  const logout   = useAuthStore(st => st.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user?.roles?.includes('ROLE_ADMIN')) return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.dot} />
          AfriFashop Admin
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Tableau de bord
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Produits
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Commandes
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Utilisateurs
          </NavLink>
        </nav>

        <div className={styles.bottom}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            Retour à la boutique
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
