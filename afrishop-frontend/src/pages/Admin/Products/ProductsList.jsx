import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import { adminApi } from '../../../services/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUiStore } from '../../../store/uiStore';
import styles from './ProductsList.module.css';

export default function ProductsList() {
  useDocumentTitle('Admin — Produits');

  const navigate   = useNavigate();
  const showToast  = useUiStore(st => st.showToast);
  const [refresh, setRefresh] = useState(0);
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue]     = useState('');
  const inputRef = useRef(null);

  const { products, loading, error } = useProducts({ limit: 50, _refresh: refresh });

  function startEditStock(product) {
    setEditingStock(product.id);
    setStockValue(String(product.stock));
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function saveStock(productId) {
    const stock = parseInt(stockValue, 10);
    if (isNaN(stock) || stock < 0) {
      setEditingStock(null);
      return;
    }
    try {
      await adminApi.updateProduct(productId, { stock });
      showToast('Stock mis à jour');
      setRefresh(r => r + 1);
    } catch (err) {
      showToast(err.message || 'Erreur lors de la mise à jour du stock');
    } finally {
      setEditingStock(null);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Supprimer le produit "${product.name}" ?`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      showToast('Produit supprimé');
      setRefresh(r => r + 1);
    } catch (err) {
      showToast(err.message || 'Erreur lors de la suppression');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Produits</h1>
        <button className={styles.newBtn} onClick={() => navigate('/admin/products/new')}>
          + Nouveau produit
        </button>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Chargement…</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                  </td>
                  <td className={styles.productName}>{product.name}</td>
                  <td className={styles.category}>{product.category}</td>
                  <td className={styles.price}>{Number(product.price).toFixed(2)} €</td>
                  <td>
                    {editingStock === product.id ? (
                      <input
                        ref={inputRef}
                        type="number"
                        min="0"
                        className={styles.stockInput}
                        value={stockValue}
                        onChange={e => setStockValue(e.target.value)}
                        onBlur={() => saveStock(product.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveStock(product.id);
                          if (e.key === 'Escape') setEditingStock(null);
                        }}
                      />
                    ) : (
                      <span
                        className={`${styles.stockValue} ${product.stock === 0 ? styles.stockZero : product.stock <= 5 ? styles.stockLow : ''}`}
                        onClick={() => startEditStock(product)}
                        title="Cliquer pour modifier"
                      >
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td>
                    {product.badge ? (
                      <span className={styles.badge}>{product.badge}</span>
                    ) : (
                      <span className={styles.noBadge}>—</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        Modifier
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(product)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>Aucun produit</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
