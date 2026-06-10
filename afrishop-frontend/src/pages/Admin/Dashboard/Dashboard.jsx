import { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUiStore } from '../../../store/uiStore';
import styles from './Dashboard.module.css';

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function Dashboard() {
  useDocumentTitle('Admin — Dashboard');

  const showToast = useUiStore(st => st.showToast);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    adminApi.stats()
      .then(data => {
        if (cancelled) return;
        setStats(data);
      })
      .catch(err => {
        if (cancelled) return;
        showToast(err.message || 'Erreur lors du chargement des statistiques');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [showToast]);

  if (loading) {
    return <div className={styles.loading}>Chargement…</div>;
  }

  if (!stats) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tableau de bord</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Produits</div>
          <div className={styles.cardValue}>{stats.totalProducts}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Commandes</div>
          <div className={styles.cardValue}>{stats.totalOrders}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Revenus (€)</div>
          <div className={styles.cardValue}>{stats.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</div>
        </div>
        <div className={`${styles.card} ${stats.outOfStock > 0 ? styles.cardAlert : ''}`}>
          <div className={styles.cardLabel}>Ruptures de stock</div>
          <div className={styles.cardValue}>{stats.outOfStock}</div>
        </div>
      </div>

      {stats.lowStock?.length > 0 && (
        <div className={styles.alertBox}>
          <div className={styles.alertTitle}>Stock faible (1–5 unités)</div>
          <ul className={styles.alertList}>
            {stats.lowStock.map(p => (
              <li key={p.id} className={styles.alertItem}>
                <span>{p.name}</span>
                <span className={styles.alertStock}>{p.stock} restant{p.stock > 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Dernières commandes</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id}</td>
                  <td>
                    <div className={styles.clientName}>{order.user?.fullName ?? '—'}</div>
                    <div className={styles.clientEmail}>{order.user?.email ?? ''}</div>
                  </td>
                  <td className={styles.amount}>{order.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge_' + order.status]}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className={styles.date}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>Aucune commande</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
