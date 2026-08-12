import React, { useEffect, useRef } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, PackageOpen, X } from "lucide-react";

const join = (...values) => values.filter(Boolean).join(" ");

export function Button({ variant = "primary", size = "md", className = "", type = "button", children, ...props }) {
  return <button type={type} className={join("btn", `btn-${variant}`, `btn-${size}`, className)} {...props}>{children}</button>;
}

export function IconButton({ label, className = "", children, ...props }) {
  return <button type="button" aria-label={label} title={label} className={join("icon-btn", className)} {...props}>{children}</button>;
}

export function Card({ className = "", children, ...props }) {
  return <section className={join("surface", className)} {...props}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <label className={join("field", className)}>
      <span className="field-label">{label}{required && <span className="text-red-600"> *</span>}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export const Input = React.forwardRef(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={join("input", className)} {...props} />;
});

export const Textarea = React.forwardRef(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={join("input min-h-24 resize-y", className)} {...props} />;
});

export const Select = React.forwardRef(function Select({ className = "", ...props }, ref) {
  return <select ref={ref} className={join("input", className)} {...props} />;
});

export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className={join("flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-3", disabled && "cursor-not-allowed opacity-60")}>
      <span><span className="block text-sm font-semibold text-stone-900">{label}</span>{description && <span className="mt-0.5 block text-xs leading-5 text-stone-500">{description}</span>}</span>
      <input className="peer sr-only" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-stone-300 transition peer-checked:bg-brand-700 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export function Badge({ tone = "neutral", children, className = "" }) {
  return <span className={join("badge", `badge-${tone}`, className)}>{children}</span>;
}

export function StatCard({ label, value, note, icon: Icon, tone = "brand" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-stone-950">{value}</p>{note && <p className="mt-1 text-xs text-stone-500">{note}</p>}</div>
        {Icon && <div className={join("grid h-11 w-11 place-items-center rounded-xl", tone === "danger" ? "bg-red-50 text-red-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "info" ? "bg-sky-50 text-sky-700" : "bg-brand-50 text-brand-800")}><Icon size={21} /></div>}
      </div>
    </Card>
  );
}

export function LoadingState({ label = "Loading…", className = "" }) {
  return <div className={join("grid min-h-40 place-items-center text-center", className)}><div><Loader2 className="mx-auto animate-spin text-brand-700" size={28} /><p className="mt-3 text-sm font-medium text-stone-500">{label}</p></div></div>;
}

export function EmptyState({ title = "Nothing here yet", description, icon: Icon = PackageOpen, action }) {
  return <div className="grid min-h-52 place-items-center p-8 text-center"><div className="max-w-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-500"><Icon size={25} /></div><h3 className="mt-4 text-base font-bold text-stone-950">{title}</h3>{description && <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>}{action && <div className="mt-4">{action}</div>}</div></div>;
}

export function Modal({ open, onClose, title, description, children, size = "lg", footer }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    window.setTimeout(() => panelRef.current?.querySelector(focusableSelector)?.focus() || panelRef.current?.focus(), 0);
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll(focusableSelector));
      if (!focusable.length) { event.preventDefault(); panelRef.current.focus(); return; }
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); previousFocus?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const width = size === "xl" ? "max-w-6xl" : size === "md" ? "max-w-2xl" : "max-w-4xl";
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-stone-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0" onClick={onClose} aria-label="Close dialog backdrop" />
      <div ref={panelRef} tabIndex={-1} className={join("relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#fbfaf6] shadow-2xl outline-none sm:rounded-2xl", width)}>
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-white px-5 py-4 sm:px-6">
          <div><h2 className="text-lg font-bold text-stone-950">{title}</h2>{description && <p className="mt-1 text-sm text-stone-500">{description}</p>}</div>
          <IconButton label="Close" onClick={onClose}><X size={20} /></IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer && <div className="border-t border-stone-200 bg-white px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Confirm action", description, confirmLabel = "Confirm", dangerous = false, loading = false }) {
  return <Modal open={open} onClose={onClose} title={title} size="md" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button variant={dangerous ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>{loading ? <><Loader2 size={16} className="animate-spin" /> Working…</> : confirmLabel}</Button></div>}><div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><AlertTriangle size={21} className="mt-0.5 shrink-0" /><p>{description}</p></div></Modal>;
}

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return <div className="flex items-center justify-between gap-4 border-t border-stone-200 px-4 py-3"><p className="text-xs font-medium text-stone-500">Page {page} of {pages}</p><div className="flex gap-2"><IconButton label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={18} /></IconButton><IconButton label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={18} /></IconButton></div></div>;
}
