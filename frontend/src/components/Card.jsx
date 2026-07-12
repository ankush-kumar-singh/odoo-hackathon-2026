export function Card({ title, description, children }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h3 className="mb-2 text-base font-semibold text-slate-800">{title}</h3> : null}
      {description ? <p className="mb-4 text-sm text-slate-500">{description}</p> : null}
      <div>{children}</div>
    </section>
  );
}
