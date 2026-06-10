import s from './Skeleton.module.css';

export function SkeletonCard() {
  return (
    <div className={s.card}>
      <div className={s.cardImg} />
      <div className={s.cardBody}>
        <div className={`${s.line} ${s.lineShort}`} />
        <div className={`${s.line} ${s.lineLong}`} />
        <div className={`${s.line} ${s.lineMedium}`} />
        <div className={s.lineBtn} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
