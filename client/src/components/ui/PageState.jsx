export function PageLoading({ label = "Loading…" }) {
  return (
    <div className="grid min-h-[320px] place-items-center" role="status">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-[#FF5500]" />
        <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-300">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-none border border-slate-800 bg-[#121216] px-6 py-12 text-center shadow-2xl">
      <h2 className="text-2xl font-black uppercase text-white">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
