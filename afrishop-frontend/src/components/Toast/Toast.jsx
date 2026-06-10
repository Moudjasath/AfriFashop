import { useUiStore } from '../../store/uiStore';

const style = {
  wrapper: {
    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 500,
    background: 'var(--night)', color: 'var(--cream)',
    padding: '12px 20px', borderRadius: '100px',
    fontSize: '0.83rem', fontWeight: 600,
    boxShadow: 'var(--shadow-lg)',
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.3s',
  },
  visible: { transform: 'translateY(0)', opacity: 1 },
  hidden:  { transform: 'translateY(80px)', opacity: 0, pointerEvents: 'none' },
};

export default function Toast() {
  const toast = useUiStore(st => st.toast);
  return (
    <div style={{ ...style.wrapper, ...(toast ? style.visible : style.hidden) }}>
      {toast?.message}
    </div>
  );
}
