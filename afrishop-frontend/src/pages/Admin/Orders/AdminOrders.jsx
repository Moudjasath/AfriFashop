import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../services/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminOrders.module.css';

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const TABS = [
  { key: '',          label: 'Toutes' },
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'shipped',   label: 'Expédiée' },
  { key: 'delivered', label: 'Livrée' },
  { key: 'cancelled', label: 'Annulée' },
];

const PAGE_SIZE = 20;

export default function AdminOrders() {
  useDocumentTitle('Admin — Commandes');

  const showToast = useUiStore(st => st.showToast);

  const [activeTab, setActiveTab]   = useState('');
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(() => {
    let cancelled = false;
    setLoading(true);

    const params = { page, limit: PAGE_SIZE };
    if (activeTab) params.status = activeTab;

    adminApi.orders(params)
      .then(res => {
        if (cancelled) return;
        setOrders(res.data ?? []);
        setPagination(res.pagination ?? null);
      })
      .catch(err => {
        if (cancelled) return;
        showToast(err.message || 'Erreur lors du chargement des commandes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeTab, page, showToast]);

  useEffect(() => {
    const cleanup = fetchOrders();
    return cleanup;
  }, [fetchOrders]);

  function handleTabChange(key) {
    setActiveTab(key);
    setPage(1);
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => o.id === orderId ? res.data : o)
      );
      showToast('Statut mis à jour');
    } catch (err) {
      showToast(err.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Commandes</h1>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement…</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className={styles.orderId}>#{order.id}</td>
                    <td>
                      <div className={styles.clientName}>{order.user?.fullName ?? '—'}</div>
                      <div className={styles.clientEmail}>{order.user?.email ?? ''}</div>
                    </td>
                    <td className={styles.itemsCount}>
                      {order.items?.length ?? 0} article{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </td>
                    <td className={styles.total}>
                      {Number(order.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td>
                      <select
                        className={`${styles.statusSelect} ${styles['status_' + order.status]}`}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.date}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.empty}>Aucune commande trouvée</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Précédent
              </button>
              <span className={styles.pageInfo}>
                Page {page} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
