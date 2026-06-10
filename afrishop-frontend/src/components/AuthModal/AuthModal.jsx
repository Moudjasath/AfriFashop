import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore }   from '../../store/uiStore';
import s from './AuthModal.module.css';

export default function AuthModal() {
  const authOpen  = useUiStore(st => st.authOpen);
  const closeAuth = useUiStore(st => st.closeAuth);
  const [tab, setTab] = useState('login');

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeAuth();
  }

  function switchTab(next) {
    setTab(next);
  }

  return (
    <div className={`${s.overlay} ${authOpen ? s.open : ''}`} onClick={handleOverlayClick}>
      <div className={s.modal}>
        <button className={s.closeBtn} onClick={closeAuth} aria-label="Fermer">✕</button>
        <div className={s.logo}>AfriShop</div>
        <p className={s.sub}>
          {tab === 'login' ? 'Content de vous revoir 👋' : 'Rejoignez la communauté AfriShop ✦'}
        </p>

        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'login' ? s.active : ''}`}    onClick={() => switchTab('login')}>Connexion</button>
          <button className={`${s.tab} ${tab === 'register' ? s.active : ''}`} onClick={() => switchTab('register')}>Inscription</button>
        </div>

        {tab === 'login'
          ? <LoginForm    onClose={closeAuth} onSwitch={() => switchTab('register')} />
          : <RegisterForm onClose={closeAuth} onSwitch={() => switchTab('login')} />
        }
      </div>
    </div>
  );
}

/* ─────────────────────── LOGIN ─────────────────────── */
function LoginForm({ onClose, onSwitch }) {
  const login      = useAuthStore(s => s.login);
  const showToast  = useUiStore(s => s.showToast);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState(null);  // { type:'err'|'ok', msg }
  const [fields,   setFields]   = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null); setFields({});
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.ok) {
      showToast('✓ Connexion réussie ! Bienvenue 🎉');
      onClose();
    } else if (Object.keys(res.fields || {}).length) {
      setFields(res.fields);
    } else {
      setAlert({ type: 'err', msg: res.message || 'Email ou mot de passe incorrect.' });
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {alert && <div className={`${s.alert} ${s[alert.type]}`}>{alert.type === 'err' ? '⚠️' : '✓'} {alert.msg}</div>}

      <Field label="Email" error={fields.email}>
        <input className={`${s.input} ${fields.email ? s.error : ''}`}
          type="email" placeholder="vous@example.com" value={email}
          onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </Field>

      <Field label="Mot de passe" error={fields.password}>
        <input className={`${s.input} ${fields.password ? s.error : ''}`}
          type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
      </Field>

      <button type="submit" className={s.submit} disabled={loading}>
        {loading && <span className={s.spinner} />}
        {loading ? 'Connexion…' : 'Se connecter →'}
      </button>

      <p className={s.switchText}>
        Pas encore de compte ?{' '}
        <button type="button" onClick={onSwitch}>Créer un compte</button>
      </p>
    </form>
  );
}

/* ─────────────────────── REGISTER ─────────────────────── */
function RegisterForm({ onClose, onSwitch }) {
  const register   = useAuthStore(s => s.register);
  const showToast  = useUiStore(s => s.showToast);

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState(null);
  const [fields,   setFields]   = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null); setFields({});

    // Client-side password confirmation check
    if (password !== confirm) {
      setFields({ confirm: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (password.length < 8) {
      setFields({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setLoading(true);
    const res = await register(email, password, fullName);
    setLoading(false);

    if (res.ok) {
      showToast('✓ Compte créé ! Bienvenue dans AfriShop 🌍');
      onClose();
    } else if (Object.keys(res.fields || {}).length) {
      setFields(res.fields);
    } else {
      setAlert({ type: 'err', msg: res.message || 'Une erreur est survenue.' });
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {alert && <div className={`${s.alert} ${s[alert.type]}`}>{alert.type === 'err' ? '⚠️' : '✓'} {alert.msg}</div>}

      <Field label="Nom complet" error={fields.fullName}>
        <input className={`${s.input} ${fields.fullName ? s.error : ''}`}
          type="text" placeholder="Votre nom" value={fullName}
          onChange={e => setFullName(e.target.value)} required autoComplete="name" />
      </Field>

      <Field label="Email" error={fields.email}>
        <input className={`${s.input} ${fields.email ? s.error : ''}`}
          type="email" placeholder="vous@example.com" value={email}
          onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </Field>

      <Field label="Mot de passe" error={fields.password}>
        <input className={`${s.input} ${fields.password ? s.error : ''}`}
          type="password" placeholder="Min. 8 caractères" value={password}
          onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
      </Field>

      <Field label="Confirmer le mot de passe" error={fields.confirm}>
        <input className={`${s.input} ${fields.confirm ? s.error : ''}`}
          type="password" placeholder="••••••••" value={confirm}
          onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
      </Field>

      <button type="submit" className={s.submit} disabled={loading}>
        {loading && <span className={s.spinner} />}
        {loading ? 'Création du compte…' : 'Créer mon compte →'}
      </button>

      <p className={s.switchText}>
        Déjà un compte ?{' '}
        <button type="button" onClick={onSwitch}>Se connecter</button>
      </p>
    </form>
  );
}

/* ─────────────────────── SHARED ─────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>
      {children}
      {error && <span className={s.fieldError}>⚠ {error}</span>}
    </div>
  );
}
