import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ordersApi }    from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Footer from '../../components/Footer/Footer';
import s from './Orders.module.css';

const STATUS_LABELS = {
  pending:   { label: 'En attente',  cls: s.badgePending },
  confirmed: { label: 'Confirmée',   cls: s.badgeShipped },
  shipped:   { label: 'Expédiée',    cls: s.badgeShipped },
  delivered: { label: 'Livrée',      cls: s.badgeDelivered },
  cancelled: { label: 'Annulée',     cls: s.badgePending },
};

export default function Orders() {
  useDocumentTitle('Mes Commandes');
  const navigate = useNavigate();
  const user     = useAuthStore(st => st.user);

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  // All hooks must run unconditionally — redirect inside effect
  useEffect(() => {
    if (!user) { navigate('/'); return; }
    ordersApi.list()
      .then(res => setOrders(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.tag}>Mon Espace</div>
          <div className={s.title}>Mes Commandes</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '1.5rem' }}>🌍</div>
        ) : orders.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📦</div>
            <div className={s.emptyTitle}>Aucune commande pour le moment</div>
            <div className={s.emptyDesc}>Vos commandes apparaîtront ici dès votre premier achat.</div>
            <button className="btn-gold" onClick={() => navigate('/catalog')}>
              Découvrir le catalogue →
            </button>
          </div>
        ) : (
          <div>
            {orders.map(order => {
              const badge = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
              return (
                <div
                  key={order.id}
                  className={s.orderCard}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className={s.orderLeft}>
                    <div className={s.orderId}>Commande #{order.id}</div>
                    <div className={s.orderName}>
                      {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''} · {order.shippingAddress?.city ?? ''}
                    </div>
                    <div className={s.orderMeta}>{order.createdAt?.slice(0, 10)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--night)' }}>
                      {Number(order.total).toFixed(2)}€
                    </span>
                    <span className={`${s.badge} ${badge.cls}`}>{badge.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
