import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../services/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { useDebounce } from '../../../hooks/useDebounce';
import s from './AdminUsers.module.css';

export default function AdminUsers() {
  useDocumentTitle('Admin — Utilisateurs');

  const currentUser = useAuthStore(st => st.user);
  const showToast   = useUiStore(st => st.showToast);

  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(null); // id en cours de modification

  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);

    const params = { page, limit: 20 };
    if (debouncedSearch) params.search = debouncedSearch;

    adminApi.users(params)
      .then(res => {
        if (cancelled) return;
        setUsers(res.data ?? []);
        setTotal(res.pagination?.total ?? 0);
        setPages(res.pagination?.pages ?? 1);
      })
      .catch(err => { if (!cancelled) showToast(err.message || 'Erreur chargement utilisateurs'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, showToast]);

  useEffect(load, [load]);

  // Réinitialiser la page quand la recherche change
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  async function handleRole(user, action) {
    setActing(user.id);
    try {
      const res = await adminApi.updateUserRole(user.id, action);
      setUsers(prev => prev.map(u => u.id === user.id ? res.user : u));
      showToast(action === 'promote'
        ? `✓ ${user.fullName} est maintenant administrateur`
        : `${user.fullName} n'est plus administrateur`
      );
    } catch (err) {
      showToast(err.message || 'Erreur lors de la modification du rôle');
    } finally {
      setActing(null);
    }
  }

  const isAdmin = (user) => user.roles?.includes('ROLE_ADMIN');
  const isMe    = (user) => user.id === currentUser?.id;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Utilisateurs <span className={s.count}>({total})</span></h1>
        <input
          className={s.search}
          type="text"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Inscrit le</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={s.empty}>Chargement…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className={s.empty}>Aucun utilisateur trouvé</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className={isMe(user) ? s.rowMe : ''}>
                <td>
                  <div className={s.userCell}>
                    <div className={s.avatar}>
                      {user.fullName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <span className={s.fullName}>
                      {user.fullName}
                      {isMe(user) && <span className={s.meTag}>vous</span>}
                    </span>
                  </div>
                </td>
                <td className={s.email}>{user.email}</td>
                <td>
                  <span className={`${s.badge} ${isAdmin(user) ? s.badgeAdmin : s.badgeUser}`}>
                    {isAdmin(user) ? 'Admin' : 'Client'}
                  </span>
                </td>
                <td className={s.date}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td>
                  {isMe(user) ? (
                    <span className={s.selfNote}>—</span>
                  ) : isAdmin(user) ? (
                    <button
                      className={s.btnRevoke}
                      disabled={acting === user.id}
                      onClick={() => {
                        if (window.confirm(`Révoquer les droits admin de ${user.fullName} ?`))
                          handleRole(user, 'revoke');
                      }}
                    >
                      {acting === user.id ? '…' : 'Révoquer admin'}
                    </button>
                  ) : (
                    <button
                      className={s.btnPromote}
                      disabled={acting === user.id}
                      onClick={() => handleRole(user, 'promote')}
                    >
                      {acting === user.id ? '…' : 'Promouvoir admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className={s.pagination}>
          <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            ← Précédent
          </button>
          <span className={s.pageInfo}>Page {page} / {pages}</span>
          <button className={s.pageBtn} disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
