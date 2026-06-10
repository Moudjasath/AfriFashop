import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, productsApi } from '../../../services/api';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUiStore } from '../../../store/uiStore';
import styles from './ProductForm.module.css';

const CATEGORIES = ['Dresses', 'Tops', 'Accessories', 'Sets'];
const ALL_SIZES   = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Taille unique'];
const BADGES      = ['', 'Nouveau', 'Vente'];

const EMPTY_FORM = {
  name:        '',
  description: '',
  category:    '',
  price:       '',
  oldPrice:    '',
  image:       '',
  stock:       '',
  badge:       '',
  sizes:       [],
  colors:      [],
};

export default function ProductForm() {
  const { id }    = useParams();
  const isNew     = id === 'new';
  const navigate  = useNavigate();
  const showToast = useUiStore(st => st.showToast);

  useDocumentTitle(isNew ? 'Admin — Nouveau produit' : 'Admin — Modifier produit');

  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(!isNew);
  const [saving, setSaving]       = useState(false);
  const [newSize, setNewSize]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef(null);

  useEffect(() => {
    if (isNew) return;

    let cancelled = false;
    setLoading(true);

    productsApi.get(id)
      .then(res => {
        if (cancelled) return;
        const p = res.data;
        setForm({
          name:        p.name        ?? '',
          description: p.description ?? '',
          category:    p.category    ?? '',
          price:       String(p.price ?? ''),
          oldPrice:    p.oldPrice != null ? String(p.oldPrice) : '',
          image:       p.image       ?? '',
          stock:       String(p.stock ?? ''),
          badge:       p.badge       ?? '',
          sizes:       p.sizes       ?? [],
          colors:      p.colors      ?? [],
        });
      })
      .catch(err => {
        if (cancelled) return;
        showToast(err.message || 'Erreur lors du chargement du produit');
        navigate('/admin/products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, isNew, navigate, showToast]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleSize(size) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }));
  }

  function addCustomSize() {
    const s = newSize.trim();
    if (!s || form.sizes.includes(s)) return;
    setForm(f => ({ ...f, sizes: [...f.sizes, s] }));
    setNewSize('');
  }

  function addColor() {
    setForm(f => ({ ...f, colors: [...f.colors, '#000000'] }));
  }

  function updateColor(index, value) {
    setForm(f => {
      const next = [...f.colors];
      next[index] = value;
      return { ...f, colors: next };
    });
  }

  function removeColor(index) {
    setForm(f => ({ ...f, colors: f.colors.filter((_, i) => i !== index) }));
  }

  async function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      showToast('Variables VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET manquantes dans .env');
      return;
    }

    setUploading(true);
    setUploadPct(0);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', preset);

    try {
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
          else reject(new Error('Upload échoué (' + xhr.status + ')'));
        };
        xhr.onerror = () => reject(new Error('Erreur réseau'));
        xhr.send(data);
      });
      set('image', url);
    } catch (err) {
      showToast(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim(),
      category:    form.category,
      price:       parseFloat(form.price),
      oldPrice:    form.oldPrice !== '' ? parseFloat(form.oldPrice) : null,
      image:       form.image.trim() || null,
      stock:       parseInt(form.stock, 10) || 0,
      badge:       form.badge || null,
      sizes:       form.sizes,
      colors:      form.colors,
    };

    try {
      if (isNew) {
        await adminApi.createProduct(payload);
        showToast('Produit créé avec succès');
      } else {
        await adminApi.updateProduct(id, payload);
        showToast('Produit mis à jour');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Chargement…</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        {isNew ? 'Nouveau produit' : 'Modifier le produit'}
      </h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>Nom *</label>
            <input
              className={styles.input}
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Catégorie *</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={e => set('category', e.target.value)}
              required
            >
              <option value="">— Choisir —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Prix (€) *</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ancien prix (€)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              value={form.oldPrice}
              onChange={e => set('oldPrice', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Stock</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.stock}
              onChange={e => set('stock', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Badge</label>
            <select
              className={styles.select}
              value={form.badge}
              onChange={e => set('badge', e.target.value)}
            >
              {BADGES.map(b => (
                <option key={b} value={b}>{b || '—'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description *</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Image du produit</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={e => { handleImageFile(e.target.files[0]); e.target.value = ''; }}
          />

          {form.image && !uploading ? (
            <div className={styles.previewWrap}>
              <img src={form.image} alt="Aperçu" className={styles.previewImg} />
              <div className={styles.previewActions}>
                <button
                  type="button"
                  className={styles.changeImgBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Changer
                </button>
                <button
                  type="button"
                  className={styles.removeImgBtn}
                  onClick={() => set('image', '')}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploadingZone : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                handleImageFile(e.dataTransfer.files[0]);
              }}
            >
              {uploading ? (
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${uploadPct}%` }} />
                  </div>
                  <span className={styles.progressLabel}>Upload en cours… {uploadPct}%</span>
                </div>
              ) : (
                <>
                  <span className={styles.uploadIcon}>↑</span>
                  <span className={styles.uploadText}>Cliquez ou glissez une image ici</span>
                  <span className={styles.uploadSub}>PNG, JPG, WEBP — max 10 Mo</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Tailles</label>
          <div className={styles.sizeList}>
            {ALL_SIZES.map(size => (
              <label key={size} className={styles.sizeItem}>
                <input
                  type="checkbox"
                  checked={form.sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                />
                {size}
              </label>
            ))}
          </div>
          <div className={styles.addRow}>
            <input
              className={styles.inputSm}
              type="text"
              placeholder="Taille personnalisée"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
            />
            <button type="button" className={styles.addBtn} onClick={addCustomSize}>
              Ajouter
            </button>
          </div>
          {form.sizes.filter(s => !ALL_SIZES.includes(s)).length > 0 && (
            <div className={styles.customSizes}>
              {form.sizes.filter(s => !ALL_SIZES.includes(s)).map(s => (
                <span key={s} className={styles.customTag}>
                  {s}
                  <button type="button" onClick={() => toggleSize(s)} className={styles.removeTag}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Couleurs</label>
          <div className={styles.colorList}>
            {form.colors.map((color, i) => (
              <div key={i} className={styles.colorItem}>
                <input
                  type="color"
                  value={color}
                  onChange={e => updateColor(i, e.target.value)}
                  className={styles.colorPicker}
                />
                <span className={styles.colorHex}>{color}</span>
                <button type="button" className={styles.removeColorBtn} onClick={() => removeColor(i)}>×</button>
              </div>
            ))}
            <button type="button" className={styles.addColorBtn} onClick={addColor}>
              + Couleur
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/admin/products')}
          >
            Annuler
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer le produit' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
