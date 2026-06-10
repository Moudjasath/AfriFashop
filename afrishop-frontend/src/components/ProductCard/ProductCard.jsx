import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUiStore } from '../../store/uiStore';
import { CATEGORY_GRADIENTS } from '../../data/products';
import s from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const navigate   = useNavigate();
  const addItem    = useCartStore(st => st.addItem);
  const toggle     = useWishlistStore(st => st.toggle);
  const wished     = useWishlistStore(st => st.has(product.id));
  const showToast  = useUiStore(st => st.showToast);
  const [added, setAdded] = useState(false);

  const fallbackBg = CATEGORY_GRADIENTS[product.category] || 'linear-gradient(135deg,#3D1A0A,#6B3A2A)';
  const outStock   = product.stock === 0;

  function handleAddToCart(e) {
    e.stopPropagation();
    if (outStock) return;
    const qty = addItem(product);
    if (qty > 0) {
      showToast(`✓ ${product.name} ajouté au panier`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      showToast(`⚠️ Stock maximum atteint pour ${product.name}`);
    }
  }

  function handleWish(e) {
    e.stopPropagation();
    toggle(product.id);
    showToast(wished ? 'Retiré des favoris' : '❤️ Ajouté aux favoris');
  }

  return (
    <div className={s.card} onClick={() => navigate(`/product/${product.id}`)}>
      <div className={s.imgWrap}>
        {product.image ? (
          <img
            className={s.img}
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={s.imgFallback} style={{ background: fallbackBg, display: product.image ? 'none' : 'flex' }} />
        {product.badge === 'Nouveau' && <span className={s.badgeNew}>Nouveau</span>}
        {product.badge === 'Vente'   && <span className={s.badgeSale}>Vente</span>}
        {product.badge === 'New'     && <span className={s.badgeNew}>Nouveau</span>}
        {product.badge === 'Sale'    && <span className={s.badgeSale}>Vente</span>}
        {outStock && <span className={s.badgeOut}>Épuisé</span>}
        <button className={s.wishBtn} onClick={handleWish} aria-label="Favoris">
          {wished ? '❤️' : '🤍'}
        </button>
      </div>

      <div className={s.info}>
        <div className={s.cat}>{product.category}</div>
        <div className={s.name}>{product.name}</div>
        <div className={s.priceRow}>
          <div>
            <span className={s.price}>{Number(product.price).toFixed(2)}€</span>
            {product.oldPrice && <span className={s.priceOld}>{Number(product.oldPrice).toFixed(2)}€</span>}
          </div>
          <div className={s.stars}>
            {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            <span className={s.reviewCount}> ({product.reviews})</span>
          </div>
        </div>
        <button
          className={`${s.addBtn} ${added ? s.added : ''} ${outStock ? s.outOfStock : ''}`}
          onClick={handleAddToCart}
          disabled={outStock}
        >
          {outStock ? 'Rupture de stock' : added ? '✓ Ajouté !' : '🛒 Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}
