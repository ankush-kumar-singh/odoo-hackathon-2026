export function LoadingState({ message = 'Loading...' }) {
  return <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">{message}</div>;
}
