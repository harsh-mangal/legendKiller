export default function FormField({ label, error, hint, className = "", as = "input", ...props }) {
  const id = props.id || props.name;
  const Component = as;
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-200">{label}</span>
      <Component
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full border border-slate-700 bg-[#121216] text-white rounded-none ${error ? "border-red-500 focus:border-red-500" : ""} ${props.className || ""}`}
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1.5 block text-xs font-bold text-red-400">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="mt-1.5 block text-xs text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
