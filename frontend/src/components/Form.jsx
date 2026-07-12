export function Form({ title, children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      {title ? <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3> : null}
      <div className="space-y-4">{children}</div>
    </form>
  );
}
