import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ordersApi }    from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Footer from '../../components/Footer/Footer';
import s from './Orders.module.css';

const STATUS_STEPS  = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS  = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '🎉', cancelled: '❌' };
const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function OrderDetail() {
  useDocumentTitle(null); // updated dynamically once order loads
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = useAuthStore(st => st.user);

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  // All hooks run unconditionally — redirect inside effect
  useEffect(() => {
    if (!user) { navigate('/'); return; }
    let cancelled = false;
    ordersApi.get(id)
      .then(res  => { if (!cancelled) setOrder(res.data); })
      .catch(err => { if (!cancelled && err.status === 404) setMissing(true); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, user, navigate]);

  if (!user) return null;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.5rem', color: 'var(--muted)' }}>🌍</div>;
  }

  if (missing || !order) {
    return (
      <div className={s.empty} style={{ margin: '4rem auto', maxWidth: 500 }}>
        <div className={s.emptyIcon}>😕</div>
        <div className={s.emptyTitle}>Commande introuvable</div>
        <button className="btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/orders')}>
          ← Mes commandes
        </button>
      </div>
    );
  }

  const stepIndex   = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const addr        = order.shippingAddress ?? {};

  return (
    <>
      <div className={s.page}>
        <button className={s.backBtn} onClick={() => navigate('/orders')}>← Mes commandes</button>

        <div className={s.header} style={{ marginTop: '1rem' }}>
          <div className={s.tag}>Commande #{order.id}</div>
          <div className={s.title} style={{ fontSize: '1.6rem' }}>
            {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
          </div>
        </div>

        {!isCancelled && (
          <div className={s.steps}>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`${s.step} ${i <= stepIndex ? s.stepDone : ''}`}>
                <div className={s.stepDot}>{i <= stepIndex ? '✓' : i + 1}</div>
                <div className={s.stepLabel}>{STATUS_LABELS[step]}</div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`${s.stepLine} ${i < stepIndex ? s.stepLineDone : ''}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={s.detailGrid}>
          <div className={s.detailCard}>
            <div className={s.cardTitle}>Articles commandés</div>
            {order.items.map(item => (
              <div key={item.id} className={s.detailItem}>
                <div className={s.detailEmoji}>{item.emoji}</div>
                <div className={s.detailInfo}>
                  <div className={s.detailName}>{item.productName}</div>
                  <div className={s.detailMeta}>
                    {item.color && <span className={s.colorDot} style={{ background: item.color }} />}
                    {item.size  && <span>Taille {item.size}</span>}
                    <span>× {item.qty}</span>
                  </div>
                </div>
                <div className={s.detailPrice}>{(item.price * item.qty).toFixed(2)}€</div>
              </div>
            ))}
            <div className={s.detailTotal}>
              <span>Total payé</span>
              <span>{Number(order.total).toFixed(2)}€</span>
            </div>
          </div>

          <div className={s.detailCard}>
            <div className={s.cardTitle}>📦 Adresse de livraison</div>
            <div className={s.addrBlock}>
              <div>{addr.firstName} {addr.lastName}</div>
              <div>{addr.address}</div>
              <div>{addr.zipCode} {addr.city}</div>
              <div>{addr.country}</div>
              {addr.phone && <div style={{ marginTop: '4px', color: 'var(--muted)' }}>{addr.phone}</div>}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--muted)' }}>
              Commandé le {order.createdAt?.slice(0, 10)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
