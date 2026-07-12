export function StatusBadge({ status, className = '' }) {
  const tone = {
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    inactive: 'bg-slate-100 text-slate-700',
    maintenance: 'bg-rose-100 text-rose-700',
    default: 'bg-sky-100 text-sky-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone[status] ?? tone.default} ${className}`.trim()}>
      {status ?? 'unknown'}
    </span>
  );
}
