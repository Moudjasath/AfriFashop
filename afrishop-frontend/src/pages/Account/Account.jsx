import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore }    from '../../store/authStore';
import { useCartStore }    from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { authApi, ordersApi } from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Footer from '../../components/Footer/Footer';
import s from './Account.module.css';

export default function Account() {
  useDocumentTitle('Mon Compte');
  const navigate   = useNavigate();
  const user       = useAuthStore(st => st.user);
  const logout     = useAuthStore(st => st.logout);
  const cartCount  = useCartStore(st => st.items.reduce((n, i) => n + i.qty, 0));
  const wishCount  = useWishlistStore(st => st.ids.length);

  const [editing,     setEditing]     = useState(false);
  const [fullName,    setFullName]     = useState(user?.fullName ?? '');
  const [saving,      setSaving]       = useState(false);
  const [feedback,    setFeedback]     = useState(null);
  const [orderCount,  setOrderCount]   = useState(null); // null = loading

  // All hooks before early return — fetch order count once
  useEffect(() => {
    if (!user) { navigate('/'); return; }
    ordersApi.list()
      .then(res => setOrderCount(res.total ?? res.data?.length ?? 0))
      .catch(() => setOrderCount(0));
  }, [user, navigate]);

  if (!user) return null;

  const initial = user.fullName?.charAt(0).toUpperCase() ?? '?';

  async function handleSave() {
    if (!fullName.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await authApi.updateProfile({ fullName: fullName.trim() });
      // Use the returned user from the API to update the store
      const updatedUser = res.user ?? { ...user, fullName: fullName.trim() };
      useAuthStore.setState(s => ({ user: { ...s.user, ...updatedUser } }));
      setFeedback({ type: 'ok', msg: 'Profil mis à jour ✓' });
      setEditing(false);
    } catch (err) {
      setFeedback({ type: 'err', msg: err.message || 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.tag}>Mon Espace</div>
          <div className={s.title}>Mon Compte</div>
        </div>

        {/* Profile card */}
        <div className={s.card}>
          <div className={s.avatarBand} />
          <div className={s.avatarWrap}>
            <div className={s.avatar}>{initial}</div>
            <div className={s.userInfo}>
              <div className={s.userName}>{user.fullName}</div>
              <div className={s.userEmail}>{user.email}</div>
            </div>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <div className={s.statNum}>{cartCount}</div>
              <div className={s.statLbl}>Panier</div>
            </div>
            <div className={s.stat}>
              <div className={s.statNum}>{wishCount}</div>
              <div className={s.statLbl}>Wishlist</div>
            </div>
            <div className={s.stat}>
              <div className={s.statNum}>{orderCount === null ? '…' : orderCount}</div>
              <div className={s.statLbl}>Commandes</div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Informations personnelles</div>

          <div className={s.field}>
            <div className={s.label}>Nom complet</div>
            <input
              className={s.input}
              value={editing ? fullName : user.fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={!editing}
            />
          </div>

          <div className={s.field}>
            <div className={s.label}>Email</div>
            <input className={s.input} value={user.email} disabled />
          </div>

          {feedback && (
            <div className={feedback.type === 'ok' ? s.success : s.error}>{feedback.msg}</div>
          )}

          <div className={s.row}>
            {editing ? (
              <>
                <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
                <button
                  className={s.cancelBtn}
                  onClick={() => { setEditing(false); setFullName(user.fullName); setFeedback(null); }}
                >
                  Annuler
                </button>
              </>
            ) : (
              <button className={s.saveBtn} onClick={() => setEditing(true)}>
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Accès rapide</div>
          <div className={s.row}>
            <button className={s.saveBtn} onClick={() => navigate('/orders')}>📦 Mes commandes</button>
            <button className={s.saveBtn} onClick={() => navigate('/wishlist')}>❤️ Ma wishlist</button>
          </div>
        </div>

        {/* Logout */}
        <div className={s.section}>
          <div className={s.sectionTitle}>Session</div>
          <button
            style={{ padding: '10px 24px', background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '.85rem' }}
            onClick={handleLogout}
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
