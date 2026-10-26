export default function FormField({ label, error, hint, className = "", as = "input", tone = "dark", ...props }) {
  const id = props.id || props.name;
  const Component = as;
  const isLight = tone === "light";

  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className={`mb-2 block text-xs font-black uppercase tracking-wider ${isLight ? "text-slate-700" : "text-slate-200"}`}>{label}</span>
      <Component
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full rounded-none border ${
          isLight
            ? "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 read-only:bg-slate-100 read-only:text-slate-700 focus:border-[#FF5500] focus:ring-[#FF5500] focus:ring-offset-white"
            : "border-slate-700 bg-[#121216] text-white"
        } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${props.className || ""}`}
      />
      {error ? (
        <span id={`${id}-error`} className={`mt-1.5 block text-xs font-bold ${isLight ? "text-red-600" : "text-red-400"}`}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className={`mt-1.5 block text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}
