import { useNavigate }     from 'react-router-dom';
import { useCartStore }    from '../../store/cartStore';
import { useUiStore }     from '../../store/uiStore';
import { useAuthStore }   from '../../store/authStore';
import s from './Cart.module.css';

export default function Cart() {
  const items      = useCartStore(st => st.items);
  const removeItem = useCartStore(st => st.removeItem);
  const updateQty  = useCartStore(st => st.updateQty);
  const total      = useCartStore(st => st.items.reduce((sum, i) => sum + i.price * i.qty, 0));
  const navigate   = useNavigate();
  const cartOpen   = useUiStore(st => st.cartOpen);
  const closeCart  = useUiStore(st => st.closeCart);
  const openAuth   = useUiStore(st => st.openAuth);
  const showToast  = useUiStore(st => st.showToast);
  const isLoggedIn = useAuthStore(st => st.isLoggedIn);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeCart();
  }

  function handleCheckout() {
    if (!isLoggedIn()) {
      closeCart();
      openAuth();
      showToast('Connectez-vous pour passer commande 🔐');
      return;
    }
    closeCart();
    navigate('/checkout');
  }

  return (
    <div className={`${s.overlay} ${cartOpen ? s.open : ''}`} onClick={handleOverlayClick}>
      <div className={s.sidebar}>
        <div className={s.header}>
          <div className={s.title}>Shopping Cart 🛒</div>
          <button className={s.closeBtn} onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        <div className={s.items}>
          {items.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>🛒</div>
              <div>Your cart is empty</div>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className={s.item}>
                <div className={s.itemImg}>{item.emoji}</div>
                <div className={s.itemInfo}>
                  <div className={s.itemName}>{item.name}</div>
                  <div className={s.itemPrice}>{(item.price * item.qty).toFixed(2)}€</div>
                  <div className={s.itemMeta}>
                    {item.color && (
                      <span className={s.colorDot} style={{ background: item.color }} title={item.color} />
                    )}
                    {item.size && <span>{item.size}</span>}
                    <button className={s.qtyBtn} onClick={() => updateQty(item.key, item.qty - 1)}>−</button>
                    <span className={s.qtyVal}>{item.qty}</span>
                    <button className={s.qtyBtn} onClick={() => updateQty(item.key, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className={s.removeBtn} onClick={() => removeItem(item.key)} aria-label="Remove">✕</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={s.footer}>
            <div className={s.totalRow}>
              <span className={s.totalLabel}>Total</span>
              <span className={s.totalVal}>{total.toFixed(2)}€</span>
            </div>
            <button className={s.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
