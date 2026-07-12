export function ChartWrapper({ title, children }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h3 className="mb-3 text-base font-semibold text-slate-800">{title}</h3> : null}
      <div>{children}</div>
    </section>
  );
}
