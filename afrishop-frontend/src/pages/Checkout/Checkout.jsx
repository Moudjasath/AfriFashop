import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useCartStore }  from '../../store/cartStore';
import { useAuthStore }  from '../../store/authStore';
import { useUiStore }    from '../../store/uiStore';
import { ordersApi }     from '../../services/api';
import Footer from '../../components/Footer/Footer';
import s from './Checkout.module.css';

const FIELDS = [
  { name: 'firstName', label: 'Prénom',      placeholder: 'Jean',        half: true },
  { name: 'lastName',  label: 'Nom',         placeholder: 'Dupont',      half: true },
  { name: 'address',   label: 'Adresse',     placeholder: '12 Rue des Acacias', half: false },
  { name: 'city',      label: 'Ville',       placeholder: 'Paris',       half: true },
  { name: 'zipCode',   label: 'Code postal', placeholder: '75001',       half: true },
  { name: 'country',   label: 'Pays',        placeholder: 'France',      half: false },
  { name: 'phone',     label: 'Téléphone',   placeholder: '+33 6 12 34 56 78', half: false },
];

const EMPTY_FORM = Object.fromEntries(FIELDS.map(f => [f.name, '']));

export default function Checkout() {
  useDocumentTitle('Finaliser la commande');
  const navigate   = useNavigate();
  const items      = useCartStore(st => st.items);
  const clearCart  = useCartStore(st => st.clearCart);
  const user       = useAuthStore(st => st.user);
  const openAuth   = useUiStore(st => st.openAuth);
  const showToast  = useUiStore(st => st.showToast);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalErr,  setGlobalErr]  = useState('');

  // Redirect if not logged in
  if (!user) {
    return (
      <div className={s.emptyState}>
        <div className={s.icon}>🔐</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--night)', marginBottom: '.5rem' }}>
          Connexion requise
        </div>
        <div style={{ fontSize: '.88rem', marginBottom: '1.5rem' }}>Connectez-vous pour finaliser votre commande.</div>
        <button className="btn-gold" onClick={openAuth}>Se connecter</button>
      </div>
    );
  }

  // Redirect if cart empty
  if (items.length === 0) {
    return (
      <div className={s.emptyState}>
        <div className={s.icon}>🛒</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--night)', marginBottom: '.5rem' }}>
          Votre panier est vide
        </div>
        <button className="btn-gold" style={{ marginTop: '1rem' }} onClick={() => navigate('/catalog')}>
          Explorer le catalogue →
        </button>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total    = subtotal + shipping;

  function validate() {
    const errs = {};
    for (const f of FIELDS) {
      if (f.name !== 'phone' && !form[f.name].trim()) {
        errs[f.name] = 'Ce champ est requis';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGlobalErr('');

    try {
      const body = {
        shippingAddress: { ...form },
        items: items.map(i => ({
          productId:   i.id,
          productName: i.name,
          price:       i.price,
          qty:         i.qty,
          size:        i.size  || null,
          color:       i.color || null,
          emoji:       i.emoji || null,
        })),
      };

      const res = await ordersApi.create(body);
      clearCart();
      showToast('✓ Commande confirmée ! 🎉');
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setGlobalErr(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  function field(name) {
    return {
      value:     form[name],
      onChange:  e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(e => { const n = { ...e }; delete n[name]; return n; }); },
      className: `${s.input}${errors[name] ? ` ${s.err}` : ''}`,
    };
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.tag}>Finalisation</div>
          <div className={s.title}>Votre commande</div>
        </div>

        <form className={s.layout} onSubmit={handleSubmit} noValidate>
          {/* ── Shipping form ── */}
          <div className={s.card}>
            <div className={s.cardTitle}>📦 Adresse de livraison</div>

            {FIELDS.reduce((rows, f, i, arr) => {
              if (f.half && arr[i + 1]?.half) {
                rows.push(
                  <div className={s.row2} key={f.name}>
                    {[f, arr[i + 1]].map(ff => (
                      <div className={s.field} key={ff.name}>
                        <label className={s.label}>{ff.label}</label>
                        <input placeholder={ff.placeholder} {...field(ff.name)} />
                        {errors[ff.name] && <div className={s.fieldErr}>{errors[ff.name]}</div>}
                      </div>
                    ))}
                  </div>
                );
              } else if (!f.half || !arr[i - 1]?.half) {
                rows.push(
                  <div className={s.field} key={f.name}>
                    <label className={s.label}>{f.label}</label>
                    <input placeholder={f.placeholder} {...field(f.name)} />
                    {errors[f.name] && <div className={s.fieldErr}>{errors[f.name]}</div>}
                  </div>
                );
              }
              return rows;
            }, [])}

            {globalErr && <div className={s.globalErr}>⚠️ {globalErr}</div>}
          </div>

          {/* ── Order summary ── */}
          <div className={s.summary}>
            <div className={s.card}>
              <div className={s.cardTitle}>🛒 Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})</div>

              <div className={s.summaryItems}>
                {items.map(item => (
                  <div key={item.key} className={s.summaryItem}>
                    <div className={s.itemEmoji}>{item.emoji}</div>
                    <div className={s.itemInfo}>
                      <div className={s.itemName}>{item.name}</div>
                      <div className={s.itemMeta}>
                        {item.color && <span className={s.colorDot} style={{ background: item.color }} />}
                        {item.size && <span>{item.size}</span>}
                        <span>× {item.qty}</span>
                      </div>
                    </div>
                    <div className={s.itemPrice}>{(item.price * item.qty).toFixed(2)}€</div>
                  </div>
                ))}
              </div>

              <div className={s.divider} />

              <div className={s.totals}>
                <div className={s.totalRow}>
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className={s.totalRow}>
                  <span>Livraison</span>
                  <span>{shipping === 0 ? '🎁 Offerte' : `${shipping.toFixed(2)}€`}</span>
                </div>
                <div className={s.divider} />
                <div className={s.totalRowBig}>
                  <span className={s.totalLabel}>Total</span>
                  <span className={s.totalVal}>{total.toFixed(2)}€</span>
                </div>
              </div>

              <button type="submit" className={s.submitBtn} disabled={submitting}>
                {submitting ? 'Traitement en cours…' : '✓ Confirmer la commande'}
              </button>

              {shipping > 0 && (
                <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--muted)', marginTop: '.75rem' }}>
                  🚚 Livraison offerte à partir de 50€
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
